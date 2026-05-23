import express from 'express';
import { parseRepoUrl, getRepoTree, getFileContent } from '../services/github.js';
import { buildChunks, getRelevantChunks } from '../services/chunker.js';
import { analyzeRepo, answerQuestion } from '../services/ai.js';

const router = express.Router();

// In-memory store — holds chunks per session so /ask can use them
// WHY: We don't want to re-fetch the repo on every question
const repoCache = new Map();

// POST /api/repo/analyze
router.post('/analyze', async (req, res) => {
  const { repoUrl } = req.body;
  if (!repoUrl) return res.status(400).json({ error: 'Repo URL is required.' });

  try {
    console.log('Analyzing:', repoUrl);
    const { owner, repo } = parseRepoUrl(repoUrl);

    // Fetch file tree
    const tree = await getRepoTree(owner, repo);
    console.log(`Found ${tree.length} files`);

    // Fetch contents of each file
    const files = await Promise.all(
      tree.map(async (file) => ({
        path: file.path,
        content: await getFileContent(owner, repo, file.path),
      }))
    );

    // Build chunks and cache them
    const chunks = buildChunks(files);
    const cacheKey = `${owner}/${repo}`;
    repoCache.set(cacheKey, { chunks, repoName: cacheKey });
    console.log(`Built ${chunks.length} chunks`);

    // Generate AI analysis
    const analysis = await analyzeRepo(cacheKey, files, chunks);

    res.json({ analysis, repoName: cacheKey, fileCount: files.length });
  } catch (err) {
    console.error('❌ Analyze error:', err.message);
    res.status(500).json({ error: err.message || 'Failed to analyze repository.' });
  }
});

// POST /api/repo/ask
router.post('/ask', async (req, res) => {
  const { repoName, question } = req.body;
  if (!repoName || !question)
    return res.status(400).json({ error: 'repoName and question are required.' });

  const cached = repoCache.get(repoName);
  if (!cached)
    return res.status(404).json({ error: 'Repo not analyzed yet. Analyze first.' });

  try {
    const relevantChunks = getRelevantChunks(cached.chunks, question);
    const answer = await answerQuestion(repoName, question, relevantChunks);
    res.json({ answer });
  } catch (err) {
    console.error('❌ Ask error:', err.message);
    res.status(500).json({ error: 'Failed to answer question.' });
  }
});

export default router;