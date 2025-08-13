import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Sparkles, 
  Code, 
  GitBranch, 
  Users, 
  Star, 
  GitFork, 
  AlertCircle, 
  Calendar,
  Clock,
  Target,
  Zap,
  BookOpen,
  FileCode,
  Folder,
  Package,
  Globe,
  Shield,
  TrendingUp,
  Heart,
  Rocket,
  Copy,
  CheckCircle
} from 'lucide-react'

const ProjectSummary = ({ repoInfo, repoLoading, repoError, repoFullName, onRefresh, treeItems, detectedTechs }) => {
  const [showReadme, setShowReadme] = useState(false)
  const [readmeCopied, setReadmeCopied] = useState(false)

  if (repoLoading) {
    return (
      <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-cyan-400" />
            AI Project Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto mb-2"></div>
              Analyzing project structure...
            </div>
            <p className="text-sm text-gray-500">
              🤖 AI is learning about {repoFullName}...
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (repoError) {
    return (
      <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 text-red-400" />
            Project Analysis Failed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-red-400 mb-4">
              <AlertCircle className="w-8 h-8 mx-auto mb-2" />
              ❌ Failed to analyze repository
            </div>
            <p className="text-sm text-gray-500 mb-4">
              {repoError}
            </p>
            <Button 
              onClick={onRefresh} 
              variant="outline" 
              size="sm"
              className="border-white/20 text-white"
            >
              🔄 Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!repoInfo) {
    return (
      <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-cyan-400" />
            AI Project Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">
              <FileCode className="w-8 h-8 mx-auto mb-2" />
              📁 No repository selected
            </div>
            <p className="text-sm text-gray-500">
              Select a repository from the dashboard to get started! 🚀
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Generate AI README content
  const generateAIReadme = () => {
    const techStack = detectedTechs.join(', ') || 'Various technologies'
    const hasReadme = treeItems.some(item => 
      item.name.toLowerCase().includes('readme') || 
      item.name.toLowerCase().includes('readme.md')
    )
    
    const readmeContent = `# ${repoInfo.name}

${repoInfo.description || 'A powerful and innovative project built with modern technologies.'}

## 🚀 Features

- **Modern Architecture**: Built with ${techStack}
- **Scalable Design**: Well-structured and maintainable codebase
- **Active Development**: Regular updates and community contributions
- **Open Source**: Free to use and contribute to

## 🛠️ Tech Stack

${detectedTechs.map(tech => `- ${tech}`).join('\n')}

## 📁 Project Structure

\`\`\`
${treeItems.slice(0, 10).map(item => `${item.type === 'folder' ? '📁' : '📄'} ${item.path}`).join('\n')}
${treeItems.length > 10 ? `... and ${treeItems.length - 10} more files` : ''}
\`\`\`

## 🚀 Getting Started

1. **Clone the repository**
   \`\`\`bash
   git clone ${repoInfo.html_url}
   cd ${repoInfo.name}
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Start development**
   \`\`\`bash
   npm run dev
   \`\`\`

## 🤝 Contributing

We welcome contributions! Please read our contributing guidelines and submit pull requests.

## 📄 License

This project is licensed under the MIT License.

---

⭐ **Star this repository if you found it helpful!**

${hasReadme ? '> 💡 **Note**: This repository already has a README file. This is an AI-generated alternative that you can customize and use.' : '> 🎉 **New README**: This repository didn\'t have a README file, so we created one for you!'}`

    return readmeContent
  }

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setReadmeCopied(true)
      setTimeout(() => setReadmeCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <Card className="bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Sparkles className="w-5 h-5 mr-2 text-cyan-400" />
          ✨ Project Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-6 max-w-full">
          {/* Beautiful Project Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2 mb-4">
              {repoInfo.language && (
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                  <Code className="w-3 h-3 mr-1" />
                  {repoInfo.language}
                </Badge>
              )}
              {repoInfo.topics && repoInfo.topics.slice(0, 3).map((topic, index) => (
                <Badge key={index} className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                  <Target className="w-3 h-3 mr-1" />
                  {topic}
                </Badge>
              ))}
            </div>
            
            <h2 className="text-2xl font-bold text-white">
              {repoInfo.name}
            </h2>
            
            <p className="text-gray-300 text-lg max-w-2xl mx-auto leading-relaxed">
              {repoInfo.description || '🚀 A powerful and innovative project ready for exploration and contribution!'}
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="text-center p-3 bg-white/5 rounded-lg border border-white/10">
              <div className="text-xl font-bold text-cyan-400 flex items-center justify-center">
                <Star className="w-4 h-4 mr-1" />
                {repoInfo.stargazers_count || 0}
              </div>
              <div className="text-xs text-gray-400">⭐ Stars</div>
            </div>
            <div className="text-center p-3 bg-white/5 rounded-lg border border-white/10">
              <div className="text-xl font-bold text-purple-400 flex items-center justify-center">
                <GitFork className="w-4 h-4 mr-1" />
                {repoInfo.forks_count || 0}
              </div>
              <div className="text-xs text-gray-400">🔀 Forks</div>
            </div>
            <div className="text-center p-3 bg-white/5 rounded-lg border border-white/10">
              <div className="text-xl font-bold text-yellow-400 flex items-center justify-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {repoInfo.open_issues_count || 0}
              </div>
              <div className="text-xs text-gray-400">🐛 Issues</div>
            </div>
            <div className="text-center p-3 bg-white/5 rounded-lg border border-white/10">
              <div className="text-xl font-bold text-green-400 flex items-center justify-center">
                <Users className="w-4 h-4 mr-1" />
                {repoInfo.subscribers_count || 0}
              </div>
              <div className="text-xs text-gray-400">👥 Watchers</div>
            </div>
          </div>

          {/* AI README Generation */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-white font-medium flex items-center">
                <BookOpen className="w-4 h-4 mr-2 text-yellow-400" />
                📝 AI README Generator
              </h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowReadme(!showReadme)}
                className="border-white/20 text-white hover:bg-white/10"
              >
                {showReadme ? 'Hide' : 'Generate README'}
              </Button>
            </div>
            
            {showReadme && (
              <div className="space-y-3">
                <div className="bg-black/30 rounded-lg p-4 border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-400">Generated README.md</span>
                    <Button
                      size="sm"
                      onClick={() => copyToClipboard(generateAIReadme())}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {readmeCopied ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-1" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                  <pre className="text-xs text-gray-300 overflow-x-auto whitespace-pre-wrap max-h-64 overflow-y-auto">
                    {generateAIReadme()}
                  </pre>
                </div>
                <p className="text-xs text-gray-500 text-center">
                  💡 Click "Copy" to copy this README and use it in your GitHub repository!
                </p>
              </div>
            )}
          </div>

          {/* Quick Project Insights */}
          <div className="space-y-3">
            <h4 className="text-white font-medium flex items-center">
              <Zap className="w-4 h-4 mr-2 text-yellow-400" />
              🚀 Quick Insights
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                <span className="text-sm text-gray-300">
                  {repoInfo.updated_at ? 
                    `🔄 Updated ${new Date(repoInfo.updated_at).toLocaleDateString()}` : 
                    '📅 Recently updated'}
                </span>
              </div>
              <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                <span className="text-sm text-gray-300">
                  {repoInfo.open_issues_count > 10 ? '🔥 Very Active' : 
                   repoInfo.open_issues_count > 5 ? '⚡ Active' : '🟢 Stable'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ProjectSummary
