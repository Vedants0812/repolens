import { useState } from 'react';
import RepoInput from './components/RepoInput';
import AnalysisView from './components/AnalysisView';
import LoadingState from './components/LoadingState';
import './App.css';

const API = 'https://repolens-production-b776.up.railway.app/api/repo';

export default function App() {
  const [phase, setPhase] = useState('input');
  const [analysis, setAnalysis] = useState(null);
  const [repoName, setRepoName] = useState('');
  const [fileCount, setFileCount] = useState(0);
  const [error, setError] = useState('');

  const analyzeRepo = async (repoUrl) => {
    setPhase('loading');
    setError('');
    try {
      const res = await fetch(`${API}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAnalysis(data.analysis);
      setRepoName(data.repoName);
      setFileCount(data.fileCount);
      setPhase('analysis');
    } catch (err) {
      setError(err.message);
      setPhase('input');
    }
  };

  const askQuestion = async (question) => {
    try {
      const res = await fetch(`${API}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoName, question }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data.answer;
    } catch (err) {
      return `Error: ${err.message}`;
    }
  };

  const reset = () => {
    setPhase('input');
    setAnalysis(null);
    setRepoName('');
    setError('');
  };

  return (
    <div className="app">
      <header className="app-header">
        <span className="logo">
          RepoLens
          <span className="logo-sub">— understand any codebase instantly</span>
        </span>
      </header>
      <main className="app-main">
        {error && <div className="error-bar">⚠ {error}</div>}
        {phase === 'input' && <RepoInput onAnalyze={analyzeRepo} />}
        {phase === 'loading' && <LoadingState />}
        {phase === 'analysis' && (
          <AnalysisView
            analysis={analysis}
            repoName={repoName}
            fileCount={fileCount}
            onAsk={askQuestion}
            onReset={reset}
          />
        )}
      </main>
    </div>
  );
}