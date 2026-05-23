import Groq from 'groq-sdk';

const getClient = () => new Groq({ apiKey: process.env.GROQ_API_KEY });

const safeJSON = (text) => {
  const clean = text.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
};

// Generates architecture overview from file list + key file contents
export const analyzeRepo = async (repoName, files, chunks) => {
  const fileList = files.map(f => f.path).join('\n');
  const sampleContent = chunks.slice(0, 8)
    .map(c => `// ${c.path}\n${c.content}`)
    .join('\n\n---\n\n');

  const prompt = `You are an expert software architect analyzing a GitHub repository.

Repository: ${repoName}
Files present:
${fileList}

Sample code from key files:
${sampleContent}

Respond ONLY with valid JSON. No markdown. No extra text.
{
  "summary": "<2 sentence overview of what this project does>",
  "techStack": ["<technology 1>", "<technology 2>"],
  "architecture": "<3-4 sentences explaining the architecture>",
  "mainComponents": [
    { "name": "<component/file name>", "role": "<what it does in 1 sentence>" }
  ],
  "onboarding": "<4-5 sentences: where to start reading, what to understand first, key patterns used>",
  "complexity": "simple" | "moderate" | "complex"
}`;

  try {
    const client = getClient();
    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are a senior software architect. Always respond with valid JSON only. No markdown, no explanation outside the JSON.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2,
    });
    return safeJSON(response.choices[0].message.content);
  } catch (err) {
    console.error('❌ AI analyze error:', err.message);
    return {
      summary: 'Could not analyze this repository.',
      techStack: [],
      architecture: 'Analysis unavailable.',
      mainComponents: [],
      onboarding: 'Try asking questions in the Q&A panel.',
      complexity: 'moderate'
    };
  }
};

// Answers a question using only the relevant chunks as context
export const answerQuestion = async (repoName, question, relevantChunks) => {
  const context = relevantChunks
    .map(c => `// File: ${c.path} (lines ${c.startLine}-${c.endLine})\n${c.content}`)
    .join('\n\n---\n\n');

  const prompt = `You are helping a developer understand the repository: ${repoName}

Relevant code context:
${context}

Developer's question: "${question}"

Answer based ONLY on the code above. If the answer isn't in the context, say so honestly.
Keep your answer under 150 words. Be specific — reference actual file names and line numbers.`;

  try {
    const client = getClient();
    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are a senior developer explaining a codebase. Be specific, reference actual files and code. Never hallucinate — only answer from the provided context.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.1,
    });
    return response.choices[0].message.content;
  } catch (err) {
    console.error('❌ AI answer error:', err.message);
    return 'Could not answer this question. Try rephrasing it.';
  }
};