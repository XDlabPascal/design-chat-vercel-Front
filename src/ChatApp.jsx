import React, { useState, useEffect, useRef } from 'react';
import './ChatApp.css';

function ChatApp() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Lancement automatique de la 1ʳᵉ question depuis le backend
    const startChat = async () => {
      try {
        const response = await fetch('http://localhost:10000/message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ history: [] }),
        });
        const data = await response.json();
        setMessages([{ role: 'assistant', content: data.reply }]);
      } catch (error) {
        console.error('Erreur au démarrage du chat :', error);
      }
    };
    startChat();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:10000/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: newMessages }),
      });
      const data = await response.json();
      setMessages([...newMessages, { role: 'assistant', content: data.reply }]);
    } catch (error) {
      console.error('Erreur de réponse backend :', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-app">
      <div className="chat-box">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.role}`}>
            {msg.content}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="input-box">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Écris ta réponse ici..."
        />
        <button onClick={handleSend} disabled={loading}>
          Envoyer
        </button>
      </div>
    </div>
  );
}

export default ChatApp;
