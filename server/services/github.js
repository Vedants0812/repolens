import axios from 'axios';

const BASE = 'https://api.github.com';

const headers = () => ({
  Authorization: `token ${process.env.GITHUB_TOKEN}`,
  Accept: 'application/vnd.github.v3+json',
});

// Parse GitHub URL → owner + repo
export const parseRepoUrl = (url) => {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) throw new Error('Invalid GitHub URL');
  return { owner: match[1], repo: match[2].replace('.git', '') };
};

// Get all files in repo (recursive tree)
export const getRepoTree = async (owner, repo) => {
  const { data: repoData } = await axios.get(
    `${BASE}/repos/${owner}/${repo}`,
    { headers: headers() }
  );
  const branch = repoData.default_branch;

  const { data } = await axios.get(
    `${BASE}/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
    { headers: headers() }
  );

  // Filter to only source files — skip node_modules, dist, lock files
  return data.tree.filter(f =>
    f.type === 'blob' &&
    f.size < 50000 && // skip huge files
    !f.path.includes('node_modules') &&
    !f.path.includes('dist') &&
    !f.path.includes('.git') &&
    !f.path.includes('package-lock') &&
    !f.path.includes('yarn.lock') &&
    /\.(js|jsx|ts|tsx|py|md|json|css|html|env\.example)$/.test(f.path)
  ).slice(0, 30); // max 30 files to stay within token limits
};

// Get content of a single file
export const getFileContent = async (owner, repo, path) => {
  try {
    const { data } = await axios.get(
      `${BASE}/repos/${owner}/${repo}/contents/${path}`,
      { headers: headers() }
    );
    // GitHub returns base64 encoded content
    return Buffer.from(data.content, 'base64').toString('utf-8');
  } catch {
    return null;
  }
};