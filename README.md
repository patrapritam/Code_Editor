# Collaborative Code Editor

A real-time collaborative code editor built with React, Node.js, Socket.IO, and Monaco Editor. Supports multi-user editing, file management, and code execution for multiple languages.

## 🚀 Features

- Real-time collaborative editing with multiple users
- Monaco Editor (same as VS Code)
- File explorer: create, rename, delete, and edit files
- Multi-language support (JavaScript, Python, Java, C++, C, etc.)
- Code execution via Judge0 API
- Project sharing via unique project ID
- User presence and project info sidebar
- Auto-save and manual save options
- Responsive, modern UI with Tailwind CSS

## 🏗️ Project Structure

```
.
├── client/           # React frontend (Monaco Editor, UI)
├── server/           # Node.js backend (Express, Socket.IO, MongoDB)
├── .env              # Environment variables
├── env.example       # Example environment file
├── install.bat       # Windows setup script
├── install.sh        # Mac/Linux setup script
├── package.json      # Root dependencies and scripts
├── README.md         # This file
└── QUICKSTART.md     # Quick start guide
```

## ⚡ Quick Start

### 1. Install Dependencies

**Windows:**
```sh
install.bat
```
**Mac/Linux:**
```sh
chmod +x install.sh
./install.sh
```
Or manually:
```sh
npm install
cd client && npm install && cd ..
```

### 2. Configure Environment

Copy and edit the environment file:
```sh
cp env.example .env
```
Edit `.env` as needed (MongoDB URI, ports, etc).

### 3. Start MongoDB

Make sure MongoDB is running locally or use a cloud instance.

### 4. Run the Application

```sh
npm run dev
```
- Server: http://localhost:5000
- Client: http://localhost:3000

## 🖥️ Usage

- **Create a project:** Enter your name and (optionally) a project name, then click "Create Project".
- **Join a project:** Enter your name and the project ID to join an existing session.
- **Edit files:** Use the file explorer to manage files. Click a file to edit.
- **Collaborate:** Share the project link or ID with others to collaborate in real time.
- **Run code:** Click "Run" to execute code (supported languages only).

## 🛠️ Tech Stack

- **Frontend:** React, Tailwind CSS, Monaco Editor, socket.io-client
- **Backend:** Node.js, Express, Socket.IO, MongoDB (Mongoose), Judge0 API
- **Other:** Axios, dotenv, concurrently, nodemon

## 📦 Scripts

- `npm run dev` – Start both server and client in development mode
- `npm run server` – Start backend only
- `npm run client` – Start frontend only
- `npm run build` – Build frontend for production

## 📄 API Endpoints

See [QUICKSTART.md](QUICKSTART.md) for API and troubleshooting.

## 📝 License


MIT

---

**Happy coding! 🚀**