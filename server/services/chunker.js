// WHY: LLMs have token limits. We can't send 30 files at once.
// We split each file into chunks and only send relevant ones per question.

export const chunkFile = (path, content, chunkSize = 60) => {
  const lines = content.split('\n');
  const chunks = [];

  for (let i = 0; i < lines.length; i += chunkSize) {
    const chunkLines = lines.slice(i, i + chunkSize);
    chunks.push({
      path,
      startLine: i + 1,
      endLine: i + chunkLines.length,
      content: chunkLines.join('\n'),
    });
  }
  return chunks;
};

export const buildChunks = (files) => {
  // files = array of { path, content }
  const allChunks = [];
  for (const file of files) {
    if (!file.content || file.content.trim().length === 0) continue;
    const fileChunks = chunkFile(file.path, file.content);
    allChunks.push(...fileChunks);
  }
  return allChunks;
};

// Simple keyword relevance scorer — finds chunks most relevant to a question
// WHY: Real RAG uses embeddings. For a portfolio project, keyword matching
// gets you 80% of the way there and is 100% explainable in interviews.
export const getRelevantChunks = (chunks, question, topK = 5) => {
  const keywords = question.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(' ')
    .filter(w => w.length > 3);

  const scored = chunks.map(chunk => {
    const text = (chunk.path + ' ' + chunk.content).toLowerCase();
    const score = keywords.reduce((sum, kw) => {
      const count = (text.match(new RegExp(kw, 'g')) || []).length;
      return sum + count;
    }, 0);
    return { ...chunk, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
};