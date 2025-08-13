import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import childProcess from 'child_process'
import archiver from 'archiver'
import rateLimit from 'express-rate-limit'
import fetch from 'node-fetch'

// Import enhanced tech detection utility
import { detectTechnologies } from '../utils/techDetect.js'

function detectTechnologiesForPath(filePath) {
  return detectTechnologies(filePath)
}

function walkDir(rootDir, ignoreDirs = new Set(['node_modules', '.next', '.git', 'dist', 'build'])) {
  const result = []
  const stack = ['']
  while (stack.length) {
    const rel = stack.pop()
    const abs = path.join(rootDir, rel)
    let stat
    try {
      stat = fs.statSync(abs)
    } catch {
      continue
    }
    if (stat.isDirectory()) {
      const name = path.basename(abs)
      if (ignoreDirs.has(name)) continue
      const children = fs.readdirSync(abs)
      for (const child of children) {
        const childRel = path.join(rel, child)
        stack.push(childRel)
      }
    } else {
      result.push(rel.replace(/\\/g, '/'))
    }
  }
  return result
}

// Build a tree suitable for the frontend sidebar with tech badges per node
function buildTree(rootDir) {
  const files = walkDir(rootDir)
  const root = {}
  for (const relPath of files) {
    const parts = relPath.split('/')
    let current = root
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      const isLeaf = i === parts.length - 1
      if (!current[part]) current[part] = { __meta: { type: isLeaf ? 'file' : 'folder', path: parts.slice(0, i + 1).join('/') } }
      current = current[part]
    }
  }

  function toArray(obj) {
    return Object.entries(obj)
      .filter(([k]) => k !== '__meta')
      .map(([name, value]) => {
        const meta = value.__meta
        if (meta.type === 'folder') {
          const children = toArray(value)
          return {
            name,
            type: 'folder',
            path: meta.path,
            technologies: [],
            children
          }
        }
        return {
          name,
          type: 'file',
          path: meta.path,
          technologies: detectTechnologiesForPath(meta.path)
        }
      })
      .sort((a, b) => (a.type === b.type ? a.name.localeCompare(b.name) : a.type === 'folder' ? -1 : 1))
  }

  return toArray(root)
}

// Basic curated resources by technology
const RESOURCES = {
  'React': [
    { title: 'React Official Docs (Beta)', url: 'https://react.dev/learn', type: 'docs' },
    { title: 'React Hooks Course – freeCodeCamp', url: 'https://youtu.be/TNhaISOUy6Q', type: 'video' },
    { title: 'Epic React by Kent C. Dodds (free articles)', url: 'https://epicreact.dev/articles', type: 'course' }
  ],
  'Next.js': [
    { title: 'Next.js Learn', url: 'https://nextjs.org/learn', type: 'course' },
    { title: 'Next.js App Router Crash Course', url: 'https://youtu.be/Hiabp1GY8fA', type: 'video' },
    { title: 'Next.js Docs', url: 'https://nextjs.org/docs', type: 'docs' }
  ],
  'Node.js': [
    { title: 'Node.js Docs', url: 'https://nodejs.org/en/learn', type: 'docs' },
    { title: 'Node.js Crash Course – Traversy Media', url: 'https://youtu.be/fBNz5xF-Kx4', type: 'video' },
    { title: 'The Odin Project: NodeJS', url: 'https://www.theodinproject.com/paths/full-stack-javascript/courses/nodejs', type: 'course' }
  ],
  'TypeScript': [
    { title: 'TypeScript Handbook', url: 'https://www.typescriptlang.org/docs/handbook/intro.html', type: 'docs' },
    { title: 'TypeScript for Beginners – freeCodeCamp', url: 'https://youtu.be/30LWjhZzg50', type: 'video' },
    { title: 'Total TypeScript (free fundamentals)', url: 'https://www.totaltypescript.com/tutorials', type: 'course' }
  ],
  'TailwindCSS': [
    { title: 'TailwindCSS Docs', url: 'https://tailwindcss.com/docs/utility-first', type: 'docs' },
    { title: 'Tailwind From Scratch – Traversy Media', url: 'https://youtu.be/dFgzHOX84xQ', type: 'video' },
    { title: 'Tailwind CSS Course – Net Ninja', url: 'https://youtube.com/playlist?list=PL4cUxeGkcC9itC4TxYMzFCfS08S0CFgls', type: 'video' }
  ]
}

// Cache for last git revision to compute diffs and to serve /status
let lastHeadRef = null

// Add YouTube API key configuration
const YT_API_KEY = process.env.YOUTUBE_API_KEY || ''

function execGit(cwd, args) {
  return childProcess.spawnSync('git', args, { cwd, encoding: 'utf-8' })
}

export const getLocalTree = (req, res) => {
  try {
    // Get repository path from query parameters instead of hardcoded path
    const { repo_path } = req.query
    
    if (!repo_path) {
      return res.status(400).json({ error: 'repo_path query parameter is required' })
    }
    
    // Use the provided repository path instead of hardcoded OpenHub AI path
    const repoRoot = path.resolve(repo_path)
    
    // Verify the path exists and is accessible
    if (!fs.existsSync(repoRoot)) {
      return res.status(404).json({ error: 'Repository path not found' })
    }
    
  const tree = buildTree(repoRoot)
  res.json({ root: repoRoot, tree })
  } catch (error) {
    console.error('[getLocalTree] error:', error)
    res.status(500).json({ error: error.message })
  }
}

export const getResources = (req, res) => {
  const techsParam = String(req.query.technologies || '')
  const techs = techsParam
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
  const out = []
  for (const tech of techs) {
    if (RESOURCES[tech]) out.push({ technology: tech, items: RESOURCES[tech] })
  }
  res.json({ resources: out })
}

export const getStatus = (req, res) => {
  try {
    const { repo_path } = req.query
    
    if (!repo_path) {
      return res.status(400).json({ error: 'repo_path query parameter is required' })
    }
    
    const repoRoot = path.resolve(repo_path)
    
    if (!fs.existsSync(repoRoot)) {
      return res.status(404).json({ error: 'Repository path not found' })
    }
    
  const head = execGit(repoRoot, ['rev-parse', 'HEAD'])
  const current = head.status === 0 ? head.stdout.trim() : null
  res.json({ head: current, lastSeen: lastHeadRef })
  } catch (error) {
    console.error('[getStatus] error:', error)
    res.status(500).json({ error: error.message })
  }
}

export const streamChanges = (req, res) => {
  try {
    const { repo_path } = req.query
    
    if (!repo_path) {
      return res.status(400).json({ error: 'repo_path query parameter is required' })
    }
    
    const repoRoot = path.resolve(repo_path)
    
    if (!fs.existsSync(repoRoot)) {
      return res.status(404).json({ error: 'Repository path not found' })
    }

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders?.()

  const send = (event, data) => {
    res.write(`event: ${event}\n`)
    res.write(`data: ${JSON.stringify(data)}\n\n`)
  }

  // Immediately send current head
  const head = execGit(repoRoot, ['rev-parse', 'HEAD'])
  const current = head.status === 0 ? head.stdout.trim() : null
  if (current) send('head', { sha: current })

  // Poll git status every 2s (portable across environments)
  const interval = setInterval(() => {
    try {
      const headNow = execGit(repoRoot, ['rev-parse', 'HEAD'])
      const sha = headNow.status === 0 ? headNow.stdout.trim() : null
      if (sha && sha !== lastHeadRef) {
        // Get changed files between last and current
        if (lastHeadRef) {
          const diff = execGit(repoRoot, ['diff', '--name-status', `${lastHeadRef}..${sha}`])
          const lines = diff.stdout.split('\n').filter(Boolean)
          const changes = lines.map(line => {
            const [status, ...rest] = line.trim().split(/\s+/)
            const file = rest.join(' ')
            return { status, file, technologies: detectTechnologiesForPath(file) }
          })
          send('change', { from: lastHeadRef, to: sha, changes })
        }
        lastHeadRef = sha
        send('head', { sha })
      }
    } catch (e) {
      send('error', { message: e.message })
    }
  }, 2000)

  req.on('close', () => {
    clearInterval(interval)
    res.end()
  })
  } catch (error) {
    console.error('[streamChanges] error:', error)
    res.status(500).json({ error: error.message })
  }
}

export const compressSelection = async (req, res) => {
  try {
    const selection = req.body?.paths
    const { repo_path } = req.body
    
    if (!Array.isArray(selection) || selection.length === 0) {
      return res.status(400).json({ error: 'paths array required' })
    }
    
    if (!repo_path) {
      return res.status(400).json({ error: 'repo_path is required' })
    }
    
    const repoRoot = path.resolve(repo_path)
    
    if (!fs.existsSync(repoRoot)) {
      return res.status(404).json({ error: 'Repository path not found' })
    }
    
    const archiveName = `export-${Date.now()}.zip`
    res.setHeader('Content-Type', 'application/zip')
    res.setHeader('Content-Disposition', `attachment; filename="${archiveName}"`)

    const archive = archiver('zip', { zlib: { level: 9 } })
    archive.on('error', err => {
      console.error('[compressSelection] archiver error', err)
      if (!res.headersSent) res.status(500)
      res.end()
    })
    archive.pipe(res)

    for (const rel of selection) {
      const absPath = path.join(repoRoot, rel)
      if (!fs.existsSync(absPath)) continue
      const stat = fs.statSync(absPath)
      if (stat.isDirectory()) {
        archive.directory(absPath, rel)
      } else {
        archive.file(absPath, { name: rel })
      }
    }

    await archive.finalize()
  } catch (e) {
    console.error('[compressSelection] error', e)
    if (!res.headersSent) res.status(500).json({ error: e.message })
  }
}

function deriveKeywordsFromPath(fileOrFolderPath) {
  const base = path.basename(fileOrFolderPath)
  const name = base.replace(path.extname(base), '')
  const ext = path.extname(base).toLowerCase()
  const extToTech = {
    '.jsx': 'React', '.tsx': 'React TypeScript', '.js': 'JavaScript',
    '.ts': 'TypeScript', '.css': 'CSS', '.scss': 'Sass',
    '.md': 'Markdown', '.py': 'Python', '.go': 'Go', '.rs': 'Rust',
    '.java': 'Java', '.rb': 'Ruby', '.php': 'PHP'
  }
  const tech = extToTech[ext] || ''
  const keywords = [name, tech].filter(Boolean).join(' ')
  return keywords || 'software development'
}

// Curated fallback resources that do not require YouTube API
const CURATED_FALLBACK = {
  'React': [
    { type: 'docs', title: 'React Official Docs (Learn)', url: 'https://react.dev/learn' },
    { type: 'video', title: 'React Hooks Course – freeCodeCamp', url: 'https://www.youtube.com/watch?v=TNhaISOUy6Q' },
    { type: 'video', title: 'React 18 Crash Course – Traversy Media', url: 'https://www.youtube.com/watch?v=LDB4uaJ87e0' }
  ],
  'Next.js': [
    { type: 'course', title: 'Next.js Learn (Official)', url: 'https://nextjs.org/learn' },
    { type: 'video', title: 'Next.js 13 App Router Crash Course – Traversy', url: 'https://www.youtube.com/watch?v=Hiabp1GY8fA' },
    { type: 'docs', title: 'Next.js Docs', url: 'https://nextjs.org/docs' }
  ],
  'TypeScript': [
    { type: 'docs', title: 'TypeScript Handbook', url: 'https://www.typescriptlang.org/docs/handbook/intro.html' },
    { type: 'video', title: 'TypeScript Full Course – freeCodeCamp', url: 'https://www.youtube.com/watch?v=30LWjhZzg50' },
    { type: 'course', title: 'Total TypeScript – Free Fundamentals', url: 'https://www.totaltypescript.com/tutorials' }
  ],
  'Node.js': [
    { type: 'docs', title: 'Node.js Docs (Learn)', url: 'https://nodejs.org/en/learn' },
    { type: 'video', title: 'Node.js Crash Course – Traversy Media', url: 'https://www.youtube.com/watch?v=fBNz5xF-Kx4' },
    { type: 'course', title: 'The Odin Project – NodeJS', url: 'https://www.theodinproject.com/paths/full-stack-javascript/courses/nodejs' }
  ],
  'TailwindCSS': [
    { type: 'docs', title: 'TailwindCSS Docs', url: 'https://tailwindcss.com/docs/utility-first' },
    { type: 'video', title: 'Tailwind From Scratch – Traversy Media', url: 'https://www.youtube.com/watch?v=dFgzHOX84xQ' },
    { type: 'video', title: 'Tailwind CSS Course – Net Ninja', url: 'https://www.youtube.com/playlist?list=PL4cUxeGkcC9itC4TxYMzFCfS08S0CFgls' }
  ],
  'CSS': [
    { type: 'docs', title: 'MDN – Learn CSS', url: 'https://developer.mozilla.org/en-US/docs/Learn/CSS' },
    { type: 'video', title: 'CSS Grid Tutorial – Web Dev Simplified', url: 'https://www.youtube.com/watch?v=9zBsdzdE4sM' },
    { type: 'video', title: 'Flexbox in 15 Minutes – Web Dev Simplified', url: 'https://www.youtube.com/watch?v=fYq5PXgSsbE' }
  ],
  'Markdown': [
    { type: 'docs', title: 'Markdown Guide – Basic Syntax', url: 'https://www.markdownguide.org/basic-syntax/' },
    { type: 'docs', title: 'GitHub Flavored Markdown Spec', url: 'https://github.github.com/gfm/' }
  ],
  'JavaScript': [
    { type: 'docs', title: 'JavaScript Guide – MDN', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide' },
    { type: 'video', title: 'JavaScript Crash Course – Traversy Media', url: 'https://www.youtube.com/watch?v=hdI2bqOjy3c' }
  ]
}

function uniqueItems(items) {
  const seen = new Set()
  const out = []
  for (const it of items) {
    const key = `${it.type}|${it.title}|${it.url || ''}`
    if (seen.has(key)) continue
    seen.add(key)
    out.push(it)
  }
  return out
}

function deriveConceptsFromPath(filePath) {
  const lower = String(filePath).toLowerCase()
  const concepts = new Set()
  if (/(^|\/)readme\.md$/.test(lower)) {
    concepts.add('Repository Overview')
    concepts.add('Getting Started')
    concepts.add('Contributing')
  }
  if (/[\\\/]components?[\\\/]/.test(lower) || /\.(jsx|tsx)$/.test(lower)) {
    concepts.add('React Components')
    concepts.add('Props and State')
    concepts.add('Hooks')
    concepts.add('Component Composition')
  }
  if (/next\.config\.(js|mjs|ts)$/.test(lower) || /[\\\/]app[\\\/]/.test(lower) || /[\\\/]pages[\\\/]/.test(lower)) {
    concepts.add('Next.js Routing')
    concepts.add('Next.js Data Fetching')
    concepts.add('Next.js Rendering (SSR/SSG)')
  }
  if (/\.(ts|tsx)$/.test(lower)) {
    concepts.add('TypeScript Types and Interfaces')
    concepts.add('Generics')
  }
  if (/tailwind\.config\.(js|ts)$/.test(lower)) {
    concepts.add('Tailwind Utility-First Styling')
    concepts.add('Tailwind Configuration')
  }
  if (/\.(css|scss)$/.test(lower)) {
    concepts.add('CSS Flexbox')
    concepts.add('CSS Grid')
  }
  if (/\.(js|mjs|cjs)$/.test(lower) && /[\\\/]server|backend|api[\\\/]/.test(lower)) {
    concepts.add('Express Middleware')
    concepts.add('REST API Design')
  }
  return Array.from(concepts)
}

function conceptDocLink(concept) {
  const map = {
    'React Components': 'https://react.dev/learn/describing-the-ui',
    'Props and State': 'https://react.dev/learn/state-a-components-memory',
    'Hooks': 'https://react.dev/learn/hooks',
    'Component Composition': 'https://react.dev/learn/passing-props-to-a-component',
    'Next.js Routing': 'https://nextjs.org/docs/app/building-your-application/routing',
    'Next.js Data Fetching': 'https://nextjs.org/docs/app/building-your-application/data-fetching/fetching',
    'Next.js Rendering (SSR/SSG)': 'https://nextjs.org/docs/app/building-your-application/rendering',
    'TypeScript Types and Interfaces': 'https://www.typescriptlang.org/docs/handbook/2/everyday-types.html',
    'Generics': 'https://www.typescriptlang.org/docs/handbook/2/generics.html',
    'Tailwind Utility-First Styling': 'https://tailwindcss.com/docs/utility-first',
    'Tailwind Configuration': 'https://tailwindcss.com/docs/configuration',
    'CSS Flexbox': 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_flexible_box_layout/Basic_concepts_of_flexbox',
    'CSS Grid': 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout',
    'Express Middleware': 'https://expressjs.com/en/guide/using-middleware.html',
    'REST API Design': 'https://www.ics.uci.edu/~fielding/pubs/dissertation/top.htm',
    'Repository Overview': 'https://opensource.guide/how-to-contribute/#introduction',
    'Getting Started': 'https://docs.github.com/en/get-started',
    'Contributing': 'https://docs.github.com/en/get-started/quickstart/contributing-to-projects'
  }
  return map[concept]
}

async function youtubeSearch({ q, type = 'video', language = 'en', max = 6 }) {
  const params = new URLSearchParams({
    key: YT_API_KEY,
    part: 'snippet',
    q,
    type,
    maxResults: String(max),
    safeSearch: 'moderate',
    relevanceLanguage: language
  })
  const res = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`)
  if (!res.ok) throw new Error(`YouTube search failed: ${res.status}`)
  const data = await res.json()
  return data.items || []
}

export const getContextualResources = async (req, res) => {
  try {
    const { full_name, path: repoPath, language = 'en', max = '6' } = req.query
    if (!repoPath) return res.status(400).json({ error: 'path query param is required' })

    const keywords = deriveKeywordsFromPath(String(repoPath))
    const videoQuery = `${keywords} tutorial`
    const courseQuery = `${keywords} full course`

    // Build curated fallback items from detected techs and concepts
    const concepts = deriveConceptsFromPath(repoPath)
    const inferredTechs = detectTechnologiesForPath(repoPath)
    const curated = []
    for (const t of inferredTechs) {
      if (CURATED_FALLBACK[t]) curated.push(...CURATED_FALLBACK[t])
    }
    for (const c of concepts) {
      const link = conceptDocLink(c)
      if (link) curated.push({ type: 'docs', title: c, url: link })
    }

    let dynamicVideos = []
    let dynamicCourses = []
    if (YT_API_KEY) {
      try {
    const [videos, playlists] = await Promise.all([
      youtubeSearch({ q: videoQuery, type: 'video', language, max: Number(max) }),
      youtubeSearch({ q: courseQuery, type: 'playlist', language, max: Math.max(3, Math.floor(Number(max) / 2)) })
    ])
        dynamicVideos = videos.map(v => ({
      type: 'video',
      title: v.snippet.title,
      url: `https://www.youtube.com/watch?v=${v.id.videoId}`,
      channel: v.snippet.channelTitle,
      publishedAt: v.snippet.publishedAt
    }))
        dynamicCourses = playlists.map(p => ({
      type: 'course',
      title: p.snippet.title,
      url: `https://www.youtube.com/playlist?list=${p.id.playlistId}`,
      channel: p.snippet.channelTitle,
      publishedAt: p.snippet.publishedAt
    }))
      } catch {
        // ignore network/api failures; rely on curated fallback
      }
    }

    const items = uniqueItems([...curated, ...dynamicVideos, ...dynamicCourses])
    res.json({ language, availableLanguages: [language], items })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

export const getRepoTreeFromGitHub = async (req, res) => {
  try {
    const { full_name } = req.query
    
    if (!full_name) {
      return res.status(400).json({ error: 'full_name query parameter is required (owner/repo)' })
    }
    
    // Use the GitHub controller's getRepoTree function logic
    const token = req.cookies?.github_token
    let normalizedFullName = String(full_name)
      .trim()
      .replace(/^https?:\/\/github\.com\//i, '')
      .replace(/\.git$/i, '')
      .replace(/\/+$/g, '')

    const [owner, repo] = normalizedFullName.split('/')
    
    if (!owner || !repo) {
      return res.status(400).json({ error: 'Invalid repository format. Expected: owner/repo' })
    }

    // Import axios dynamically to avoid circular dependencies
    const axios = (await import('axios')).default
    
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

    // Convert GitHub tree to our tree format with technologies
    const tree = treeRes.data.tree
      .filter(item => item.type === 'blob') // Only files, not directories
      .map(item => ({
        name: path.basename(item.path),
        type: 'file',
        path: item.path,
        technologies: detectTechnologiesForPath(item.path),
        size: item.size,
        sha: item.sha
      }))

    res.json({
      default_branch: defaultBranch,
      tree,
      repository: {
        name: repo,
        owner: owner,
        full_name: normalizedFullName
      }
    })
  } catch (error) {
    console.error('[getRepoTreeFromGitHub] error:', error)
    const status = error.response?.status || 500
    const ghMessage = error.response?.data?.message
    res.status(status).json({ 
      error: 'Failed to fetch repository tree', 
      details: ghMessage || error.message 
    })
  }
}

export const getGitHubContextualResources = async (req, res) => {
  try {
    const { full_name, path: repoPath, language = 'en', max = '6' } = req.query
    if (!repoPath) {
      return res.status(400).json({ error: 'path query param is required' })
    }

    const keywords = deriveKeywordsFromPath(String(repoPath))
    const videoQuery = `${keywords} tutorial`
    const courseQuery = `${keywords} full course`

    // Build curated fallback items from detected techs and concepts
    const concepts = deriveConceptsFromPath(repoPath)
    const inferredTechs = detectTechnologiesForPath(repoPath)
    const curated = []
    for (const t of inferredTechs) {
      if (CURATED_FALLBACK[t]) curated.push(...CURATED_FALLBACK[t])
    }
    for (const c of concepts) {
      const link = conceptDocLink(c)
      if (link) curated.push({ type: 'docs', title: c, url: link })
    }

    let dynamicVideos = []
    let dynamicCourses = []
    if (YT_API_KEY) {
      try {
        const [videos, playlists] = await Promise.all([
          youtubeSearch({ q: videoQuery, type: 'video', language, max: Number(max) }),
          youtubeSearch({ q: courseQuery, type: 'playlist', language, max: Math.max(3, Math.floor(Number(max) / 2)) })
        ])
        dynamicVideos = videos.map(v => ({
          type: 'video',
          title: v.snippet.title,
          url: `https://www.youtube.com/watch?v=${v.id.videoId}`,
          channel: v.snippet.channelTitle,
          publishedAt: v.snippet.publishedAt
        }))
        dynamicCourses = playlists.map(p => ({
          type: 'course',
          title: p.snippet.title,
          url: `https://www.youtube.com/playlist?list=${p.id.playlistId}`,
          channel: p.snippet.channelTitle,
          publishedAt: p.snippet.publishedAt
        }))
      } catch {
        // ignore network/api failures; rely on curated fallback
      }
    }

    const items = uniqueItems([...curated, ...dynamicVideos, ...dynamicCourses])
    res.json({ language, availableLanguages: [language], items, repository: full_name, filePath: repoPath })
  } catch (e) {
    console.error('[getGitHubContextualResources] error:', e)
    res.status(500).json({ error: e.message })
  }
}

// Optional: basic rate limiter (attach in routes)
export const learnRateLimiter = rateLimit({
  windowMs: 60_000,
  max: 30
})


