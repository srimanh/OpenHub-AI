import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  FileCode, 
  Code, 
  Folder, 
  Package, 
  Zap, 
  Target, 
  TrendingUp,
  FileText,
  Database,
  Globe,
  Smartphone,
  Server
} from 'lucide-react'

const CodeViewSummary = ({ treeItems, detectedTechs, repoInfo }) => {
  // Analyze code structure
  const analyzeCodeStructure = () => {
    const analysis = {
      totalFiles: 0,
      totalFolders: 0,
      fileTypes: {},
      mainFolders: [],
      techStack: [],
      complexity: 'low',
      hasTests: false,
      hasDocs: false,
      hasConfig: false
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

    // Check for common patterns
    analysis.hasTests = treeItems.some(item => 
      item.path.toLowerCase().includes('test') || 
      item.path.toLowerCase().includes('spec') ||
      item.path.toLowerCase().includes('__tests__')
    )
    
    analysis.hasDocs = treeItems.some(item => 
      item.path.toLowerCase().includes('docs') || 
      item.path.toLowerCase().includes('documentation') ||
      item.path.toLowerCase().includes('readme')
    )
    
    analysis.hasConfig = treeItems.some(item => 
      item.path.toLowerCase().includes('config') || 
      item.path.toLowerCase().includes('configs') ||
      item.path.toLowerCase().includes('.env')
    )

    return analysis
  }

  const structure = analyzeCodeStructure()

  // Get technology insights
  const getTechInsights = () => {
    const insights = []
    
    if (detectedTechs.includes('React')) {
      insights.push('⚛️ React-based frontend with component architecture')
    }
    if (detectedTechs.includes('Next.js')) {
      insights.push('🚀 Next.js framework for production-ready apps')
    }
    if (detectedTechs.includes('TypeScript')) {
      insights.push('🔷 TypeScript for type safety and better DX')
    }
    if (detectedTechs.includes('Node.js')) {
      insights.push('🟢 Node.js backend with Express framework')
    }
    if (detectedTechs.includes('TailwindCSS')) {
      insights.push('🎨 TailwindCSS for utility-first styling')
    }
    if (detectedTechs.includes('MongoDB') || detectedTechs.includes('PostgreSQL')) {
      insights.push('🗄️ Database integration with modern ORMs')
    }
    
    return insights
  }

  const techInsights = getTechInsights()

  // Get code quality insights
  const getCodeQualityInsights = () => {
    const insights = []
    
    if (structure.hasTests) {
      insights.push('🧪 Testing framework included for code quality')
    }
    if (structure.hasDocs) {
      insights.push('📚 Well-documented with guides and examples')
    }
    if (structure.hasConfig) {
      insights.push('⚙️ Configuration management for different environments')
    }
    if (structure.totalFolders > 5) {
      insights.push('🏗️ Well-organized folder structure')
    }
    if (Object.keys(structure.fileTypes).length > 8) {
      insights.push('🔧 Multi-technology stack with various file types')
    }
    
    return insights
  }

  const qualityInsights = getCodeQualityInsights()

  return (
    <Card className="bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <FileCode className="w-5 h-5 mr-2 text-purple-400" />
          Code Structure Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-6 max-w-full">
          {/* Code Overview */}
          <div className="text-center space-y-3">
            <h3 className="text-xl font-bold text-white">
              {repoInfo?.name || 'Repository'} Codebase
            </h3>
            <p className="text-gray-300">
              AI-powered analysis of your project's code structure and organization
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="text-center p-3 bg-white/5 rounded-lg border border-white/10">
              <div className="text-xl font-bold text-blue-400 flex items-center justify-center">
                <Folder className="w-4 h-4 mr-1" />
                {structure.totalFolders || 0}
              </div>
              <div className="text-xs text-gray-400">📁 Folders</div>
            </div>
            <div className="text-center p-3 bg-white/5 rounded-lg border border-white/10">
              <div className="text-xl font-bold text-purple-400 flex items-center justify-center">
                <FileCode className="w-4 h-4 mr-1" />
                {structure.totalFiles || 0}
              </div>
              <div className="text-xs text-gray-400">📄 Files</div>
            </div>
            <div className="text-center p-3 bg-white/5 rounded-lg border border-white/10">
              <div className="text-xl font-bold text-yellow-400 flex items-center justify-center">
                <Package className="w-4 h-4 mr-1" />
                {Object.keys(structure.fileTypes || {}).length}
              </div>
              <div className="text-xs text-gray-400">🔧 Types</div>
            </div>
            <div className="text-center p-3 bg-white/5 rounded-lg border border-white/10">
              <div className="text-xl font-bold text-green-400 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                {(structure.complexity || 'low').toUpperCase()}
              </div>
              <div className="text-xs text-gray-400">📊 Level</div>
            </div>
          </div>

          {/* Debug Info - Remove this after testing */}
          {process.env.NODE_ENV === 'development' && (
            <div className="p-2 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-300">
              Debug: Folders: {structure.totalFolders}, Files: {structure.totalFiles}, 
              Tree Items: {treeItems?.length || 0}
            </div>
          )}

          {/* Technology Stack */}
          {techInsights.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-white font-medium flex items-center">
                <Zap className="w-4 h-4 mr-2 text-yellow-400" />
                🚀 Technology Stack
              </h4>
              <div className="space-y-2">
                {techInsights.map((insight, index) => (
                  <div key={index} className="flex items-center p-2 bg-white/5 rounded-lg border border-white/10">
                    <span className="text-sm text-gray-300 break-words">{insight}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Code Quality */}
          {qualityInsights.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-white font-medium flex items-center">
                <Target className="w-4 h-4 mr-2 text-green-400" />
                🏆 Code Quality Features
              </h4>
              <div className="space-y-2">
                {qualityInsights.map((insight, index) => (
                  <div key={index} className="flex items-center p-2 bg-white/5 rounded-lg border border-white/10">
                    <span className="text-sm text-gray-300 break-words">{insight}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* File Type Breakdown */}
          {Object.keys(structure.fileTypes).length > 0 && (
            <div className="space-y-3">
              <h4 className="text-white font-medium flex items-center">
                <FileText className="w-4 h-4 mr-2 text-cyan-400" />
                📊 File Type Distribution
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
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

          {/* Main Folders */}
          {structure.mainFolders.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-white font-medium flex items-center">
                <Folder className="w-4 h-4 mr-2 text-blue-400" />
                📂 Main Project Structure
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {structure.mainFolders.map((folder, index) => (
                  <div key={index} className="flex items-center p-2 bg-white/5 rounded-lg border border-white/10">
                    <Folder className="w-4 h-4 mr-2 text-blue-400" />
                    <span className="text-sm text-gray-300">{folder}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Code Navigation Tips */}
          <div className="space-y-3">
            <h4 className="text-white font-medium flex items-center">
              <Code className="w-4 h-4 mr-2 text-purple-400" />
              💡 Code Navigation Tips
            </h4>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex items-start space-x-2">
                <span className="text-cyan-400">💡</span>
                <span><strong>Start with main folders:</strong> Look at root-level directories to understand the project structure</span>
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
                <span><strong>Review tests:</strong> Check test files to understand expected behavior and usage</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default CodeViewSummary
