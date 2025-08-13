'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle, XCircle, Github } from 'lucide-react'

export default function AuthCallback() {
  const [status, setStatus] = useState('processing') // processing, success, error
  const [message, setMessage] = useState('Processing GitHub authentication...')
  const searchParams = useSearchParams()
  const router = useRouter()
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  useEffect(() => {
    const handleCallback = async () => {
      console.log('🔍 Callback received:', { code: !!code, error })
      
      if (error) {
        setStatus('error')
        setMessage(`Authentication failed: ${error}`)
        return
      }

      if (!code) {
        setStatus('error')
        setMessage('No authorization code received from GitHub')
        return
      }

      console.log('🚀 Sending code to backend:', code.substring(0, 8) + '...')

      try {
        // Send the code to our backend to exchange for access token
        const response = await fetch(`http://localhost:5001/auth/github/callback?code=${code}`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        console.log('📡 Backend response status:', response.status)

        if (response.ok) {
          const data = await response.json()
          if (data.success && data.user) {
            setStatus('success')
            setMessage(`Welcome, ${data.user.login || data.user.name}! Redirecting to dashboard...`)
            
            // Redirect to dashboard after 2 seconds
            setTimeout(() => {
              router.push('/dashboard')
            }, 2000)
          } else {
            throw new Error(data.error || 'Authentication failed')
          }
        } else {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || 'Authentication failed')
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        setStatus('error')
        setMessage('Authentication failed. Please try again.')
      }
    }

    handleCallback()
  }, [code, error, router])

  const handleRetry = () => {
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <Card className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 max-w-md w-full text-center">
        <div className="mb-6">
          {status === 'processing' && (
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
                <div className="relative bg-black border-2 border-white/20 rounded-full p-4">
                  <Github className="w-8 h-8 text-white" />
                </div>
              </div>
              <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
            </div>
          )}
          
          {status === 'success' && (
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="absolute inset-0 bg-green-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
                <div className="relative bg-black border-2 border-green-500/50 rounded-full p-4">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
              </div>
            </div>
          )}
          
          {status === 'error' && (
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="absolute inset-0 bg-red-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
                <div className="relative bg-black border-2 border-red-500/50 rounded-full p-4">
                  <XCircle className="w-8 h-8 text-red-400" />
                </div>
              </div>
            </div>
          )}
        </div>

        <h1 className="text-2xl font-bold text-white mb-4">
          {status === 'processing' && 'Authenticating...'}
          {status === 'success' && 'Success!'}
          {status === 'error' && 'Authentication Failed'}
        </h1>

        <p className="text-gray-300 mb-6">{message}</p>

        {status === 'error' && (
          <Button 
            onClick={handleRetry}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Try Again
          </Button>
        )}

        {status === 'processing' && (
          <div className="flex items-center justify-center space-x-2 text-gray-400">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-100"></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-200"></div>
          </div>
        )}
      </Card>
    </div>
  )
}
