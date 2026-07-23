import { useState, useEffect, useRef } from 'react';

const API_URL = '/api/public';

export default function CustomerChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [error, setError] = useState(null);
  const [unread, setUnread] = useState(0);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen) { setUnread(0); inputRef.current?.focus(); }
  }, [isOpen]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || sending) return;

    const userMessage = { role: 'user', content: trimmed };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setSending(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          conversationId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.blocked) {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: "I can only help with restaurant-related questions. Please ask about our menu, bookings, hours, or other restaurant topics.",
          }]);
        } else {
          setError(data.error || 'Failed to get response');
        }
        return;
      }

      if (data.conversationId) setConversationId(data.conversationId);

      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setConversationId(null);
    setError(null);
    setInput('');
  };

  const handleToggle = () => {
    if (!isOpen) setUnread(0);
    setIsOpen(!isOpen);
  };

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
      {isOpen && (
        <div style={{
          width: '360px', maxHeight: '520px', backgroundColor: '#1a1a1a',
          borderRadius: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          marginBottom: '12px', border: '1px solid #333',
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '14px 16px', backgroundColor: '#222', borderBottom: '1px solid #333',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#28a745' }} />
              <span style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold' }}>Yori Support</span>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button onClick={handleNewChat} title="New conversation"
                style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '14px', padding: '2px 6px' }}>
                &#8635;
              </button>
              <button onClick={handleToggle} title="Minimize"
                style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '16px', padding: '2px 6px' }}>
                &#x2212;
              </button>
            </div>
          </div>

          <div style={{
            flex: 1, overflowY: 'auto', padding: '12px',
            display: 'flex', flexDirection: 'column', gap: '8px',
            minHeight: '280px', maxHeight: '340px',
          }}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', color: '#666', marginTop: '40px' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>&#128172;</div>
                <div style={{ fontSize: '14px', marginBottom: '4px' }}>Ask us anything!</div>
                <div style={{ fontSize: '12px' }}>Menu, reservations, hours...</div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '80%', padding: '10px 14px', borderRadius: '12px',
                  backgroundColor: msg.role === 'user' ? '#8B0000' : '#333',
                  color: msg.role === 'user' ? '#1a1a1a' : '#fff',
                  fontSize: '13px', lineHeight: '1.5',
                  borderBottomRightRadius: msg.role === 'user' ? '4px' : '12px',
                  borderBottomLeftRadius: msg.role === 'user' ? '12px' : '4px',
                }}>
                  <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                </div>
              </div>
            ))}

            {sending && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{
                  padding: '10px 14px', borderRadius: '12px', backgroundColor: '#333',
                  color: '#999', fontSize: '13px', borderBottomLeftRadius: '4px',
                }}>
                  Thinking<span style={{ animation: 'ydot 1.5s infinite' }}>.</span>
                  <span style={{ animation: 'ydot 1.5s infinite 0.2s' }}>.</span>
                  <span style={{ animation: 'ydot 1.5s infinite 0.4s' }}>.</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {error && (
            <div style={{ padding: '8px 16px', backgroundColor: '#3d1f1f', color: '#ff6b6b', fontSize: '12px', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <div style={{ padding: '10px', borderTop: '1px solid #333', display: 'flex', gap: '8px' }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about menu, reservations..."
              disabled={sending}
              style={{
                flex: 1, padding: '10px 12px', borderRadius: '8px', border: '1px solid #444',
                backgroundColor: '#222', color: '#fff', fontSize: '13px', outline: 'none',
              }}
            />
            <button onClick={handleSend} disabled={sending || !input.trim()}
              style={{
                padding: '10px 14px', backgroundColor: '#8B0000', color: '#1a1a1a',
                border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold',
                fontSize: '13px', opacity: sending || !input.trim() ? 0.5 : 1,
              }}>
              Send
            </button>
          </div>
        </div>
      )}

      <button onClick={handleToggle} aria-label="Toggle chat"
        style={{
          width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#8B0000',
          border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '24px', position: 'relative', transition: 'transform 0.2s',
        }}>
        {isOpen ? '\u2715' : '\uD83D\uDCAC'}
        {!isOpen && unread > 0 && (
          <span style={{
            position: 'absolute', top: '-4px', right: '-4px', backgroundColor: '#dc3545',
            color: '#fff', borderRadius: '50%', width: '20px', height: '20px',
            fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>{unread}</span>
        )}
      </button>

      <style>{`
        @keyframes ydot { 0%,100% { opacity: 0.3; } 50% { opacity: 1; } }
      `}</style>
    </div>
  );
}
