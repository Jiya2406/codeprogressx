'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Send,
  User as UserIcon,
  RefreshCw,
  Plus,
  Trash2,
  MessageSquare,
  History,
  X
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { getToken } from '@/lib/auth';
import NavBar from '@/components/NavBar';

function renderMarkdown(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code class="bg-lavender-100 px-1.5 py-0.5 rounded text-xs">$1</code>')
    .replace(/^### (.+)$/gm, '<h3 class="font-display font-bold text-base mt-3 mb-1">$1</h3>')
    .replace(/^## (.+)$/gm, '<h3 class="font-display font-bold text-lg mt-3 mb-1">$1</h3>')
    .replace(/^- (.+)$/gm, '<div class="flex gap-2 my-1"><span class="text-lavender-400">•</span><span>$1</span></div>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');
}

function relativeTime(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export default function MentorPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingSession, setLoadingSession] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState('');
  const [historyOpen, setHistoryOpen] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }
    Promise.all([
      apiFetch('/chat/sessions', { token }).catch(() => ({ sessions: [] })),
      apiFetch('/chat/suggestions', { token }).catch(() => ({ prompts: [] }))
    ]).then(([s, p]) => {
      setSessions(s.sessions || []);
      setSuggestions(p.prompts || []);
    });
  }, [router]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  const loadSession = async (id) => {
    if (id === currentSessionId) {
      setHistoryOpen(false);
      return;
    }
    setLoadingSession(true);
    setError('');
    try {
      const { session } = await apiFetch(`/chat/sessions/${id}`, { token: getToken() });
      setCurrentSessionId(id);
      setMessages(session.messages || []);
      setHistoryOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingSession(false);
    }
  };

  const newChat = () => {
    setCurrentSessionId(null);
    setMessages([]);
    setInput('');
    setError('');
    setHistoryOpen(false);
  };

  const deleteSession = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Delete this conversation?')) return;
    try {
      await apiFetch(`/chat/sessions/${id}`, { method: 'DELETE', token: getToken() });
      setSessions((s) => s.filter((x) => x._id !== id));
      if (id === currentSessionId) newChat();
    } catch (err) {
      setError(err.message);
    }
  };

  const send = async (text) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;

    setInput('');
    setError('');
    const optimisticMessages = [...messages, { role: 'user', content: msg }];
    setMessages(optimisticMessages);
    setLoading(true);

    try {
      const data = await apiFetch('/chat', {
        method: 'POST',
        token: getToken(),
        body: { message: msg, sessionId: currentSessionId }
      });
      setMessages([...optimisticMessages, { role: 'assistant', content: data.reply }]);

      if (!currentSessionId) {
        setCurrentSessionId(data.sessionId);
        setSessions((s) => [
          { _id: data.sessionId, title: data.title, updatedAt: new Date().toISOString() },
          ...s
        ]);
      } else {
        setSessions((s) => {
          const idx = s.findIndex((x) => x._id === currentSessionId);
          if (idx === -1) return s;
          const updated = [...s];
          const [item] = updated.splice(idx, 1);
          return [{ ...item, updatedAt: new Date().toISOString() }, ...updated];
        });
      }
    } catch (err) {
      setError(err.message);
      setMessages(messages);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen max-w-7xl mx-auto px-6 md:px-10 py-6 md:py-10">
      <NavBar />

      <div className="flex justify-end mb-3 lg:hidden">
        <button
          onClick={() => setHistoryOpen(!historyOpen)}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 border border-white text-sm text-gray-700 hover:bg-white transition"
        >
          <History className="w-4 h-4 text-lavender-400" />
          History ({sessions.length})
        </button>
      </div>

      <div className="grid lg:grid-cols-[280px_1fr] gap-x-5">
        <div className="hidden lg:block" aria-hidden="true" />
        <h1 className="hidden lg:block font-display text-4xl md:text-5xl font-bold text-center mb-5">
          AI Mentor <Sparkles className="inline w-6 h-6 md:w-7 md:h-7 text-lavender-400" />
        </h1>

        <aside
          className={`${
            historyOpen ? 'block' : 'hidden'
          } lg:block glass-card rounded-3xl p-4 shadow-soft h-fit`}
        >
          <div className="flex items-center justify-between mb-3 lg:hidden">
            <span className="font-display font-bold text-lg">History</span>
            <button onClick={() => setHistoryOpen(false)} className="p-1 text-gray-400 hover:text-gray-700">
              <X className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={newChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-lavender-400 to-blush-300 text-white text-sm font-semibold shadow-soft hover:shadow-glow transition mb-3"
          >
            <Plus className="w-4 h-4" /> New chat
          </button>

          {sessions.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-4">
              No past chats yet — your conversations will appear here.
            </p>
          ) : (
            <div className="space-y-1 max-h-[60vh] overflow-y-auto pr-1">
              {sessions.map((s) => {
                const active = s._id === currentSessionId;
                return (
                  <div
                    key={s._id}
                    onClick={() => loadSession(s._id)}
                    className={`group flex items-start gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition ${
                      active
                        ? 'bg-gradient-to-r from-lavender-100 to-blush-100 border border-lavender-200'
                        : 'hover:bg-white/60 border border-transparent'
                    }`}
                  >
                    <MessageSquare
                      className={`w-3.5 h-3.5 mt-1 flex-shrink-0 ${
                        active ? 'text-lavender-500' : 'text-gray-400'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-gray-800 truncate font-medium">{s.title}</div>
                      <div className="text-xs text-gray-400">{relativeTime(s.updatedAt)}</div>
                    </div>
                    <button
                      onClick={(e) => deleteSession(s._id, e)}
                      className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-blush-400 transition flex-shrink-0"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </aside>

        <div className="flex flex-col">
          <h1 className="lg:hidden font-display text-3xl sm:text-4xl font-bold text-center mb-5">
            AI Mentor <Sparkles className="inline w-6 h-6 text-lavender-400" />
          </h1>
          <div className="glass-card rounded-3xl shadow-soft flex flex-col" style={{ minHeight: '60vh' }}>
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-5 md:p-7 space-y-4"
            style={{ maxHeight: '60vh' }}
          >
            {loadingSession ? (
              <div className="flex items-center justify-center gap-2 text-gray-500 py-12">
                <RefreshCw className="w-4 h-4 animate-spin" /> Loading conversation…
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-lavender-400 to-blush-300 flex items-center justify-center mx-auto mb-5 shadow-soft">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-display text-xl font-bold mb-2">Your personal CP mentor</h3>
                <p className="text-gray-600 text-sm mb-6">
                  Ask about your weak topics, what to practice, or how to improve.
                </p>
                {suggestions.length > 0 && (
                  <div className="flex flex-col gap-2 max-w-md mx-auto">
                    <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">Try asking</p>
                    {suggestions.map((p) => (
                      <button
                        key={p}
                        onClick={() => send(p)}
                        className="text-left px-4 py-3 rounded-xl bg-white/70 border border-lavender-100 hover:bg-lavender-50 hover:border-lavender-200 transition text-sm text-gray-700"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              messages.map((m, i) => <Message key={i} role={m.role} content={m.content} />)
            )}
            {loading && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-lavender-400 to-blush-300 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="bg-lavender-50 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-lavender-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-lavender-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-lavender-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            {error && (
              <div className="text-sm text-blush-400 bg-blush-50 px-4 py-2.5 rounded-xl border border-blush-100">
                {error}
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="border-t border-lavender-100 p-4 flex gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading || loadingSession}
              placeholder="Ask your mentor anything…"
              className="flex-1 px-4 py-3 rounded-xl bg-white/70 border border-lavender-100 focus:border-lavender-300 focus:outline-none focus:ring-2 focus:ring-lavender-200 transition placeholder:text-gray-400 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={loading || loadingSession || !input.trim()}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-lavender-400 to-blush-300 text-white font-semibold shadow-soft hover:shadow-glow disabled:opacity-50 transition flex items-center gap-2"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
          </div>
        </div>
      </div>
    </main>
  );
}

function Message({ role, content }) {
  const isUser = role === 'user';
  return (
    <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div
        className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
          isUser ? 'bg-blush-100' : 'bg-gradient-to-br from-lavender-400 to-blush-300 shadow-soft'
        }`}
      >
        {isUser ? (
          <UserIcon className="w-4 h-4 text-blush-400" />
        ) : (
          <Sparkles className="w-4 h-4 text-white" />
        )}
      </div>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? 'bg-blush-50 rounded-tr-sm text-gray-800'
            : 'bg-lavender-50 rounded-tl-sm text-gray-800'
        }`}
        dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
      />
    </div>
  );
}
