import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Code, Users, Zap, Share2, Plus, ArrowRight } from 'lucide-react';

const Home = () => {
  const [username, setUsername] = useState('');
  const [projectName, setProjectName] = useState('');
  const [projectId, setProjectId] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();

  const createNewProject = async () => {
    if (!username.trim()) {
      alert('Please enter a username');
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: projectName || 'Untitled Project',
          language: 'javascript',
          content: ''
        }),
      });

      const data = await response.json();
      navigate(`/editor/${data.projectId}`, { 
        state: { username, projectName: data.name } 
      });
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project');
    } finally {
      setIsCreating(false);
    }
  };

  const joinProject = async () => {
    if (!username.trim() || !projectId.trim()) {
      alert('Please enter both username and project ID');
      return;
    }
    try {
      await fetch(`/api/projects/${projectId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName: username })
      });
      navigate(`/editor/${projectId}`, { 
        state: { username } 
      });
    } catch (error) {
      alert('Failed to join project');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <Code className="w-12 h-12 text-blue-500 mr-4" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Collaborative Code Editor
            </h1>
          </div>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Real-time collaborative coding with syntax highlighting, multiple language support, 
            and seamless team collaboration.
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <Zap className="w-8 h-8 text-yellow-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Real-Time Sync</h3>
            <p className="text-slate-300">See changes instantly as your teammates type</p>
          </div>
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <Code className="w-8 h-8 text-green-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Monaco Editor</h3>
            <p className="text-slate-300">Powered by the same editor that runs VS Code</p>
          </div>
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <Users className="w-8 h-8 text-purple-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Multi-User</h3>
            <p className="text-slate-300">Collaborate with unlimited team members</p>
          </div>
        </div>

        {/* Main Actions */}
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Create New Project */}
            <div className="bg-slate-800 p-8 rounded-lg border border-slate-700">
              <div className="flex items-center mb-6">
                <Plus className="w-6 h-6 text-green-500 mr-3" />
                <h2 className="text-2xl font-semibold">Create New Project</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-100"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Project Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Untitled Project"
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-100"
                  />
                </div>
                
                <button
                  onClick={createNewProject}
                  disabled={isCreating}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isCreating ? 'Creating...' : 'Create Project'}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
              </div>
            </div>

            {/* Join Existing Project */}
            <div className="bg-slate-800 p-8 rounded-lg border border-slate-700">
              <div className="flex items-center mb-6">
                <Share2 className="w-6 h-6 text-blue-500 mr-3" />
                <h2 className="text-2xl font-semibold">Join Project</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-100"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Project ID
                  </label>
                  <input
                    type="text"
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    placeholder="Enter project ID"
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-100"
                  />
                </div>
                
                <button
                  onClick={joinProject}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:from-green-600 hover:to-blue-700 transition-all duration-200 flex items-center justify-center"
                >
                  Join Project
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-slate-400">
          <p>Built with React, Node.js, Socket.IO, and Monaco Editor</p>
        </div>
      </div>
    </div>
  );
};

export default Home; 