import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import Editor from '@monaco-editor/react';
import { 
  Users, 
  Save, 
  Share2, 
  Settings, 
  ArrowLeft,
  Copy,
  CheckCircle,
  FolderPlus,
  Pencil,
  Trash2
} from 'lucide-react';
import axios from 'axios';

const CodeEditor = () => {
  const { projectId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const socketRef = useRef();
  const editorRef = useRef();
  const monacoRef = useRef();
  const lastUpdateSource = useRef('local');

  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [projectName, setProjectName] = useState('Untitled Project');
  const [users, setUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [runError, setRunError] = useState('');
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [newFileName, setNewFileName] = useState('');

  const username = location.state?.username || 'Anonymous';

  const languages = [
    { id: 'javascript', name: 'JavaScript' },
    { id: 'python', name: 'Python' },
    { id: 'java', name: 'Java' },
    { id: 'cpp', name: 'C++' },
    { id: 'c', name: 'C' },
    // Add more only if backend supports them
  ];

  useEffect(() => {
    // Initialize Socket.IO connection
    socketRef.current = io();

    socketRef.current.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to server');
    });

    socketRef.current.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from server');
    });

    // Join the room
    socketRef.current.emit('join_room', { roomId: projectId, username });

    // Listen for room data
    socketRef.current.on('room_data', (data) => {
      setCode(data.content || '');
      setLanguage(data.language || 'javascript');
      setProjectName(data.name || 'Untitled Project');
      setUsers(data.users || []);
    });

    // Listen for code updates from other users
    socketRef.current.on('code_updated', (data) => {
      if (editorRef.current) {
        const currentValue = editorRef.current.getValue();
        if (currentValue !== data.content) {
          setCode(data.content);
          editorRef.current.setValue(data.content);
        }
      }
    });

    // Listen for user joins/leaves
    socketRef.current.on('user_joined', (data) => {
      setUsers(data.users);
    });

    socketRef.current.on('user_left', (data) => {
      setUsers(data.users);
    });

    // Listen for project name updates
    socketRef.current.on('project_name_updated', (data) => {
      setProjectName(data.name);
    });

    // Listen for save confirmations
    socketRef.current.on('project_saved', (data) => {
      if (data.success) {
        setShowSaved(true);
        setTimeout(() => setShowSaved(false), 3000);
      }
    });

    socketRef.current.on('project_saved_by_other', (data) => {
      // Show notification that someone else saved
      console.log(`${data.savedBy} saved the project`);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [projectId, username]);

  // Fetch file list on mount and on file_list_updated event
  useEffect(() => {
    const fetchFiles = async () => {
      const res = await axios.get(`/api/projects/${projectId}/files`);
      setFiles(res.data.files);
      if (!selectedFile && res.data.files.length > 0) {
        setSelectedFile(res.data.files[0].name);
      }
    };
    fetchFiles();
    if (!socketRef.current) return;
    socketRef.current.on('file_list_updated', (data) => {
      setFiles(data.files);
      if (!selectedFile && data.files.length > 0) {
        setSelectedFile(data.files[0].name);
      }
    });
    return () => {
      if (socketRef.current) {
        socketRef.current.off('file_list_updated');
      }
    };
  }, [projectId]);

  // Fetch file content when selectedFile changes
  useEffect(() => {
    if (!selectedFile) return;
    const fetchContent = async () => {
      const res = await axios.get(`/api/projects/${projectId}/files/${selectedFile}`);
      setCode(res.data.content);
    };
    fetchContent();
  }, [selectedFile, projectId]);

  // Listen for file content updates from others
  useEffect(() => {
    if (!socketRef.current) return;
    const handler = (data) => {
      if (data.filename === selectedFile) {
        // Only update if content is different and not from this client
        if (data.content !== code && data.sender !== socketRef.current.id) {
          lastUpdateSource.current = 'remote';
          setCode(data.content);
          if (editorRef.current) editorRef.current.setValue(data.content);
        }
      }
    };
    socketRef.current.on('file_updated', handler);
    return () => {
      if (socketRef.current) {
        socketRef.current.off('file_updated', handler);
      }
    };
  }, [selectedFile, code]);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Set up cursor position tracking
    editor.onDidChangeCursorPosition((e) => {
      if (socketRef.current) {
        socketRef.current.emit('cursor_move', {
          roomId: projectId,
          position: e.position,
          username
        });
      }
    });
  };

  // Update handleEditorChange to mark local updates and emit sender id
  const handleEditorChange = (value, event) => {
    if (lastUpdateSource.current === 'remote') {
      lastUpdateSource.current = 'local';
      return;
    }
    setCode(value);
    if (socketRef.current && selectedFile) {
      socketRef.current.emit('file_change', {
        roomId: projectId,
        filename: selectedFile,
        content: value,
        sender: socketRef.current.id,
      });
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      socketRef.current.emit('save_project', {
        roomId: projectId,
        content: code,
        language,
        name: projectName
      });
    } catch (error) {
      console.error('Error saving project:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    setShowLanguageSelector(false);
    
    if (socketRef.current) {
      socketRef.current.emit('code_change', {
        roomId: projectId,
        content: code,
        language: newLanguage,
        cursorPosition: editorRef.current?.getPosition()
      });
    }
  };

  const copyProjectLink = () => {
    const link = `${window.location.origin}/editor/${projectId}`;
    navigator.clipboard.writeText(link);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  const updateProjectName = (newName) => {
    setProjectName(newName);
    if (socketRef.current) {
      socketRef.current.emit('project_name_change', {
        roomId: projectId,
        name: newName
      });
    }
  };

  const handleRun = async () => {
    setIsRunning(true);
    setRunError('');
    setOutput('');
    try {
      const response = await axios.post('/api/execute', {
        code,
        language,
      });
      if (response.data.stderr || response.data.compile_output) {
        setOutput((response.data.stderr || '') + (response.data.compile_output || ''));
      } else {
        setOutput(response.data.output || '');
      }
    } catch (error) {
      setRunError(error.response?.data?.message || 'Failed to execute code');
    } finally {
      setIsRunning(false);
    }
  };

  // File create, rename, delete handlers
  const handleCreateFile = async () => {
    if (!newFileName.trim()) return;
    socketRef.current.emit('file_create', {
      roomId: projectId,
      name: newFileName.trim(),
      content: '',
    });
    setNewFileName('');
  };
  const handleDeleteFile = (name) => {
    if (window.confirm(`Delete file ${name}?`)) {
      socketRef.current.emit('file_delete', {
        roomId: projectId,
        filename: name,
      });
      if (selectedFile === name) setSelectedFile(null);
    }
  };
  const handleRenameFile = (oldName) => {
    const newName = prompt('Rename file to:', oldName);
    if (newName && newName !== oldName) {
      socketRef.current.emit('file_rename', {
        roomId: projectId,
        oldName,
        newName,
      });
      if (selectedFile === oldName) setSelectedFile(newName);
    }
  };

  return (
    <div className="h-screen bg-slate-900 flex flex-row">
      {/* File Explorer Sidebar */}
      <div className="w-64 bg-slate-800 border-r border-slate-700 p-4 flex flex-col">
        <div className="flex items-center mb-4">
          <span className="text-lg font-semibold text-slate-200 flex-1">Files</span>
          <input
            type="text"
            value={newFileName}
            onChange={e => setNewFileName(e.target.value)}
            placeholder="New file"
            className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-xs text-white mr-2 w-24"
          />
          <button onClick={handleCreateFile} className="text-blue-400 hover:text-blue-300">
            <FolderPlus className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {files.map(f => (
            <div key={f.name} className={`flex items-center px-2 py-1 rounded cursor-pointer ${selectedFile === f.name ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-700'}`}
              onClick={() => setSelectedFile(f.name)}>
              <span className="flex-1 truncate">{f.name}</span>
              <button onClick={e => { e.stopPropagation(); handleRenameFile(f.name); }} className="text-yellow-400 hover:text-yellow-300 mx-1"><Pencil className="w-4 h-4" /></button>
              <button onClick={e => { e.stopPropagation(); handleDeleteFile(f.name); }} className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      </div>
      {/* Main Editor and Right Sidebar */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-slate-800 border-b border-slate-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center text-slate-300 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
              </button>
              
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-sm text-slate-300">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Project Name */}
              <input
                type="text"
                value={projectName}
                onChange={(e) => updateProjectName(e.target.value)}
                className="bg-slate-700 border border-slate-600 rounded px-3 py-1 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {/* Language Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowLanguageSelector(!showLanguageSelector)}
                  className="flex items-center space-x-2 bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded text-sm transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  <span>{languages.find(l => l.id === language)?.name || 'JavaScript'}</span>
                </button>
                
                {showLanguageSelector && (
                  <div className="absolute top-full right-0 mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                    {languages.map((lang) => (
                      <button
                        key={lang.id}
                        onClick={() => handleLanguageChange(lang.id)}
                        className={`block w-full text-left px-4 py-2 text-sm hover:bg-slate-700 ${
                          language === lang.id ? 'bg-blue-600 text-white' : 'text-slate-300'
                        }`}
                      >
                        {lang.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : 'Save'}</span>
              </button>

              {/* Share Button */}
              <button
                onClick={copyProjectLink}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm font-medium transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>

              {/* Run Button (in header, next to Save/Share) */}
              <button
                onClick={handleRun}
                disabled={isRunning}
                className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50"
              >
                <span>{isRunning ? 'Running...' : 'Run'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Notifications */}
        {(showCopied || showSaved) && (
          <div className="fixed top-4 right-4 z-50">
            {showCopied && (
              <div className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg">
                <CheckCircle className="w-5 h-5" />
                <span>Link copied to clipboard!</span>
              </div>
            )}
            {showSaved && (
              <div className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">
                <CheckCircle className="w-5 h-5" />
                <span>Project saved successfully!</span>
              </div>
            )}
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Editor */}
          <div className="flex-1 flex flex-col">
            <Editor
              height="100%"
              language={language}
              value={code}
              onChange={handleEditorChange}
              onMount={handleEditorDidMount}
              theme="vs-dark"
              options={{
                minimap: { enabled: true },
                fontSize: 14,
                lineNumbers: 'on',
                roundedSelection: false,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                wordWrap: 'on',
                folding: true,
                foldingStrategy: 'indentation',
                showFoldingControls: 'always',
                disableLayerHinting: true,
                renderLineHighlight: 'all',
                selectOnLineNumbers: true,
                glyphMargin: true,
                useTabStops: false,
                fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
              }}
            />
          </div>

          {/* Sidebar */}
          <div className="w-80 bg-slate-800 border-l border-slate-700 p-4">
            <div className="space-y-6">
              {/* Users */}
              <div>
                <h3 className="text-lg font-semibold text-slate-200 mb-3 flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Active Users ({users.length})
                </h3>
                <div className="space-y-2">
                  {users.map((user, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 p-2 bg-slate-700 rounded"
                    >
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-sm text-slate-300">{user}</span>
                      {user === username && (
                        <span className="text-xs text-blue-400">(You)</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Project Info */}
              <div>
                <h3 className="text-lg font-semibold text-slate-200 mb-3">Project Info</h3>
                <div className="space-y-2 text-sm text-slate-300">
                  <div>
                    <span className="font-medium">Project ID:</span>
                    <div className="flex items-center space-x-2 mt-1">
                      <code className="bg-slate-700 px-2 py-1 rounded text-xs flex-1">
                        {projectId}
                      </code>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(projectId);
                          setShowCopied(true);
                          setTimeout(() => setShowCopied(false), 2000);
                        }}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Language:</span>
                    <span className="ml-2">{languages.find(l => l.id === language)?.name}</span>
                  </div>
                  <div>
                    <span className="font-medium">Lines:</span>
                    <span className="ml-2">{code.split('\n').length}</span>
                  </div>
                  <div>
                    <span className="font-medium">Characters:</span>
                    <span className="ml-2">{code.length}</span>
                  </div>
                </div>
              </div>

              {/* Output (restore here) */}
              <div>
                <h3 className="text-lg font-semibold text-slate-200 mb-3">Output</h3>
                <div className="bg-slate-900 border border-slate-700 rounded p-2 text-sm text-slate-100 whitespace-pre-wrap min-h-[60px] max-h-40 overflow-y-auto">
                  {isRunning && <span>Running...</span>}
                  {runError && <span className="text-red-400">{runError}</span>}
                  {!isRunning && !runError && output && <span>{output}</span>}
                  {!isRunning && !runError && !output && <span className="text-slate-500">No output yet.</span>}
                </div>
              </div>
              {/* Connection Status */}
              <div>
                <h3 className="text-lg font-semibold text-slate-200 mb-3">Connection</h3>
                <div className="flex items-center space-x-2">
                  {isConnected ? (
                    <>
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-sm text-green-400">Connected</span>
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      <span className="text-sm text-red-400">Disconnected</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor; 