import { useState, useRef, useEffect } from "react";
import { 
  Sparkles, 
  Send, 
  X, 
  Minimize2, 
  Maximize2, 
  Trash2, 
  Bot, 
  User, 
  ShieldAlert, 
  ShieldCheck, 
  Loader2 
} from "lucide-react";
import { useDeskRole, type DeskRole } from "../../utils/access/deskRole";
import { sendChatMessage, type ChatMessage } from "../../services/chatService";

interface GeminiChatWidgetProps {
  pageContext?: string;
}

const DEFAULT_PILLS_BY_ROLE: Record<DeskRole, string[]> = {
  SUPER_ADMIN: [
    "Occupancy & financial audit summary",
    "Room inventory & status breakdown",
    "High priority maintenance tickets",
    "Current in-house guest count",
  ],
  ADMIN: [
    "Occupancy & financial audit summary",
    "Room inventory & status breakdown",
    "High priority maintenance tickets",
    "Staff shift register status",
  ],
  RECEPTION: [
    "Which rooms are available right now?",
    "Show in-house checked-in guests",
    "Confirmed upcoming reservations",
    "Rooms currently in cleaning phase",
  ],
  USER: [
    "What amenities does the hotel offer?",
    "How do I request staff role access?",
    "What are check-in and check-out timings?",
    "Contact front desk assistance",
  ],
};

export default function GeminiChatWidget({ pageContext }: GeminiChatWidgetProps) {
  const { role } = useDeskRole();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        role: "model",
        content: `👋 Hello! I am your **Gemini AI Hotel Assistant**. As **${role}**, I can assist you with real-time room availability, operations, and dashboard tasks. How can I help you today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ];
  });
  const [suggestedPills, setSuggestedPills] = useState<string[]>(DEFAULT_PILLS_BY_ROLE[role] || []);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isMinimized, loading]);

  // Update greeting and pills when role changes
  useEffect(() => {
    setSuggestedPills(DEFAULT_PILLS_BY_ROLE[role] || []);
  }, [role]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || loading) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setLoading(true);

    try {
      const response = await sendChatMessage({
        message: text,
        history: messages,
        pageContext,
      });

      const modelMessage: ChatMessage = {
        role: "model",
        content: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, modelMessage]);

      if (response.suggestedActions && response.suggestedActions.length > 0) {
        setSuggestedPills(response.suggestedActions);
      }
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        role: "model",
        content: `⚠️ **Error communicating with Gemini Assistant**: ${err?.message || "Failed to reach backend."}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        role: "model",
        content: `Chat history cleared. Active role: **${role}**. What can I assist you with?`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setSuggestedPills(DEFAULT_PILLS_BY_ROLE[role] || []);
  };

  const renderFormattedContent = (content: string) => {
    const isSecurityViolation = content.includes("[AUTHORIZATION VIOLATION]");
    
    // Split into paragraphs / lines
    const lines = content.split("\n");

    return (
      <div className={`space-y-1 text-sm ${isSecurityViolation ? "text-rose-700 dark:text-rose-300 font-medium" : ""}`}>
        {isSecurityViolation && (
          <div className="flex items-center gap-1.5 pb-1 font-bold text-rose-600 dark:text-rose-400">
            <ShieldAlert className="size-4 shrink-0" />
            <span>RBAC Security Violation</span>
          </div>
        )}
        {lines.map((line, idx) => {
          if (!line.trim()) return <div key={idx} className="h-1.5" />;

          // Header
          if (line.startsWith("### ")) {
            return (
              <h4 key={idx} className="font-bold text-slate-800 dark:text-slate-100 pt-1">
                {line.replace("### ", "")}
              </h4>
            );
          }

          // Bullet points
          if (line.trim().startsWith("* ") || line.trim().startsWith("- ")) {
            const bulletText = line.trim().substring(2);
            return (
              <div key={idx} className="flex items-start gap-1.5 pl-1">
                <span className="text-amber-500 font-bold">•</span>
                <span>{renderBoldSpans(bulletText)}</span>
              </div>
            );
          }

          return <p key={idx}>{renderBoldSpans(line)}</p>;
        })}
      </div>
    );
  };

  // Helper to parse **bold** and *italic* markdown
  const renderBoldSpans = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={index} className="font-semibold text-slate-900 dark:text-slate-100">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="no-print fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {/* Floating Trigger Button when closed */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          className="group relative flex items-center gap-2.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2.5 text-white shadow-xl shadow-orange-500/30 transition-all duration-300 hover:scale-105 hover:shadow-orange-500/50 focus:outline-none focus:ring-4 focus:ring-orange-300 dark:focus:ring-orange-900"
          aria-label="Open Gemini Hotel Assistant"
        >
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-amber-200 opacity-75"></span>
            <span className="relative inline-flex size-2.5 rounded-full bg-white"></span>
          </span>
          <Sparkles className="size-4 animate-pulse text-amber-100" />
          <span className="text-sm font-bold tracking-wide">Gemini AI</span>
          <span className="rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider backdrop-blur-sm">
            {role.replace("_", " ")}
          </span>
        </button>
      )}

      {/* Expanded Chat Drawer */}
      {isOpen && (
        <div
          className={`flex w-[380px] sm:w-[420px] flex-col rounded-2xl border border-slate-200 bg-white/95 shadow-2xl backdrop-blur-xl transition-all duration-300 dark:border-slate-800 dark:bg-slate-900/95 ${
            isMinimized ? "h-[62px]" : "h-[540px] max-h-[82vh]"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200/80 bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-transparent px-4 py-3 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20">
                <Sparkles className="size-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    Gemini AI Assistant
                  </h3>
                  <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                    {role.replace("_", " ")}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  <ShieldCheck className="size-3" />
                  <span>Grounding Active (PostgreSQL)</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 text-slate-400">
              <button
                onClick={handleClearHistory}
                title="Clear Chat History"
                className="rounded-lg p-1.5 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <Trash2 className="size-4" />
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? "Expand" : "Minimize"}
                className="rounded-lg p-1.5 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                {isMinimized ? <Maximize2 className="size-4" /> : <Minimize2 className="size-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close Assistant"
                className="rounded-lg p-1.5 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          {/* Body when expanded */}
          {!isMinimized && (
            <>
              {/* Message History */}
              <div className="flex-1 space-y-3.5 overflow-y-auto p-4 text-xs">
                {messages.map((msg, index) => {
                  const isUser = msg.role === "user";
                  return (
                    <div
                      key={index}
                      className={`flex items-start gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}
                    >
                      <div
                        className={`flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                          isUser
                            ? "bg-slate-800 text-white dark:bg-slate-700"
                            : "bg-orange-500 text-white shadow-sm"
                        }`}
                      >
                        {isUser ? <User className="size-3.5" /> : <Bot className="size-3.5" />}
                      </div>

                      <div
                        className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 shadow-sm ${
                          isUser
                            ? "bg-gradient-to-br from-orange-500 to-amber-500 text-white font-medium"
                            : "border border-slate-200/90 bg-slate-50/90 text-slate-800 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-200"
                        }`}
                      >
                        {isUser ? <p className="text-sm">{msg.content}</p> : renderFormattedContent(msg.content)}
                        {msg.timestamp && (
                          <div
                            className={`pt-1 text-[9px] ${
                              isUser ? "text-amber-100" : "text-slate-400"
                            }`}
                          >
                            {msg.timestamp}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {loading && (
                  <div className="flex items-start gap-2.5">
                    <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-orange-500 text-white">
                      <Bot className="size-3.5" />
                    </div>
                    <div className="flex items-center gap-2 rounded-2xl border border-slate-200/90 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-400">
                      <Loader2 className="size-3.5 animate-spin text-orange-500" />
                      <span>Gemini is checking live database records...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompt Pills */}
              {suggestedPills.length > 0 && (
                <div className="border-t border-slate-200/60 bg-slate-50/50 px-3.5 py-2 dark:border-slate-800/60 dark:bg-slate-900/40">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Suggested Quick Inquiries:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {suggestedPills.slice(0, 3).map((pill, i) => (
                      <button
                        key={i}
                        type="button"
                        disabled={loading}
                        onClick={() => handleSendMessage(pill)}
                        className="rounded-full border border-orange-200/70 bg-white px-2.5 py-1 text-[11px] font-medium text-orange-800 transition hover:bg-orange-50 hover:border-orange-300 dark:border-orange-950 dark:bg-slate-800 dark:text-orange-300 dark:hover:bg-slate-700 disabled:opacity-50"
                      >
                        {pill}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat Input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2 border-t border-slate-200/80 p-3 dark:border-slate-800"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={`Ask Gemini as ${role}...`}
                  disabled={loading}
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:ring-orange-950"
                />
                <button
                  type="submit"
                  disabled={loading || !inputMessage.trim()}
                  className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white transition hover:bg-orange-600 disabled:opacity-40"
                >
                  <Send className="size-3.5" />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
}
