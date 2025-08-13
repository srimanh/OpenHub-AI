import axios from 'axios'

export const getUser = async (req, res) => {
  const token = req.cookies.github_token
  if (!token) {
    console.warn('[getUser] Missing github_token cookie')
    return res.status(401).json({ error: 'Not authenticated: missing token cookie' })
  }

  try {
    const userRes = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `token ${token}` }
    })
    res.json(userRes.data)
  } catch (err) {
    const status = err.response?.status || 500
    const ghMessage = err.response?.data?.message
    console.error('[getUser] GitHub API error:', status, ghMessage || err.message)
    res.status(status).json({ error: 'Failed to fetch user', details: ghMessage || err.message })
  }
}

export const getRepos = async (req, res) => {
  const token = req.cookies.github_token
  
  if (!token) {
    console.warn('[getRepos] Missing github_token cookie')
    return res.status(401).json({ error: 'Not authenticated: missing token cookie' })
  }

  try {
    const response = await axios.get('https://api.github.com/user/repos', {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json'
      },
      params: {
        sort: 'updated',
        per_page: 100
      }
    })

    res.json(response.data)
  } catch (error) {
    const status = error.response?.status || 500
    const ghMessage = error.response?.data?.message
    console.error('[getRepos] GitHub API error:', status, ghMessage || error.message)
    res.status(status).json({ error: 'Failed to fetch repositories', details: ghMessage || error.message })
  }
}

export const getRepoInfo = async (req, res) => {
  const token = req.cookies.github_token
  let fullName = req.query.full_name

  if (!fullName || !fullName.includes('/')) {
    return res.status(400).json({ error: 'full_name query param required (owner/repo)' })
  }

  // Normalize e.g. "owner/repo.git" -> "owner/repo" and trim slashes
  fullName = String(fullName)
    .trim()
    .replace(/^https?:\/\/github\.com\//i, '')
    .replace(/\.git$/i, '')
    .replace(/\/+$/g, '')

  const [owner, repo] = fullName.split('/')

  try {
    const authHeaders = token ? { Authorization: `token ${token}` } : {}
    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: authHeaders
    })

    res.json(response.data)
  } catch (error) {
    const status = error.response?.status || 500
    const ghMessage = error.response?.data?.message
    console.error('[getRepoInfo] GitHub API error:', status, ghMessage || error.message)
    res.status(status).json({ error: 'Failed to fetch repository info', details: ghMessage || error.message })
  }
}

/**
 * Returns the complete repository tree using GitHub Trees API (recursive)
 * Query: full_name=owner/repo
 */
export const getRepoTree = async (req, res) => {
  const token = req.cookies.github_token
  let fullName = req.query.full_name

  if (!fullName || !fullName.includes('/')) {
    return res.status(400).json({ error: 'full_name query param required (owner/repo)' })
  }

  // Normalize e.g. "owner/repo.git" -> "owner/repo" and trim slashes
  fullName = String(fullName)
    .trim()
    .replace(/^https?:\/\/github\.com\//i, '')
    .replace(/\.git$/i, '')
    .replace(/\/+$/g, '')

  const [owner, repo] = fullName.split('/')

  try {
    // 1) Get repo info to determine default branch
    const authHeaders = token ? { Authorization: `token ${token}` } : {}
    const repoInfo = await axios.get(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: authHeaders
    })
    const defaultBranch = repoInfo.data.default_branch

    // 2) Get branch to retrieve latest commit sha
    const branchInfo = await axios.get(`https://api.github.com/repos/${owner}/${repo}/branches/${defaultBranch}`, {
      headers: authHeaders
    })
    const treeSha = branchInfo.data.commit?.commit?.tree?.sha
    if (!treeSha) {
      return res.status(500).json({ error: 'Failed to resolve repository tree SHA' })
    }

    // 3) Get full tree recursively
    const treeRes = await axios.get(`https://api.github.com/repos/${owner}/${repo}/git/trees/${treeSha}?recursive=1`, {
      headers: authHeaders
    })

    res.json({
      default_branch: defaultBranch,
      tree: treeRes.data.tree // array of { path, type: 'blob'|'tree' }
    })
  } catch (error) {
    const status = error.response?.status || 500
    const ghMessage = error.response?.data?.message
    console.error('[getRepoTree] GitHub API error:', status, ghMessage || error.message)
    res.status(status).json({ error: 'Failed to fetch repository tree', details: ghMessage || error.message })
  }
}

/**
 * Returns file content for a given path in a repo
 * Query: full_name=owner/repo, path=path/to/file
 */
export const getFileContent = async (req, res) => {
  const token = req.cookies.github_token
  let fullName = req.query.full_name
  const path = req.query.path

  if (!fullName || !fullName.includes('/')) {
    return res.status(400).json({ error: 'full_name query param required (owner/repo)' })
  }
  if (!path) {
    return res.status(400).json({ error: 'path query param required' })
  }

  // Normalize e.g. "owner/repo.git" -> "owner/repo" and trim slashes
  fullName = String(fullName)
    .trim()
    .replace(/^https?:\/\/github\.com\//i, '')
    .replace(/\.git$/i, '')
    .replace(/\/+$/g, '')

  const [owner, repo] = fullName.split('/')

  try {
    const authHeaders = token ? { Authorization: `token ${token}` } : {}
    const fileRes = await axios.get(`https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`, {
      headers: authHeaders
    })

    if (Array.isArray(fileRes.data)) {
      return res.status(400).json({ error: 'Path is a directory, not a file' })
    }

    const { content, encoding, type, name } = fileRes.data
    let decoded = null
    if (encoding === 'base64' && typeof content === 'string') {
      try {
        decoded = Buffer.from(content, 'base64').toString('utf-8')
      } catch (e) {
        console.error('[getFileContent] Failed to decode base64:', e.message)
      }
    }

    res.json({ name, path, type, encoding, content: decoded ?? content })
  } catch (error) {
    const status = error.response?.status || 500
    const ghMessage = error.response?.data?.message
    console.error('[getFileContent] GitHub API error:', status, ghMessage || error.message)
    res.status(status).json({ error: 'Failed to fetch file content', details: ghMessage || error.message })
  }
}

/**
 * Returns issues for a given repository
 * Query: full_name=owner/repo, state=open|closed|all, per_page=number
 */
export const getRepoIssues = async (req, res) => {
  const token = req.cookies.github_token
  let fullName = req.query.full_name
  const state = req.query.state || 'open'
  const perPage = req.query.per_page || 30

  if (!fullName || !fullName.includes('/')) {
    return res.status(400).json({ error: 'full_name query param required (owner/repo)' })
  }

  // Normalize e.g. "owner/repo.git" -> "owner/repo" and trim slashes
  fullName = String(fullName)
    .trim()
    .replace(/^https?:\/\/github\.com\//i, '')
    .replace(/\.git$/i, '')
    .replace(/\/+$/g, '')

  const [owner, repo] = fullName.split('/')

  try {
    const authHeaders = token ? { Authorization: `token ${token}` } : {}
    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/issues`, {
      headers: authHeaders,
      params: {
        state: state,
        per_page: perPage,
        sort: 'created',
        direction: 'desc'
      }
    })

    res.json(response.data)
  } catch (error) {
    const status = error.response?.status || 500
    const ghMessage = error.response?.data?.message
    console.error('[getRepoIssues] GitHub API error:', status, ghMessage || error.message)
    res.status(status).json({ error: 'Failed to fetch repository issues', details: ghMessage || error.message })
  }
}

/**
 * Generates intelligent summaries for files and folders
 * Body: { type: 'file'|'folder', path: string, content?: string, repoName: string, children?: array }
 */
export const getAISummary = async (req, res) => {
  const { type, path, content, repoName, children } = req.body

  if (!type || !path || !repoName) {
    return res.status(400).json({ error: 'Missing required fields: type, path, repoName' })
  }

  try {
    let summary = ''
    
    if (type === 'file') {
      // For files, analyze the actual code content
      if (content && content.length > 0) {
        const fileName = path.split('/').pop()
        const fileExtension = fileName.split('.').pop() || ''
        
        // Try AI analysis first
        try {
          const prompt = `You are helping a beginner understand a codebase.

Task: Read the file below and produce 5-7 short, clear bullet points explaining what this file is used for.
Style rules:
- Use simple, friendly language a non-expert understands.
- Do not mention file extensions or technologies/framework names.
- Focus on purpose, inputs/outputs, and how it helps the app.
- Start each line with "- " and keep each bullet under 18 words.

File name: ${fileName}
Code:
${content}`

          const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': 'Bearer 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',
              'Content-Type': 'application/json',
              'HTTP-Referer': 'https://openhub.ai',
              'X-Title': 'OpenHub AI'
            },
            body: JSON.stringify({
              model: 'openai/gpt-4o',
              messages: [
                {
                  role: 'system',
                  content: 'You are helping a beginner understand a codebase. Provide clear, simple explanations that help new developers understand code purpose and functionality.'
                },
                {
                  role: 'user',
                  content: prompt
                }
              ],
              max_tokens: 600,
              temperature: 0.3
            })
          })

          if (response.ok) {
            const data = await response.json()
            console.log('OpenRouter AI response:', JSON.stringify(data, null, 2))
            
            if (data && data.choices && data.choices[0] && data.choices[0].message) {
              const aiResponse = data.choices[0].message.content.trim()
              console.log('AI Response extracted:', aiResponse)
              console.log('AI Response length:', aiResponse.length)
              
              // Validate AI response - if it's too generic or incorrect, use fallback
              if (aiResponse.length < 10) {
                console.log('AI response validation failed, using fallback:', aiResponse)
                throw new Error('AI response seems incorrect, using fallback')
              }
              
              console.log('✅ Using AI response for summary')
              summary = aiResponse
            } else {
              console.log('❌ Invalid OpenRouter response format:', data)
              throw new Error('Invalid OpenRouter response format')
            }
          } else {
            const errorText = await response.text()
            console.log('❌ OpenRouter API failed:', response.status, errorText)
            throw new Error(`OpenRouter API failed: ${response.status}`)
          }
        } catch (aiError) {
          console.error('OpenRouter AI analysis failed, using rule-based analysis:', aiError.message)
          
          // Fallback to simple, beginner-friendly bullet summary (no tech names / extensions)
          const lines = content.split('\n')
          const firstLines = lines.slice(0, 30)
          const allLines = lines.join('\n').toLowerCase()
          
          const mentionsRequest = /(get|post|put|delete|fetch|request|response|router|route|api)/
          const mentionsAuth = /(auth|login|signup|token|session|password)/
          const mentionsData = /(model|schema|db|database|query|insert|update|delete|select)/
          const mentionsConfig = /(config|settings|env|environment|process\.env)/
          const mentionsStyle = /(style|styles|color|spacing|font|layout)/
          const mentionsView = /(render|view|ui|component|page|title|button|input)/
          const isPackageJson = fileName === 'package.json'
          
          const bullets = []

          if (isPackageJson) {
            bullets.push(
              '- Lists tools and libraries used by this project',
              '- Defines commands to run and build the app',
              '- Stores project name and basic info',
              '- Helps others install everything with one command'
            )
          } else {
            // Core purpose guesses
            if (mentionsRequest.test(allLines)) bullets.push('- Handles incoming requests and prepares helpful responses')
            if (mentionsAuth.test(allLines)) bullets.push('- Checks who is signed in and what they can do')
            if (mentionsData.test(allLines)) bullets.push('- Reads and writes data used by the app')
            if (mentionsConfig.test(allLines)) bullets.push('- Keeps app settings like keys and service URLs')
            if (mentionsStyle.test(allLines)) bullets.push('- Controls the look and layout of screens')
            if (mentionsView.test(allLines)) bullets.push('- Shows part of the interface and reacts to user actions')

            // Always include generic bullets to fill to 5–7
            bullets.push('- Connects this part with the rest of the app')
            bullets.push('- Organizes logic so the feature is easy to update')
          }

          // Trim to 5–7 bullets and join
          const limited = bullets.slice(0, 7)
          while (limited.length < 5) {
            limited.push('- Supports this feature with clear, reusable code')
          }
          summary = limited.join('\n')
        }
      } else {
        summary = [
          '- This file is part of the project structure',
          '- It looks empty or could not be read',
          '- Kept to organize the project correctly',
          '- Safe to ignore unless you are editing this area'
        ].join('\n')
      }
    } else if (type === 'folder') {
      // For folders, analyze all subfiles and provide comprehensive summary
      const folderName = path.split('/').pop()
      
      if (Array.isArray(children) && children.length > 0) {
        const visible = children.map(c => c.name)
        
        // Try AI analysis first
        try {
          const folderPrompt = `You are helping a beginner understand a project structure.

Task: Explain why this folder exists and what it contains using 4-6 simple bullet points.
Style rules:
- Use friendly, plain language.
- Do not mention file extensions or technology/framework names.
- Start each line with "- " and keep each bullet under 18 words.

Folder: ${folderName}
Repository: ${repoName}
Items: ${visible.join(', ')}`

          const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': 'Bearer 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',
              'Content-Type': 'application/json',
              'HTTP-Referer': 'https://openhub.ai',
              'X-Title': 'OpenHub AI'
            },
            body: JSON.stringify({
              model: 'openai/gpt-4o',
              messages: [
                {
                  role: 'system',
                  content: 'You are helping a beginner understand a project structure. Provide clear, simple explanations that help new developers understand code organization.'
                },
                {
                  role: 'user',
                  content: folderPrompt
                }
              ],
              max_tokens: 300,
              temperature: 0.3
            })
          })

          if (response.ok) {
            const data = await response.json()
            console.log('OpenRouter AI folder response:', JSON.stringify(data, null, 2))
            
            if (data && data.choices && data.choices[0] && data.choices[0].message) {
              const aiResponse = data.choices[0].message.content.trim()
              console.log('✅ Folder AI Response extracted:', aiResponse)
              console.log('✅ Folder AI Response length:', aiResponse.length)
              summary = aiResponse
            } else {
              console.log('❌ Invalid OpenRouter folder response format:', data)
              throw new Error('Invalid OpenRouter response format')
            }
          } else {
            const errorText = await response.text()
            console.log('❌ OpenRouter folder API failed:', response.status, errorText)
            throw new Error(`OpenRouter API failed: ${response.status}`)
          }
        } catch (aiError) {
          console.error('OpenRouter AI folder analysis failed, using rule-based analysis:', aiError.message)
          
          // Fallback to simple, beginner-friendly folder bullets (no tech names / extensions)
          const nameLower = folderName.toLowerCase()
          const hasPages = visible.some(name => /page|screen|view/i.test(name))
          const hasServices = visible.some(name => /service|client|api/i.test(name))
          const hasControllers = visible.some(name => /controller/i.test(name))
          const hasModels = visible.some(name => /model|schema/i.test(name))
          const hasRoutes = visible.some(name => /route|router/i.test(name))
          const hasMiddleware = visible.some(name => /middleware|auth|validation/i.test(name))
          const hasStyles = visible.some(name => /style|styles|css|scss/i.test(name))
          const hasConfig = visible.some(name => /config|env/i.test(name))
          const hasPublic = visible.some(name => /public|static|assets/i.test(name))
          const hasTests = visible.some(name => /test|spec|__tests__/i.test(name))

          const bullets = []

          // Special handling for known top-level folders
          if (nameLower === 'frontend') {
            bullets.push(
              '- Holds everything users see and click',
              '- Contains screens and small reusable pieces',
              '- Manages navigation and page layout',
              '- Includes styles and shared helpers'
            )
          } else if (nameLower === 'backend') {
            bullets.push(
              '- Handles app logic on the server side',
              '- Receives requests and returns useful data',
              '- Connects to storage and other services',
              '- Includes routes, controllers, and helpers'
            )
          } else {
            bullets.push('- Groups files for one clear area of the app')
          }

          if (hasPages) bullets.push('- Holds full screens users can open')
          if (hasServices) bullets.push('- Keeps helpers for talking to other services')
          if (hasControllers) bullets.push('- Stores functions that process requests and responses')
          if (hasModels) bullets.push('- Defines how important data is shaped')
          if (hasRoutes) bullets.push('- Lists paths this part of the app responds to')
          if (hasMiddleware) bullets.push('- Adds checks like access and input validation')
          if (hasStyles) bullets.push('- Keeps files that control look and layout')
          if (hasConfig) bullets.push('- Stores settings and environment values')
          if (hasPublic) bullets.push('- Holds images and other public assets')
          if (hasTests) bullets.push('- Contains checks to make sure features work')

          // Ensure 4–6 bullets
          const limited = bullets.slice(0, 6)
          while (limited.length < 4) {
            limited.push('- Explains this feature area and keeps it organized')
          }
          summary = limited.join('\n')
        }
        
        // Add file list
        summary += `\n\nFiles and subfolders in this directory:\n${visible.slice(0, 15).map(name => `• ${name}`).join('\n')}`
        if (visible.length > 15) {
          summary += `\n... and ${visible.length - 15} more items`
        }
      } else {
        summary = [
          '- This folder organizes related files in one place',
          '- Helps keep features tidy and easy to find',
          '- May be empty now or contain hidden files',
          '- Used to structure the project clearly'
        ].join('\n')
      }
    }
    
    res.json({ summary })
  } catch (error) {
    console.error('[getAISummary] Error:', error.message)
    
    // Fallback summary on error
    let fallbackSummary = ''
    if (type === 'file') {
      const fileName = path.split('/').pop()
      fallbackSummary = [
        `- ${fileName} helps this part of the app work`,
        '- Explains behavior and handles a small set of tasks',
        '- Connects with nearby files to complete the feature',
        '- Safe to read to understand how this area behaves'
      ].join('\n')
    } else {
      const folderName = path.split('/').pop()
      fallbackSummary = [
        `- ${folderName} groups related files together`,
        '- Makes this feature easier to find and update',
        '- Use it to keep work for this area in one place'
      ].join('\n')
    }
    
    res.json({ summary: fallbackSummary })
  }
}

/**
 * Analyzes a GitHub issue and provides comprehensive solution
 * Body: { issueNumber: number, repoFullName: string, issueTitle: string, issueBody: string }
 */
export const analyzeIssue = async (req, res) => {
  const token = req.cookies.github_token
  const { issueNumber, repoFullName, issueTitle, issueBody } = req.body

  if (!issueNumber || !repoFullName || !issueTitle) {
    return res.status(400).json({ error: 'Missing required fields: issueNumber, repoFullName, issueTitle' })
  }

  try {
    // Normalize repo name
    const normalizedRepoName = String(repoFullName)
      .trim()
      .replace(/^https?:\/\/github\.com\//i, '')
      .replace(/\.git$/i, '')
      .replace(/\/+$/g, '')

    const [owner, repo] = normalizedRepoName.split('/')

    // Analyze issue using AI to determine what needs to be changed
    const analysisPrompt = `Analyze this GitHub issue and provide a solution guide.

ISSUE: #${issueNumber} - ${issueTitle}
DESCRIPTION: ${issueBody || 'No description provided'}
REPO: ${repoFullName}

Provide analysis in this JSON format:
{
  "issueSummary": "What this issue is about and what needs to be done",
  "affectedFiles": ["Files that need changes"],
  "solutionSteps": ["Step 1", "Step 2", "Step 3"],
  "codeChanges": "Specific code changes needed",
  "suggestedComment": "Comment to add when starting work",
  "branchName": "descriptive-branch-name",
  "difficulty": "easy|medium|hard",
  "estimatedTime": "time estimate",
  "gitCommands": [
    "git checkout -b [BRANCH_NAME]",
    "git add .",
    "git commit -m \"[COMMIT_MESSAGE]\"",
    "git push origin [BRANCH_NAME]"
  ],
  "commitMessage": "Descriptive commit message"
}

Be specific and actionable based on the issue content.`

    let analysis
    try {
      console.log('🔍 Calling OpenRouter API for issue analysis...')
      console.log('📝 Issue Title:', issueTitle)
      console.log('📄 Issue Body length:', issueBody ? issueBody.length : 0)
      
      const aiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer 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',
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://openhub.ai',
          'X-Title': 'OpenHub AI'
        },
        body: JSON.stringify({
          model: 'openai/gpt-4o',
          messages: [
            {
              role: 'system',
              content: 'You are an expert software developer helping to analyze GitHub issues. Provide clear, actionable advice that helps developers understand and solve issues efficiently.'
            },
            {
              role: 'user',
              content: analysisPrompt
            }
          ],
          max_tokens: 600,
          temperature: 0.3
        })
      })

      console.log('📡 OpenRouter API Response Status:', aiResponse.status)
      console.log('📡 OpenRouter API Response Headers:', Object.fromEntries(aiResponse.headers.entries()))

      if (aiResponse.ok) {
        const data = await aiResponse.json()
        console.log('✅ OpenRouter AI response received successfully')
        console.log('📊 Response data keys:', Object.keys(data))
        console.log('📝 AI Response content length:', data.choices?.[0]?.message?.content?.length || 0)

        if (data && data.choices && data.choices[0] && data.choices[0].message) {
          const aiText = data.choices[0].message.content.trim()
          console.log('🤖 AI Generated Text (first 200 chars):', aiText.substring(0, 200))
          
          // Try to extract JSON from AI response
          try {
            const jsonMatch = aiText.match(/\{[\s\S]*\}/)
            if (jsonMatch) {
              analysis = JSON.parse(jsonMatch[0])
              console.log('✅ JSON parsed successfully from AI response')
              console.log('🔍 Parsed analysis keys:', Object.keys(analysis))
            } else {
              throw new Error('No JSON found in response')
            }
          } catch (parseError) {
            console.log('⚠️ JSON parsing failed, using fallback:', parseError.message)
            // Fallback to structured response
            analysis = {
              issueSummary: aiText.substring(0, 200) + '...',
              affectedFiles: [], // No longer fetching tree, so no files
              solutionSteps: ['Analyze the issue description', 'Identify affected files', 'Implement the fix', 'Test the changes'],
              codeChanges: 'Review the issue and implement necessary changes based on the description',
              suggestedComment: 'I\'ll work on this issue. Let me analyze the codebase and implement a solution.',
              branchName: `fix-issue-${issueNumber}`,
              difficulty: 'medium',
              estimatedTime: '2-4 hours',
              gitCommands: [
                `git checkout -b fix-issue-${issueNumber}`,
                'git add .',
                `git commit -m "fix: resolve issue #${issueNumber} - ${issueTitle}"`,
                `git push origin fix-issue-${issueNumber}`
              ],
              commitMessage: `fix: resolve issue #${issueNumber} - ${issueTitle}`
            }
          }
        } else {
          console.log('❌ Invalid response structure from OpenRouter')
          throw new Error('Invalid response structure')
        }
      } else {
        const errorText = await aiResponse.text()
        console.log('❌ OpenRouter API failed:', aiResponse.status, errorText)
        throw new Error(`OpenRouter API failed: ${aiResponse.status}`)
      }
    } catch (aiError) {
      console.error('❌ OpenRouter AI analysis failed, using fallback:', aiError.message)
      console.error('🔍 Full error details:', aiError)
    }

    // Fallback analysis if AI fails
    if (!analysis) {
      analysis = {
        issueSummary: `Issue #${issueNumber}: ${issueTitle}`,
        affectedFiles: [],
        solutionSteps: [
          'Read and understand the issue description',
          'Identify which files are affected',
          'Make the necessary code changes',
          'Test your changes locally',
          'Create a pull request'
        ],
        codeChanges: 'Implement the fix based on the issue requirements',
        suggestedComment: 'I\'ll take a look at this issue and work on a solution.',
        branchName: `fix-issue-${issueNumber}`,
        difficulty: 'medium',
        estimatedTime: '2-4 hours',
        gitCommands: [
          `git checkout -b fix-issue-${issueNumber}`,
          'git add .',
          `git commit -m "fix: resolve issue #${issueNumber} - ${issueTitle}"`,
          `git push origin fix-issue-${issueNumber}`
        ],
        commitMessage: `fix: resolve issue #${issueNumber} - ${issueTitle}`
      }
    }

    // Ensure all required fields are present
    analysis = {
      issueSummary: analysis.issueSummary || `Issue #${issueNumber}: ${issueTitle}`,
      affectedFiles: analysis.affectedFiles || [],
      solutionSteps: analysis.solutionSteps || [],
      codeChanges: analysis.codeChanges || 'Implement the fix based on the issue requirements',
      suggestedComment: analysis.suggestedComment || 'I\'ll work on this issue.',
      branchName: analysis.branchName || `fix-issue-${issueNumber}`,
      difficulty: analysis.difficulty || 'medium',
      estimatedTime: analysis.estimatedTime || '2-4 hours',
      gitCommands: analysis.gitCommands || [
        `git checkout -b ${analysis.branchName || `fix-issue-${issueNumber}`}`,
        'git add .',
        `git commit -m "fix: resolve issue #${issueNumber} - ${issueTitle}"`,
        `git push origin ${analysis.branchName || `fix-issue-${issueNumber}`}`
      ],
      commitMessage: analysis.commitMessage || `fix: resolve issue #${issueNumber} - ${issueTitle}`
    }

    res.json({
      success: true,
      analysis,
      repoInfo: {
        owner,
        repo,
        fullName: normalizedRepoName
      }
    })

  } catch (error) {
    console.error('[analyzeIssue] Error:', error.message)
    
    // Provide more specific error messages
    let errorMessage = 'Failed to analyze issue'
    let errorDetails = error.message
    
    if (error.response?.status === 403) {
      errorMessage = 'Access denied. Please check your GitHub token permissions.'
      errorDetails = 'The repository may be private or your token may not have sufficient access.'
    } else if (error.response?.status === 404) {
      errorMessage = 'Repository not found'
      errorDetails = 'The specified repository does not exist or is not accessible.'
    } else if (error.response?.status === 401) {
      errorMessage = 'Authentication required'
      errorDetails = 'Please log in with GitHub to analyze issues.'
    }
    
    res.status(error.response?.status || 500).json({ 
      error: errorMessage, 
      details: errorDetails 
    })
  }
}

/**
 * Analyzes a GitHub repository and suggests top 3 issues
 * Body: { repoFullName: string, analysisType: string }
 */
export const analyzeRepo = async (req, res) => {
  const token = req.cookies.github_token
  const { repoFullName, analysisType } = req.body

  if (!repoFullName) {
    return res.status(400).json({ error: 'Missing required field: repoFullName' })
  }

  try {
    // Normalize repo name
    const normalizedRepoName = String(repoFullName)
      .trim()
      .replace(/^https?:\/\/github\.com\//i, '')
      .replace(/\.git$/i, '')
      .replace(/\/+$/g, '')

    const [owner, repo] = normalizedRepoName.split('/')

    // Get repository information
    const authHeaders = token ? { Authorization: `token ${token}` } : {}
    const repoResponse = await axios.get(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: authHeaders
    })

    const repoData = repoResponse.data

    // Get repository tree to understand structure
    const treeResponse = await axios.get(`https://api.github.com/repos/${owner}/${repo}/git/trees/main?recursive=1`, {
      headers: authHeaders
    })

    const treeData = treeResponse.data

    // Get key files for analysis
    let packageJson = null
    let readmeContent = null
    let tsConfig = null
    let sampleCodeFiles = []

    try {
      // Try to get package.json
      const packageResponse = await axios.get(`https://api.github.com/repos/${owner}/${repo}/contents/package.json`, {
        headers: authHeaders
      })
      if (packageResponse.data && packageResponse.data.content) {
        packageJson = Buffer.from(packageResponse.data.content, 'base64').toString()
      }
    } catch (e) {
      console.log('No package.json found')
    }

    try {
      // Try to get README
      const readmeResponse = await axios.get(`https://api.github.com/repos/${owner}/${repo}/contents/README.md`, {
        headers: authHeaders
      })
      if (readmeResponse.data && readmeResponse.data.content) {
        readmeContent = Buffer.from(readmeResponse.data.content, 'base64').toString()
      }
    } catch (e) {
      console.log('No README.md found')
    }

    try {
      // Try to get tsconfig.json
      const tsConfigResponse = await axios.get(`https://api.github.com/repos/${owner}/${repo}/contents/tsconfig.json`, {
        headers: authHeaders
      })
      if (tsConfigResponse.data && tsConfigResponse.data.content) {
        tsConfig = Buffer.from(tsConfigResponse.data.content, 'base64').toString()
      }
    } catch (e) {
      console.log('No tsconfig.json found')
    }

    // Get sample code files for analysis
    const codeFiles = treeData.tree?.filter(item => 
      item.type === 'blob' && 
      (item.path.endsWith('.ts') || item.path.endsWith('.tsx') || item.path.endsWith('.js') || item.path.endsWith('.jsx'))
    ).slice(0, 5) || []

    console.log(`📁 Found ${codeFiles.length} code files to analyze`)

    for (const file of codeFiles) {
      try {
        const fileResponse = await axios.get(`https://api.github.com/repos/${owner}/${repo}/contents/${file.path}`, {
          headers: authHeaders
        })
        if (fileResponse.data && fileResponse.data.content) {
          const content = Buffer.from(fileResponse.data.content, 'base64').toString()
          sampleCodeFiles.push({
            path: file.path,
            content: content.substring(0, 500) // First 500 chars for analysis
          })
          console.log(`✅ Analyzed file: ${file.path}`)
        }
      } catch (e) {
        console.log(`⚠️ Could not read file: ${file.path} - ${e.message}`)
      }
    }

    console.log(`📊 Total files analyzed: ${sampleCodeFiles.length}`)
    console.log(`📋 Package.json: ${packageJson ? 'Found' : 'Missing'}`)
    console.log(`📖 README: ${readmeContent ? 'Found' : 'Missing'}`)
    console.log(`⚙️ TSConfig: ${tsConfig ? 'Found' : 'Missing'}`)

    // Analyze repository using AI with actual file content
    const analysisPrompt = `Analyze this GitHub repository and suggest the top 3 most important issues that need attention. Use the actual repository data provided.

REPOSITORY: ${repoFullName}
DESCRIPTION: ${repoData.description || 'No description provided'}
LANGUAGE: ${repoData.language || 'Unknown'}
STARS: ${repoData.stargazers_count}
FORKS: ${repoData.forks_count}
OPEN ISSUES: ${repoData.open_issues_count}
CREATED: ${repoData.created_at}
UPDATED: ${repoData.updated_at}

REPOSITORY STRUCTURE (first 30 files):
${treeData.tree?.slice(0, 30).map(item => `- ${item.path} (${item.type})`).join('\n') || 'No files found'}

PACKAGE.JSON CONTENT:
${packageJson || 'No package.json found'}

README CONTENT (first 300 chars):
${readmeContent ? readmeContent.substring(0, 300) + '...' : 'No README found'}

TSCONFIG CONTENT:
${tsConfig || 'No tsconfig.json found'}

SAMPLE CODE FILES:
${sampleCodeFiles.map(file => `\n--- ${file.path} ---\n${file.content}`).join('\n')}

Based on this actual repository data, identify the top 3 most critical issues that would improve the codebase. Consider:
- Missing or incomplete documentation
- Lack of testing infrastructure
- Code quality issues (complexity, maintainability)
- Missing error handling
- Performance bottlenecks
- Security concerns
- Build/deployment configuration issues
- Dependencies and version management

Provide analysis in this JSON format:
{
  "repoSummary": "Detailed analysis of the repository based on actual files and code",
  "suggestedIssues": [
    {
      "title": "Specific, actionable issue title",
      "description": "Detailed description explaining the issue, why it's important, and what needs to be done. Include specific file paths and technical details.",
      "difficulty": "easy|medium|hard",
      "priority": "low|medium|high|critical",
      "estimatedTime": "realistic time estimate based on code complexity",
      "category": "bug|enhancement|documentation|testing|performance|security|build|dependencies",
      "affectedFiles": ["specific file paths that need changes"],
      "technicalDetails": "Specific technical implementation details and requirements"
    }
  ],
  "overallHealth": "GOOD|FAIR|NEEDS_ATTENTION|CRITICAL",
  "maintenanceScore": "score out of 10 with explanation",
  "recommendedActions": [
    "Specific, actionable steps to improve the repository"
  ],
  "codeQualityMetrics": {
    "complexity": "low|medium|high",
    "testCoverage": "estimated percentage",
    "documentation": "poor|fair|good|excellent"
  }
}

Be specific and actionable. Base your analysis on the actual repository structure and code content provided. Don't make generic suggestions - analyze the real code and identify real problems.`

    let analysis
    try {
      console.log('🔍 Calling OpenRouter API for comprehensive repository analysis...')
      console.log('📝 Repository:', repoFullName)
      console.log('📄 Language:', repoData.language)
      console.log('⭐ Stars:', repoData.stargazers_count)
      console.log('📁 Files analyzed:', sampleCodeFiles.length)
      
      const aiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer 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',
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://openhub.ai',
          'X-Title': 'OpenHub AI'
        },
        body: JSON.stringify({
          model: 'openai/gpt-4o',
          messages: [
            {
              role: 'system',
              content: 'You are an expert software developer and code reviewer. Analyze GitHub repositories by examining actual code, file structure, and configuration files. Provide specific, actionable insights based on real code analysis. Be technical and precise.'
            },
            {
              role: 'user',
              content: analysisPrompt
            }
          ],
          max_tokens: 1200,
          temperature: 0.2
        })
      })

      console.log('📡 OpenRouter API Response Status:', aiResponse.status)

      if (aiResponse.ok) {
        const data = await aiResponse.json()
        console.log('✅ OpenRouter AI response received successfully')

        if (data && data.choices && data.choices[0] && data.choices[0].message) {
          const aiText = data.choices[0].message.content.trim()
          console.log('🤖 AI Generated Text (first 300 chars):', aiText.substring(0, 300))
          
          // Try to extract JSON from AI response
          try {
            const jsonMatch = aiText.match(/\{[\s\S]*\}/)
            if (jsonMatch) {
              analysis = JSON.parse(jsonMatch[0])
              console.log('✅ JSON parsed successfully from AI response')
              console.log('🔍 Parsed analysis keys:', Object.keys(analysis))
            } else {
              throw new Error('No JSON found in response')
            }
          } catch (parseError) {
            console.log('⚠️ JSON parsing failed, using fallback:', parseError.message)
            // Enhanced fallback based on actual repository data
            analysis = generateEnhancedFallback(repoData, treeData, packageJson, readmeContent, sampleCodeFiles)
          }
        } else {
          console.log('❌ Invalid response structure from OpenRouter')
          throw new Error('Invalid response structure')
        }
      } else {
        const errorText = await aiResponse.text()
        console.log('❌ OpenRouter API failed:', aiResponse.status, errorText)
        throw new Error(`OpenRouter API failed: ${aiResponse.status}`)
      }
    } catch (aiError) {
      console.error('❌ OpenRouter AI analysis failed, using enhanced fallback:', aiError.message)
      console.error('🔍 Full error details:', aiError)
    }

    // Enhanced fallback analysis if AI fails
    if (!analysis) {
      analysis = generateEnhancedFallback(repoData, treeData, packageJson, readmeContent, sampleCodeFiles)
    }

    res.json({ analysis })
  } catch (error) {
    console.error('[analyzeRepo] Error:', error.message)
    res.status(500).json({ error: 'Failed to analyze repository', details: error.message })
  }
}

// Helper function to generate enhanced fallback analysis
function generateEnhancedFallback(repoData, treeData, packageJson, readmeContent, sampleCodeFiles) {
  const hasPackageJson = !!packageJson
  const hasReadme = !!readmeContent
  const hasTests = treeData.tree?.some(item => 
    item.path.includes('test') || item.path.includes('spec') || item.path.includes('__tests__')
  )
  const hasConfigFiles = treeData.tree?.some(item => 
    item.path.includes('config') || item.path.includes('.env') || item.path.includes('docker')
  )
  const hasDocumentation = treeData.tree?.some(item => 
    item.path.includes('docs') || item.path.includes('documentation') || item.path.includes('wiki')
  )
  
  const issues = []
  
  // Issue 1: Documentation
  if (!hasReadme || readmeContent?.length < 200) {
    issues.push({
      title: "Improve Project Documentation",
      description: `The repository lacks comprehensive documentation. The README is ${hasReadme ? 'minimal' : 'missing'}, and there are no dedicated documentation files. This makes it difficult for new contributors to understand the project structure, setup process, and contribution guidelines.`,
      difficulty: "easy",
      priority: "high",
      estimatedTime: "3-5 hours",
      category: "documentation",
      affectedFiles: ["README.md", "docs/", "CONTRIBUTING.md"],
      technicalDetails: "Create a comprehensive README with installation instructions, usage examples, API documentation, and contribution guidelines. Consider adding a docs/ folder for detailed technical documentation."
    })
  }
  
  // Issue 2: Testing Infrastructure
  if (!hasTests) {
    issues.push({
      title: "Implement Testing Infrastructure",
      description: "The repository lacks testing infrastructure, which is critical for code quality and preventing regressions. No test files, testing frameworks, or CI/CD testing workflows are present.",
      difficulty: "medium",
      priority: "high",
      estimatedTime: "6-10 hours",
      category: "testing",
      affectedFiles: ["tests/", "jest.config.js", "package.json", ".github/workflows/"],
      technicalDetails: "Set up Jest or Vitest testing framework, create test directory structure, add test scripts to package.json, and implement basic unit tests for core functionality. Consider adding GitHub Actions for automated testing."
    })
  }
  
  // Issue 3: Code Quality & Configuration
  if (!hasConfigFiles || !hasPackageJson) {
    issues.push({
      title: "Enhance Project Configuration & Code Quality",
      description: `The project ${!hasPackageJson ? 'lacks package.json' : 'has minimal configuration'}. Missing essential configuration files for code quality tools, linting, formatting, and build processes.`,
      difficulty: "medium",
      priority: "medium",
      estimatedTime: "4-6 hours",
      category: "enhancement",
      affectedFiles: ["package.json", ".eslintrc.js", ".prettierrc", "tsconfig.json", ".gitignore"],
      technicalDetails: "Add ESLint for code linting, Prettier for code formatting, TypeScript configuration, and proper .gitignore. Configure scripts for linting, formatting, and building."
    })
  }
  
  // If we don't have 3 issues, add generic ones
  while (issues.length < 3) {
    if (issues.length === 0 || !issues.some(i => i.category === 'performance')) {
      issues.push({
        title: "Performance Optimization & Monitoring",
        description: "Implement performance monitoring and optimization strategies. Add performance metrics, bundle analysis, and optimization tools to improve application speed and user experience.",
        difficulty: "hard",
        priority: "medium",
        estimatedTime: "8-12 hours",
        category: "performance",
        affectedFiles: ["src/", "webpack.config.js", "package.json"],
        technicalDetails: "Add bundle analyzers, performance monitoring tools, implement code splitting, and optimize critical rendering paths. Consider adding Lighthouse CI for performance tracking."
      })
    } else if (issues.length === 1 || !issues.some(i => i.category === 'security')) {
      issues.push({
        title: "Security Hardening & Audit",
        description: "Implement security best practices and conduct security audit. Add security scanning tools, dependency vulnerability checks, and security headers.",
        difficulty: "medium",
        priority: "high",
        estimatedTime: "5-8 hours",
        category: "security",
        affectedFiles: ["package.json", ".github/workflows/", "src/"],
        technicalDetails: "Add npm audit scripts, GitHub security scanning, implement security headers, validate user inputs, and add rate limiting for API endpoints."
      })
    } else {
      issues.push({
        title: "Build & Deployment Optimization",
        description: "Optimize build process and deployment pipeline. Implement proper build tools, environment configuration, and deployment automation.",
        difficulty: "medium",
        priority: "medium",
        estimatedTime: "4-6 hours",
        category: "build",
        affectedFiles: ["package.json", "webpack.config.js", ".env", "docker-compose.yml"],
        technicalDetails: "Configure build optimization, add environment variable management, implement Docker containerization, and set up automated deployment pipelines."
      })
    }
  }

  return {
    repoSummary: `Repository ${repoData.full_name} is a ${repoData.language || 'software'} project with ${repoData.stargazers_count} stars and ${repoData.forks_count} forks. The project ${hasPackageJson ? 'has basic package management' : 'lacks package configuration'} and ${hasReadme ? 'includes minimal documentation' : 'needs documentation setup'}.`,
    suggestedIssues: issues,
    overallHealth: hasPackageJson && hasReadme && hasTests ? "GOOD" : "NEEDS_ATTENTION",
    maintenanceScore: `${hasPackageJson && hasReadme && hasTests ? 7 : 4}/10`,
    recommendedActions: [
      "Start with documentation improvements as they provide immediate value",
      "Implement testing infrastructure to prevent regressions",
      "Add code quality tools for consistent development standards"
    ],
    codeQualityMetrics: {
      complexity: "medium",
      testCoverage: hasTests ? "estimated 20%" : "0%",
      documentation: hasReadme ? "poor" : "missing"
    }
  }
}

/**
 * Creates a new branch and performs initial setup for issue fix
 * Body: { repoFullName: string, branchName: string, issueNumber: number }
 */
export const createIssueBranch = async (req, res) => {
  const token = req.cookies.github_token
  const { repoFullName, branchName, issueNumber } = req.body

  if (!repoFullName || !branchName || !issueNumber) {
    return res.status(400).json({ error: 'Missing required fields: repoFullName, branchName, issueNumber' })
  }

  try {
    const normalizedRepoName = String(repoFullName)
      .trim()
      .replace(/^https?:\/\/github\.com\//i, '')
      .replace(/\.git$/i, '')
      .replace(/\/+$/g, '')

    const [owner, repo] = normalizedRepoName.split('/')

    // Get the default branch (usually main or master)
    const repoInfo = await axios.get(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: { Authorization: `token ${token}` }
    })

    const defaultBranch = repoInfo.data.default_branch

    // Get the latest commit from default branch
    const commitsResponse = await axios.get(`https://api.github.com/repos/${owner}/${repo}/commits/${defaultBranch}`, {
      headers: { Authorization: `token ${token}` }
    })

    const latestCommitSha = commitsResponse.data.sha

    // Create the new branch
    const createBranchResponse = await axios.post(`https://api.github.com/repos/${owner}/${repo}/git/refs`, {
      ref: `refs/heads/${branchName}`,
      sha: latestCommitSha
    }, {
      headers: { Authorization: `token ${token}` }
    })

    // Create an initial commit message
    const commitMessage = `feat: start work on issue #${issueNumber}

- Created branch: ${branchName}
- Issue: ${repoFullName}#${issueNumber}
- Status: In progress`

    res.json({
      success: true,
      branch: createBranchResponse.data,
      commitMessage,
      nextSteps: [
        'Clone the repository locally',
        `Checkout the new branch: git checkout ${branchName}`,
        'Make your changes',
        'Commit and push: git add . && git commit -m "your message" && git push origin ${branchName}',
        'Create a pull request when ready'
      ]
    })

  } catch (error) {
    console.error('[createIssueBranch] Error:', error.message)
    res.status(500).json({ 
      error: 'Failed to create issue branch', 
      details: error.message 
    })
  }
}