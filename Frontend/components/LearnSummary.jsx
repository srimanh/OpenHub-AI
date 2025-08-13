import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  BookOpen, 
  GraduationCap, 
  Target, 
  Zap, 
  Clock, 
  Users, 
  Star, 
  TrendingUp,
  Code,
  Database,
  Globe,
  Smartphone,
  Server,
  Lightbulb,
  ExternalLink
} from 'lucide-react'

const LearnSummary = ({ detectedTechs, repoInfo, contextualResources }) => {
  // Generate learning insights
  const getLearningInsights = () => {
    const insights = []
    
    if (detectedTechs.includes('React')) {
      insights.push('⚛️ React ecosystem with modern hooks and patterns')
    }
    if (detectedTechs.includes('Next.js')) {
      insights.push('🚀 Next.js for full-stack React applications')
    }
    if (detectedTechs.includes('TypeScript')) {
      insights.push('🔷 TypeScript fundamentals and advanced patterns')
    }
    if (detectedTechs.includes('Node.js')) {
      insights.push('🟢 Node.js backend development and APIs')
    }
    if (detectedTechs.includes('TailwindCSS')) {
      insights.push('🎨 Modern CSS with utility-first approach')
    }
    if (detectedTechs.includes('MongoDB') || detectedTechs.includes('PostgreSQL')) {
      insights.push('🗄️ Database design and management')
    }
    
    return insights
  }

  const learningInsights = getLearningInsights()

  // Get skill level recommendations
  const getSkillLevelRecommendations = () => {
    const recommendations = []
    
    if (detectedTechs.includes('React')) {
      recommendations.push('📚 Start with React fundamentals if you\'re new to frontend')
      recommendations.push('🔧 Practice with hooks and modern React patterns')
    }
    
    if (detectedTechs.includes('TypeScript')) {
      recommendations.push('🔷 Learn TypeScript basics before diving into complex types')
      recommendations.push('🎯 Practice type safety and interface design')
    }
    
    if (detectedTechs.includes('Node.js')) {
      recommendations.push('🟢 Understand JavaScript fundamentals first')
      recommendations.push('🌐 Learn about async programming and APIs')
    }
    
    if (detectedTechs.includes('TailwindCSS')) {
      recommendations.push('🎨 Learn CSS fundamentals before utility classes')
      recommendations.push('🔧 Practice responsive design principles')
    }
    
    return recommendations
  }

  const skillRecommendations = getSkillLevelRecommendations()

  // Get learning resources
  const getLearningResources = () => {
    const resources = []
    
    if (detectedTechs.includes('React')) {
      resources.push({
        title: 'React Documentation',
        description: 'Official React docs with tutorials and examples',
        url: 'https://react.dev/',
        type: 'Documentation'
      })
      resources.push({
        title: 'React Tutorial',
        description: 'Step-by-step React learning path',
        url: 'https://react.dev/learn',
        type: 'Tutorial'
      })
    }
    
    if (detectedTechs.includes('Next.js')) {
      resources.push({
        title: 'Next.js Documentation',
        description: 'Complete Next.js guide and API reference',
        url: 'https://nextjs.org/docs',
        type: 'Documentation'
      })
    }
    
    if (detectedTechs.includes('TypeScript')) {
      resources.push({
        title: 'TypeScript Handbook',
        description: 'Official TypeScript learning materials',
        url: 'https://www.typescriptlang.org/docs/',
        type: 'Handbook'
      })
    }
    
    if (detectedTechs.includes('Node.js')) {
      resources.push({
        title: 'Node.js Guides',
        description: 'Node.js development tutorials and best practices',
        url: 'https://nodejs.org/en/learn/',
        type: 'Guides'
      })
    }
    
    return resources
  }

  const learningResources = getLearningResources()

  // Get project-specific learning tips
  const getProjectLearningTips = () => {
    const tips = []
    
    if (detectedTechs.length > 3) {
      tips.push('🔧 This is a full-stack project - focus on one area at a time')
    }
    
    if (detectedTechs.includes('React') && detectedTechs.includes('TypeScript')) {
      tips.push('⚛️ Start with TypeScript basics, then apply to React components')
    }
    
    if (detectedTechs.includes('Node.js') && detectedTechs.includes('MongoDB')) {
      tips.push('🗄️ Learn database concepts before diving into Node.js APIs')
    }
    
    tips.push('📖 Read the project\'s README and documentation first')
    tips.push('🔍 Explore the code structure to understand the architecture')
    tips.push('🧪 Look at test files to understand expected behavior')
    
    return tips
  }

  const projectTips = getProjectLearningTips()

  return (
    <Card className="bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <BookOpen className="w-5 h-5 mr-2 text-cyan-400" />
          📚 Learning Resources
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-6 max-w-full">
          {/* Learning Overview */}
          <div className="text-center space-y-3">
            <h3 className="text-xl font-bold text-white">
              Learn {repoInfo?.name || 'This Project'}
            </h3>
            <p className="text-gray-300">
              AI-powered learning path and resources for mastering this codebase
            </p>
          </div>

          {/* Technology Stack for Learning */}
          {detectedTechs.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-white font-medium flex items-center">
                <Target className="w-4 h-4 mr-2 text-blue-400" />
                🎯 Technologies to Learn
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {detectedTechs.map((tech, index) => (
                  <div key={index} className="flex items-center p-2 bg-white/5 rounded-lg border border-white/10">
                    <span className="text-sm text-gray-300">{tech}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Learning Insights */}
          {learningInsights.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-white font-medium flex items-center">
                <Zap className="w-4 h-4 mr-2 text-yellow-400" />
                🤖 AI Learning Insights
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {learningInsights.map((insight, index) => (
                  <div key={index} className="flex items-center p-2 bg-white/5 rounded-lg border border-white/10">
                    <span className="text-sm text-gray-300">{insight}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skill Level Recommendations */}
          {skillRecommendations.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-white font-medium flex items-center">
                <GraduationCap className="w-4 h-4 mr-2 text-purple-400" />
                📚 Learning Path Recommendations
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {skillRecommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-center p-2 bg-white/5 rounded-lg border border-white/10">
                    <span className="text-sm text-gray-300">{recommendation}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Learning Resources */}
          {learningResources.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-white font-medium flex items-center">
                <ExternalLink className="w-4 h-4 mr-2 text-cyan-400" />
                🌐 Recommended Learning Resources
              </h4>
              <div className="grid grid-cols-1 gap-3">
                {learningResources.map((resource, index) => (
                  <div key={index} className="p-3 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-white font-medium">{resource.title}</h5>
                      <Badge variant="outline" className="text-xs">
                        {resource.type}
                      </Badge>
                    </div>
                    <p className="text-gray-300 text-sm mb-3">{resource.description}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(resource.url, '_blank')}
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Visit Resource
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Project-Specific Learning Tips */}
          <div className="space-y-3">
            <h4 className="text-white font-medium flex items-center">
              <Lightbulb className="w-4 h-4 mr-2 text-yellow-400" />
              💡 Project Learning Tips
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {projectTips.map((tip, index) => (
                <div key={index} className="flex items-center p-2 bg-white/5 rounded-lg border border-white/10">
                  <span className="text-sm text-gray-300">{tip}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Learning Progress */}
          <div className="space-y-3">
            <h4 className="text-white font-medium flex items-center">
              <TrendingUp className="w-4 h-4 mr-2 text-green-400" />
              📈 Your Learning Journey
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-gray-400">Estimated Time</span>
                </div>
                <div className="text-white font-medium">
                  {detectedTechs.length > 5 ? '3-4 weeks' : 
                   detectedTechs.length > 3 ? '2-3 weeks' : '1-2 weeks'}
                </div>
              </div>
              <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center space-x-2 mb-2">
                  <Target className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-gray-400">Focus Areas</span>
                </div>
                <div className="text-white font-medium">
                  {detectedTechs.length > 3 ? 'Multiple' : 'Focused'}
                </div>
              </div>
            </div>
          </div>

          {/* Getting Started */}
          <div className="space-y-3">
            <h4 className="text-white font-medium flex items-center">
              <Code className="w-4 h-4 mr-2 text-cyan-400" />
              🚀 Getting Started with Learning
            </h4>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex items-start space-x-2">
                <span className="text-cyan-400">1️⃣</span>
                <span><strong>Choose Your Path:</strong> Pick one technology to focus on first</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-purple-400">2️⃣</span>
                <span><strong>Use Resources:</strong> Follow the recommended learning materials</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-green-400">3️⃣</span>
                <span><strong>Practice:</strong> Apply what you learn by exploring the code</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-yellow-400">4️⃣</span>
                <span><strong>Contribute:</strong> Start with small issues to build confidence</span>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center p-4 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg border border-green-500/20">
            <h4 className="text-white font-medium mb-2">Ready to Start Learning?</h4>
            <p className="text-gray-300 text-sm mb-3">
              Choose a technology from above and begin your learning journey!
            </p>
            <Button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white">
              <BookOpen className="w-4 h-4 mr-2" />
              Start Learning
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default LearnSummary
