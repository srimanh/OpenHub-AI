'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Github, Sparkles, Code, GitBranch, Users, Zap, ArrowRight, Bot, FileCode, Search, Star, GitFork, ExternalLink, Loader2, BookOpen, Target, MessageCircle, ChevronRight, ChevronDown, File, Folder } from 'lucide-react'
import Link from 'next/link'

export default function Dashboard() {
  const [selectedRepo, setSelectedRepo] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [repos, setRepos] = useState([])
  const [user, setUser] = useState(null)
  const [search, setSearch] = useState('')
  const [publicRepoInput, setPublicRepoInput] = useState('')
  
  // Learning functionality state variables
  const [expandedFolders, setExpandedFolders] = useState(new Set())
  const [treeItems, setTreeItems] = useState([])
  const [localTree, setLocalTree] = useState([])
  const [detectedTechs, setDetectedTechs] = useState([])
  const [resources, setResources] = useState([])
  const [selection, setSelection] = useState(new Set())
  const [loading, setLoading] = useState(false)
  const [fileContent, setFileContent] = useState('')
  const [contextualLanguage, setContextualLanguage] = useState('en')
  const [contextualResources, setContextualResources] = useState([])

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

  useEffect(() => {
    // Fetch user info
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

    // Fetch repos
    fetch('http://localhost:5001/api/github/repos', { 
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch repos');
        return res.json();
      })
      .then(setRepos)
      .catch((error) => {
        console.error('Error fetching repos:', error);
        setRepos([]);
      })
  }, [])

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
    if (!selectedRepo) return
    const url = `http://localhost:5001/api/learn/github-contextual?full_name=${encodeURIComponent(selectedRepo)}&language=${encodeURIComponent(contextualLanguage)}`
    fetch(url)
      .then(r => r.json())
      .then(data => setContextualResources(Array.isArray(data.items) ? data.items : []))
      .catch(() => setContextualResources([]))
  }, [selectedRepo, contextualLanguage])

  const handleAnalyze = (repoFullName) => {
    setSelectedRepo(repoFullName)
    setIsAnalyzing(true)
    setProgress(0)

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => {
            window.location.href = `/explorer?repo=${encodeURIComponent(repoFullName)}`
          }, 500)
          return 100
        }
        return prev + 10
      })
    }, 300)
  }

  // Repo tree with selection toggling for export (currently export is disabled for remote repos)
  const renderRepoTree = (items, level = 0) => {
    return items.map((item, idx) => (
      <div key={`R-${idx}`} style={{ marginLeft: `${level * 16}px` }}>
        <div
          className={`flex items-center space-x-2 p-2 rounded-lg hover:bg-green-500/10 cursor-pointer transition-colors group`}
          onClick={() => {
            if (item.type === 'folder') {
              const newExpanded = new Set(expandedFolders)
              const path = `repo:${item.path}`
              if (newExpanded.has(path)) {
                newExpanded.delete(path)
              } else {
                newExpanded.add(path)
              }
              setExpandedFolders(newExpanded)
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

  // Filter repos by search
  const filteredRepos = repos.filter(repo =>
    repo.name.toLowerCase().includes(search.toLowerCase()) ||
    (repo.owner?.login || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-black">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl animate-float-slow"></div>
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <div className="relative group">
              <div className="absolute inset-0 bg-blue-500 rounded-lg blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative bg-black border border-white/20 rounded-lg p-2">
                <Bot className="w-6 h-6 text-white" />
              </div>
            </div>
            <span className="text-2xl font-bold text-white">OpenHub AI</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Avatar className="border-2 border-white/20">
              <AvatarImage src={user?.avatar_url || '/diverse-user-avatars.png'} />
              <AvatarFallback className="bg-white/10 text-white">
                {user?.login?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <span className="text-white">
              {user ? `Welcome, ${user.name || user.login}!` : 'Welcome!'}
            </span>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* Welcome Banner */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 animate-fade-in-up">
            {user ? `Welcome, ${user.name || user.login}!` : 'Welcome!'}
            <span className="block bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent animate-gradient-x">
              Ready to explore a new codebase?
            </span>
          </h1>
          <p className="text-xl text-gray-400 animate-fade-in-up delay-300">
            Choose a repository to get started with AI-powered exploration
          </p>
        </div>

        {/* Analysis Progress */}
        {isAnalyzing && (
          <Card className="bg-white/5 backdrop-blur-xl border border-white/10 mb-12 animate-slide-up">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="flex items-center justify-center mb-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-500 rounded-full blur-lg opacity-75 animate-pulse-glow"></div>
                    <Loader2 className="w-12 h-12 text-white animate-spin relative" />
                  </div>
                  <span className="text-white text-xl ml-4">AI is analyzing {selectedRepo}...</span>
                </div>
                <Progress value={progress} className="mb-6 h-3" />
                <div className="text-gray-400">
                  {progress < 30 && "🔍 Fetching files..."}
                  {progress >= 30 && progress < 60 && "📝 Summarizing code..."}
                  {progress >= 60 && progress < 90 && "🔗 Mapping issues..."}
                  {progress >= 90 && "✨ Almost ready!"}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Repo Selection */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* GitHub Repos */}
          <Card className="bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:border-blue-500/50 animate-slide-up">
            <CardHeader className="pb-6">
              <CardTitle className="text-white flex items-center text-xl">
                <div className="relative mr-4">
                  <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-lg"></div>
                  <Github className="w-8 h-8 text-white relative" />
                </div>
                Choose from your GitHub Repos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
               <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search your repositories..."
                className="mb-4 bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20 h-12 text-base rounded-xl transition-all duration-300"
              />
              <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                {filteredRepos.length === 0 && (
                  <div className="text-gray-400 text-center py-8">No repositories found.</div>
                )}
                {filteredRepos.map((repo, index) => (
                  <div key={repo.id || index} className="group relative mb-4">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative flex items-center justify-between p-6 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300 border border-white/10 group-hover:border-blue-500/30">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className="text-white font-bold text-lg">
                            {repo.owner?.login}/{repo.name}
                          </h3>
                          {repo.language && (
                            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                              {repo.language}
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-400 mb-3 leading-relaxed">{repo.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Star className="w-4 h-4 mr-1" />
                            {repo.stargazers_count}
                          </span>
                          <span className="flex items-center">
                            <GitFork className="w-4 h-4 mr-1" />
                            {repo.forks_count}
                          </span>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleAnalyze(`${repo.owner?.login || ''}/${repo.name}`)}
                        className="bg-blue-600 hover:bg-blue-700 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-105"
                        disabled={isAnalyzing}
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Analyze
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Public Repo URL */}
          <Card className="bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:border-blue-500/50 animate-slide-up delay-200">
            <CardHeader className="pb-6">
              <CardTitle className="text-white flex items-center text-xl">
                <div className="relative mr-4">
                  <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-lg"></div>
                  <ExternalLink className="w-8 h-8 text-white relative" />
                </div>
                Paste a Public Repository URL
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="relative group">
                <Input
                  value={publicRepoInput}
                  onChange={(e) => setPublicRepoInput(e.target.value)}
                  placeholder="https://github.com/owner/repo or owner/repo"
                  className="bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20 h-14 text-lg rounded-xl transition-all duration-300 group-hover:bg-white/15"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <Sparkles className="w-6 h-6 text-blue-400 animate-pulse" />
                </div>
              </div>
              <Button
                onClick={() => {
                  const input = publicRepoInput.trim()
                  if (!input) return
                  // Accept https://github.com/owner/repo or owner/repo
                  let fullName = ''
                  try {
                    if (input.startsWith('http://') || input.startsWith('https://')) {
                      const url = new URL(input)
                      const parts = url.pathname.replace(/^\//, '').split('/')
                      if (parts.length >= 2) {
                        const owner = parts[0]
                        const repo = (parts[1] || '').replace(/\.git$/i, '')
                        fullName = `${owner}/${repo}`
                      }
                    } else {
                      const parts = input.split('/')
                      if (parts.length >= 2) {
                        const owner = parts[0]
                        const repo = (parts[1] || '').replace(/\.git$/i, '')
                        fullName = `${owner}/${repo}`
                      }
                    }
                  } catch {}
                  if (!fullName || !fullName.includes('/')) {
                    alert('Please enter a valid GitHub repository like "owner/repo" or a full GitHub URL')
                    return
                  }
                  // Reuse analyze flow for consistency
                  handleAnalyze(fullName)
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white h-14 text-lg rounded-xl transition-all duration-300 hover:scale-105"
                disabled={isAnalyzing}
              >
                <Search className="w-5 h-5 mr-3" />
                Analyze Repository
              </Button>
              <div className="text-center">
                <p className="text-gray-400">
                  ✨ Works with any public GitHub, GitLab, or Bitbucket repository
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Learning Section */}
        

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { icon: Code, value: '1.2M+', label: 'Repositories Analyzed', color: 'blue' },
            { icon: Users, value: '50K+', label: 'Developers Helped', color: 'purple' },
            { icon: GitBranch, value: '25K+', label: 'Issues Mapped', color: 'green' },
            { icon: Zap, value: '98%', label: 'Accuracy Rate', color: 'yellow' }
          ].map((stat, index) => (
            <Card key={index} className={`bg-white/5 backdrop-blur-xl border border-white/10 text-center p-8 hover:bg-white/10 transition-all duration-500 hover:scale-105 animate-slide-up`} style={{ animationDelay: `${index * 100}ms` }}>
              <div className="relative mb-4">
                <div className={`absolute inset-0 bg-${stat.color}-500/20 rounded-full blur-xl opacity-75`}></div>
                <stat.icon className="w-12 h-12 text-white mx-auto relative" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
              <div className="text-gray-400">{stat.label}</div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}