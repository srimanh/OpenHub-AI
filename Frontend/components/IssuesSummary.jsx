import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  AlertCircle, 
  GitBranch, 
  Clock, 
  Users, 
  Star, 
  Target, 
  Zap, 
  TrendingUp,
  MessageCircle,
  CheckCircle,
  XCircle,
  HelpCircle
} from 'lucide-react'

const IssuesSummary = ({ issues, repoInfo, issueState, setIssueState }) => {
  // Analyze issues
  const analyzeIssues = () => {
    const analysis = {
      totalIssues: issues.length,
      openIssues: issues.filter(issue => issue.state === 'open').length,
      closedIssues: issues.filter(issue => issue.state === 'closed').length,
      issueTypes: {},
      averageAge: 0,
      hasLabels: false,
      hasAssignees: false,
      complexity: 'low'
    }

    if (analysis.totalIssues === 0) return analysis

    // Analyze issue types based on labels and titles
    issues.forEach(issue => {
      const labels = issue.labels || []
      const title = issue.title.toLowerCase()
      
      if (labels.length > 0) analysis.hasLabels = true
      if (issue.assignee) analysis.hasAssignees = true
      
      // Categorize by common patterns
      if (title.includes('bug') || title.includes('fix') || labels.some(l => l.name.toLowerCase().includes('bug'))) {
        analysis.issueTypes.bug = (analysis.issueTypes.bug || 0) + 1
      } else if (title.includes('feature') || title.includes('enhancement') || labels.some(l => l.name.toLowerCase().includes('feature'))) {
        analysis.issueTypes.feature = (analysis.issueTypes.feature || 0) + 1
      } else if (title.includes('docs') || title.includes('documentation') || labels.some(l => l.name.toLowerCase().includes('docs'))) {
        analysis.issueTypes.documentation = (analysis.issueTypes.documentation || 0) + 1
      } else if (title.includes('test') || labels.some(l => l.name.toLowerCase().includes('test'))) {
        analysis.issueTypes.testing = (analysis.issueTypes.testing || 0) + 1
      } else {
        analysis.issueTypes.other = (analysis.issueTypes.other || 0) + 1
      }
    })

    // Calculate average age
    const now = new Date()
    const totalAge = issues.reduce((sum, issue) => {
      const created = new Date(issue.created_at)
      return sum + (now - created)
    }, 0)
    analysis.averageAge = Math.round(totalAge / (1000 * 60 * 60 * 24 * analysis.totalIssues))

    // Determine complexity
    if (analysis.totalIssues > 50) analysis.complexity = 'high'
    else if (analysis.totalIssues > 20) analysis.complexity = 'medium'
    else analysis.complexity = 'low'

    return analysis
  }

  const analysis = analyzeIssues()

  // Get issue insights
  const getIssueInsights = () => {
    const insights = []
    
    if (analysis.openIssues > 20) {
      insights.push('🔥 Very active project with many open issues to work on')
    } else if (analysis.openIssues > 10) {
      insights.push('⚡ Active development with several issues to contribute to')
    } else if (analysis.openIssues > 5) {
      insights.push('🔧 Some issues available for contribution')
    } else {
      insights.push('🟢 Well-maintained project with few open issues')
    }
    
    if (analysis.hasLabels) {
      insights.push('🏷️ Well-organized with labeled issues for easy categorization')
    }
    
    if (analysis.hasAssignees) {
      insights.push('👥 Issues are assigned to contributors for focused work')
    }
    
    if (analysis.issueTypes.bug > analysis.issueTypes.feature) {
      insights.push('🐛 Focus on bug fixes and stability improvements')
    } else if (analysis.issueTypes.feature > analysis.issueTypes.bug) {
      insights.push('🚀 Active feature development and enhancements')
    }
    
    if (analysis.averageAge > 30) {
      insights.push('⏰ Some issues have been open for a while - good opportunity to help')
    }
    
    return insights
  }

  const issueInsights = getIssueInsights()

  // Get contribution opportunities
  const getContributionOpportunities = () => {
    const opportunities = []
    
    if (analysis.issueTypes.documentation > 0) {
      opportunities.push('📚 Documentation improvements - great for new contributors')
    }
    
    if (analysis.issueTypes.testing > 0) {
      opportunities.push('🧪 Testing enhancements - improve code quality')
    }
    
    if (analysis.issueTypes.bug > 0) {
      opportunities.push('🐛 Bug fixes - help improve project stability')
    }
    
    if (analysis.issueTypes.feature > 0) {
      opportunities.push('🚀 Feature development - contribute new functionality')
    }
    
    if (analysis.openIssues > 10) {
      opportunities.push('🔍 Many issues to choose from - find your perfect fit')
    }
    
    return opportunities
  }

  const opportunities = getContributionOpportunities()

  return (
    <Card className="bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Target className="w-5 h-5 mr-2 text-green-400" />
          🐛 Issues Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-6 max-w-full">
          {/* Issues Overview */}
          <div className="text-center space-y-3">
            <h3 className="text-xl font-bold text-white">
              {repoInfo?.name || 'Repository'} Issues
            </h3>
            <p className="text-gray-300">
              AI-powered analysis of project issues and contribution opportunities
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-3 bg-white/5 rounded-lg border border-white/10">
              <div className="text-2xl font-bold text-red-400 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 mr-1" />
                {analysis.openIssues}
              </div>
              <div className="text-sm text-gray-400">🐛 Open</div>
            </div>
            <div className="text-center p-3 bg-white/5 rounded-lg border border-white/10">
              <div className="text-2xl font-bold text-green-400 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 mr-1" />
                {analysis.closedIssues}
              </div>
              <div className="text-sm text-gray-400">✅ Closed</div>
            </div>
            <div className="text-center p-3 bg-white/5 rounded-lg border border-white/10">
              <div className="text-2xl font-bold text-blue-400 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 mr-1" />
                {analysis.totalIssues}
              </div>
              <div className="text-sm text-gray-400">📝 Total</div>
            </div>
            <div className="text-center p-3 bg-white/5 rounded-lg border border-white/10">
              <div className="text-2xl font-bold text-yellow-400 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 mr-1" />
                {analysis.complexity.toUpperCase()}
              </div>
              <div className="text-sm text-gray-400">📊 Activity</div>
            </div>
          </div>

          {/* Issue Type Breakdown */}
          {Object.keys(analysis.issueTypes).length > 0 && (
            <div className="space-y-3">
              <h4 className="text-white font-medium flex items-center">
                <Target className="w-4 h-4 mr-2 text-purple-400" />
                📊 Issue Type Distribution
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(analysis.issueTypes).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between p-2 bg-white/5 rounded-lg border border-white/10">
                    <span className="text-sm text-gray-300 capitalize">{type}</span>
                    <Badge variant="outline" className="text-xs">
                      {count}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Insights */}
          {issueInsights.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-white font-medium flex items-center">
                <Zap className="w-4 h-4 mr-2 text-yellow-400" />
                🤖 AI Issue Insights
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {issueInsights.map((insight, index) => (
                  <div key={index} className="flex items-center p-2 bg-white/5 rounded-lg border border-white/10">
                    <span className="text-sm text-gray-300">{insight}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contribution Opportunities */}
          {opportunities.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-white font-medium flex items-center">
                <GitBranch className="w-4 h-4 mr-2 text-green-400" />
                🚀 Contribution Opportunities
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {opportunities.map((opportunity, index) => (
                  <div key={index} className="flex items-center p-2 bg-white/5 rounded-lg border border-white/10">
                    <span className="text-sm text-gray-300">{opportunity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Project Health */}
          <div className="space-y-3">
            <h4 className="text-white font-medium flex items-center">
              <TrendingUp className="w-4 h-4 mr-2 text-blue-400" />
              📈 Project Health Indicators
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-gray-400">Average Age</span>
                </div>
                <div className="text-white font-medium">
                  {analysis.averageAge > 0 ? `${analysis.averageAge} days` : 'N/A'}
                </div>
              </div>
              <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center space-x-2 mb-2">
                  <Users className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-gray-400">Organization</span>
                </div>
                <div className="text-white font-medium">
                  {analysis.hasLabels ? '🏷️ Labeled' : '📝 Basic'}
                </div>
              </div>
            </div>
          </div>

          {/* Getting Started Tips */}
          <div className="space-y-3">
            <h4 className="text-white font-medium flex items-center">
              <HelpCircle className="w-4 h-4 mr-2 text-cyan-400" />
              💡 Getting Started with Issues
            </h4>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex items-start space-x-2">
                <span className="text-cyan-400">1️⃣</span>
                <span><strong>Browse Issues:</strong> Look through open issues to find ones that interest you</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-purple-400">2️⃣</span>
                <span><strong>Check Labels:</strong> Use labels to find issues matching your skills and interests</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-green-400">3️⃣</span>
                <span><strong>Read Details:</strong> Click on issues to understand requirements and context</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-yellow-400">4️⃣</span>
                <span><strong>Start Contributing:</strong> Use the "Analyze Issue" button to get AI guidance</span>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          {analysis.openIssues > 0 && (
            <div className="text-center p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/20">
              <h4 className="text-white font-medium mb-2">Ready to Contribute?</h4>
              <p className="text-gray-300 text-sm mb-3">
                {analysis.openIssues} open issues are waiting for contributors like you!
              </p>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                <GitBranch className="w-4 h-4 mr-2" />
                Browse Issues
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default IssuesSummary
