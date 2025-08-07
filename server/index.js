console.log("Starting server...");
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const axios = require('axios');

const app = express();
const PORT = 5000;

// Connect to local MongoDB
mongoose.connect('mongodb://localhost:27017/code_editor', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Project schema and model
const fileSchema = new mongoose.Schema({
  name: String,
  content: String,
});

const projectSchema = new mongoose.Schema({
  name: String,
  files: [fileSchema], // Array of files
  language: String,
  users: [String], // Array of user names
  createdAt: { type: Date, default: Date.now },
});

const Project = mongoose.model('Project', projectSchema);

app.use(cors());
app.use(express.json());

// Save project automatically
app.post('/api/projects', async (req, res) => {
  try {
    const { name, code, language, users } = req.body;
    const project = new Project({ name, code, language, users });
    await project.save();
    res.status(201).json({ message: 'Project created successfully!', projectId: project._id });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create project', error });
  }
});

// Get project by ID
app.get('/api/projects/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch project', error });
  }
});

// Endpoint for a user to join a project by ID
app.post('/api/projects/:id/join', async (req, res) => {
  try {
    const { userName } = req.body;
    if (!userName) return res.status(400).json({ message: 'User name is required' });
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (!project.users.includes(userName)) {
      project.users.push(userName);
      await project.save();
    }
    res.json({ message: 'User joined project', users: project.users });
  } catch (error) {
    res.status(500).json({ message: 'Failed to join project', error });
  }
});

// Endpoint to get users in a project
app.get('/api/projects/:id/users', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json({ users: project.users });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users', error });
  }
});

// Endpoint to run code using Judge0 API
app.post('/api/execute', async (req, res) => {
  const { code, language, input } = req.body;
  console.log('Received for execution:', { code, language, input }); // Debug log
  if (!code || !language) {
    return res.status(400).json({ message: 'Code and language are required' });
  }

  // Judge0 language mapping (add more as needed)
  const languageMap = {
    'python': 71, // Python 3.8.1
    'java': 62,   // Java (OpenJDK 13.0.1)
    'cpp': 54,    // C++ (GCC 9.2.0)
    'c': 50,      // C (GCC 9.2.0)
    'javascript': 63, // JavaScript (Node.js 12.14.0)
    'typescript': 74, // TypeScript (3.7.4)
    'php': 68,        // PHP (7.4.1)
    'ruby': 72,       // Ruby (2.7.0)
    'go': 60,         // Go (1.13.5)
    'rust': 73,       // Rust (1.40.0)
    'swift': 83,      // Swift (5.2.3)
    'kotlin': 78,     // Kotlin (1.3.70)
    'scala': 81,      // Scala (2.13.2)
    'csharp': 51,     // C# (Mono 6.6.0.161)
    // Add more as needed from Judge0 docs
  };

  const languageId = languageMap[language.toLowerCase()];
  if (!languageId) {
    return res.status(400).json({ message: 'Unsupported language' });
  }

  try {
    // Debug log before Judge0 call
    console.log('Sending to Judge0:', {
      source_code: code,
      language_id: languageId,
      stdin: input || ''
    });
    // Submit code to Judge0
    const submission = await axios.post('https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true', {
      source_code: code,
      language_id: languageId,
      stdin: input || ''
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
        'X-RapidAPI-Key': '2390acdd6amsh038b4ce8629773bp1ab025jsn66732632aab3' // <-- User's RapidAPI key
      }
    });
    // Debug log after Judge0 response
    console.log('Judge0 response:', submission.data);
    res.json({ output: submission.data.stdout, stderr: submission.data.stderr, compile_output: submission.data.compile_output });
  } catch (error) {
    res.status(500).json({ message: 'Code execution failed', error: error.response ? error.response.data : error.message });
  }
});

// --- File API Endpoints ---
// List files in a project
app.get('/api/projects/:id/files', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json({ files: project.files.map(f => ({ name: f.name })) });
  } catch (error) {
    res.status(500).json({ message: 'Failed to list files', error });
  }
});
// Get file content
app.get('/api/projects/:id/files/:filename', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    const file = project.files.find(f => f.name === req.params.filename);
    if (!file) return res.status(404).json({ message: 'File not found' });
    res.json({ name: file.name, content: file.content });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get file', error });
  }
});
// Create a new file
app.post('/api/projects/:id/files', async (req, res) => {
  try {
    const { name, content } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.files.find(f => f.name === name)) {
      return res.status(400).json({ message: 'File already exists' });
    }
    project.files.push({ name, content: content || '' });
    await project.save();
    res.status(201).json({ message: 'File created', files: project.files.map(f => ({ name: f.name })) });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create file', error });
  }
});
// Update file content
app.put('/api/projects/:id/files/:filename', async (req, res) => {
  try {
    const { content } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    const file = project.files.find(f => f.name === req.params.filename);
    if (!file) return res.status(404).json({ message: 'File not found' });
    file.content = content;
    await project.save();
    res.json({ message: 'File updated' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update file', error });
  }
});
// Rename a file
app.put('/api/projects/:id/files/:filename/rename', async (req, res) => {
  try {
    const { newName } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    const file = project.files.find(f => f.name === req.params.filename);
    if (!file) return res.status(404).json({ message: 'File not found' });
    if (project.files.find(f => f.name === newName)) {
      return res.status(400).json({ message: 'File with new name already exists' });
    }
    file.name = newName;
    await project.save();
    res.json({ message: 'File renamed' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to rename file', error });
  }
});
// Delete a file
app.delete('/api/projects/:id/files/:filename', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    project.files = project.files.filter(f => f.name !== req.params.filename);
    await project.save();
    res.json({ message: 'File deleted', files: project.files.map(f => ({ name: f.name })) });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete file', error });
  }
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Join a project room
  socket.on('join_room', async ({ roomId, username }) => {
    socket.join(roomId);
    // Optionally, track users per room
    const project = await Project.findById(roomId);
    if (project) {
      socket.emit('room_data', {
        files: project.files.map(f => ({ name: f.name })),
        name: project.name,
        language: project.language,
        users: project.users,
      });
    }
  });

  // Handle file content change
  socket.on('file_change', async ({ roomId, filename, content }) => {
    const project = await Project.findById(roomId);
    if (project) {
      const file = project.files.find(f => f.name === filename);
      if (file) {
        file.content = content;
        await project.save();
        // Broadcast to others in the room
        socket.to(roomId).emit('file_updated', { filename, content });
      }
    }
  });

  // Handle file creation
  socket.on('file_create', async ({ roomId, name, content }) => {
    const project = await Project.findById(roomId);
    if (project && !project.files.find(f => f.name === name)) {
      project.files.push({ name, content: content || '' });
      await project.save();
      io.to(roomId).emit('file_list_updated', { files: project.files.map(f => ({ name: f.name })) });
    }
  });

  // Handle file rename
  socket.on('file_rename', async ({ roomId, oldName, newName }) => {
    const project = await Project.findById(roomId);
    if (project) {
      const file = project.files.find(f => f.name === oldName);
      if (file && !project.files.find(f => f.name === newName)) {
        file.name = newName;
        await project.save();
        io.to(roomId).emit('file_list_updated', { files: project.files.map(f => ({ name: f.name })) });
      }
    }
  });

  // Handle file deletion
  socket.on('file_delete', async ({ roomId, filename }) => {
    const project = await Project.findById(roomId);
    if (project) {
      project.files = project.files.filter(f => f.name !== filename);
      await project.save();
      io.to(roomId).emit('file_list_updated', { files: project.files.map(f => ({ name: f.name })) });
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});