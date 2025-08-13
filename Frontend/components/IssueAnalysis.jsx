'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Bot, 
  FileCode, 
  GitBranch, 
  Clock, 
  Target, 
  MessageCircle, 
  CheckCircle, 
  Loader2,
  Copy,
  ExternalLink,
  AlertCircle,
  Zap
} from 'lucide-react'
import { toast } from 'sonner'

export default function IssueAnalysis({ issue, repoFullName, onClose }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState(null)

  const analyzeIssue = async () => {
    setIsAnalyzing(true)
    try {
      // Check if this is a repository-wide analysis
      if (issue.number === 'repo-analysis') {
        const response = await fetch('http://localhost:5001/api/github/analyze-repo', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            repoFullName,
            analysisType: 'repo-wide'
          })
        })

        if (!response.ok) {
          throw new Error('Failed to analyze repository')
        }

        const data = await response.json()
        setAnalysis(data.analysis)
        toast.success('Repository analysis completed!')
      } else {
        // Individual issue analysis
        const response = await fetch('http://localhost:5001/api/github/analyze-issue', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            issueNumber: issue.number,
            repoFullName,
            issueTitle: issue.title,
            issueBody: issue.body
          })
        })

        if (!response.ok) {
          throw new Error('Failed to analyze issue')
        }

        const data = await response.json()
        setAnalysis(data.analysis)
        toast.success('Issue analysis completed!')
      }
    } catch (error) {
      console.error('Error analyzing:', error)
      toast.error('Failed to analyze. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'hard': return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    }
  }

  if (!analysis && !isAnalyzing) {
    return (
      <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Bot className="w-5 h-5 mr-2 text-cyan-400" />
            {issue.number === 'repo-analysis' ? 'Repository Analysis' : 'Issue Analysis'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">
              <Target className="w-16 h-16 mx-auto mb-4 text-cyan-400" />
              <h3 className="text-lg font-medium text-white mb-2">
                {issue.number === 'repo-analysis' ? 'Analyze Repository' : `Analyze Issue #${issue.number}`}
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                {issue.number === 'repo-analysis' 
                  ? 'Get AI-powered insights about the entire repository and discover the top 3 issues that need attention.'
                  : 'Get AI-powered insights about this issue, including affected files, solution steps, and suggested fixes.'
                }
              </p>
            </div>
            <Button 
              onClick={analyzeIssue}
              className="bg-cyan-600 hover:bg-cyan-700 text-white"
              size="lg"
            >
              <Bot className="w-4 h-4 mr-2" />
              {issue.number === 'repo-analysis' ? 'Analyze Repository' : 'Analyze Issue'}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isAnalyzing) {
    return (
      <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Bot className="w-5 h-5 mr-2 text-cyan-400" />
            Analyzing Issue...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-cyan-400" />
            <p className="text-gray-400">AI is analyzing the issue and codebase...</p>
            <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center">
            <Bot className="w-5 h-5 mr-2 text-cyan-400" />
            {issue.number === 'repo-analysis' ? 'Repository Analysis Complete' : 'Issue Analysis Complete'}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-400 hover:text-white">
            ×
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {issue.number === 'repo-analysis' ? (
          // Repository-wide analysis display
          <>
            {/* Repository Summary */}
            <div>
              <h3 className="text-lg font-medium text-white mb-3 flex items-center">
                <Target className="w-4 h-4 mr-2 text-green-400" />
                Repository Summary
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed mb-3">
                {analysis.repoSummary || 'AI analysis of the repository structure and codebase.'}
              </p>
              
              {/* Analysis Details */}
              <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                <h5 className="text-sm font-medium text-cyan-400 mb-2">Analysis Scope:</h5>
                <div className="text-xs text-gray-400 space-y-1">
                  <p>• Repository structure and file organization</p>
                  <p>• Configuration files (package.json, tsconfig.json, etc.)</p>
                  <p>• README and documentation files</p>
                  <p>• Sample code files for complexity assessment</p>
                  <p>• Dependencies and build configuration</p>
                </div>
              </div>
            </div>

            <Separator className="bg-white/10" />

            {/* Top 3 AI-Suggested Issues */}
            <div>
              <h3 className="text-lg font-medium text-white mb-3 flex items-center">
                <AlertCircle className="w-4 h-4 mr-2 text-yellow-400" />
                Top 3 AI-Suggested Issues
              </h3>
              <div className="space-y-3">
                {analysis.suggestedIssues?.map((suggestedIssue, index) => (
                  <div key={index} className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                        Issue #{index + 1}
                      </Badge>
                      <div className="flex items-center space-x-2">
                        <Badge className={getDifficultyColor(suggestedIssue.difficulty)}>
                          {suggestedIssue.difficulty?.toUpperCase() || 'MEDIUM'}
                        </Badge>
                        <Badge className={`${
                          suggestedIssue.priority === 'critical' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                          suggestedIssue.priority === 'high' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                          suggestedIssue.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                          'bg-blue-500/20 text-blue-400 border-blue-500/30'
                        }`}>
                          {suggestedIssue.priority?.toUpperCase() || 'MEDIUM'}
                        </Badge>
                      </div>
                    </div>
                    <h4 className="text-white font-medium mb-2">{suggestedIssue.title}</h4>
                    <p className="text-gray-300 text-sm mb-3">{suggestedIssue.description}</p>
                    
                    {/* Technical Details */}
                    {suggestedIssue.technicalDetails && (
                      <div className="mb-3 p-3 bg-white/5 rounded-lg border border-white/10">
                        <h5 className="text-sm font-medium text-cyan-400 mb-2">Technical Details:</h5>
                        <p className="text-gray-300 text-xs">{suggestedIssue.technicalDetails}</p>
                      </div>
                    )}
                    
                    {/* Affected Files */}
                    {suggestedIssue.affectedFiles && suggestedIssue.affectedFiles.length > 0 && (
                      <div className="mb-3">
                        <h5 className="text-sm font-medium text-blue-400 mb-2">Affected Files:</h5>
                        <div className="flex flex-wrap gap-1">
                          {suggestedIssue.affectedFiles.map((file, fileIndex) => (
                            <Badge key={fileIndex} variant="outline" className="text-xs bg-white/5 text-gray-300 border-white/10">
                              {file}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <span>Category: {suggestedIssue.category || 'enhancement'}</span>
                      <span>Est. Time: {suggestedIssue.estimatedTime || '2-4 hours'}</span>
                    </div>
                    
                    <div className="pt-3 border-t border-white/10">
                      <Button
                        onClick={() => {
                          // Create a new issue with AI-generated content
                          if (window.confirm('Create this AI-suggested issue on GitHub?')) {
                            const issueBody = `${suggestedIssue.description}\n\n**Technical Details:**\n${suggestedIssue.technicalDetails || 'No technical details provided.'}\n\n**Affected Files:**\n${suggestedIssue.affectedFiles?.map(f => `- \`${f}\``).join('\n') || 'No specific files identified.'}\n\n**Priority:** ${suggestedIssue.priority}\n**Difficulty:** ${suggestedIssue.difficulty}\n**Estimated Time:** ${suggestedIssue.estimatedTime}\n\n**Category:** ${suggestedIssue.category}`
                            const issueUrl = `https://github.com/${repoFullName}/issues/new?title=${encodeURIComponent(suggestedIssue.title)}&body=${encodeURIComponent(issueBody)}`
                            window.open(issueUrl, '_blank')
                          }
                        }}
                        variant="outline"
                        size="sm"
                        className="w-full bg-green-500/10 hover:bg-green-500/20 border-green-500/30 text-green-400 hover:text-green-300"
                      >
                        <GitBranch className="w-3 h-3 mr-2" />
                        Create Issue
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator className="bg-white/10" />

            {/* Repository Insights */}
            <div>
              <h3 className="text-lg font-medium text-white mb-3 flex items-center">
                <Zap className="w-4 h-4 mr-2 text-blue-400" />
                Repository Insights
              </h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 bg-white/5 rounded-lg">
                  <div className="text-2xl font-bold text-cyan-400 mb-1">
                    {analysis.overallHealth || 'GOOD'}
                  </div>
                  <div className="text-xs text-gray-400">Overall Health</div>
                </div>
                <div className="text-center p-3 bg-white/5 rounded-lg">
                  <div className="text-2xl font-bold text-purple-400 mb-1">
                    {analysis.maintenanceScore || '8/10'}
                  </div>
                  <div className="text-xs text-gray-400">Maintenance Score</div>
                </div>
              </div>
              
              {/* Code Quality Metrics */}
              {analysis.codeQualityMetrics && (
                <div className="space-y-3">
                  <h5 className="text-sm font-medium text-white">Code Quality Metrics:</h5>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-2 bg-white/5 rounded-lg">
                      <div className="text-lg font-bold text-yellow-400">
                        {analysis.codeQualityMetrics.complexity?.toUpperCase() || 'MEDIUM'}
                      </div>
                      <div className="text-xs text-gray-400">Complexity</div>
                    </div>
                    <div className="text-center p-2 bg-white/5 rounded-lg">
                      <div className="text-lg font-bold text-blue-400">
                        {analysis.codeQualityMetrics.testCoverage || '0%'}
                      </div>
                      <div className="text-xs text-gray-400">Test Coverage</div>
                    </div>
                    <div className="text-center p-2 bg-white/5 rounded-lg">
                      <div className="text-lg font-bold text-green-400">
                        {analysis.codeQualityMetrics.documentation?.toUpperCase() || 'POOR'}
                      </div>
                      <div className="text-xs text-gray-400">Documentation</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Separator className="bg-white/10" />

            {/* Next Steps */}
            <div>
              <h3 className="text-lg font-medium text-white mb-3 flex items-center">
                <Clock className="w-4 h-4 mr-2 text-blue-400" />
                Recommended Actions
              </h3>
              <div className="space-y-2">
                {analysis.recommendedActions?.map((action, index) => (
                  <div key={index} className="flex items-start">
                    <span className="bg-cyan-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-gray-300 text-sm">{action}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          // Individual issue analysis display
          <>
            {/* Issue Summary */}
            <div>
              <h3 className="text-lg font-medium text-white mb-3 flex items-center">
                <Target className="w-4 h-4 mr-2 text-green-400" />
                Issue Summary
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                {analysis.issueSummary}
              </p>
            </div>

            <Separator className="bg-white/10" />

            {/* Difficulty & Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-white/5 rounded-lg">
                <div className="text-2xl font-bold text-cyan-400 mb-1">
                  {analysis.difficulty?.toUpperCase() || 'MEDIUM'}
                </div>
                <div className="text-xs text-gray-400">Difficulty</div>
              </div>
              <div className="text-center p-3 bg-white/5 rounded-lg">
                <div className="text-2xl font-bold text-purple-400 mb-1">
                  {analysis.estimatedTime || '2-4 hours'}
                </div>
                <div className="text-xs text-gray-400">Estimated Time</div>
              </div>
            </div>

            {/* Affected Files */}
            <div>
              <h3 className="text-lg font-medium text-white mb-3 flex items-center">
                <FileCode className="w-4 h-4 mr-2 text-blue-400" />
                Files to Modify
              </h3>
              <div className="space-y-2">
                {analysis.affectedFiles?.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                    <span className="text-gray-300 text-sm font-mono">{file}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(file)}
                      className="text-gray-400 hover:text-white"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <Separator className="bg-white/10" />

            {/* Solution Steps */}
            <div>
              <h3 className="text-lg font-medium text-white mb-3 flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                Solution Steps
              </h3>
              <ol className="space-y-2">
                {analysis.solutionSteps?.map((step, index) => (
                  <li key={index} className="flex items-start">
                    <span className="bg-cyan-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-gray-300 text-sm">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <Separator className="bg-white/10" />

            {/* Code Changes */}
            <div>
              <h3 className="text-lg font-medium text-white mb-3 flex items-center">
                <FileCode className="w-4 h-4 mr-2 text-yellow-400" />
                Code Changes Needed
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed bg-white/5 p-3 rounded-lg">
                {analysis.codeChanges}
              </p>
            </div>

            <Separator className="bg-white/10" />

            {/* Suggested Comment */}
            <div>
              <h3 className="text-lg font-medium text-white mb-3 flex items-center">
                <MessageCircle className="w-4 h-4 mr-2 text-purple-400" />
                Suggested Comment
              </h3>
              <div className="bg-white/5 p-3 rounded-lg">
                <p className="text-gray-300 text-sm mb-3">
                  {analysis.suggestedComment}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(analysis.suggestedComment)}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <Copy className="w-3 h-3 mr-2" />
                  Copy Comment
                </Button>
              </div>
            </div>

            <Separator className="bg-white/10" />

            {/* Git Commands */}
            <div>
              <h3 className="text-lg font-medium text-white mb-3 flex items-center">
                <GitBranch className="w-4 h-4 mr-2 text-green-400" />
                Git Commands to Get Started
              </h3>
              
              <div className="space-y-3">
                <div className="bg-white/5 p-3 rounded-lg">
                  <p className="text-gray-300 text-sm mb-2">
                    Branch name: <code className="bg-white/10 px-2 py-1 rounded text-cyan-400">{analysis.branchName}</code>
                  </p>
                  <p className="text-gray-400 text-xs">
                    Use these commands to start working on the issue:
                  </p>
                </div>
                
                <div className="space-y-2">
                  {analysis.gitCommands && analysis.gitCommands.map((command, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                      <code className="text-gray-300 text-sm font-mono">
                        {command.replace('[BRANCH_NAME]', analysis.branchName).replace('[DESCRIPTIVE_COMMIT_MESSAGE]', analysis.commitMessage || `fix: resolve issue #${issue.number}`)}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(command.replace('[BRANCH_NAME]', analysis.branchName).replace('[DESCRIPTIVE_COMMIT_MESSAGE]', analysis.commitMessage || `fix: resolve issue #${issue.number}`))}
                        className="text-gray-400 hover:text-white"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
                
                <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <AlertCircle className="w-5 h-5 text-blue-400 mr-2" />
                    <span className="text-blue-400 font-medium">Workflow Guide</span>
                  </div>
                  <p className="text-blue-300 text-sm mb-3">
                    Follow these steps to implement your solution:
                  </p>
                  <ol className="text-blue-200 text-sm space-y-1">
                    <li>1. Copy and run the git commands above</li>
                    <li>2. Make your code changes based on the analysis</li>
                    <li>3. Test your changes locally</li>
                    <li>4. Push your branch and create a pull request</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div>
              <h3 className="text-lg font-medium text-white mb-3 flex items-center">
                <Clock className="w-4 h-4 mr-2 text-blue-400" />
                Implementation Steps
              </h3>
              <div className="space-y-2">
                <p className="text-gray-300 text-sm">
                  1. Copy the git commands above to create your branch
                </p>
                <p className="text-gray-300 text-sm">
                  2. Make the necessary code changes based on the analysis
                </p>
                <p className="text-gray-300 text-sm">
                  3. Test your changes locally
                </p>
                <p className="text-gray-300 text-sm">
                  4. Commit and push your changes using the git commands
                </p>
                <p className="text-gray-300 text-sm">
                  5. Create a pull request from your branch
                </p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
