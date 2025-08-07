# Quick Start Guide

Get your Collaborative Code Editor running in 5 minutes!

## 🚀 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

## ⚡ Quick Setup

### 1. Install Dependencies

**On Windows:**
```bash
install.bat
```

**On Mac/Linux:**
```bash
chmod +x install.sh
./install.sh
```

**Manual Installation:**
```bash
npm install
cd client && npm install && cd ..
```

### 2. Configure Environment

Copy the example environment file:
```bash
cp env.example .env
```

Edit `.env` if needed:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/collaborative-editor
CLIENT_URL=http://localhost:3000
```

### 3. Start MongoDB

**Local MongoDB:**
```bash
mongod
```

**Or use MongoDB Atlas (cloud):**
- Sign up at [MongoDB Atlas](https://www.mongodb.com/atlas)
- Create a cluster
- Get your connection string
- Update `MONGODB_URI` in `.env`

### 4. Run the Application

```bash
npm run dev
```

This starts both the server (port 5000) and client (port 3000).

### 5. Open Your Browser

Navigate to: http://localhost:3000

## 🎯 First Steps

1. **Create a Project:**
   - Enter your name
   - Optionally set a project name
   - Click "Create Project"

2. **Share with Friends:**
   - Click the "Share" button
   - Send the link to your collaborators

3. **Start Coding:**
   - Choose your programming language
   - Start typing - changes sync in real-time!

## 🔧 Troubleshooting

### "MongoDB connection error"
- Make sure MongoDB is running
- Check your connection string in `.env`
- Try `mongod` in terminal

### "Port already in use"
- Change the port in `.env`
- Or kill the process using the port

### "Module not found"
- Run `npm install` in both root and client directories
- Clear node_modules and reinstall

### "Socket connection failed"
- Check if the server is running on port 5000
- Verify CORS settings in server code

## 📱 Features to Try

- **Real-time editing** - Open in multiple tabs
- **Language switching** - Try different programming languages
- **User management** - See who's online
- **Project sharing** - Share the unique project ID
- **Auto-save** - Your work is automatically saved

## 🆘 Need Help?

- Check the full [README.md](README.md)
- Review the [API documentation](README.md#-api-endpoints)
- Check the project structure in [README.md](README.md#-project-structure)

---

**Happy coding! 🎉** 