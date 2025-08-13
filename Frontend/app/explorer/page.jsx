'use client'

import { useEffect, useMemo, useState, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Github, Sparkles, Code, GitBranch, Users, Zap, ArrowRight, Bot, FileCode, Search, Star, GitFork, ExternalLink, Loader2, ChevronRight, ChevronDown, File, Folder, MessageCircle, BookOpen, Trophy, Target, Send, X, Minimize2, Maximize2, GripVertical } from 'lucide-react'
import Link from 'next/link'
import IssueAnalysis from '@/components/IssueAnalysis'
import ProjectSummary from '@/components/ProjectSummary'
import RepositoryOverview from '@/components/RepositoryOverview'
import CodeViewSummary from '@/components/CodeViewSummary'
import IssuesSummary from '@/components/IssuesSummary'
import LearnSummary from '@/components/LearnSummary'
import AISummary from '@/components/AISummary'

export default function Explorer() {
  const searchParams = useSearchParams()
  const repoFullName = useMemo(() => searchParams.get('repo') || '', [searchParams])

  // Resizable panel state
  const [leftPanelWidth, setLeftPanelWidth] = useState(320) // 320px default
  const [rightPanelWidth, setRightPanelWidth] = useState(320) // 320px default
  const [isDraggingLeft, setIsDraggingLeft] = useState(false)
  const [isDraggingRight, setIsDraggingRight] = useState(false)
  const leftDragRef = useRef(null)
  const rightDragRef = useRef(null)

  const [selectedFile, setSelectedFile] = useState('')
  const [selectedNode, setSelectedNode] = useState(null) // { type, path, name }
  const [chatOpen, setChatOpen] = useState(false)
  const [chatMessage, setChatMessage] = useState('')
  const [expandedFolders, setExpandedFolders] = useState(new Set())
  const [treeItems, setTreeItems] = useState([])
  const [localTree, setLocalTree] = useState([])
  const [detectedTechs, setDetectedTechs] = useState([])
  const [resources, setResources] = useState([])
  const [selection, setSelection] = useState(new Set())
  const [loading, setLoading] = useState(false)
  const [fileContent, setFileContent] = useState('')
  const [user, setUser] = useState(null)
  const [repoInfo, setRepoInfo] = useState(null)
  const [repoLoading, setRepoLoading] = useState(false)
  const [repoError, setRepoError] = useState(null)
  const [issues, setIssues] = useState([])
  const [issuesLoading, setIssuesLoading] = useState(false)
  const [issuesError, setIssuesError] = useState(null)
  const [issueState, setIssueState] = useState('open')
  const [aiSummaries, setAiSummaries] = useState({})
  const [aiLoading, setAiLoading] = useState({})
  const [contextualLanguage, setContextualLanguage] = useState('en')
  const [contextualResources, setContextualResources] = useState([])
  
  // Issue analysis state
  const [selectedIssue, setSelectedIssue] = useState(null)
  const [showIssueAnalysis, setShowIssueAnalysis] = useState(false)

  // Simple tech detection based on filename/extension
  const detectTechnologiesForPath = (filePath) => {
    const lower = String(filePath).toLowerCase()
    const techs = new Set()
    const ext = lower.slice(lower.lastIndexOf('.'))
    const add = (t) => techs.add(t)
    if (ext === '.js') add('JavaScript')
    if (ext === '.jsx') add('React')
    if (ext === '.ts') add('TypeScript')
    if (ext === '.tsx') { add('React'); add('TypeScript') }
    if (ext === '.css') add('CSS')
    if (ext === '.scss') add('Sass')
    if (ext === '.md') add('Markdown')
    if (lower.includes('package.json')) add('Node.js')
    if (lower.includes('next.config')) add('Next.js')
    if (lower.includes('tailwind.config')) add('TailwindCSS')
    if (lower.includes('vite.config')) add('Vite')
    if (lower.includes('tsconfig')) add('TypeScript')
    return Array.from(techs)
  }

  // Build a nested tree structure from GitHub Trees API list
  const buildTree = (flatTree) => {
    const root = {}
    for (const node of flatTree) {
      const parts = node.path.split('/')
      let current = root
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i]
        const isLeaf = i === parts.length - 1
        if (!current[part]) {
          current[part] = isLeaf
            ? { __meta: { type: node.type, path: node.path } }
            : { __meta: { type: 'tree', path: parts.slice(0, i + 1).join('/') } }
        }
        current = current[part]
      }
    }
    const toArray = (obj, name = '') => {
      const entries = Object.entries(obj).filter(([k]) => k !== '__meta')
      return entries
        .map(([key, value]) => {
          const meta = value.__meta || { type: 'tree', path: key }
          if (meta.type === 'tree') {
            return { name: key, type: 'folder', path: meta.path, children: toArray(value, key), technologies: [] }
          }
          return { name: key, type: 'file', path: meta.path, technologies: detectTechnologiesForPath(meta.path) }
        })
        .sort((a, b) => (a.type === b.type ? a.name.localeCompare(b.name) : a.type === 'folder' ? -1 : 1))
    }
    return toArray(root)
  }

  // Fetch user data on component mount
  useEffect(() => {
    fetch('http://localhost:5001/api/github/user', { 
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch user');
        return res.json();
      })
      .then(setUser)
      .catch((error) => {
        console.error('Error fetching user:', error);
        setUser(null);
      })
  }, [])

  useEffect(() => {
    if (!repoFullName) return;
    
    const fetchRepoInfo = async () => {
      setRepoLoading(true)
      setRepoError(null)
      
      try {
        const res = await fetch(`http://localhost:5001/api/github/repo?full_name=${encodeURIComponent(repoFullName)}`, {
          credentials: 'include',
        });
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        
        if (data.error) {
          throw new Error(data.error);
        }
        
        setRepoInfo(data);
        setRepoError(null);
      } catch (error) {
        console.error('Error fetching repo info:', error);
        setRepoInfo(null);
        setRepoError(error.message);
      } finally {
        setRepoLoading(false);
      }
    };
    
    fetchRepoInfo();
  }, [repoFullName])

  useEffect(() => {
    if (!repoFullName) return;
    
    const fetchIssues = async () => {
      setIssuesLoading(true)
      setIssuesError(null)
      
      try {
        const res = await fetch(`http://localhost:5001/api/github/issues?full_name=${encodeURIComponent(repoFullName)}&state=${issueState}&per_page=20`, {
          credentials: 'include',
        });
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        
        if (data.error) {
          throw new Error(data.error);
        }
        
        setIssues(data);
        setIssuesError(null);
      } catch (error) {
        console.error('Error fetching issues:', error);
        setIssues([]);
        setIssuesError(error.message);
      } finally {
        setIssuesLoading(false);
      }
    };
    
    fetchIssues();
  }, [repoFullName, issueState])

  // Fetch tree when repo changes
  useEffect(() => {
    if (!repoFullName) return
    setLoading(true)
    fetch(`http://localhost:5001/api/github/tree?full_name=${encodeURIComponent(repoFullName)}`, { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch tree')
        return res.json()
      })
      .then(data => {
        const items = buildTree(data.tree)
        setTreeItems(items)
        // Also use this as the source for the right-side repo files section
        setLocalTree(items)
        // Expand top-level folders by default
        const topFolders = items.filter(i => i.type === 'folder').map(f => f.path)
        setExpandedFolders(new Set(topFolders))
        // Try selecting README.md or package.json by default
        const defaultFile = items.find(i => i.type === 'file' && /readme\.md/i.test(i.name)) || items.find(i => i.type === 'file' && i.name === 'package.json')
        if (defaultFile) setSelectedFile(defaultFile.path)
        // Derive detected technologies from the repo tree
        const techSet = new Set()
        const collect = (arr) => arr.forEach(it => {
          if (Array.isArray(it.technologies)) it.technologies.forEach(t => techSet.add(t))
          if (Array.isArray(it.children)) collect(it.children)
        })
        collect(items)
        setDetectedTechs(Array.from(techSet))
      })
      .catch(err => {
        console.error('Tree fetch error:', err)
        setTreeItems([])
        setLocalTree([])
        setDetectedTechs([])
      })
      .finally(() => setLoading(false))
  }, [repoFullName])

  // Fetch file content when selection changes
  useEffect(() => {
    if (!repoFullName || !selectedFile) return
    fetch(`http://localhost:5001/api/github/file?full_name=${encodeURIComponent(repoFullName)}&path=${encodeURIComponent(selectedFile)}`, { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch file')
        return res.json()
      })
      .then(data => setFileContent(data.content || ''))
      .catch(err => {
        console.error('File fetch error:', err)
        setFileContent('')
      })
  }, [repoFullName, selectedFile])

  // Fetch resources based on detected technologies
  useEffect(() => {
    if (detectedTechs.length === 0) return
    const qs = encodeURIComponent(detectedTechs.join(','))
    fetch(`http://localhost:5001/api/learn/resources?technologies=${qs}`)
      .then(r => r.json())
      .then(data => setResources(data.resources || []))
      .catch(() => setResources([]))
  }, [detectedTechs])

  // Fetch contextual resources when file selection changes (use GitHub-aware endpoint)
  useEffect(() => {
    if (!selectedFile || !repoFullName) return
    const url = `http://localhost:5001/api/learn/github-contextual?full_name=${encodeURIComponent(repoFullName)}&path=${encodeURIComponent(selectedFile)}&language=${encodeURIComponent(contextualLanguage)}`
    fetch(url)
      .then(r => r.json())
      .then(data => setContextualResources(Array.isArray(data.items) ? data.items : []))
      .catch(() => setContextualResources([]))
  }, [selectedFile, contextualLanguage, repoFullName])

  const toggleFolder = (path) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(path)) {
      newExpanded.delete(path)
    } else {
      newExpanded.add(path)
    }
    setExpandedFolders(newExpanded)
  }

  const getAISummary = async (type, path, content = '', children = []) => {
    if (aiSummaries[path]) return // Already have summary
    
    setAiLoading(prev => ({ ...prev, [path]: true }))
    
    try {
      const response = await fetch('http://localhost:5001/api/github/ai-summary', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          path,
          content,
          repoName: repoFullName,
          children
        })
      })

      if (response.ok) {
        const data = await response.json()
        setAiSummaries(prev => ({ ...prev, [path]: data.summary }))
      } else {
        console.error(`❌ AI Summary failed for ${path}:`, response.status)
      }
    } catch (error) {
      console.error(`❌ Error fetching AI summary for ${path}:`, error)
    } finally {
      setAiLoading(prev => ({ ...prev, [path]: false }))
    }
  }

  const renderFileTree = (items, level = 0) => {
    return items.map((item, index) => (
      <div key={index} style={{ marginLeft: `${level * 16}px` }}>
        <div 
          className={`flex items-center space-x-2 p-2 rounded-lg hover:bg-blue-500/10 cursor-pointer transition-colors group ${
            selectedFile === item.path ? 'bg-blue-500/20 border-l-2 border-blue-400' : ''
          }`}
          onClick={() => {
            if (item.type === 'folder') {
              toggleFolder(item.path)
              // Get AI summary for folder
              setSelectedNode(item)
              getAISummary('folder', item.path, '', item.children || [])
            } else {
              setSelectedFile(item.path)
              setSelectedNode(item)
              // Fetch file content first, then get AI summary
              fetch(`http://localhost:5001/api/github/file?full_name=${encodeURIComponent(repoFullName)}&path=${encodeURIComponent(item.path)}`, { 
                credentials: 'include' 
              })
                .then(res => {
                  if (!res.ok) throw new Error('Failed to fetch file')
                  return res.json()
                })
                .then(data => {
                  const content = data.content || ''
                  setFileContent(content)
                  // Now get AI summary with the actual content
                  getAISummary('file', item.path, content)
                })
                .catch(err => {
                  console.error('File fetch error:', err)
                  setFileContent('')
                  // Still try to get AI summary even if content fetch fails
                  getAISummary('file', item.path, '')
                })
            }
          }}
          // Removed hover calls to avoid noise; click-based only
        >
          {item.type === 'folder' ? (
            expandedFolders.has(item.path) ? 
              <ChevronDown className="w-4 h-4 text-gray-400" /> : 
              <ChevronRight className="w-4 h-4 text-gray-400" />
          ) : null}
          
          {item.type === 'folder' ? (
            <Folder className="w-4 h-4 text-blue-400" />
          ) : (
            <File className="w-4 h-4 text-gray-400" />
          )}
          
          <span className="text-white text-sm flex-1">{item.name}</span>
          {Array.isArray(item.technologies) && item.technologies.slice(0,2).map((t) => (
            <span key={t} className="text-[10px] px-1 py-0.5 rounded bg-white/10 text-gray-300 border border-white/10">{t}</span>
          ))}
        </div>
        
        {/* No inline tooltip; summaries will show in Overview + Sidebar */}
        
        {item.type === 'folder' && expandedFolders.has(item.path) && item.children && (
          <div>
            {renderFileTree(item.children, level + 1)}
          </div>
        )}
      </div>
    ))
  }

  // Repo tree with selection toggling for export (currently export is disabled for remote repos)
  const renderRepoTree = (items, level = 0) => {
    return items.map((item, idx) => (
      <div key={`R-${idx}`} style={{ marginLeft: `${level * 16}px` }}>
        <div
          className={`flex items-center space-x-2 p-2 rounded-lg hover:bg-green-500/10 cursor-pointer transition-colors group`}
          onClick={() => {
            if (item.type === 'folder') {
              toggleFolder(`repo:${item.path}`)
            } else {
              const next = new Set(selection)
              const id = item.path
              if (next.has(id)) next.delete(id); else next.add(id)
              setSelection(next)
            }
          }}
        >
          {item.type === 'folder' ? (
            expandedFolders.has(`repo:${item.path}`) ?
              <ChevronDown className="w-4 h-4 text-gray-400" /> :
              <ChevronRight className="w-4 h-4 text-gray-400" />
          ) : null}

          {item.type === 'folder' ? (
            <Folder className="w-4 h-4 text-green-400" />
          ) : (
            <File className="w-4 h-4 text-gray-400" />
          )}

          <span className="text-white text-sm flex-1">{item.name}</span>
          {item.type === 'file' && Array.isArray(item.technologies) && item.technologies.slice(0,2).map((t) => (
            <span key={t} className="text-[10px] px-1 py-0.5 rounded bg-white/10 text-gray-300 border border-white/10">{t}</span>
          ))}
          {item.type === 'file' && selection.has(item.path) && (
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          )}
        </div>
        {item.type === 'folder' && expandedFolders.has(`repo:${item.path}`) && item.children && (
          <div>{renderRepoTree(item.children, level + 1)}</div>
        )}
      </div>
    ))
  }

  // Resizable panel handlers
  const handleMouseDown = (e, isLeft) => {
    e.preventDefault()
    if (isLeft) {
      setIsDraggingLeft(true)
    } else {
      setIsDraggingRight(true)
    }
  }

  const handleMouseMove = (e) => {
    if (isDraggingLeft) {
      const newWidth = e.clientX
      if (newWidth > 200 && newWidth < window.innerWidth - 400) {
        setLeftPanelWidth(newWidth)
      }
    } else if (isDraggingRight) {
      const newWidth = window.innerWidth - e.clientX
      if (newWidth > 200 && newWidth < window.innerWidth - 400) {
        setRightPanelWidth(newWidth)
      }
    }
  }

  const handleMouseUp = () => {
    setIsDraggingLeft(false)
    setIsDraggingRight(false)
  }

  useEffect(() => {
    if (isDraggingLeft || isDraggingRight) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDraggingLeft, isDraggingRight])

  // Save panel widths to localStorage
  useEffect(() => {
    const savedLeftWidth = localStorage.getItem('openhub-left-panel-width')
    const savedRightWidth = localStorage.getItem('openhub-right-panel-width')
    if (savedLeftWidth) setLeftPanelWidth(parseInt(savedLeftWidth))
    if (savedRightWidth) setRightPanelWidth(parseInt(savedRightWidth))
  }, [])

  useEffect(() => {
    localStorage.setItem('openhub-left-panel-width', leftPanelWidth.toString())
  }, [leftPanelWidth])

  useEffect(() => {
    localStorage.setItem('openhub-right-panel-width', rightPanelWidth.toString())
  }, [rightPanelWidth])

  return (
    <div className={`h-screen bg-black flex overflow-hidden ${isDraggingLeft || isDraggingRight ? 'cursor-col-resize' : ''}`}>
      {/* Left Sidebar - File Tree */}
      <div 
        className="bg-black/20 backdrop-blur-lg border-r border-white/10 flex flex-col min-w-0 flex-shrink-0"
        style={{ width: `${leftPanelWidth}px` }}
      >
        <div className="p-4 border-b border-white/10 flex-shrink-0">
          <Link href="/dashboard" className="flex items-center space-x-2 mb-4">
            <Bot className="w-6 h-6 text-cyan-400" />
            <span className="text-lg font-bold text-white">OpenHub AI</span>
          </Link>
          <div className="flex items-center space-x-2 text-sm text-gray-400 mb-2">
            <Github className="w-4 h-4" />
            <span className="truncate">{repoFullName || 'Select a repository'}</span>
            <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-400 text-xs flex-shrink-0">
              {repoInfo?.language || 'Unknown'}
            </Badge>
          </div>
          {user && (
            <div className="flex items-center space-x-2 text-sm text-gray-300">
              <Avatar className="w-6 h-6 border border-white/20 flex-shrink-0">
                <AvatarImage src={user.avatar_url} />
                <AvatarFallback className="bg-white/10 text-white text-xs">
                  {user.login?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="truncate">{user.name || user.login}</span>
            </div>
          )}
        </div>
        
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-1 pb-4">
            {loading ? (
              <div className="text-gray-400 text-sm">Loading tree...</div>
            ) : (
              renderFileTree(treeItems)
            )}
          </div>
        </ScrollArea>

        {/* Onboarding Progress */}
        <div className="p-4 border-t border-white/10 flex-shrink-0">
          <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white text-sm font-medium">Onboarding Progress</span>
                <Trophy className="w-4 h-4 text-yellow-400" />
              </div>
              <Progress value={75} className="mb-2" />
              <div className="text-xs text-gray-400">3 of 4 steps completed</div>
              <div className="mt-2 space-y-1">
                <div className="flex items-center text-xs text-green-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  Explored file structure
                </div>
                <div className="flex items-center text-xs text-green-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  Read AI summaries
                </div>
                <div className="flex items-center text-xs text-green-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  Asked AI questions
                </div>
                <div className="flex items-center text-xs text-gray-400">
                  <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                  Find first issue to contribute
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Left Panel Drag Handle */}
      <div 
        className="w-2 bg-gradient-to-b from-white/5 to-white/10 hover:from-white/10 hover:to-white/20 cursor-col-resize flex items-center justify-center group transition-all duration-200 hover:w-3"
        onMouseDown={(e) => handleMouseDown(e, true)}
        ref={leftDragRef}
        title="Drag to resize left panel"
      >
        <div className="w-1 h-8 bg-white/30 rounded-full group-hover:bg-white/50 transition-colors"></div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation */}
        <header className="bg-black/20 backdrop-blur-lg border-b border-white/10 p-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 min-w-0">
              <h1 className="text-xl font-semibold text-white">Code Explorer</h1>
              <Badge variant="secondary" className="bg-green-500/20 text-green-400 flex-shrink-0">
                <Zap className="w-3 h-3 mr-1" />
                AI Active
              </Badge>
              {detectedTechs.length > 0 && (
                <div className="hidden md:flex items-center gap-1 ml-2">
                  {detectedTechs.slice(0,5).map(t => (
                    <Badge key={t} variant="secondary" className="bg-white/5 text-gray-200 flex-shrink-0">{t}</Badge>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4 flex-shrink-0">
              <Button 
                variant="outline" 
                size="sm" 
                className="border-white/20 text-white hover:bg-white/10"
                onClick={() => {
                  setLeftPanelWidth(320)
                  setRightPanelWidth(320)
                }}
                title="Reset panel widths"
              >
                <Maximize2 className="w-4 h-4 mr-2" />
                Reset Layout
              </Button>
              <Button variant="outline" size="sm" className="border-white/20 text-white">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
              <Avatar className="border-2 border-white/20">
                <AvatarImage src={user?.avatar_url || '/diverse-user-avatars.png'} />
                <AvatarFallback className="bg-white/10 text-white">
                  {user?.login?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 flex min-h-0">
          {/* Center Panel */}
          <div className="flex-1 p-6 min-w-0 max-w-full">
            <Tabs defaultValue="overview" className="h-full flex flex-col">
              <TabsList className="bg-white/5 border-white/10 flex-shrink-0">
                <TabsTrigger value="overview" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="code" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
                  Code View
                </TabsTrigger>
                <TabsTrigger value="issues" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
                  Issues {issues.length > 0 && `(${issues.length})`}
                </TabsTrigger>
                <TabsTrigger value="learn" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
                  Learn
                </TabsTrigger>
                <TabsTrigger value="ai-summary" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
                  🤖 AI Summary
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6 flex-1 min-h-0">
                <ScrollArea className="h-full">
                  <div className="space-y-6 pr-4 max-w-full">
                    {/* Project Summary */}
                    <ProjectSummary
                      repoInfo={repoInfo}
                      repoLoading={repoLoading}
                      repoError={repoError}
                      repoFullName={repoFullName}
                      onRefresh={() => window.location.reload()}
                      treeItems={treeItems}
                      detectedTechs={detectedTechs}
                    />

                    {/* Repository Overview */}
                    <RepositoryOverview
                      treeItems={treeItems}
                      repoInfo={repoInfo}
                      detectedTechs={detectedTechs}
                    />
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="code" className="mt-6 flex-1 min-h-0">
                <ScrollArea className="h-full">
                  <div className="space-y-6 pr-4 max-w-full">
                    <CodeViewSummary
                      treeItems={treeItems}
                      detectedTechs={detectedTechs}
                      repoInfo={repoInfo}
                    />
                    
                    <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center">
                          <FileCode className="w-5 h-5 mr-2 text-purple-400" />
                          {selectedFile ? selectedFile.split('/').pop() : 'Select a file from the left'}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {selectedFile ? (
                            <div className="bg-slate-800/50 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="text-white font-medium">Code View</h4>
                                <div className="flex items-center space-x-2">
                                  <Badge variant="outline" className="border-cyan-400/50 text-cyan-400 text-xs">
                                    {selectedFile.split('.').pop() || 'text'}
                                  </Badge>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="border-white/20 text-white"
                                    onClick={() => {
                                      if (fileContent) {
                                        navigator.clipboard.writeText(fileContent);
                                      }
                                    }}
                                  >
                                    Copy
                                  </Button>
                                </div>
                              </div>
                              <div className="relative">
                                <ScrollArea className="max-h-96">
                                  <pre className="text-sm text-gray-300 whitespace-pre-wrap bg-black/30 rounded p-4 break-words">
                                    {fileContent || 'Loading file content...'}
                                  </pre>
                                </ScrollArea>
                                {!fileContent && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded">
                                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-12">
                              <FileCode className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                              <h3 className="text-white text-lg font-medium mb-2">No File Selected</h3>
                              <p className="text-gray-400">
                                Select a file from the left sidebar to view its code content.
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="issues" className="mt-6 flex-1 min-h-0">
                <ScrollArea className="h-full">
                  <div className="space-y-6 pr-4 max-w-full">
                    <IssuesSummary
                      issues={issues}
                      repoInfo={repoInfo}
                      issueState={issueState}
                      setIssueState={setIssueState}
                    />
                    
                    <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
, m                      <CardHeader className="sticky top-0 bg-white/5 backdrop-blur-xl border-b border-white/10 z-10 -mx-6 -mt-6 px-6 pt-6">
                        <CardTitle className="text-white flex items-center justify-between">
                          <div className="flex items-center">
                            <Target className="w-5 h-5 mr-2 text-green-400" />
                            Repository Issues
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              onClick={() => {
                                // Trigger AI analysis of the whole repo
                                setShowIssueAnalysis(true)
                                setSelectedIssue({ 
                                  number: 'repo-analysis',
                                  title: 'Repository Analysis',
                                  body: 'AI analysis of the entire repository to suggest top 3 issues'
                                })
                              }}
                              variant="outline"
                              size="sm"
                              className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20"
                            >
                              <Bot className="w-3 h-3 mr-2" />
                              AI Analysis
                            </Button>
                            <Button
                              onClick={() => {
                                // Open GitHub new issue page
                                if (repoInfo?.html_url) {
                                  window.open(`${repoInfo.html_url}/issues/new`, '_blank')
                                }
                              }}
                              variant="default"
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <GitBranch className="w-3 h-3 mr-2" />
                              New Issue
                            </Button>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center space-x-4">
                            <Input 
                              placeholder="Search issues..."
                              className="bg-white/5 border-white/20 text-white placeholder-gray-400 flex-1"
                            />
                            <div className="flex items-center space-x-2">
                              <Button
                                variant={issueState === 'open' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setIssueState('open')}
                                className={issueState === 'open' ? 'bg-green-600 hover:bg-green-700' : 'border-white/20 text-white'}
                              >
                                Open
                              </Button>
                              <Button
                                variant={issueState === 'closed' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setIssueState('closed')}
                                className={issueState === 'closed' ? 'bg-red-600 hover:bg-red-700' : 'border-white/20 text-white'}
                              >
                                Closed
                              </Button>
                              <Button
                                variant={issueState === 'all' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setIssueState('all')}
                                className={issueState === 'all' ? 'bg-blue-600 hover:bg-blue-700' : 'border-white/20 text-white'}
                              >
                                All
                              </Button>
                            </div>
                          </div>
                          
                          {issuesLoading ? (
                            <div className="text-center py-8">
                              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-gray-400" />
                              <p className="text-gray-400">Loading issues...</p>
                            </div>
                          ) : issuesError ? (
                            <div className="text-center py-8">
                              <div className="text-red-400 mb-4">
                                <X className="w-8 h-8 mx-auto mb-2" />
                                Failed to load issues
                              </div>
                              <p className="text-sm text-gray-500 mb-4">
                                {issuesError}
                              </p>
                              <Button 
                                onClick={() => window.location.reload()} 
                                variant="outline" 
                                size="sm"
                                className="border-white/20 text-white"
                              >
                                Try Again
                              </Button>
                            </div>
                          ) : issues.length === 0 ? (
                            <div className="text-center py-8">
                              <div className="text-gray-400 mb-4">
                                <Target className="w-8 h-8 mx-auto mb-2" />
                                No issues found
                              </div>
                              <p className="text-sm text-gray-500">
                                This repository doesn't have any open issues.
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {issues.map((issue) => (
                                <div key={issue.id} className="p-4 bg-white/5 rounded-lg border-l-4 border-green-400 hover:bg-white/10 transition-colors">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                      {issue.labels.map((label) => (
                                        <Badge 
                                          key={label.id} 
                                          className="text-xs"
                                          style={{ 
                                            backgroundColor: `#${label.color}20`, 
                                            color: `#${label.color}`,
                                            border: `1px solid #${label.color}40`
                                          }}
                                        >
                                          {label.name}
                                        </Badge>
                                      ))}
                                    </div>
                                    <span className="text-xs text-gray-400">#{issue.number}</span>
                                  </div>
                                  <h4 className="text-white font-medium mb-1">
                                    <a 
                                      href={issue.html_url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="hover:text-cyan-400 transition-colors"
                                    >
                                      {issue.title}
                                    </a>
                                  </h4>
                                  <p className="text-gray-400 text-sm mb-2 line-clamp-2">
                                    {issue.body ? issue.body.substring(0, 150) + (issue.body.length > 150 ? '...' : '') : 'No description provided.'}
                                  </p>
                                  <div className="flex items-center justify-between text-xs text-gray-500">
                                    <div className="flex items-center space-x-4">
                                      <span className="flex items-center">
                                        <MessageCircle className="w-3 h-3 mr-1" />
                                        {issue.comments} comments
                                      </span>
                                      <span>Opened by {issue.user.login}</span>
                                      <span>{new Date(issue.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      {issue.assignees && issue.assignees.length > 0 && (
                                        <div className="flex items-center space-x-1">
                                          <span>Assigned to:</span>
                                          {issue.assignees.map((assignee) => (
                                            <Avatar key={assignee.id} className="w-4 h-4">
                                              <AvatarImage src={assignee.avatar_url} />
                                              <AvatarFallback className="text-xs">
                                                {assignee.login[0].toUpperCase()}
                                              </AvatarFallback>
                                            </Avatar>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                    
                                    {/* Analyze Issue Button */}
                                    <div className="mt-3 pt-3 border-t border-white/10">
                                      <Button
                                        onClick={() => {
                                          setSelectedIssue(issue)
                                          setShowIssueAnalysis(true)
                                        }}
                                        variant="outline"
                                        size="sm"
                                        className="w-full bg-cyan-500/10 hover:bg-cyan-500/20 border-cyan-500/30 text-cyan-400 hover:text-cyan-300"
                                      >
                                        <Bot className="w-3 h-3 mr-2" />
                                        Analyze Issue
                                      </Button>
                                    </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="learn" className="mt-6 flex-1 min-h-0">
                <ScrollArea className="h-full">
                  <div className="space-y-6 pr-4 max-w-full">
                    <LearnSummary
                      detectedTechs={detectedTechs}
                      repoInfo={repoInfo}
                      contextualResources={contextualResources}
                    />
                    
                    <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center">
                          <BookOpen className="w-5 h-5 mr-2 text-cyan-400" />
                          Technologies Detected
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {detectedTechs.length === 0 ? (
                            <span className="text-gray-400 text-sm">Scanning repository...</span>
                          ) : (
                            detectedTechs.map(t => (
                              <Badge key={t} className="bg-white/10 text-white border border-white/10">{t}</Badge>
                            ))
                          )}
                        </div>
                        <div className="mt-4">
                          <h4 className="text-white text-sm mb-2">Repository Files (GitHub)</h4>
                          <ScrollArea className="max-h-[360px]">
                            <div className="pr-2">
                              {renderRepoTree(localTree)}
                            </div>
                          </ScrollArea>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="ai-summary" className="mt-6 flex-1 min-h-0">
                <ScrollArea className="h-full">
                  <div className="pr-4 max-w-full">
                    <AISummary
                      selectedNode={selectedNode}
                      selectedFile={selectedFile}
                      aiLoading={aiLoading}
                      aiSummaries={aiSummaries}
                      repoInfo={repoInfo}
                    />
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Panel Drag Handle */}
          <div 
            className="w-2 bg-gradient-to-b from-white/5 to-white/10 hover:from-white/10 hover:to-white/20 cursor-col-resize flex items-center justify-center group transition-all duration-200 hover:w-3"
            onMouseDown={(e) => handleMouseDown(e, false)}
            ref={rightDragRef}
            title="Drag to resize right panel"
          >
            <div className="w-1 h-8 bg-white/30 rounded-full group-hover:bg-white/50 transition-colors"></div>
          </div>

          {/* Right Sidebar */}
          <div 
            className="bg-black/10 backdrop-blur-lg border-l border-white/10 p-4 space-y-6 flex-shrink-0"
            style={{ width: `${rightPanelWidth}px` }}
          >
            <ScrollArea className="h-full">
              <div className="space-y-6 pr-4">
                {/* Learning Resources */}
                <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white text-sm flex items-center">
                      <BookOpen className="w-4 h-4 mr-2 text-cyan-400" />
                      Contextual Learning
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                      <h4 className="text-cyan-400 text-sm font-medium">React Components</h4>
                      <p className="text-gray-400 text-xs mt-1">Learn component patterns</p>
                    </div>
                    <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                      <h4 className="text-purple-400 text-sm font-medium">TypeScript Props</h4>
                      <p className="text-gray-400 text-xs mt-1">Type-safe component APIs</p>
                    </div>
                    <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                      <h4 className="text-yellow-400 text-sm font-medium">Accessibility</h4>
                      <p className="text-gray-400 text-xs mt-1">WCAG compliance guide</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start border-white/20 text-white">
                      <GitBranch className="w-4 h-4 mr-2" />
                      Create Branch
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start border-white/20 text-white">
                      <GitFork className="w-4 h-4 mr-2" />
                      Fork Repository
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start border-white/20 text-white">
                      <Star className="w-4 h-4 mr-2" />
                      Star Project
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* Issue Analysis Modal */}
      {showIssueAnalysis && selectedIssue && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <IssueAnalysis
              issue={selectedIssue}
              repoFullName={repoFullName}
              onClose={() => {
                setShowIssueAnalysis(false)
                setSelectedIssue(null)
              }}
            />
          </div>
        </div>
      )}

      {/* AI Chat Widget */}
      <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${chatOpen ? 'w-96 h-96' : 'w-16 h-16'}`}>
        {chatOpen ? (
          <Card className="bg-black/80 backdrop-blur-lg border-cyan-400/50 h-full flex flex-col">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bot className="w-5 h-5 text-cyan-400" />
                  <span className="text-white font-medium">AI Assistant</span>
                </div>
                <div className="flex space-x-1">
                  <Button size="sm" variant="ghost" onClick={() => setChatOpen(false)}>
                    <Minimize2 className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setChatOpen(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-4">
              <ScrollArea className="flex-1 mb-4">
                <div className="space-y-3">
                  <div className="bg-cyan-500/20 rounded-lg p-3">
                    <p className="text-cyan-400 text-sm">
                      Hi! I'm here to help you understand this codebase. Ask me anything!
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-white text-sm">
                      Where is authentication handled in this project?
                    </p>
                  </div>
                  <div className="bg-cyan-500/20 rounded-lg p-3">
                    <p className="text-cyan-400 text-sm">
                      Authentication is handled in the `src/auth` directory. The main files are `AuthProvider.tsx` and `useAuth.ts` hook.
                    </p>
                  </div>
                </div>
              </ScrollArea>
              <div className="flex space-x-2">
                <Input 
                  placeholder="Ask about this codebase..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  className="bg-white/5 border-white/20 text-white placeholder-gray-400 text-sm"
                />
                <Button size="sm" className="bg-cyan-500 hover:bg-cyan-600">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Button 
            onClick={() => setChatOpen(true)}
            className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300"
          >
            <Bot className="w-8 h-8 text-white" />
          </Button>
        )}
      </div>
    </div>
  )
}
