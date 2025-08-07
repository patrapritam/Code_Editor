# Real-Time Collaborative Code Editor

A modern, real-time collaborative code editor built with React, Node.js, Socket.IO, and Monaco Editor. Multiple users can edit code simultaneously with live synchronization, syntax highlighting, and support for 25+ programming languages.

## 🚀 Features

### Core Features
- **Real-Time Collaboration**: Multiple users can edit code simultaneously
- **Monaco Editor Integration**: Powered by the same editor that runs VS Code
- **25+ Language Support**: JavaScript, TypeScript, Python, Java, C++, and more
- **Live Cursor Tracking**: See where other users are typing
- **Project Persistence**: Save and load projects with MongoDB
- **Shareable Links**: Easy project sharing with unique URLs

### Advanced Features
- **Syntax Highlighting**: Full language support with proper syntax highlighting
- **Auto-Save**: Automatic project saving with manual save option
- **User Management**: See active users in real-time
- **Connection Status**: Visual indicators for connection state
- **Responsive Design**: Works on desktop and tablet devices
- **Dark Theme**: Modern dark theme optimized for coding

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Socket.IO** - Real-time bidirectional communication
- **MongoDB** - Database for project persistence
- **Mongoose** - MongoDB object modeling

### Frontend
- **React** - UI library
- **Monaco Editor** - Code editor component
- **Socket.IO Client** - Real-time communication
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd collaborative-code-editor
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   npm install
   
   # Install client dependencies
   cd client
   npm install
   cd ..
   ```

3. **Configure environment**
   Create a `.env` file in the root directory:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/collaborative-editor
   CLIENT_URL=http://localhost:3000
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system:
   ```bash
   # Start MongoDB (if installed locally)
   mongod
   
   # Or use MongoDB Atlas (cloud)
   # Update MONGODB_URI in .env file
   ```

5. **Run the application**
   ```bash
   # Development mode (runs both server and client)
   npm run dev
   
   # Or run separately:
   # Terminal 1 - Server
   npm run server
   
   # Terminal 2 - Client
   npm run client
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 🎯 Usage

### Creating a New Project
1. Visit the homepage
2. Enter your name
3. Optionally set a project name
4. Click "Create Project"
5. You'll be redirected to the editor with a unique project ID

### Joining an Existing Project
1. Visit the homepage
2. Enter your name
3. Enter the project ID (shared by another user)
4. Click "Join Project"

### Sharing Projects
- Click the "Share" button to copy the project link
- Share the link with others to collaborate
- The project ID is also displayed in the sidebar

### Real-Time Features
- **Live Editing**: See changes as others type
- **User List**: View all active users in the sidebar
- **Connection Status**: Monitor real-time connection
- **Language Switching**: Change programming language on the fly
- **Auto-Save**: Projects are automatically saved

## 🔧 API Endpoints

### Projects
- `POST /api/projects` - Create a new project
- `GET /api/projects/:projectId` - Get project data

### WebSocket Events
- `join_room` - Join a collaborative session
- `code_change` - Broadcast code changes
- `cursor_move` - Broadcast cursor position
- `save_project` - Save project to database
- `project_name_change` - Update project name

## 🏗️ Project Structure

```
collaborative-code-editor/
├── server/
│   └── index.js              # Express server with Socket.IO
├── client/
│   ├── public/
│   │   └── index.html        # Main HTML file
│   ├── src/
│   │   ├── components/
│   │   │   ├── Home.js       # Landing page
│   │   │   └── Editor.js     # Main editor component
│   │   ├── App.js            # Main app component
│   │   ├── index.js          # React entry point
│   │   └── index.css         # Global styles
│   ├── package.json          # Client dependencies
│   └── tailwind.config.js    # Tailwind configuration
├── package.json              # Server dependencies
├── .env                      # Environment variables
└── README.md                 # This file
```

## 🚀 Deployment

### Local Development
```bash
npm run dev
```

### Production Build
```bash
# Build the React app
cd client
npm run build
cd ..

# Start production server
npm start
```

### Environment Variables for Production
```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/collaborative-editor
CLIENT_URL=https://yourdomain.com
```

## 🔒 Security Considerations

- Input validation on server-side
- CORS configuration for client-server communication
- Helmet.js for security headers
- Environment variable protection
- MongoDB injection prevention

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - The powerful code editor
- [Socket.IO](https://socket.io/) - Real-time communication
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Lucide React](https://lucide.dev/) - Beautiful icons

## 🐛 Known Issues

- Cursor position synchronization may have slight delays
- Large files (>1MB) may cause performance issues
- Mobile support is limited to tablet-sized screens

## 🔮 Future Enhancements

- [ ] User authentication and authorization
- [ ] File upload and download
- [ ] Chat functionality
- [ ] Code execution and output
- [ ] Version control integration
- [ ] Multiple file support
- [ ] Custom themes
- [ ] Mobile app
- [ ] Video/audio calling integration
- [ ] Code formatting and linting

---

**Built with ❤️ using React, Node.js, Socket.IO, and Monaco Editor** 