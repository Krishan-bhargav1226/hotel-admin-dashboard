import { useState, useRef, useEffect } from "react";
import { 
  Sparkles, 
  Send, 
  X, 
  Minus, 
  Maximize2, 
  RotateCcw, 
  ShieldAlert, 
  Database
} from "lucide-react";
import { useDeskRole, type DeskRole } from "../../utils/access/deskRole";
import { sendChatMessage, type ChatMessage } from "../../services/chatService";
import CuteMascot from "./CuteMascot";

interface GeminiChatWidgetProps {
  pageContext?: string;
}

const PAGE_FRIENDLY_NAMES: Record<string, { title: string; icon: string }> = {
  "/rooms": { title: "Room Inventory & Photo Gallery", icon: "🛏️" },
  "/housekeeping": { title: "Housekeeping & Turnover Board", icon: "🧹" },
  "/check-in": { title: "New Guest Check-In Wizard", icon: "🛎️" },
  "/stays": { title: "In-House Active Stays", icon: "👥" },
  "/reservations": { title: "Booking Calendar & Reservations", icon: "📅" },
  "/pos": { title: "POS & Room Service Orders", icon: "🍽️" },
  "/guests": { title: "Guest Profiles CRM", icon: "📋" },
  "/settings": { title: "Hotel Brand & System Settings", icon: "⚙️" },
  "/dashboard": { title: "Executive Operations Dashboard", icon: "🏨" },
};

const getPagePills = (pathname?: string, role?: DeskRole): string[] => {
  const path = (pathname || "").toLowerCase();

  if (path.includes("room")) {
    return [
      "Room 111 ka live status kya hai? 🛏️",
      "Available rooms right now ✨",
      "Which rooms are in cleaning? 🧹",
      "Room 111 price & details 💰",
    ];
  }

  if (path.includes("housekeep")) {
    return [
      "Which rooms need urgent cleaning? 🧹",
      "Room 111 housekeeping state 🛏️",
      "Inspected rooms ready for guests ✨",
      "Housekeeping queue summary 📋",
    ];
  }

  if (path.includes("check-in") || path.includes("stay")) {
    return [
      "Available rooms for check-in today 🛏️",
      "List of currently checked-in guests 👥",
      "Standard check-in / check-out timings ⏰",
      "Room 111 availability & price ✨",
    ];
  }

  if (role === "SUPER_ADMIN" || role === "ADMIN") {
    return [
      "Hotel occupancy & room summary 🏨",
      "Room 111 status & rate 🛏️",
      "Active in-house guests 👥",
      "Today's revenue & night audit 💰",
    ];
  }

  return [
    "Room 111 status kya chal raha hai? 🛏️",
    "Which rooms are available right now? ✨",
    "Check-in and check-out timings ⏰",
    "Show in-house checked-in guests 👥",
  ];
};

export default function GeminiChatWidget({ pageContext }: GeminiChatWidgetProps) {
  const { role } = useDeskRole();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [mascotEmotion, setMascotEmotion] = useState<"happy" | "thinking" | "waving" | "sleepy" | "wink">("happy");
  const [isHoveringOrb, setIsHoveringOrb] = useState(false);

  // Read active property
  const activePropertyId = localStorage.getItem("activePropertyId");
  let activePropertyName = "new way inn";
  try {
    const rawUser = localStorage.getItem("hotel_auth_session");
    if (rawUser) {
      const u = JSON.parse(rawUser);
      if (u.propertyName) activePropertyName = u.propertyName;
    }
  } catch {
    // fallback
  }

  const currentPath = pageContext || window.location.pathname;
  const pageMeta = Object.entries(PAGE_FRIENDLY_NAMES).find(([key]) => currentPath.startsWith(key))?.[1] || {
    title: "Hotel Operations",
    icon: "🏨",
  };

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      role: "model",
      content: `Hello ji! ✨ Main hoon **Dot** 🛎️, aapka smart Hotel Concierge AI assistant!\n\nAap abhi **${activePropertyName}** (${pageMeta.title}) manage kar rahe hain as **${role.replace("_", " ")}**.\n\nAap mujhse live database se kisi bhi room (jaise **Room 111** 🛏️), available rooms, housekeeping status, ya guests ke baare me pooch sakte hain! Kaise help karu aapki? ✨`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const [suggestedPills, setSuggestedPills] = useState<string[]>(() => getPagePills(currentPath, role));
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isMinimized, loading]);

  // Update pills when route changes
  useEffect(() => {
    setSuggestedPills(getPagePills(currentPath, role));
  }, [currentPath, role]);

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
    setMascotEmotion("thinking");

    try {
      const propId = activePropertyId && !isNaN(Number(activePropertyId)) ? Number(activePropertyId) : undefined;
      const response = await sendChatMessage({
        message: text,
        propertyId: propId,
        propertyName: activePropertyName,
        pageContext: currentPath,
        pageTitle: pageMeta.title,
      });

      const botMessage: ChatMessage = {
        role: "model",
        content: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMessage]);
      setMascotEmotion("happy");

      if (response.suggestedActions && response.suggestedActions.length > 0) {
        setSuggestedPills(response.suggestedActions);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to reach live backend.";
      const errorMessage: ChatMessage = {
        role: "model",
        content: `⚠️ **Oops! Dot ko connect karne me dikkat aayi**: ${errorMsg} 🛎️\n\nLive backend database par retry karein ya direct poochhein!`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setMascotEmotion("sleepy");
    } finally {
      setLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        role: "model",
        content: `Chat history refresh kar di gayi hai! ✨ Active property: **${activePropertyName}**. Bataiye, Dot kis cheez me help kare? 🛎️`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setSuggestedPills(getPagePills(currentPath, role));
  };

  // Helper to parse **bold** markdown and format interactive room tags
  const renderInteractiveText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        const raw = part.slice(2, -2);
        const isRoomNum = /^(Room\s+)?\d{2,4}$/i.test(raw);
        if (isRoomNum) {
          return (
            <button
              key={index}
              type="button"
              onClick={() => handleSendMessage(`Room ${raw.replace(/\D/g, "")} ka pura status batao`)}
              className="inline-flex items-center gap-1 mx-1 px-2 py-0.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-[11px] transition-all hover:scale-105 active:scale-95 shadow-2xs dark:bg-amber-950/80 dark:text-amber-200 dark:border dark:border-amber-800"
              title={`Click to inspect ${raw}`}
            >
              <span>🛏️</span>
              <span>{raw}</span>
            </button>
          );
        }

        // Status tags
        const lowerRaw = raw.toLowerCase();
        if (lowerRaw.includes("available") || lowerRaw.includes("clean_inspected")) {
          return (
            <span key={index} className="inline-flex items-center gap-1 mx-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[11px] dark:bg-emerald-950/80 dark:text-emerald-300">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              {raw}
            </span>
          );
        }
        if (lowerRaw.includes("cleaning") || lowerRaw.includes("turnaround")) {
          return (
            <span key={index} className="inline-flex items-center gap-1 mx-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-bold text-[11px] dark:bg-amber-950/80 dark:text-amber-300">
              <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
              {raw}
            </span>
          );
        }
        if (lowerRaw.includes("occupied") || lowerRaw.includes("maintenance") || lowerRaw.includes("out_of_order")) {
          return (
            <span key={index} className="inline-flex items-center gap-1 mx-1 px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-bold text-[11px] dark:bg-rose-950/80 dark:text-rose-300">
              <span className="size-1.5 rounded-full bg-rose-500" />
              {raw}
            </span>
          );
        }

        return (
          <strong key={index} className="font-semibold text-slate-900 dark:text-slate-100">
            {raw}
          </strong>
        );
      }
      return part;
    });
  };

  const renderFormattedContent = (content: string) => {
    const isSecurityViolation = content.includes("[AUTHORIZATION VIOLATION]");
    const lines = content.split("\n");

    return (
      <div className={`space-y-1.5 text-xs sm:text-[13px] leading-relaxed ${isSecurityViolation ? "text-rose-700 dark:text-rose-300 font-medium" : ""}`}>
        {isSecurityViolation && (
          <div className="flex items-center gap-1.5 pb-1 font-bold text-rose-600 dark:text-rose-400">
            <ShieldAlert className="size-4 shrink-0" />
            <span>Access Blocked by Role Security</span>
          </div>
        )}
        {lines.map((line, idx) => {
          if (!line.trim()) return <div key={idx} className="h-1" />;

          // Header line
          if (line.startsWith("### ")) {
            return (
              <h4 key={idx} className="font-bold text-slate-900 dark:text-white pt-1 text-sm flex items-center gap-1.5">
                <span>🛎️</span>
                <span>{line.replace("### ", "")}</span>
              </h4>
            );
          }

          // Bullet points
          if (line.trim().startsWith("* ") || line.trim().startsWith("- ")) {
            const bulletText = line.trim().substring(2);
            return (
              <div key={idx} className="flex items-start gap-1.5 pl-1.5">
                <span className="text-amber-500 font-bold mt-0.5">•</span>
                <span className="flex-1">{renderInteractiveText(bulletText)}</span>
              </div>
            );
          }

          // Quote / Tips
          if (line.trim().startsWith("> ")) {
            return (
              <div key={idx} className="rounded-xl border border-amber-200/60 bg-amber-50/70 p-2 text-[11px] text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-200 my-1">
                {renderInteractiveText(line.replace(/^>\s*/, ""))}
              </div>
            );
          }

          return <p key={idx}>{renderInteractiveText(line)}</p>;
        })}
      </div>
    );
  };

  return (
    <div className="no-print fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {/* Floating ONLY MASCOT Trigger Button (Grok / Dot Character style) */}
      {!isOpen && (
        <div 
          className="relative group flex items-center justify-center"
          onMouseEnter={() => setIsHoveringOrb(true)}
          onMouseLeave={() => setIsHoveringOrb(false)}
        >
          {/* Subtle Hover Tooltip */}
          {isHoveringOrb && (
            <div className="absolute right-full mr-3.5 whitespace-nowrap rounded-2xl border border-amber-200/80 bg-white/95 px-3 py-1.5 text-xs font-bold text-slate-800 shadow-xl backdrop-blur-md dark:border-slate-700 dark:bg-slate-900/95 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center gap-1.5">
                <span className="text-amber-500">🛎️</span>
                <span>Dot Concierge</span>
                <span className="size-1.5 rounded-full bg-emerald-500 animate-ping" />
              </div>
              <div className="text-[10px] font-normal text-slate-500 dark:text-slate-400">
                Click to ask anything
              </div>
              {/* Arrow */}
              <div className="absolute top-1/2 -right-1.5 size-3 -translate-y-1/2 rotate-45 border-t border-r border-amber-200/80 bg-white dark:border-slate-700 dark:bg-slate-900" />
            </div>
          )}

          {/* Standalone Mascot Floating Button */}
          <button
            onClick={() => {
              setIsOpen(true);
              setIsMinimized(false);
              setMascotEmotion("waving");
              setTimeout(() => setMascotEmotion("happy"), 2200);
            }}
            className="relative flex size-16 items-center justify-center rounded-full p-1 bg-gradient-to-tr from-amber-400 via-orange-500 to-rose-400 shadow-[0_8px_25px_rgba(245,158,11,0.4)] transition-all duration-300 hover:scale-110 hover:shadow-[0_12px_32px_rgba(245,158,11,0.55)] active:scale-95 focus:outline-none focus:ring-4 focus:ring-amber-300/50 dark:focus:ring-amber-800"
            aria-label="Open Dot AI Hotel Concierge"
          >
            {/* Ambient Pulse Ring */}
            <span className="absolute -inset-1 rounded-full bg-amber-400/25 blur-sm animate-pulse pointer-events-none" />

            {/* Inner White/Dark Glass Disc */}
            <div className="relative flex size-full items-center justify-center rounded-full bg-white dark:bg-slate-900 shadow-inner">
              <CuteMascot emotion={mascotEmotion} size="lg" isFloating={true} interactive={true} />
              
              {/* Green Live Online Dot */}
              <span className="absolute bottom-0.5 right-0.5 flex size-3.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-3.5 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-900" />
              </span>
            </div>
          </button>
        </div>
      )}

      {/* Expanded Modern Glassmorphic Chat Window */}
      {isOpen && (
        <div
          className={`flex w-[410px] sm:w-[450px] flex-col rounded-3xl border border-amber-200/70 bg-white/95 shadow-2xl backdrop-blur-2xl transition-all duration-300 dark:border-slate-800 dark:bg-slate-900/95 overflow-hidden ${
            isMinimized ? "h-[72px]" : "h-[600px] max-h-[88vh]"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-amber-100/80 bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-orange-500/10 px-4 py-3 dark:border-slate-800">
            <div className="flex items-center gap-3">
              {/* Header Mascot Avatar */}
              <div className="relative flex size-11 items-center justify-center rounded-2xl bg-white shadow-sm ring-2 ring-amber-300/50 dark:bg-slate-800 dark:ring-amber-700/50">
                <CuteMascot emotion={mascotEmotion} size="md" interactive={true} />
                <span className="absolute -top-1 -right-1 flex size-3">
                  <span className="relative inline-flex size-3 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-900" />
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                    <span>Dot</span>
                    <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                      AI Concierge
                    </span>
                  </h3>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  <Database className="size-3 text-emerald-500" />
                  <span className="truncate max-w-[170px]">{activePropertyName}</span>
                  <span>•</span>
                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">Live DB</span>
                </div>
              </div>
            </div>

            {/* Header Action Controls */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleResetChat}
                className="flex size-8 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                title="Refresh conversation"
              >
                <RotateCcw className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsMinimized(!isMinimized)}
                className="flex size-8 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                title={isMinimized ? "Expand" : "Minimize"}
              >
                {isMinimized ? <Maximize2 className="size-4" /> : <Minus className="size-4" />}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex size-8 items-center justify-center rounded-xl text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-slate-800 dark:hover:text-rose-400"
                title="Close"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          {/* Main Body */}
          {!isMinimized && (
            <>
              {/* Page Scope Status Ribbon */}
              <div className="flex items-center justify-between border-b border-slate-100 bg-amber-50/40 px-4 py-1.5 text-[11px] font-medium text-amber-900/80 dark:border-slate-800 dark:bg-amber-950/20 dark:text-amber-300">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-slate-500 dark:text-slate-400">Context:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200 truncate">{pageMeta.title}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono shrink-0">{currentPath}</span>
              </div>

              {/* Message List */}
              <div className="flex-1 space-y-3.5 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
                {messages.map((msg, index) => {
                  const isUser = msg.role === "user";
                  return (
                    <div
                      key={index}
                      className={`flex items-start gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}
                    >
                      {/* Avatar */}
                      <div
                        className={`flex size-8 shrink-0 items-center justify-center rounded-2xl shadow-sm text-xs font-bold ${
                          isUser
                            ? "bg-gradient-to-r from-amber-500 to-rose-500 text-white"
                            : "bg-white ring-1 ring-amber-300/80 dark:bg-slate-800 dark:ring-amber-700/60"
                        }`}
                      >
                        {isUser ? "You" : <CuteMascot emotion="happy" size="xs" />}
                      </div>

                      {/* Message Bubble */}
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-xs ${
                          isUser
                            ? "rounded-tr-xs bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white font-medium"
                            : "rounded-tl-xs border border-slate-200/80 bg-slate-50/90 text-slate-800 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-200"
                        }`}
                      >
                        {isUser ? <p className="text-xs sm:text-[13px]">{msg.content}</p> : renderFormattedContent(msg.content)}
                        {msg.timestamp && (
                          <div
                            className={`pt-1.5 text-[9px] text-right font-medium ${
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

                {/* Thinking Animation */}
                {loading && (
                  <div className="flex items-start gap-2.5">
                    <div className="flex size-8 items-center justify-center rounded-2xl bg-white ring-1 ring-amber-300 dark:bg-slate-800 dark:ring-slate-700">
                      <CuteMascot emotion="thinking" size="xs" />
                    </div>
                    <div className="flex items-center gap-2.5 rounded-2xl rounded-tl-xs border border-amber-200/80 bg-amber-50/80 px-4 py-3 text-xs text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200 shadow-sm">
                      <div className="flex gap-1 items-center">
                        <span className="size-1.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="size-1.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="size-1.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                      <span className="font-semibold">Dot is checking real-time database... 🛎️✨</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Dynamic Quick Inquiry Chips */}
              {suggestedPills.length > 0 && (
                <div className="border-t border-slate-200/60 bg-slate-50/70 px-3.5 py-2.5 dark:border-slate-800/60 dark:bg-slate-900/40">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    <Sparkles className="size-2.5 text-amber-500" />
                    <span>Quick Inquiries for {pageMeta.title}:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {suggestedPills.slice(0, 4).map((pill, i) => (
                      <button
                        key={i}
                        type="button"
                        disabled={loading}
                        onClick={() => handleSendMessage(pill)}
                        className="rounded-full border border-amber-200/80 bg-white px-3 py-1 text-[11px] font-semibold text-amber-900 transition hover:bg-amber-100/70 hover:border-amber-300 dark:border-amber-900 dark:bg-slate-800 dark:text-amber-200 dark:hover:bg-slate-700 disabled:opacity-50 shadow-2xs"
                      >
                        {pill}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat Input Bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2 border-t border-slate-200/80 p-3 bg-white dark:border-slate-800 dark:bg-slate-900"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={`Ask Dot anything about ${activePropertyName}... 🛎️`}
                  disabled={loading}
                  className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:ring-amber-950 font-medium"
                />
                <button
                  type="submit"
                  disabled={loading || !inputMessage.trim()}
                  className="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white shadow-md shadow-orange-500/20 transition-all hover:scale-105 hover:shadow-orange-500/40 active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
                >
                  <Send className="size-4" />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
}
