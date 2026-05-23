import { useState } from 'react';

const SUGGESTED = [
  'Where does the main logic live?',
  'How is authentication handled?',
  'What is the folder structure pattern?',
  'Where should I start reading?',
];

export default function ChatPanel({ repoName, onAsk }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const ask = async (question) => {
    if (!question.trim() || loading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: question }]);
    setLoading(true);
    const answer = await onAsk(question);
    setMessages(prev => [...prev, { role: 'ai', text: answer }]);
    setLoading(false);
  };

  return (
    <div className="chat-wrap card" style={{ marginTop: '16px' }}>
      <h3 className="chat-title">Ask about the code</h3>

      {messages.length === 0 && (
        <>
          <p className="section-label">Suggested questions</p>
          <div className="suggested-questions">
            {SUGGESTED.map((q, i) => (
              <button key={i} className="sq-chip" onClick={() => ask(q)}>{q}</button>
            ))}
          </div>
        </>
      )}

      {messages.length > 0 && (
        <div className="chat-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`message message-${msg.role}`}>
              <p className="message-label">{msg.role === 'user' ? 'You' : 'RepoLens'}</p>
              {msg.text}
            </div>
          ))}
          {loading && (
            <div className="message message-ai">
              <p className="message-label">RepoLens</p>
              Analyzing code...
            </div>
          )}
        </div>
      )}

      <div className="chat-input-row">
        <input
          className="chat-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && ask(input)}
          placeholder="Ask anything about this codebase..."
          disabled={loading}
        />
        <button
          className="btn btn-primary"
          onClick={() => ask(input)}
          disabled={!input.trim() || loading}
        >
          Ask →
        </button>
      </div>
    </div>
  );
}