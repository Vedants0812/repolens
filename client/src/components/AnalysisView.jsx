import ChatPanel from './ChatPanel';

const complexityClass = (c) => `complexity-badge complexity-${c}`;

export default function AnalysisView({ analysis, repoName, fileCount, onAsk, onReset }) {
  return (
    <div>
      <div className="card">
        <div className="analysis-header">
          <div>
            <h2 className="repo-title">{repoName}</h2>
            <p className="repo-meta">{fileCount} files analyzed</p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span className={complexityClass(analysis.complexity)}>
              {analysis.complexity}
            </span>
            <button className="btn btn-ghost" onClick={onReset}>← New Repo</button>
          </div>
        </div>

        <p className="section-label">What it does</p>
        <p className="summary-text">{analysis.summary}</p>

        <p className="section-label">Tech Stack</p>
        <div className="tech-stack">
          {analysis.techStack?.map((tech, i) => (
            <span key={i} className="tech-tag">{tech}</span>
          ))}
        </div>

        <p className="section-label">Architecture</p>
        <p className="summary-text">{analysis.architecture}</p>

        <p className="section-label">Key Components</p>
        <div className="components-list">
          {analysis.mainComponents?.map((comp, i) => (
            <div key={i} className="component-item">
              <p className="component-name">{comp.name}</p>
              <p className="component-role">{comp.role}</p>
            </div>
          ))}
        </div>

        <div className="onboarding-box">
          <p className="onboarding-label">Developer Onboarding Guide</p>
          <p className="onboarding-text">{analysis.onboarding}</p>
        </div>
      </div>

      <ChatPanel repoName={repoName} onAsk={onAsk} />
    </div>
  );
}