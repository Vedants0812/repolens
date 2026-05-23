const STEPS = [
  'Fetching repository file tree...',
  'Reading source files...',
  'Chunking code into segments...',
  'Running AI architecture analysis...',
  'Building onboarding guide...',
];

export default function LoadingState() {
  return (
    <div className="loading-screen">
      <div className="spinner" />
      <span>Analyzing repository</span>
      <div className="loading-steps">
        {STEPS.map((step, i) => (
          <p key={i} className="loading-step active">{step}</p>
        ))}
      </div>
    </div>
  );
}