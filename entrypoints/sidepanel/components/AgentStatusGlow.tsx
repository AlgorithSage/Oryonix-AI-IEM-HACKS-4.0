import React from 'react';

type AgentState = 'idle' | 'thinking' | 'acting' | 'error';

interface AgentStatusGlowProps {
  status: AgentState;
}

export const AgentStatusGlow: React.FC<AgentStatusGlowProps> = ({ status }) => {
  const isActive = status === 'thinking' || status === 'acting';
  const isError  = status === 'error';

  const label = isActive ? 'Agent Live' : 'Agent Idle';

  return (
    <div
      className={`agent-status-container ${isActive ? 'status-active' : ''} ${isError ? 'status-error' : ''}`}
      aria-live="polite"
    >
      <div className={`status-dot ${isActive ? 'dot-live' : isError ? 'dot-error' : 'dot-idle'}`} />
      <span className="status-label">{label}</span>
    </div>
  );
};
