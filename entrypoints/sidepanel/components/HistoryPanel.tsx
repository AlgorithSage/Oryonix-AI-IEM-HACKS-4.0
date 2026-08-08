import { useState, useEffect } from 'react';
import { storage } from '@wxt-dev/storage';
import './HistoryPanel.css';

export interface SearchHistoryItem {
  id: string;
  task: string;
  summary: string;
  timestamp: number;
}

interface LiveSession {
  id: string;
  task: string;
  timestamp: number;
}

interface HistoryPanelProps {
  onClose: () => void;
  onRestore: (item: SearchHistoryItem) => void;
  onRestoreLive: () => void;
  status: string;
}

export function HistoryPanel({ onClose, onRestore, onRestoreLive, status }: HistoryPanelProps) {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [liveSession, setLiveSession] = useState<LiveSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
    loadLiveSession();
  }, []);

  const loadLiveSession = async () => {
    try {
      const live = await storage.getItem<LiveSession>('local:oryonix_live_session');
      setLiveSession(live ?? null);
    } catch {}
  };

  const loadHistory = async () => {
    try {
      const savedHistory = await storage.getItem<SearchHistoryItem[]>('local:oryonix_history');
      if (savedHistory && Array.isArray(savedHistory)) {
        // Sort newest first
        setHistory(savedHistory.sort((a, b) => b.timestamp - a.timestamp));
      }
    } catch (e) {
      console.error('Failed to load history', e);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = async () => {
    if (confirm('Are you sure you want to clear your local search history?')) {
      await storage.removeItem('local:oryonix_history');
      setHistory([]);
    }
  };

  const getSnippet = (text: string) => {
    // Basic markdown strip
    let stripped = text.replace(/[*_#`~>]/g, '').replace(/\[(.*?)\]\(.*?\)/g, '$1');
    // Remove extra newlines and spaces
    stripped = stripped.replace(/\s+/g, ' ').trim();
    return stripped;
  };

  if (loading) {
    return <div className="history-panel-container"><div className="loader"></div></div>;
  }

  const isRunning = status === 'running' || status === 'thinking';

  return (
    <div className="history-panel-container">
      <div className="history-header">
        <h3 className="history-title">Search History</h3>
        <button className="history-close-btn" onClick={onClose}>✕</button>
      </div>
      
      {liveSession && (
        <div className="live-session-item">
          <div className="live-session-header">
            <div className="live-badge">
              <span className="live-dot" />
              Live
            </div>
            <span className="live-session-date">{new Date(liveSession.timestamp).toLocaleString()}</span>
          </div>
          <div className="live-session-task">{liveSession.task}</div>
          <button className="live-resume-btn" onClick={onRestoreLive}>
            ↩ Resume Session
          </button>
        </div>
      )}

      {history.length === 0 && !liveSession ? (
        <div className="history-empty">
          <p>No past searches found.</p>
          <p className="history-empty-sub">Your searches are saved locally to your device for privacy.</p>
        </div>
      ) : (
        <div className="history-list">
          {history.map((item) => (
            <div 
              key={item.id} 
              className={`history-item ${isRunning ? 'disabled' : 'clickable'}`}
              onClick={() => {
                if (!isRunning) onRestore(item);
              }}
              style={{ cursor: isRunning ? 'not-allowed' : 'pointer', opacity: isRunning ? 0.7 : 1 }}
              title={isRunning ? "" : "Click to restore this task"}
            >
              <div className="history-item-header">
                <span className="history-item-date">{new Date(item.timestamp).toLocaleString()}</span>
                <button 
                  className="history-run-again-btn" 
                  disabled={isRunning}
                  style={{ opacity: isRunning ? 0.5 : 1, cursor: isRunning ? 'not-allowed' : 'pointer' }}
                  onClick={(e) => {
                    e.stopPropagation(); // prevent double firing
                    if (!isRunning) onRestore(item);
                  }}
                >
                  ↻ Run Again
                </button>
              </div>
              <div className="history-item-task">
                <strong>Task:</strong> {item.task}
              </div>
              <div className="history-item-summary">
                {getSnippet(item.summary)}
              </div>
            </div>
          ))}
          <div className="history-actions">
            <button className="history-clear-btn" onClick={clearHistory}>Clear All History</button>
          </div>
        </div>
      )}
    </div>
  );
}
