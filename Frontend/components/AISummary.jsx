import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileCode, BookOpen, Loader2, Sparkles, Folder } from 'lucide-react'

const AISummary = ({ selectedNode, selectedFile, aiLoading, aiSummaries, repoInfo }) => {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <Sparkles className="w-8 h-8 text-cyan-400" />
          <h1 className="text-3xl font-bold text-white">AI File & Folder Analysis</h1>
          <Sparkles className="w-8 h-8 text-cyan-400" />
        </div>
        <p className="text-gray-300 text-lg max-w-2xl mx-auto">
          Get instant AI-powered insights into any file or folder in the repository. 
          Select an item from the left sidebar to analyze its purpose and contents.
        </p>
      </div>

      {/* Main AI Summary Card */}
      <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <FileCode className="w-5 h-5 mr-2 text-purple-400" />
            {selectedNode ? selectedNode.name : 'Select a file or folder'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-black/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-cyan-400 font-medium">Selected Item</h4>
                {selectedNode && (
                  <div className="text-sm text-gray-400 flex items-center">
                    {selectedNode.type === 'folder' ? (
                      <>
                        <Folder className="w-4 h-4 mr-1" />
                        Folder
                      </>
                    ) : (
                      <>
                        <FileCode className="w-4 h-4 mr-1" />
                        File
                      </>
                    )}
                  </div>
                )}
              </div>
              
              {selectedNode ? (
                <div>
                  <div className="mb-3 p-2 bg-white/5 rounded border border-white/10">
                    <span className="text-white font-medium">{selectedNode.name}</span>
                    <span className="text-gray-400 text-sm ml-2">({selectedNode.path})</span>
                  </div>
                  
                  {aiLoading[selectedNode.path] ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                      <span className="text-gray-300 text-sm">Generating AI summary...</span>
                    </div>
                  ) : aiSummaries[selectedNode.path] ? (
                    <div className="max-h-[400px] overflow-y-auto">
                      {(() => {
                        const text = aiSummaries[selectedNode.path] || ''
                        const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
                        const bulletLines = lines.filter(l => l.startsWith('- '))
                        const otherLines = lines.filter(l => !l.startsWith('- '))
                        return (
                          <div className="text-gray-300 text-sm space-y-2">
                            {bulletLines.length > 0 && (
                              <ul className="list-disc pl-5 space-y-1">
                                {bulletLines.map((l, i) => (
                                  <li key={i}>{l.replace(/^\-\s+/, '')}</li>
                                ))}
                              </ul>
                            )}
                            {otherLines.length > 0 && (
                              <p className="whitespace-pre-line">{otherLines.join('\n')}</p>
                            )}
                            {bulletLines.length === 0 && otherLines.length === 0 && (
                              <p>{text}</p>
                            )}
                          </div>
                        )
                      })()}
                    </div>
                  ) : (
                    <p className="text-gray-300 text-sm">
                      {selectedNode.type === 'folder'
                        ? `The ${selectedNode.name} folder is part of ${repoInfo?.name || 'this repository'} and groups related code.`
                        : `This file (${selectedNode.name}) is part of ${repoInfo?.name || 'this repository'} and contributes to the app functionality.`}
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileCode className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-300 text-sm mb-2">
                    Select a file or folder from the left
                  </p>
                  <p className="text-gray-500 text-xs">
                    Get an AI-powered summary of its purpose and contents
                  </p>
                </div>
              )}
            </div>

            {/* Action Button */}
            {selectedNode && (
              <Button className="bg-gradient-to-r from-cyan-500 to-purple-500 w-full">
                <BookOpen className="w-4 h-4 mr-2" />
                Learn More About This Pattern
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Instructions Card */}
      <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-cyan-400" />
            How to Use AI Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-300">
            <div className="space-y-2">
              <h4 className="text-white font-medium">📁 For Folders</h4>
              <ul className="space-y-1 pl-4">
                <li>• Understand folder organization</li>
                <li>• Learn about related files</li>
                <li>• Get architectural insights</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="text-white font-medium">📄 For Files</h4>
              <ul className="space-y-1 pl-4">
                <li>• Understand file purpose</li>
                <li>• Learn about functions and classes</li>
                <li>• Get implementation details</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AISummary
