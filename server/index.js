import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import repoRouter from './routes/repo.js';

dotenv.config(); // ← THIS was missing. Without it .env is never loaded.

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/repo', repoRouter);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`✓ RepoLens server → http://localhost:${PORT}`);
  console.log(`✓ GitHub token loaded: ${process.env.GITHUB_TOKEN ? 'YES' : 'NO ← PROBLEM'}`);
  console.log(`✓ Groq key loaded: ${process.env.GROQ_API_KEY ? 'YES' : 'NO ← PROBLEM'}`);
});