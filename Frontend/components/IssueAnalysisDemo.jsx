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
  Copy,
  AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'

export default function IssueAnalysisDemo({ onClose }) {
  const [currentStep, setCurrentStep] = useState('initial') // 'initial', 'analyzing', 'complete'
  
  // Demo data for demonstration
  const demoAnalysis = {
    issueSummary: "The login form is not properly validating email addresses, allowing users to submit invalid email formats. This could lead to security issues and poor user experience.",
    affectedFiles: [
      "src/components/auth/LoginForm.jsx",
      "src/utils/validation.js",
      "src/hooks/useAuth.js"
    ],
    solutionSteps: [
      "Add email format validation using regex pattern",
      "Update the LoginForm component to show validation errors",
      "Modify the useAuth hook to validate before submission",
      "Add unit tests for the validation logic"
    ],
    codeChanges: "Implement email validation regex, add error state management in LoginForm, and update the validation utility function to include email format checking.",
    suggestedComment: "I'll work on fixing the email validation issue. I can see the problem is in the validation logic and form handling. Let me implement proper email format validation and error handling.",
    branchName: "fix-email-validation",
    difficulty: "easy",
    estimatedTime: "1-2 hours"
  }

  const startAnalysis = () => {
    setCurrentStep('analyzing')
    // Simulate analysis time
    setTimeout(() => {
      setCurrentStep('complete')
    }, 3000)
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  if (currentStep === 'initial') {
    return (
      <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Bot className="w-5 h-5 mr-2 text-cyan-400" />
            Issue Analysis Demo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">
              <Target className="w-16 h-16 mx-auto mb-4 text-cyan-400" />
              <h3 className="text-lg font-medium text-white mb-2">
                Demo: Issue #123 - Email Validation Bug
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                This is a demonstration of our AI-powered issue analysis feature. 
                Click below to see how it analyzes issues and provides solutions.
              </p>
            </div>
            <Button 
              onClick={startAnalysis}
              className="bg-cyan-600 hover:bg-cyan-700 text-white"
              size="lg"
            >
              <Bot className="w-4 h-4 mr-2" />
              Start Demo Analysis
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (currentStep === 'analyzing') {
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
            <div className="animate-pulse">
              <Bot className="w-12 h-12 mx-auto mb-4 text-cyan-400" />
            </div>
            <p className="text-gray-400">AI is analyzing the issue and codebase...</p>
            <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
            
            <div className="mt-6 space-y-2">
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                <span>Scanning repository structure...</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse delay-1000"></div>
                <span>Analyzing issue description...</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse delay-2000"></div>
                <span>Identifying affected files...</span>
              </div>
            </div>
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
            Issue Analysis Complete
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-400 hover:text-white">
            ×
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Issue Summary */}
        <div>
          <h3 className="text-lg font-medium text-white mb-3 flex items-center">
            <Target className="w-4 h-4 mr-2 text-green-400" />
            Issue Summary
          </h3>
          <p className="text-gray-300 text-sm leading-relaxed">
            {demoAnalysis.issueSummary}
          </p>
        </div>

        <Separator className="bg-white/10" />

        {/* Difficulty & Time */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <div className="text-2xl font-bold text-cyan-400 mb-1">
              {demoAnalysis.difficulty?.toUpperCase()}
            </div>
            <div className="text-xs text-gray-400">Difficulty</div>
          </div>
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <div className="text-2xl font-bold text-purple-400 mb-1">
              {demoAnalysis.estimatedTime}
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
            {demoAnalysis.affectedFiles?.map((file, index) => (
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
            {demoAnalysis.solutionSteps?.map((step, index) => (
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
            {demoAnalysis.codeChanges}
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
              {demoAnalysis.suggestedComment}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(demoAnalysis.suggestedComment)}
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Copy className="w-3 h-3 mr-2" />
              Copy Comment
            </Button>
          </div>
        </div>

        <Separator className="bg-white/10" />

        {/* Branch Creation */}
        <div>
          <h3 className="text-lg font-medium text-white mb-3 flex items-center">
            <GitBranch className="w-4 h-4 mr-2 text-green-400" />
            Ready to Start?
          </h3>
          
          <div className="space-y-3">
            <div className="bg-white/5 p-3 rounded-lg">
              <p className="text-gray-300 text-sm mb-2">
                Branch name: <code className="bg-white/10 px-2 py-1 rounded text-cyan-400">{demoAnalysis.branchName}</code>
              </p>
              <p className="text-gray-400 text-xs">
                This would create a new branch for you to work on this issue.
              </p>
            </div>
            
            <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <AlertCircle className="w-5 h-5 text-blue-400 mr-2" />
                <span className="text-blue-400 font-medium">Demo Mode</span>
              </div>
              <p className="text-blue-300 text-sm">
                This is a demonstration. In the real application, clicking the button above would:
              </p>
              <ul className="text-blue-200 text-sm mt-2 space-y-1">
                <li>• Create a new branch on GitHub</li>
                <li>• Provide git commands to clone and checkout</li>
                <li>• Guide you through the implementation</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <Separator className="bg-white/10" />
        <div>
          <h3 className="text-lg font-medium text-white mb-3 flex items-center">
            <Clock className="w-4 h-4 mr-2 text-blue-400" />
            Next Steps
          </h3>
          <div className="space-y-2">
            <p className="text-gray-300 text-sm">
              1. Clone the repository locally
            </p>
            <p className="text-gray-300 text-sm">
              2. Checkout your new branch
            </p>
            <p className="text-gray-300 text-sm">
              3. Make the necessary changes
            </p>
            <p className="text-gray-300 text-sm">
              4. Test your changes
            </p>
            <p className="text-gray-300 text-sm">
              5. Commit and push your changes
            </p>
            <p className="text-gray-300 text-sm">
              6. Create a pull request
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
