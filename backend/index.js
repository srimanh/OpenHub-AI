import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.js'
import githubRoutes from './routes/github.js'
import learnRoutes from './routes/learn.js'

// Load environment variables
dotenv.config()

const app = express()

// CORS configuration - allow both localhost:3000 and localhost:3001
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5001', process.env.FRONTEND_URL].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(cookieParser())
app.use(express.json())

app.use('/auth', authRoutes)
app.use('/api/github', githubRoutes)
app.use('/api/learn', learnRoutes)

// Test endpoint to verify frontend connectivity
app.get('/test', (req, res) => {
  res.json({ 
    message: 'Backend is working!', 
    timestamp: new Date().toISOString(),
    aiStatus: 'OpenRouter GPT-4o integration active'
  })
})

const PORT = process.env.PORT || 5001
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`)
})