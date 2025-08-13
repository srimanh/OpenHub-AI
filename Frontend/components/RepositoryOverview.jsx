import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Folder, 
  FileCode, 
  GitBranch, 
  Clock, 
  Users, 
  Star, 
  GitFork, 
  AlertCircle,
  TrendingUp,
  Package,
  Globe,
  Shield,
  Zap,
  BookOpen,
  Target,
  Code,
  Database,
  Server,
  Layout,
  Smartphone
} from 'lucide-react'

const RepositoryOverview = ({ treeItems, repoInfo, detectedTechs }) => {
  // Analyze repository structure
  const analyzeStructure = () => {
    const analysis = {
      totalFiles: 0,
      totalFolders: 0,
      fileTypes: {},
      mainFolders: [],
      techStack: [],
      complexity: 'low'
    }

    const countItems = (items) => {
      items.forEach(item => {
        if (item.type === 'file') {
          analysis.totalFiles++
          const ext = item.path.split('.').pop()?.toLowerCase()
          if (ext) {
            analysis.fileTypes[ext] = (analysis.fileTypes[ext] || 0) + 1
          }
        } else if (item.type === 'folder') {
          analysis.totalFolders++
          if (item.path.split('/').length === 1) {
            analysis.mainFolders.push(item.name)
          }
        }
        
        if (item.children) {
          countItems(item.children)
        }
      })
    }

    countItems(treeItems)

    // Determine complexity
    if (analysis.totalFiles > 100) analysis.complexity = 'high'
    else if (analysis.totalFiles > 50) analysis.complexity = 'medium'
    else analysis.complexity = 'low'

    return analysis
  }

  const structure = analyzeStructure()

  // Get technology insights
  const getTechInsights = () => {
    const insights = []
    
    if (detectedTechs.includes('React')) {
      insights.push('⚛️ React-based frontend application')
    }
    if (detectedTechs.includes('Next.js')) {
      insights.push('🚀 Next.js framework for production')
    }
    if (detectedTechs.includes('TypeScript')) {
      insights.push('🔷 TypeScript for type safety')
    }
    if (detectedTechs.includes('Node.js')) {
      insights.push('🟢 Node.js backend runtime')
    }
    if (detectedTechs.includes('TailwindCSS')) {
      insights.push('🎨 TailwindCSS for styling')
    }
    if (detectedTechs.includes('MongoDB') || detectedTechs.includes('PostgreSQL')) {
      insights.push('🗄️ Database integration included')
    }
    
    return insights
  }

  const techInsights = getTechInsights()

  // Get folder insights
  const getFolderInsights = () => {
    const insights = []
    
    structure.mainFolders.forEach(folder => {
      const lowerFolder = folder.toLowerCase()
      
      if (lowerFolder.includes('src') || lowerFolder.includes('app')) {
        insights.push('📁 Main source code directory')
      } else if (lowerFolder.includes('test') || lowerFolder.includes('spec')) {
        insights.push('🧪 Testing framework included')
      } else if (lowerFolder.includes('docs') || lowerFolder.includes('documentation')) {
        insights.push('📚 Well-documented project')
      } else if (lowerFolder.includes('config') || lowerFolder.includes('configs')) {
        insights.push('⚙️ Configuration management')
      } else if (lowerFolder.includes('public') || lowerFolder.includes('static')) {
        insights.push('🌐 Public assets directory')
      } else if (lowerFolder.includes('scripts') || lowerFolder.includes('tools')) {
        insights.push('🛠️ Build and utility scripts')
      }
    })
    
    return insights
  }

  const folderInsights = getFolderInsights()

  return (
    <Card className="bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Folder className="w-5 h-5 mr-2 text-blue-400" />
          📁 Repository Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-6 max-w-full">
          {/* Quick Stats */}
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-white/5 rounded-lg border border-white/10">
              <div className="text-2xl font-bold text-blue-400 flex items-center justify-center">
                <Folder className="w-5 h-5 mr-1" />
                {structure.totalFolders}
              </div>
              <div className="text-sm text-gray-400">📁 Folders</div>
            </div>
            <div className="text-center p-3 bg-white/5 rounded-lg border border-white/10">
              <div className="text-2xl font-bold text-purple-400 flex items-center justify-center">
                <FileCode className="w-5 h-5 mr-1" />
                {structure.totalFiles}
              </div>
              <div className="text-sm text-gray-400">📄 Files</div>
            </div>
            <div className="text-center p-3 bg-white/5 rounded-lg border border-white/10">
              <div className="text-2xl font-bold text-yellow-400 flex items-center justify-center">
                <Package className="w-5 h-5 mr-1" />
                {Object.keys(structure.fileTypes).length}
              </div>
              <div className="text-sm text-gray-400">🔧 File Types</div>
            </div>
            <div className="text-center p-3 bg-white/5 rounded-lg border border-white/10">
              <div className="text-2xl font-bold text-green-400 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 mr-1" />
                {structure.complexity.toUpperCase()}
              </div>
              <div className="text-sm text-gray-400">📊 Complexity</div>
            </div>
          </div>

          {/* Technology Stack */}
          {techInsights.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-white font-medium flex items-center">
                <Zap className="w-4 h-4 mr-2 text-yellow-400" />
                🚀 Technology Stack
              </h4>
              <div className="grid md:grid-cols-2 gap-2">
                {techInsights.map((insight, index) => (
                  <div key={index} className="flex items-center p-2 bg-white/5 rounded-lg border border-white/10">
                    <span className="text-sm text-gray-300">{insight}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Main Folders */}
          {structure.mainFolders.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-white font-medium flex items-center">
                <Folder className="w-4 h-4 mr-2 text-blue-400" />
                📂 Main Project Structure
              </h4>
              <div className="grid md:grid-cols-2 gap-2">
                {structure.mainFolders.map((folder, index) => (
                  <div key={index} className="flex items-center p-2 bg-white/5 rounded-lg border border-white/10">
                    <Folder className="w-4 h-4 mr-2 text-blue-400" />
                    <span className="text-sm text-gray-300">{folder}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Folder Insights */}
          {folderInsights.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-white font-medium flex items-center">
                <Target className="w-4 h-4 mr-2 text-purple-400" />
                🔍 Project Organization Insights
              </h4>
              <div className="grid md:grid-cols-2 gap-2">
                {folderInsights.map((insight, index) => (
                  <div key={index} className="flex items-center p-2 bg-white/5 rounded-lg border border-white/10">
                    <span className="text-sm text-gray-300">{insight}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* File Type Breakdown */}
          {Object.keys(structure.fileTypes).length > 0 && (
            <div className="space-y-3">
              <h4 className="text-white font-medium flex items-center">
                <FileCode className="w-4 h-4 mr-2 text-cyan-400" />
                📊 File Type Distribution
              </h4>
              <div className="grid md:grid-cols-3 gap-2">
                {Object.entries(structure.fileTypes)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 9)
                  .map(([ext, count]) => (
                    <div key={ext} className="flex items-center justify-between p-2 bg-white/5 rounded-lg border border-white/10">
                      <span className="text-sm text-gray-300">.{ext}</span>
                      <Badge variant="outline" className="text-xs">
                        {count}
                      </Badge>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Project Health Indicators */}
          <div className="space-y-3">
            <h4 className="text-white font-medium flex items-center">
              <Shield className="w-4 h-4 mr-2 text-green-400" />
              🏥 Project Health Indicators
            </h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center space-x-2 mb-2">
                  <Code className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-gray-400">Code Organization</span>
                </div>
                <div className="text-white font-medium">
                  {structure.totalFolders > 5 ? '🏗️ Well-structured' : 
                   structure.totalFolders > 2 ? '📁 Organized' : '📄 Simple'}
                </div>
              </div>
              <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center space-x-2 mb-2">
                  <Package className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-gray-400">File Diversity</span>
                </div>
                <div className="text-white font-medium">
                  {Object.keys(structure.fileTypes).length > 8 ? '🎯 Multi-purpose' : 
                   Object.keys(structure.fileTypes).length > 4 ? '🔧 Feature-rich' : '🎯 Focused'}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Tips */}
          <div className="space-y-3">
            <h4 className="text-white font-medium flex items-center">
              <BookOpen className="w-4 h-4 mr-2 text-yellow-400" />
              💡 Quick Navigation Tips
            </h4>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex items-start space-x-2">
                <span className="text-cyan-400">💡</span>
                <span><strong>Start with main folders:</strong> Look at the root-level directories to understand the project structure</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-purple-400">💡</span>
                <span><strong>Check configuration files:</strong> Look for config files to understand project setup</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-green-400">💡</span>
                <span><strong>Explore source code:</strong> Dive into src/ or app/ folders for the main application logic</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-yellow-400">💡</span>
                <span><strong>Review documentation:</strong> Check docs/ folders for project guides and information</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default RepositoryOverview
