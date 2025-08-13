'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Github, Sparkles, Code, GitBranch, Users, Zap, ArrowRight, Bot, FileCode, Search, Star, Play } from 'lucide-react'
import Link from 'next/link'

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    setIsVisible(true)
    
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const handleGitHubAuth = async () => {
    try {
      const response = await fetch('http://localhost:5001/auth/github', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No authorization URL received');
      }
    } catch (error) {
      console.error('GitHub auth error:', error);
      alert('Unable to connect to authentication server. Please make sure the backend is running on port 5001 and GitHub OAuth is configured.');
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Orbs */}
        <div 
          className="absolute w-96 h-96 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-full blur-3xl animate-pulse-slow"
          style={{
            left: `${mousePosition.x * 0.02}px`,
            top: `${mousePosition.y * 0.02}px`,
          }}
        ></div>
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-gradient-to-r from-purple-600/15 to-blue-600/15 rounded-full blur-3xl animate-float-slow"></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 opacity-30 animate-float-up">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
        </div>
        <div className="absolute top-40 right-20 opacity-20 animate-float-down delay-1000">
          <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse"></div>
        </div>
        <div className="absolute bottom-40 left-20 opacity-25 animate-float-up delay-2000">
          <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
        </div>
        
        {/* Code Snippets */}
        <div className="absolute top-32 left-1/4 opacity-10 animate-code-float">
          <pre className="text-xs text-white font-mono">
            {`const explore = () => {
              return <AI />
            }`}
          </pre>
        </div>
        <div className="absolute bottom-32 right-1/4 opacity-10 animate-code-float delay-3000">
          <pre className="text-xs text-white font-mono">
            {`function discover() {
              ai.analyze(repo)
            }`}
          </pre>
        </div>
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-6">
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative group">
              <div className="absolute inset-0 bg-blue-500 rounded-lg blur opacity-75 group-hover:opacity-100 transition-opacity animate-pulse-glow"></div>
              <div className="relative bg-black border border-white/20 rounded-lg p-2">
                <Bot className="w-6 h-6 text-white" />
              </div>
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">OpenHub AI</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-300 hover:text-white transition-colors duration-300 relative group">
              Features
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a href="#how-it-works" className="text-gray-300 hover:text-white transition-colors duration-300 relative group">
              How it Works
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 transition-all duration-300 group-hover:w-full"></span>
            </a>
            <Button onClick={handleGitHubAuth} variant="outline" className="border-white/20 text-white hover:bg-white hover:text-black transition-all duration-300 hover:scale-105">
              Sign In
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 px-6 py-20">
        <div className="max-w-6xl mx-auto text-center">
          {/* Animated Logo */}
          <div className={`mb-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="relative inline-block">
              <div className="flex items-center justify-center space-x-4 mb-6">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-xl opacity-75 animate-pulse-glow"></div>
                  <div className="relative bg-black border-2 border-white/20 rounded-full p-4">
                    <Bot className="w-12 h-12 text-white animate-bounce-subtle" />
                  </div>
                  <div className="absolute -top-2 -right-2 animate-spin-slow">
                    <Sparkles className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          

          {/* REDESIGNED HERO SECTION */}
          <div className={`mb-16 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="relative">
              {/* Floating Particles */}
              <div className="absolute top-10 left-1/4 w-3 h-3 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full animate-float-up opacity-60"></div>
              <div className="absolute top-20 right-1/3 w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-float-down delay-1000 opacity-40"></div>
              <div className="absolute bottom-10 left-1/3 w-4 h-4 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full animate-float-up delay-2000 opacity-50"></div>
              
              {/* Main Headline with Stunning Effects */}
              <div className="relative">
                <h1 className="text-7xl md:text-9xl font-bold mb-6 leading-tight">
                  <span className="block bg-gradient-to-r from-purple-400 via-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent animate-gradient-x drop-shadow-2xl">
                    Unlock Any
                  </span>
                  <span className="block bg-gradient-to-r from-blue-400 via-purple-400 via-blue-400 to-purple-400 bg-clip-text text-transparent animate-gradient-x delay-300 drop-shadow-2xl">
                    Codebase
                  </span>
                  <span className="block text-5xl md:text-7xl bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent animate-gradient-x delay-600 font-light">
                    Instantly
                  </span>
                </h1>
                
                {/* Glow Effect Behind Text */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-purple-500/10 blur-3xl -z-10 animate-pulse-slow"></div>
              </div>

              {/* Enhanced Subtext */}
              <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
                AI-powered onboarding, guided exploration, and personalized learning for open-source and enterprise repositories—
                <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent font-semibold"> zero confusion, pure discovery!</span>
              </p>


              {/* STUNNING SIGNUP BUTTON */}
    <div className="relative inline-block group">
      {/* Outer Glow */}
      <div className="absolute -inset-2 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 rounded-full blur-2xl opacity-50 group-hover:opacity-75 transition-opacity duration-500 animate-gradient-x"></div>
      
      {/* Button Container */}
      <div className="relative">
        <Button
          size="lg"
          onClick={handleGitHubAuth} // 🐐 Connected here
          className="relative bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 hover:from-purple-700 hover:via-blue-700 hover:to-purple-700 text-white px-16 py-8 text-xl font-bold rounded-full transition-all duration-300 transform hover:scale-110 shadow-2xl border-2 border-white/20 group overflow-hidden"
        >
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-gradient-x"></div>
          
          {/* Shimmer Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          
          {/* Button Content */}
          <div className="relative flex items-center z-10">
            <Github className="w-7 h-7 mr-4 group-hover:rotate-12 transition-transform duration-300" />
            Sign Up with GitHub
            <ArrowRight className="w-7 h-7 ml-4 group-hover:translate-x-2 transition-transform duration-300" />
          </div>
        </Button>
        
        {/* Issue Analysis Demo Button */}
        <div className="mt-6 animate-fade-in-up delay-700">
          <Button 
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10 px-8 py-3 rounded-full transition-all duration-300 group"
            onClick={() => {
              // This would open the demo in a new way
              alert('Issue Analysis Demo: This feature helps new contributors by analyzing GitHub issues with AI, providing solution steps, affected files, and automatically creating feature branches. Try it in the Explorer after connecting a repository!')
            }}
          >
            <div className="flex items-center">
              <Bot className="w-5 h-5 mr-2 text-cyan-400" />
              Try Issue Analysis Demo
              <Sparkles className="w-4 h-4 ml-2 text-yellow-400 group-hover:animate-pulse" />
            </div>
          </Button>
        </div>
      </div>
    </div>

    <p className="text-gray-400 mt-8 animate-fade-in-up delay-1000 text-lg">
      ✨ Analyze any public project in seconds!
    </p>
  </div>
            </div>

          {/* Demo Video Section */}
          <div className={`mb-24 transition-all duration-1000 delay-900 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="relative max-w-6xl mx-auto">
              {/* Video Container */}
              <div className="relative group">
                {/* Glowing Border Effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-500 animate-gradient-x"></div>
                
                {/* Video Frame */}
                <div className="relative bg-black/50 backdrop-blur-xl border border-white/20 rounded-2xl p-4 overflow-hidden">
                  {/* Browser-like Header */}
                  <div className="flex items-center space-x-2 mb-4 pb-3 border-b border-white/10">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="flex-1 text-center">
                      <div className="bg-white/5 rounded-lg px-4 py-1 text-sm text-gray-400 inline-block">
                        openhub.ai/demo
                      </div>
                    </div>
                  </div>
                  
                  {/* Demo Interface */}
                  <div className="relative bg-gradient-to-br from-gray-900 to-black rounded-xl overflow-hidden min-h-[400px] flex items-center justify-center">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:30px_30px]"></div>
                    
                    {/* Floating Elements */}
                    <div className="absolute top-8 left-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 animate-float-up">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-white text-sm">AI Analyzing...</span>
                      </div>
                      <div className="text-xs text-gray-400">react/src/components</div>
                    </div>
                    
                    <div className="absolute top-20 right-12 bg-blue-500/10 backdrop-blur-sm border border-blue-500/20 rounded-lg p-3 animate-float-down delay-1000">
                      <div className="text-blue-400 text-sm font-medium">Issue #1234</div>
                      <div className="text-xs text-gray-400">Connected to Button.jsx</div>
                    </div>
                    
                    <div className="absolute bottom-16 left-16 bg-purple-500/10 backdrop-blur-sm border border-purple-500/20 rounded-lg p-3 animate-float-up delay-2000">
                      <div className="text-purple-400 text-sm font-medium">Learning Path</div>
                      <div className="text-xs text-gray-400">React Hooks Tutorial</div>
                    </div>
                    
                    {/* Central Demo Content */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="relative mb-8">
                          <div className="absolute inset-0 bg-blue-500 rounded-full blur-3xl opacity-20 animate-pulse-glow"></div>
                          <div className="relative bg-black border-2 border-white/20 rounded-full p-8">
                            <Bot className="w-16 h-16 text-white animate-bounce-subtle" />
                          </div>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-4">
                          Watch OpenHub AI in Action
                        </h3>
                        <p className="text-gray-400 mb-6 max-w-md">
                          See how AI instantly maps your codebase, explains complex functions, and guides you to your first contribution
                        </p>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full transition-all duration-300 hover:scale-105 group">
                          <div className="flex items-center">
                            <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                            Play Demo
                          </div>
                        </Button>
                      </div>
                    </div>
                    
                    {/* Code Snippets Floating */}
                    <div className="absolute top-32 left-1/4 opacity-20 animate-code-float">
                      <pre className="text-xs text-blue-400 font-mono">
{`function explore(repo) {
  return ai.analyze(repo)
}`}
                      </pre>
                    </div>
                    
                    <div className="absolute bottom-32 right-1/4 opacity-20 animate-code-float delay-3000">
                      <pre className="text-xs text-purple-400 font-mono">
{`const insights = await 
  getAIInsights(codebase)`}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Demo Stats */}
              <div className="grid md:grid-cols-3 gap-6 mt-12">
                <div className="text-center group">
                  <div className="text-3xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                    <span className="animate-pulse">⚡</span> 3s
                  </div>
                  <div className="text-gray-400">Average Analysis Time</div>
                </div>
                <div className="text-center group">
                  <div className="text-3xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
                    <span className="animate-pulse">🎯</span> 95%
                  </div>
                  <div className="text-gray-400">Code Understanding Accuracy</div>
                </div>
                <div className="text-center group">
                  <div className="text-3xl font-bold text-white mb-2 group-hover:text-green-400 transition-colors">
                    <span className="animate-pulse">🚀</span> 10x
                  </div>
                  <div className="text-gray-400">Faster Onboarding</div>
                </div>
              </div>
            </div>
          </div>

          {/* Key Features Section */}
          <div className={`mb-24 transition-all duration-1000 delay-1100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                🚀 Key Features
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Everything you need to understand and contribute to any codebase
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {/* AI Code Analysis */}
              <div className="group p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300 hover:scale-105">
                <div className="text-4xl mb-4">🤖</div>
                <h3 className="text-xl font-bold text-white mb-3">AI Code Analysis</h3>
                <p className="text-gray-300 mb-4">
                  Get instant AI-powered explanations of any file, function, or code structure. Understand complex logic in seconds.
                </p>
                <div className="flex items-center text-cyan-400 text-sm">
                  <span>Instant insights</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Smart Issue Analysis */}
              <div className="group p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300 hover:scale-105">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-white mb-3">Smart Issue Analysis</h3>
                <p className="text-gray-300 mb-4">
                  AI analyzes GitHub issues and provides step-by-step solutions, affected files, and ready-to-use git commands.
                </p>
                <div className="flex items-center text-purple-400 text-sm">
                  <span>Ready to contribute</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Repository Structure */}
              <div className="group p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300 hover:scale-105">
                <div className="text-4xl mb-4">🏗️</div>
                <h3 className="text-xl font-bold text-white mb-3">Repository Structure</h3>
                <p className="text-gray-300 mb-4">
                  Visualize and understand the entire project structure with AI-powered insights on folders and organization.
                </p>
                <div className="flex items-center text-green-400 text-sm">
                  <span>Clear organization</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Contextual Learning */}
              <div className="group p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300 hover:scale-105">
                <div className="text-4xl mb-4">📚</div>
                <h3 className="text-xl font-bold text-white mb-3">Contextual Learning</h3>
                <p className="text-gray-300 mb-4">
                  Get personalized learning resources and tutorials based on the specific code you're exploring.
                </p>
                <div className="flex items-center text-yellow-400 text-sm">
                  <span>Learn as you go</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Technology Detection */}
              <div className="group p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300 hover:scale-105">
                <div className="text-4xl mb-4">🔧</div>
                <h3 className="text-xl font-bold text-white mb-3">Technology Detection</h3>
                <p className="text-gray-300 mb-4">
                  Automatically detect frameworks, libraries, and technologies used in the project.
                </p>
                <div className="flex items-center text-blue-400 text-sm">
                  <span>Tech stack insights</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* New Contributor Guide */}
              <div className="group p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300 hover:scale-105">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-xl font-bold text-white mb-3">New Contributor Guide</h3>
                <p className="text-gray-300 mb-4">
                  Perfect for developers new to open source. Get guided through your first contribution with AI assistance.
                </p>
                <div className="flex items-center text-pink-400 text-sm">
                  <span>Start contributing</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>

          {/* How It Works Section */}
          <div className={`mb-24 transition-all duration-1000 delay-1300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                How It Works
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Three simple steps to unlock any codebase with AI-powered insights
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[
                {
                  step: "01",
                  title: "Connect Repository",
                  description: "Link your GitHub account or paste any public repository URL",
                  icon: Github,
                  color: "blue"
                },
                {
                  step: "02", 
                  title: "AI Analysis",
                  description: "Our AI instantly analyzes code structure, dependencies, and patterns",
                  icon: Bot,
                  color: "purple"
                },
                {
                  step: "03",
                  title: "Start Exploring",
                  description: "Navigate with AI guidance, understand code, and find contribution opportunities",
                  icon: Sparkles,
                  color: "green"
                }
              ].map((item, index) => (
                <div key={index} className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <Card className="relative bg-white/5 backdrop-blur-xl border border-white/10 p-8 hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:border-blue-500/50">
                    <div className="text-center">
                      <div className="relative mb-6">
                        <div className={`absolute inset-0 bg-${item.color}-500/20 rounded-full blur-xl opacity-75`}></div>
                        <div className="relative bg-black border-2 border-white/20 rounded-full p-6 mx-auto w-fit">
                          <item.icon className="w-12 h-12 text-white" />
                        </div>
                        <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-sm font-bold rounded-full w-8 h-8 flex items-center justify-center">
                          {item.step}
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-4">{item.title}</h3>
                      <p className="text-gray-400 leading-relaxed">{item.description}</p>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <footer className="relative z-10 border-t border-white/10 bg-black/50 backdrop-blur-xl mt-24">
            <div className="max-w-7xl mx-auto px-6 py-16">
              <div className="grid md:grid-cols-4 gap-12">
                {/* Brand */}
                <div className="md:col-span-1">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="relative group">
                      <div className="absolute inset-0 bg-blue-500 rounded-lg blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
                      <div className="relative bg-black border border-white/20 rounded-lg p-2">
                        <Bot className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-white">OpenHub AI</span>
                  </div>
                  <p className="text-gray-400 mb-6 leading-relaxed">
                    AI-powered codebase exploration and learning platform for developers worldwide.
                  </p>
                  <div className="flex space-x-4">
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">
                      <Github className="w-5 h-5" />
                    </a>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                      </svg>
                    </a>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </a>
                  </div>
                </div>
                
                {/* Product */}
                <div>
                  <h3 className="text-white font-semibold mb-6">Product</h3>
                  <ul className="space-y-4">
                    <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
                    <li><a href="#" className="text-gray-400 hover:text-white transition-colors">How it Works</a></li>
                    <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Pricing</a></li>
                    <li><a href="#" className="text-gray-400 hover:text-white transition-colors">API</a></li>
                    <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Integrations</a></li>
                  </ul>
                </div>
                
                {/* Resources */}
                <div>
                  <h3 className="text-white font-semibold mb-6">Resources</h3>
                  <ul className="space-y-4">
                    <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Documentation</a></li>
                    <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
                    <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Tutorials</a></li>
                    <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Community</a></li>
                    <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Support</a></li>
                  </ul>
                </div>
                
                {/* Company */}
                <div>
                  <h3 className="text-white font-semibold mb-6">Company</h3>
                  <ul className="space-y-4">
                    <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About</a></li>
                    <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Careers</a></li>
                    <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
                    <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy</a></li>
                    <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms</a></li>
                  </ul>
                </div>
              </div>
              
              {/* Bottom Bar */}
              <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
                <p className="text-gray-400 text-sm">
                  © 2024 OpenHub AI. All rights reserved.
                </p>
                <div className="flex items-center space-x-6 mt-4 md:mt-0">
                  <span className="text-gray-400 text-sm">Made with ❤️ CodeFox developers</span>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                    All systems operational
                  </Badge>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8 z-20">
        <div className="relative group cursor-pointer">
          <div className="absolute inset-0 bg-blue-500 rounded-full blur-lg opacity-75 animate-pulse-glow"></div>
          <div className="relative w-16 h-16 bg-black border-2 border-white/20 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all duration-300 group">
            <Bot className="w-8 h-8 text-white group-hover:animate-bounce" />
          </div>
          <div className="absolute -top-16 right-0 bg-black/90 border border-white/20 text-white px-4 py-2 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap backdrop-blur-sm">
            Hi! I'm your AI guide 👋
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white/20"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
