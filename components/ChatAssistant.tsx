import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, MessageSquare, Cpu, Wifi } from 'lucide-react';
import { sendChatMessage } from '../services/geminiService';
import { ChatMessage, TruckBrand, Language } from '../types';
import { soundEngine } from '../utils/sound';

interface ChatAssistantProps {
  selectedBrand: TruckBrand;
  selectedModel: string;
  lang: Language;
}

const ChatAssistant: React.FC<ChatAssistantProps> = ({ selectedBrand, selectedModel, lang }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: `System Online. 🟢\nConnected to ${selectedBrand} ${selectedModel} Database.\nHow can I assist you with diagnostics today?`,
      timestamp: Date.now()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    soundEngine.playClick();
    
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

      soundEngine.playScan();

      const responseText = await sendChatMessage(history, userMsg.text, selectedBrand, selectedModel, lang);

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText || 'Error processing request.',
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, botMsg]);
      soundEngine.playSuccess();

    } catch (error) {
      console.error(error);
      soundEngine.playError();
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: 'Connection Lost. Retry.',
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative bg-black/90 rounded-xl overflow-hidden border border-blue-500/30 h-[650px] flex flex-col shadow-[0_0_30px_rgba(37,99,235,0.2)]">
      
      {/* Holographic Grid Background */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-[linear-gradient(rgba(0,100,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,100,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]"></div>

      {/* Header */}
      <div className="bg-blue-950/30 p-4 flex items-center justify-between border-b border-blue-500/30 relative z-10 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 border border-blue-400/50 rounded-lg animate-pulse">
            <Cpu className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="font-bold text-blue-100 text-lg tracking-wider">AI DIAGNOSTIC HUD</h2>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping"></span>
              <span className="text-[10px] text-blue-300 font-mono">LINK ESTABLISHED</span>
            </div>
          </div>
        </div>
        <Wifi className="w-5 h-5 text-blue-400/50" />
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 relative z-10 scroll-smooth">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-end gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-none flex items-center justify-center shrink-0 border 
              ${msg.role === 'user' ? 'bg-red-900/20 border-red-500 text-red-500' : 'bg-blue-900/20 border-blue-500 text-blue-400'}`}>
              {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
            </div>
            
            <div className={`max-w-[85%] p-4 text-sm font-mono leading-relaxed border backdrop-blur-sm shadow-lg
              ${msg.role === 'user' 
                ? 'bg-red-950/30 border-red-500/30 text-red-100 rounded-tr-lg rounded-bl-lg' 
                : 'bg-blue-950/30 border-blue-500/30 text-blue-100 rounded-tl-lg rounded-br-lg'}`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 p-4 bg-blue-950/10 border border-blue-500/30 max-w-[120px] rounded-r-lg ml-11">
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" />
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-75" />
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-150" />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-blue-500/30 bg-black/40 backdrop-blur-md relative z-10">
        <form onSubmit={handleSend} className="flex gap-2 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="ENTER COMMAND OR QUERY..."
            className="flex-1 p-4 bg-blue-950/10 border border-blue-500/30 rounded-none focus:outline-none focus:border-blue-400 text-blue-100 placeholder-blue-500/50 font-mono transition-all"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-6 bg-blue-600/20 border border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatAssistant;