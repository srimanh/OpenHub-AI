import express from 'express'
import {
  getLocalTree,
  getResources,
  streamChanges,
  compressSelection,
  getStatus,
  getContextualResources,
  getRepoTreeFromGitHub,
  getGitHubContextualResources,
  learnRateLimiter
} from '../controllers/learncontroller.js'

const router = express.Router()

router.get('/tree', getLocalTree)
router.get('/github-tree', getRepoTreeFromGitHub)
router.get('/resources', getResources)
router.get('/status', getStatus)
router.get('/stream', streamChanges)
router.post('/compress', compressSelection)
router.get('/contextual', learnRateLimiter, getContextualResources)
router.get('/github-contextual', learnRateLimiter, getGitHubContextualResources)

export default router


