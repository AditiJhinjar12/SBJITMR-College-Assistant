import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, Bot, User, Trash2, HelpCircle, MessageSquare, ExternalLink, School } from "lucide-react";
import { chatWithAssistant } from "./services/geminiService";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const QUICK_QUESTIONS = [
  "Admission process for B.Tech?",
  "Annual tuition fee?",
  "Scholarships available?",
  "Hostel facility on campus?",
  "Average placement package?",
];

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text: string = input) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Convert history for Gemini
      const history = messages.map((m) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      }));

      const response = await chatWithAssistant(text, history as any);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat Error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm sorry, I'm having trouble connecting right now. Please try again later.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-white shadow-2xl">
      {/* Header */}
      <header className="bg-primary p-4 text-white flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="bg-white p-2 rounded-full text-primary">
            <School size={24} />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg leading-tight">SBJITMR Assistant</h1>
            <p className="text-xs text-blue-100 opacity-80">S.B. Jain Institute of Technology, Nagpur</p>
          </div>
        </div>
        <button 
          onClick={clearChat}
          className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/80 hover:text-white"
          title="Clear Chat"
        >
          <Trash2 size={20} />
        </button>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-8 mt-12">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-primary/5 p-6 rounded-full"
            >
              <Bot size={64} className="text-primary" />
            </motion.div>
            <div className="space-y-2">
              <h2 className="text-2xl font-display font-bold text-slate-800">Hello! I'm your SBJITMR Assistant.</h2>
              <p className="text-slate-500 max-w-sm mx-auto">
                Ask me anything about admissions, fees, hostel, academics, or placements at S.B. Jain Nagpur.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md">
              {QUICK_QUESTIONS.map((q, i) => (
                <motion.button
                  key={i}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => handleSend(q)}
                  className="text-left p-3 text-sm bg-white border border-slate-200 rounded-xl hover:border-primary hover:text-primary hover:bg-primary/5 transition-all chat-bubble-shadow flex items-center gap-2"
                >
                  <MessageSquare size={14} className="shrink-0" />
                  {q}
                </motion.button>
              ))}
            </div>
          </div>
        ) : (
          <>
            <AnimatePresence initial={false}>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`flex gap-3 max-w-[85%] ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${
                      message.role === "user" ? "bg-accent text-white" : "bg-primary text-white"
                    }`}>
                      {message.role === "user" ? <User size={16} /> : <Bot size={16} />}
                    </div>
                    <div className={`p-4 rounded-2xl chat-bubble-shadow ${
                      message.role === "user" 
                        ? "bg-primary text-white rounded-tr-none" 
                        : "bg-white text-slate-800 rounded-tl-none border border-slate-100 shadow-sm"
                    }`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      <span className={`text-[10px] mt-2 block opacity-50 ${message.role === "user" ? "text-right" : "text-left"}`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-none flex gap-2 items-center">
                  <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </main>

      {/* Input */}
      <footer className="p-4 border-t bg-white">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type your question here..."
              className="w-full pl-4 pr-12 py-3 bg-slate-100 border-none rounded-2xl focus:ring-2 focus:ring-primary h-12 outline-hidden text-sm"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400">
              <HelpCircle size={18} />
            </div>
          </div>
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="w-12 h-12 bg-primary hover:bg-primary-dark text-white rounded-2xl flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
          >
            <Send size={20} />
          </button>
        </div>
        <div className="mt-4 flex items-center justify-center gap-4 text-xs text-slate-400">
          <a href="https://sbjain.org" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary transition-colors">
            Official Website <ExternalLink size={10} />
          </a>
          <span className="w-1 h-1 bg-slate-300 rounded-full" />
          <a href="mailto:info@sbjain.org" className="hover:text-primary transition-colors">Email Support</a>
          <span className="w-1 h-1 bg-slate-300 rounded-full" />
          <span className="italic">Nagpur, Maharashtra</span>
        </div>
      </footer>
    </div>
  );
}
