import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/apiConfig";
import { Send, Bot, User, X, MessageCircle } from "lucide-react";
import { useTranslation } from "react-i18next"; // Importar hook

const ChatGloriaModal = () => {
  const { t, i18n } = useTranslation('chat'); // Inicializar namespace 'chat'
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  
  const chatEndRef = useRef(null);
  const navigate = useNavigate();

  // Inicializar o traducir el mensaje de bienvenida cuando cambie el idioma
  useEffect(() => {
    if (messages.length <= 1) {
      setMessages([
        { 
          text: t('welcome_message'), 
          sender: "bot", 
          time: new Date().toLocaleTimeString() 
        }
      ]);
    }
  }, [i18n.language, t]); // Se dispara al cambiar de idioma

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    const time = new Date().toLocaleTimeString();
    
    setMessages(prev => [...prev, { text: userMessage, sender: "user", time }]);
    setInput("");
    setLoading(true);

    try {
      const res = await api.post('/chat/enviar', { mensaje: userMessage });
      
      setMessages(prev => [...prev, { 
        text: res.data.respuesta || t('error_no_response'), 
        sender: "bot", 
        time: new Date().toLocaleTimeString() 
      }]);
    } catch (err) {
      setMessages(prev => [...prev, { 
        text: t('error_connection'), 
        sender: "bot", 
        time: new Date().toLocaleTimeString() 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-white/20 backdrop-blur-lg border border-white/40 text-brand-indigo p-4 rounded-2xl shadow-[0_8px_32px_rgba(99,102,241,0.2)] hover:bg-white/40 hover:scale-110 hover:-translate-y-1 transition-all duration-300 z-50 flex items-center gap-3 group"
        >
          <div className="bg-brand-indigo text-white p-2 rounded-xl shadow-lg group-hover:rotate-12 transition-transform">
            <MessageCircle size={24} />
          </div>
          <span className="font-black text-slate-800 hidden md:inline tracking-tight">
            {t('assistant_name')}
          </span>
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 md:inset-auto md:bottom-6 md:right-6 md:w-[420px] md:h-[600px] bg-white/60 backdrop-blur-2xl z-50 flex flex-col rounded-t-[2rem] md:rounded-[2.5rem] border border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden animate-in slide-in-from-bottom-10">
          
          {/* HEADER */}
          <div className="bg-white/20 backdrop-blur-md p-5 flex justify-between items-center border-b border-white/20">
            <div className="flex items-center gap-3">
              <div className="bg-brand-indigo/10 p-2.5 rounded-2xl text-brand-indigo shadow-inner">
                <Bot size={22} />
              </div>
              <div>
                <h3 className="font-black text-slate-800 leading-none text-sm tracking-tight">{t('assistant_name')}</h3>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black">{t('status_online')}</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="hover:bg-red-50 text-slate-400 hover:text-red-500 p-2 rounded-xl transition-all"
            >
              <X size={20} />
            </button>
          </div>

          {/* MENSAJES */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-gradient-to-b from-transparent to-white/20">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] p-4 rounded-3xl text-sm shadow-sm transition-all ${
                  msg.sender === "user" 
                    ? "bg-brand-indigo text-white rounded-tr-none shadow-indigo-100" 
                    : "bg-white/80 backdrop-blur-sm text-slate-700 border border-white/60 rounded-tl-none"
                }`}>
                  <div className="flex items-center gap-2 mb-1 opacity-70 font-bold text-[10px] uppercase">
                    {msg.sender === "user" ? <User size={12} /> : <Bot size={12} />}
                    {msg.sender === "user" ? t('label_you') : t('label_bot')}
                  </div>
                  <p className="leading-relaxed font-medium">{msg.text}</p>
                  <span className={`text-[9px] block mt-2 opacity-50 font-bold ${msg.sender === "user" ? "text-right" : "text-left"}`}>
                    {msg.time}
                  </span>
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white/80 backdrop-blur-sm border border-white/60 p-4 rounded-3xl rounded-tl-none shadow-sm flex items-center gap-3">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-brand-indigo rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-brand-indigo rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 bg-brand-indigo rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                  <span className="text-xs font-bold text-slate-400 italic">{t('processing')}</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* INPUT */}
          <form onSubmit={handleSend} className="p-5 bg-white/40 backdrop-blur-md border-t border-white/20">
            <div className="relative flex items-center group">
              <input
                type="text"
                placeholder={t('placeholder')}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full p-4 pr-14 bg-white/60 border border-white/80 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-brand-indigo/10 outline-none transition-all placeholder:text-slate-400 shadow-inner"
              />
              <button 
                type="submit"
                disabled={!input.trim() || loading}
                className="absolute right-2 p-2.5 bg-brand-indigo text-white rounded-xl shadow-lg shadow-indigo-200 hover:scale-110 active:scale-95 disabled:opacity-30 transition-all"
              >
                <Send size={18} />
              </button>
            </div>
            <p className="text-[9px] text-slate-400 mt-3 text-center font-bold uppercase tracking-tighter opacity-60">
              {t('footer_note')}
            </p>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatGloriaModal;