import React, { useState, useEffect, useRef } from 'react';
import { useAgent } from '../../agent/useAgent';
import { createGeminiFetch } from '../../agent/geminiFetch';
import { AgentStatusGlow } from './components/AgentStatusGlow';
import { HistoryPanel } from './components/HistoryPanel';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChartBlock } from './components/ChartBlock';
import { storage } from '@wxt-dev/storage';
import {
  ClockCounterClockwiseIcon,
  CheckCircleIcon, XCircleIcon, WarningIcon, InfoIcon,
} from '@phosphor-icons/react';
import './App.css';

const EMOJI_MAP: [RegExp, React.ReactNode][] = [
  [/✅/g, <CheckCircleIcon size={15} weight="fill" color="#22c55e" style={{ verticalAlign: 'middle', display: 'inline', marginBottom: 2 }} />],
  [/❌/g, <XCircleIcon    size={15} weight="fill" color="#ef4444" style={{ verticalAlign: 'middle', display: 'inline', marginBottom: 2 }} />],
  [/⚠️/g, <WarningIcon   size={15} weight="fill" color="#f97316" style={{ verticalAlign: 'middle', display: 'inline', marginBottom: 2 }} />],
  [/ℹ️/g, <InfoIcon      size={15} weight="fill" color="#60a5fa" style={{ verticalAlign: 'middle', display: 'inline', marginBottom: 2 }} />],
];

function injectIcons(children: React.ReactNode): React.ReactNode {
  return React.Children.map(children, child => {
    if (typeof child !== 'string') return child;
    let parts: (string | React.ReactNode)[] = [child];
    for (const [regex, icon] of EMOJI_MAP) {
      parts = parts.flatMap(part => {
        if (typeof part !== 'string') return [part];
        return part.split(regex).flatMap((seg, i, arr) =>
          i < arr.length - 1 ? [seg, React.cloneElement(icon as React.ReactElement, { key: `${i}` })] : [seg]
        );
      });
    }
    return parts;
  });
}

const CopyButton = ({ text, isUser }: { text: string, isUser: boolean }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button className={`bubble-copy-btn ${isUser ? 'user' : 'ai'}`} onClick={handleCopy} title="Copy message">
      {copied ? (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
      ) : (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
      )}
      <span style={{ fontSize: '10px', marginLeft: '4px' }}>{copied ? 'Copied' : 'Copy'}</span>
    </button>
  );
};

export default function App() {
  const [task, setTask] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [isDetached, setIsDetached] = useState(false);
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'ai', content: string}>>([]);
  const modelDropdownRef = useRef<HTMLDivElement>(null);
  const chatAreaRef = useRef<HTMLDivElement>(null);
  const aiResponseAddedRef = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea height as content changes
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto';
    
    // Set height to scrollHeight
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [task]);
  const { status, activity, history, currentTask, execute, stop, reset, configure, config } = useAgent();

  const [isRequestingMicTab, setIsRequestingMicTab] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [isErrorExiting, setIsErrorExiting] = useState(false);
  const errorTimeoutRef = useRef<any>(null);
  const errorExitTimeoutRef = useRef<any>(null);

  // Auto-dismiss voiceError after 6 seconds with a vanish animation
  useEffect(() => {
    if (voiceError) {
      setIsErrorExiting(false);
      
      // Clear any previous timers
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
      if (errorExitTimeoutRef.current) clearTimeout(errorExitTimeoutRef.current);

      errorTimeoutRef.current = setTimeout(() => {
        setIsErrorExiting(true);
        errorExitTimeoutRef.current = setTimeout(() => {
          setVoiceError(null);
          setIsErrorExiting(false);
        }, 300); // 300ms matches the transition/animation duration
      }, 6000); // Show for 6 seconds
    }

    return () => {
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
      if (errorExitTimeoutRef.current) clearTimeout(errorExitTimeoutRef.current);
    };
  }, [voiceError]);

  const handleDismissError = () => {
    setIsErrorExiting(true);
    if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
    if (errorExitTimeoutRef.current) clearTimeout(errorExitTimeoutRef.current);
    
    errorExitTimeoutRef.current = setTimeout(() => {
      setVoiceError(null);
      setIsErrorExiting(false);
    }, 300);
  };

  const recognitionRef = useRef<any>(null);
  const initialTextRef = useRef('');
  const finalTranscriptRef = useRef('');
  const shouldBeListeningRef = useRef(false);
  const silenceTimerRef = useRef<any>(null);
  const refineOnStopRef = useRef(false);
  // Always points to latest refineVoiceText — lets onend call it without stale closure
  const refineVoiceTextRef = useRef<((text: string) => void) | null>(null);

  // Check if this page is opened in a tab specifically to request microphone permissions
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('request-mic') === 'true') {
      setIsRequestingMicTab(true);
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
          stream.getTracks().forEach(track => track.stop());
          window.close();
        })
        .catch((err) => {
          console.error('Failed to get mic permission in tab', err);
        });
    }
  }, []);

  const resetSilenceTimer = () => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = setTimeout(() => {
      if (shouldBeListeningRef.current) {
        shouldBeListeningRef.current = false;
        setIsListening(false);
        setInterimText('');
        try { recognitionRef.current?.stop(); } catch {}
      }
    }, 10_000);
  };

  // Always creates a fresh instance — avoids stale state after errors/aborts
  const createRecognition = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return null;

    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = navigator.language || 'en-US';
    rec.maxAlternatives = 1;

    rec.onstart = () => {
      setIsListening(true);
      setVoiceError(null);
      resetSilenceTimer();
    };

    rec.onend = () => {
      if (shouldBeListeningRef.current) {
        // Unexpected stop (silence gap, network blip) — restart with a fresh instance
        const newRec = createRecognition();
        if (newRec) {
          recognitionRef.current = newRec;
          try { newRec.start(); return; } catch {}
        }
      }
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      setIsListening(false);
      setInterimText('');

      // User explicitly tapped stop — refine the final transcript with LLM
      if (refineOnStopRef.current) {
        refineOnStopRef.current = false;
        const prefix = initialTextRef.current
          ? (initialTextRef.current + (initialTextRef.current.endsWith(' ') ? '' : ' '))
          : '';
        const fullText = (prefix + finalTranscriptRef.current).trim();
        if (fullText) refineVoiceTextRef.current?.(fullText);
      }
    };

    rec.onerror = (event: any) => {
      // no-speech and aborted are non-fatal — let onend handle restart
      if (event.error === 'no-speech' || event.error === 'aborted') return;

      console.error('Speech recognition error', event.error);
      shouldBeListeningRef.current = false;
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      setIsListening(false);
      setInterimText('');

      if (event.error === 'not-allowed') {
        chrome.tabs.create({ url: chrome.runtime.getURL('sidepanel.html?request-mic=true') });
      } else if (event.error === 'network') {
        const isBrave = !!(navigator as any).brave;
        setVoiceError(isBrave
          ? 'Brave blocks Google Voice by default. Use Windows Key + H (Windows) or double-press Control (macOS) to dictate natively!'
          : 'Speech Recognition requires a connection or is blocked by browser settings.'
        );
      } else {
        setVoiceError(`Voice input error: ${event.error}`);
      }
    };

    rec.onresult = (event: any) => {
      resetSilenceTimer();
      let interimTranscript = '';

      // Only process NEW results from this event — event.resultIndex is the start offset
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        const confidence: number = result[0].confidence;

        if (result.isFinal) {
          // confidence === 0 means the API didn't provide a score — accept it
          if (confidence === 0 || confidence >= 0.45) {
            finalTranscriptRef.current += transcript;
          }
        } else {
          interimTranscript += transcript;
        }
      }

      setInterimText(interimTranscript);
      const prefix = initialTextRef.current
        ? (initialTextRef.current + (initialTextRef.current.endsWith(' ') ? '' : ' '))
        : '';
      setTask(prefix + finalTranscriptRef.current + interimTranscript);
    };

    return rec;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      shouldBeListeningRef.current = false;
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      try { recognitionRef.current?.abort(); } catch {}
    };
  }, []);

  const startListening = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setVoiceError('Speech Recognition is not supported in this browser.');
      return;
    }
    setVoiceError(null);
    initialTextRef.current = task;
    finalTranscriptRef.current = '';
    shouldBeListeningRef.current = true;

    const rec = createRecognition();
    if (!rec) return;
    recognitionRef.current = rec;
    try { rec.start(); } catch (e) { console.error(e); }
  };

  const stopListening = () => {
    shouldBeListeningRef.current = false;
    refineOnStopRef.current = true;
    setInterimText('');
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    // stop() (not abort()) lets the engine commit any remaining audio before onend fires
    try { recognitionRef.current?.stop(); } catch {}
  };

  const refineVoiceText = async (rawText: string) => {
    if (!config || !rawText.trim()) return;
    setIsRefining(true);
    try {
      const fetchFn: typeof fetch = (config as any).customFetch ?? fetch;
      const response = await fetchFn(`${config.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(config.apiKey && config.apiKey !== 'NA'
            ? { Authorization: `Bearer ${config.apiKey}` }
            : {}),
        },
        body: JSON.stringify({
          model: config.model,
          messages: [{
            role: 'user',
            content: `You are a speech-to-text correction assistant. The following text was produced by voice recognition and may contain mishearing errors (wrong words that sound similar to the intended ones). Fix ONLY those errors. Do not rephrase, summarize, or add anything. Return ONLY the corrected text with no explanation:\n\n${rawText}`,
          }],
          max_tokens: 300,
          temperature: 0,
        }),
      });
      const data = await response.json();
      const refined = data.choices?.[0]?.message?.content?.trim();
      if (refined) setTask(refined);
    } catch {
      // Silent fail — original transcription stays as-is
    } finally {
      setIsRefining(false);
    }
  };

  // Keep the ref pointing at the latest refineVoiceText so onend can call it
  refineVoiceTextRef.current = refineVoiceText;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(e.target as Node)) {
        setModelDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const MODEL_OPTIONS = [
    { value: 'qwen', label: 'Qwen 3.5 Plus' },
    { value: 'gemma-api', label: 'Gemma 4 26B (API)' },
    { value: 'gemma-local', label: `Local Ollama (${config?.model || 'gemma4:e4b'})` },
  ];

  const currentModelValue =
    config?.baseURL?.includes('localhost') || config?.baseURL?.includes('127.0.0.1') ? 'gemma-local' :
    config?.model === 'gemma-4-26b-a4b-it' ? 'gemma-api' :
    config?.model === 'qwen3.5-plus' ? 'qwen' : 'gemma-local';

  const currentModelLabel = 
    currentModelValue === 'gemma-local'
      ? `Local (${config?.model || 'Ollama'})`
      : MODEL_OPTIONS.find(o => o.value === currentModelValue)?.label || config?.model || 'Qwen 3.5 Plus';

  const handleModelSelect = async (val: string) => {
    setModelDropdownOpen(false);
    if (val === 'qwen') {
      await configure({
        baseURL: "https://page-ag-testing-ohftxirgbn.cn-shanghai.fcapp.run",
        model: "qwen3.5-plus",
        apiKey: "NA"
      });
    } else if (val === 'gemma-local') {
      const targetModel = (import.meta as any).env.VITE_LLM_MODEL_NAME || config?.model || "qwen2.5:7b";
      const targetBaseUrl = (import.meta as any).env.VITE_LLM_BASE_URL || "http://localhost:11434/v1";
      await configure({
        baseURL: targetBaseUrl,
        model: targetModel,
        apiKey: "ollama"
      });
    } else if (val === 'gemma-api') {
      const apiKey = (import.meta as any).env.VITE_GOOGLE_API_KEY as string;
      const model = 'gemma-4-26b-a4b-it';
      await configure({
        baseURL: "https://generativelanguage.googleapis.com/v1beta/openai",
        model,
        apiKey,
        disableNamedToolChoice: true,
        customFetch: createGeminiFetch(apiKey, model),
      });
    }
  };

  const saveLiveSession = async (taskText: string) => {
    try {
      await storage.setItem('local:oryonix_live_session', {
        id: Date.now().toString(),
        task: taskText,
        timestamp: Date.now(),
      });
    } catch (e) {
      console.error('Failed to save live session', e);
    }
  };

  const clearLiveSession = async () => {
    try { await storage.removeItem('local:oryonix_live_session'); } catch {}
  };

  const handleNewChat = () => {
    if (status === 'running' && !isDetached) {
      saveLiveSession(currentTask);
      setIsDetached(true);
      return;
    }
    if (status === 'running') stop();
    reset();
    clearLiveSession();
    setTask('');
    setChatMessages([]);
    aiResponseAddedRef.current = false;
    setIsDetached(false);
  };


  const saveToHistory = async (taskText: string, summaryText: string) => {
    try {
      const savedHistory = await storage.getItem<any[]>('local:oryonix_history') || [];
      const newItem = {
        id: Date.now().toString(),
        task: taskText,
        summary: summaryText,
        timestamp: Date.now()
      };
      await storage.setItem('local:oryonix_history', [...savedHistory, newItem]);
    } catch (e) {
      console.error('Failed to save history', e);
    }
  };

  const handleRun = async () => {
    stopListening();
    if (!task) return;
    if (isDetached) {
      if (status === 'running') stop();
      clearLiveSession();
      reset();
      setChatMessages([]);
      setIsDetached(false);
    }
    const taskToRun = task;
    setTask('');
    aiResponseAddedRef.current = false;
    setChatMessages(prev => [...prev, { role: 'user', content: taskToRun }]);
    try {
      const result: any = await execute(taskToRun);
      const outputText = result?.message || result?.output || result?.answer || result?.content;
      if (outputText && !aiResponseAddedRef.current) {
        aiResponseAddedRef.current = true;
        setChatMessages(prev => [...prev, { role: 'ai', content: outputText }]);
        saveToHistory(taskToRun, outputText);
      }
    } catch (e: any) {
      console.error(e);
      const errorMsg = `Error: ${e?.message || 'Execution failed'}`;
      if (!aiResponseAddedRef.current) {
        aiResponseAddedRef.current = true;
        setChatMessages(prev => [...prev, { role: 'ai', content: errorMsg }]);
        saveToHistory(taskToRun, errorMsg);
      }
    }
  };

  const prevStatusRef = useRef(status);

  useEffect(() => {
    const prevStatus = prevStatusRef.current;
    prevStatusRef.current = status;

    if (prevStatus === 'running' && (status === 'completed' || status === 'error') && currentTask && !aiResponseAddedRef.current) {
      if (history.length === 0) {
        const text = "Task stopped or failed before execution started.";
        aiResponseAddedRef.current = true;
        setChatMessages(prev => [...prev, { role: 'ai', content: text }]);
        return;
      }

      const addAIMessage = (text: string) => {
        if (!aiResponseAddedRef.current) {
          aiResponseAddedRef.current = true;
          setChatMessages(prev => [...prev, { role: 'ai', content: text }]);
          saveToHistory(currentTask, text);
        }
      };

      const lastMessageEvent = [...history].reverse().find(e =>
        e.type !== 'error' && ((e as any).message || (e as any).output || (e as any).content || (e as any).text || (e as any).answer || ((e as any).action?.name === 'done' && (e as any).action?.input?.text))
      ) as any;

      let foundDoneText = null;
      if (lastMessageEvent?.action?.name === 'done' && lastMessageEvent?.action?.input?.text) {
        foundDoneText = lastMessageEvent.action.input.text;
      }

      if (foundDoneText) {
        addAIMessage(foundDoneText);
      } else if (lastMessageEvent && (lastMessageEvent.message || lastMessageEvent.output || lastMessageEvent.content || lastMessageEvent.text || lastMessageEvent.answer)) {
        addAIMessage(lastMessageEvent.message || lastMessageEvent.output || lastMessageEvent.content || lastMessageEvent.text || lastMessageEvent.answer);
      } else {
        const lastStep = [...history].reverse().find(e => e.type === 'step') as any;
        if (lastStep?.reflection?.memory) {
          addAIMessage(`**Task concluded without a formal summary.**\n\n*Last agent memory:*\n${lastStep.reflection.memory}`);
        } else if (history[history.length - 1].type === 'error') {
          addAIMessage(`Error: ${(history[history.length - 1] as any).error?.message || (history[history.length - 1] as any).message || 'Execution failed'}`);
        } else {
          addAIMessage("Task completed, but the AI did not format a text summary.");
        }
      }
      clearLiveSession();
    }
  }, [status, history, currentTask]);

  // Auto-scroll to bottom on new messages or while running
  useEffect(() => {
    if (chatAreaRef.current) {
      if (chatMessages.length === 0) {
        chatAreaRef.current.scrollTop = 0;
      } else {
        chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
      }
    }
  }, [chatMessages, status]);


  const mapStatus = () => {
    if (status === 'running') {
      if (activity?.type === 'executing' && activity.tool === 'visionFallback') return 'thinking';
      return 'acting';
    }
    if (status === 'error') return 'error';
    return 'idle';
  };

  const getThinkingText = () => {
    const lastStep = [...history].reverse().find(e => e.type === 'step') as any;
    const memory = lastStep?.reflection?.memory || lastStep?.reflection?.next_goal;
    
    if (memory) {
      const words = memory.split(' ');
      if (words.length > 30) {
        return words.slice(0, 30).join(' ') + '...';
      }
      return memory;
    }

    if (activity) {
      if (activity.type === 'executing') return `Executing ${(activity as any).tool}...`;
      if (activity.type === 'thinking') return 'Analyzing page context...';
      return `Oryonix is ${activity.type}...`;
    }
    return 'Thinking...';
  };

  if (isRequestingMicTab) {
    return (
      <div className="permission-tab-container theme-dark">
        <div className="permission-card">
          <div className="permission-icon-wrapper">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="permission-mic-icon"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
          </div>
          <h1 className="permission-title">Microphone Access Required</h1>
          <p className="permission-description">
            Oryonix AI uses your microphone to let you dictate browser commands and chat messages with your voice.
          </p>
          <div className="permission-instruction">
            <div className="pulse-circle"></div>
            <span>Please click <strong>Allow</strong> in the browser prompt at the top of the screen.</span>
          </div>
          <p className="permission-footer">This tab will close automatically once microphone access is granted.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="popup-container theme-dark">
      <header className="popup-header">
        <div className="popup-brand">
          <img src="/logo.svg" alt="Oryonix AI Logo" className="popup-logo" />
          <h2 className="popup-title">Oryonix AI</h2>
        </div>
        <div className="header-actions">
          <button
            className="btn-header btn-header-action"
            onClick={handleNewChat}
            title="Start a new chat"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" aria-hidden="true"><path d="M5.625 1.25a.625.625 0 1 0-1.25 0v3.125H1.25a.625.625 0 1 0 0 1.25h3.125V8.75a.625.625 0 1 0 1.25 0V5.625H8.75a.625.625 0 1 0 0-1.25H5.625V1.25z"/></svg>
            <span className="btn-text">New Chat</span>
          </button>
          <button
            className="btn-header btn-header-ghost"
            onClick={() => setShowHistory(true)}
            title="View history"
          >
            <ClockCounterClockwiseIcon size={13} weight="bold" />
            <span className="btn-text">History</span>
          </button>
          <div className="header-divider" />
          <AgentStatusGlow status={mapStatus()} />
        </div>
      </header>
      

      <div className={`popup-chat-area ${chatMessages.length === 0 ? 'is-landing' : ''}`} ref={chatAreaRef}>
        {chatMessages.length === 0 && status !== 'running' && (
          <div className="landing-state">
            <div className="landing-hero-icon">
              <img src="/logo.svg" alt="Oryonix AI Logo" />
            </div>
            <h1 className="landing-title accent-text">Oryonix AI</h1>
            <p className="landing-subtitle">
              Your autonomous browser copilot. I can navigate pages, analyze visual context, and execute complex workflows directly in your browser.
            </p>
            <div className="landing-features">
              <div className="feature-item">
                <span className="feature-icon"><img src="/icon/artificial.png" width={20} height={20} alt="Autonomous Execution" /></span>
                <div className="feature-text">
                  <strong>Autonomous Execution</strong>
                  <span>Give me a goal and watch me navigate.</span>
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-icon"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24"><path fill="#f97316" d="M16 18a1 1 0 100-2v2zm-8-2a1 1 0 100 2v-2zm.707-8.707a1 1 0 10-1.414 1.414l1.414-1.414zM11 11l.707.707a1 1 0 000-1.414L11 11zm-3.707 2.293a1 1 0 101.414 1.414l-1.414-1.414zM7 4h10V2H7v2zm13 3v10h2V7h-2zm-3 13H7v2h10v-2zM4 17V7H2v10h2zm3 3a3 3 0 01-3-3H2a5 5 0 005 5v-2zm13-3a3 3 0 01-3 3v2a5 5 0 005-5h-2zM17 4a3 3 0 013 3h2a5 5 0 00-5-5v2zM7 2a5 5 0 00-5 5h2a3 3 0 013-3V2zm9 14H8v2h8v-2zM7.293 8.707l3 3 1.414-1.414-3-3-1.414 1.414zm3 1.586l-3 3 1.414 1.414 3-3-1.414-1.414z"/></svg></span>
                <div className="feature-text">
                  <strong>Visual DOM Perception</strong>
                  <span>Advanced spatial understanding of web layouts.</span>
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-icon"><img src="/icon/chat.svg" width={20} height={20} alt="Intelligent Summarization" /></span>
                <div className="feature-text">
                  <strong>Intelligent Summarization</strong>
                  <span>Concise insights and actionable results.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {chatMessages.map((msg, i) =>
          msg.role === 'user' ? (
            <div key={i} className="chat-message-container user-container">
              <div className="chat-bubble user-bubble">{msg.content}</div>
              <div className="chat-action-row user-action-row">
                <CopyButton text={msg.content} isUser={true} />
              </div>
            </div>
          ) : (
            <div key={i} className="chat-message-container ai-container">
              <div className="chat-bubble ai-bubble">
                <div className="ai-bubble-icon">
                  <img src="/logo.svg" alt="AI" />
                </div>
                <div className="ai-bubble-content markdown-body">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code({ className, children }) {
                        const lang = /language-(\w+)/.exec(className || '')?.[1]
                        if (lang === 'chart') {
                          return <ChartBlock code={String(children).replace(/\n$/, '')} />
                        }
                        return <code className={className}>{children}</code>
                      },
                      p({ children }) { return <p>{injectIcons(children)}</p> },
                      li({ children }) { return <li>{injectIcons(children)}</li> },
                      td({ children }) { return <td>{injectIcons(children)}</td> },
                      th({ children }) { return <th>{injectIcons(children)}</th> },
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              </div>
              <div className="chat-action-row ai-action-row">
                <CopyButton text={msg.content} isUser={false} />
              </div>
            </div>
          )
        )}

        {status === 'running' && (
          <div className="chat-status-bar">
            <div className="loader"></div>
            <span className="status-text">{getThinkingText()}</span>
          </div>
        )}
      </div>

      <div className="popup-input-area">
        {(voiceError || isErrorExiting) && (
          <div className={`voice-error-banner ${isErrorExiting ? 'exiting' : ''}`}>
            <div className="voice-error-content">
              <svg className="voice-error-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span>{voiceError}</span>
            </div>
            <button className="voice-error-close-btn" onClick={handleDismissError} title="Dismiss">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><path d="M1.25 1.25a.625.625 0 0 1 .884 0L5 4.116 7.866 1.25a.625.625 0 1 1 .884.884L5.884 5l2.866 2.866a.625.625 0 1 1-.884.884L5 5.884 2.134 8.75a.625.625 0 1 1-.884-.884L4.116 5 1.25 2.134a.625.625 0 0 1 0-.884z"/></svg>
            </button>
          </div>
        )}
        {isListening && interimText && (
          <div className="voice-interim-banner">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" style={{flexShrink: 0, opacity: 0.7}}><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2" fill="none" stroke="currentColor" strokeWidth="2"/></svg>
            <span className="voice-interim-text">{interimText}</span>
          </div>
        )}
        <div className={`chat-input-wrapper ${status === 'running' ? 'is-running' : ''}`}>
          <textarea
            ref={textareaRef}
            value={task}
            onChange={(e) => setTask(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleRun();
              }
            }}
            placeholder="Ask Oryonix anything..."
            disabled={status === 'running' || isRefining}
            rows={1}
            className="chat-input-field"
          />
          <div className="chat-input-bottom-row">
            <div className="chat-input-actions-left">
              <div className="chat-model-selector-wrapper" ref={modelDropdownRef} title="Select model">
                <button
                  className={`chat-model-trigger ${modelDropdownOpen ? 'is-open' : ''}`}
                  onClick={() => setModelDropdownOpen(prev => !prev)}
                  type="button"
                >
                  <span className="chat-model-trigger-label">{currentModelLabel}</span>
                  <svg className={`chat-model-caret ${modelDropdownOpen ? 'caret-flip' : ''}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </button>
                <div className={`chat-model-dropdown ${modelDropdownOpen ? 'dropdown-open' : 'dropdown-closed'}`}>
                  {MODEL_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      className={`chat-model-option ${opt.value === currentModelValue ? 'option-active' : ''}`}
                      onClick={() => handleModelSelect(opt.value)}
                      type="button"
                    >
                      {opt.label}
                      {opt.value === currentModelValue && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            

            <div className="chat-input-actions-right">
              <button
                onClick={
                  isRefining ? undefined :
                  status === 'running' ? stop :
                  isListening ? stopListening :
                  task ? handleRun : startListening
                }
                disabled={isRefining}
                className={`chat-submit-btn ${
                  isRefining ? 'refining-mode' :
                  status === 'running' ? 'stop-mode' :
                  isListening ? 'listening-mode' :
                  task ? 'send-mode' : 'mic-mode'
                }`}
                title={
                  isRefining ? 'Refining with AI...' :
                  status === 'running' ? 'Stop' :
                  isListening ? 'Stop Listening' :
                  task ? 'Run' : 'Voice Input'
                }
              >
                {isRefining ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="spin-icon">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                ) : status === 'running' ? (
                  <div className="stop-icon-container">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="6" y="6" width="12" height="12" rx="1.5" />
                      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.3" />
                    </svg>
                  </div>
                ) : isListening ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="4" width="4" height="16" rx="1" />
                    <rect x="14" y="4" width="4" height="16" rx="1" />
                  </svg>
                ) : task ? (
                  <svg className="chat-submit-send-icon" width="20" height="20" viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M 32.7812 52.5508 C 34.4687 52.5508 35.6640 51.0977 36.5312 48.8477 L 51.8829 8.7461 C 52.3048 7.6680 52.5626 6.7070 52.5626 5.9102 C 52.5626 4.3867 51.6016 3.4492 50.0781 3.4492 C 49.2813 3.4492 48.3203 3.6836 47.2423 4.1055 L 6.9296 19.5508 C 4.9609 20.3008 3.4374 21.4961 3.4374 23.2070 C 3.4374 25.3633 5.0780 26.0899 7.3280 26.7695 L 20.0077 30.6133 C 21.4843 31.0821 22.3280 31.0352 23.3359 30.0977 L 49.0466 6.0742 C 49.3514 5.7930 49.7032 5.8399 49.9375 6.0508 C 50.1717 6.2852 50.1952 6.6367 49.9139 6.9414 L 25.9843 32.7461 C 25.0937 33.7070 24.9999 34.5039 25.4687 36.0742 L 29.1718 48.4492 C 29.8749 50.8164 30.6015 52.5508 32.7812 52.5508 Z"/></svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
                )}
              </button>
            </div>
          </div>
        </div>
        <div className="chat-disclaimer">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink: 0, marginTop: '1px'}}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span>AI can make mistakes. Some models route requests through third-party AI providers. See our <a href="https://oryonix-ai.vercel.app/privacy.html" target="_blank" rel="noreferrer">privacy policy</a> and <a href="https://oryonix-ai.vercel.app/terms.html" target="_blank" rel="noreferrer">terms</a>.</span>
        </div>
      </div>

      {showHistory && (
        <HistoryPanel
          onClose={() => setShowHistory(false)}
          onRestore={(item) => {
            setChatMessages([
              { role: 'user', content: item.task },
              { role: 'ai', content: item.summary }
            ]);
            setTask(item.task);
            setShowHistory(false);
          }}
          onRestoreLive={() => {
            setIsDetached(false);
            setShowHistory(false);
          }}
          status={status}
        />
      )}
    </div>
  );
}
