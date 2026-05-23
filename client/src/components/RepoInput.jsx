import { useState } from 'react';

const EXAMPLES = [
  'https://github.com/facebook/react',
  'https://github.com/expressjs/express',
  'https://github.com/vitejs/vite',
];

export default function RepoInput({ onAnalyze }) {
  const [url, setUrl] = useState('');

  return (
    <div className="card">
      <p className="input-eyebrow">AI Codebase Explorer</p>
      <h1 className="input-title">Understand any repo instantly</h1>
      <p className="input-sub">
        Paste a public GitHub URL. RepoLens reads the actual source code
        and gives you an architecture breakdown, onboarding guide, and
        answers your questions — all grounded in the real code.
      </p>
      <div className="url-input-wrap">
        <input
          className="url-input"
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="https://github.com/owner/repository"
          onKeyDown={e => e.key === 'Enter' && url.trim() && onAnalyze(url.trim())}
        />
        <button
          className="btn btn-primary"
          onClick={() => onAnalyze(url.trim())}
          disabled={!url.trim()}
        >
          Analyze →
        </button>
      </div>
      <p className="section-label">Try an example</p>
      <div className="example-repos">
        {EXAMPLES.map(ex => (
          <button
            key={ex}
            className="example-chip"
            onClick={() => { setUrl(ex); onAnalyze(ex); }}
          >
            {ex.replace('https://github.com/', '')}
          </button>
        ))}
      </div>
    </div>
  );
}