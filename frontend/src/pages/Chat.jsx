import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import apiFetch from "@/lib/api";
import { toast } from "sonner";
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Send,
    MoreVertical,
    Search,
    ArrowLeft,
    Sparkles,
    Brain,
    Bot,
    MessageSquare,
    Zap,
    Heart,
    Code,
    Palette,
    Check,
    Trash2,
    X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "../context/AuthContext";

const AgentIcon = ({ iconName, color, size = "large" }) => {
    const iconMap = {
        'Brain': Brain,
        'Code': Code,
        'Heart': Heart,
        'Palette': Palette,
        'Bot': Bot,
        'Zap': Zap,
        'Sparkles': Sparkles
    };

    const IconComponent = iconMap[iconName] || Bot;
    const sizeClasses = size === "small" ? "w-4 h-4" : "w-6 h-6";
    const containerClasses = size === "small"
        ? "w-8 h-8 rounded-lg"
        : "w-10 h-10 sm:w-12 sm:h-12 rounded-2xl";

    return (
        <div className={`${containerClasses} bg-linear-to-br ${color || 'from-blue-500 to-cyan-500'} flex items-center justify-center shadow-lg transition-transform group-hover:scale-105`}>
            <IconComponent className={`${sizeClasses} text-white`} />
        </div>
    );
};

export default function ChatPage() {
    const { agentId } = useParams();
    const navigate = useNavigate();
    const { authUser, setAuthUser } = useAuth();
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [agents, setAgents] = useState([]);
    const [activeAgent, setActiveAgent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const scrollRef = useRef(null);
    const menuRef = useRef(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Fetch all agents
    useEffect(() => {
        const fetchAgents = async () => {
            try {
                const response = await apiFetch("/api/agents");
                if (response.ok) {
                    const data = await response.json();
                    setAgents(data);
                    if (agentId) {
                        const active = data.find(a => a._id === agentId);
                        setActiveAgent(active);
                    } else if (data.length > 0) {
                        setActiveAgent(data[0]);
                        navigate(`/chat/${data[0]._id}`);
                    }
                }
            } catch (error) {
                console.error("Error fetching agents:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAgents();
    }, [agentId, navigate]);

    // Fetch conversation history
    useEffect(() => {
        if (!agentId) return;
        const fetchHistory = async () => {
            try {
                const response = await apiFetch(`/api/chat/${agentId}`);
                if (response.ok) {
                    const data = await response.json();
                    setMessages(data.messages || []);
                }
            } catch (error) {
                console.error("Error fetching history:", error);
            }
        };
        fetchHistory();
    }, [agentId]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleDeleteAgent = async (e, id) => {
        e.stopPropagation();
        toast("Delete Agent", {
            description: "Are you sure you want to delete this agent? This action cannot be undone.",
            action: {
                label: "Delete",
                onClick: async () => {
                    try {
                        const response = await apiFetch(`/api/agents/${id}`, {
                            method: "DELETE"
                        });
                        if (response.ok) {
                            setAgents(prev => prev.filter(a => a._id !== id));
                            toast.success("Agent deleted successfully");
                            if (agentId === id) navigate('/dashboard');
                        } else {
                            const data = await response.json();
                            toast.error(data.message || "Failed to delete agent");
                        }
                    } catch (error) {
                        toast.error("An error occurred while deleting the agent");
                    }
                },
            },
            cancel: { label: "Cancel" }
        });
    };

    const handleClearChat = async () => {
        if (!agentId) return;
        toast("Clear Conversation", {
            description: "Are you sure you want to clear this conversation?",
            action: {
                label: "Clear",
                onClick: async () => {
                    try {
                        const response = await apiFetch(`/api/chat/${agentId}`, {
                            method: "DELETE"
                        });
                        if (response.ok) {
                            setMessages([]);
                            setIsMenuOpen(false);
                            toast.success("Conversation cleared successfully");
                        } else {
                            toast.error("Failed to clear conversation");
                        }
                    } catch (error) {
                        toast.error("An error occurred while clearing the chat");
                    }
                },
            },
            cancel: { label: "Cancel" }
        });
    };

    const handleAcceptDiscovery = async (discoveryData) => {
        try {
            const currentUser = authUser;
            const updatedInterests = [...new Set([...(currentUser.interests || []), ...(discoveryData.interests || [])])];
            const updatedTraits = [...new Set([...(currentUser.personalityTraits || []), ...(discoveryData.personalityTraits || [])])];
            const response = await apiFetch("/api/user/profile", {
                method: "PUT",
                body: JSON.stringify({ interests: updatedInterests, personalityTraits: updatedTraits }),
            });
            if (response.ok) {
                const data = await response.json();
                if (setAuthUser) setAuthUser(data.user);
                toast.success("Profile updated with new discoveries!", {
                    icon: <Check className="w-4 h-4 text-green-500" />
                });
            }
        } catch (error) {
            toast.error("Failed to update profile");
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!message.trim() || !agentId || sending || isAnimating) return;

        const userMsg = { role: "user", content: message, createdAt: new Date().toISOString() };
        setMessages(prev => [...prev, userMsg]);
        const currentMessage = message;
        setMessage("");
        setSending(true);

        try {
            const response = await apiFetch("/api/chat", {
                method: "POST",
                body: JSON.stringify({ agentId, message: currentMessage }),
            });

            if (response.ok) {
                const data = await response.json();
                if (window.location.pathname.split('/').pop() !== agentId) {
                    setSending(false);
                    return;
                }

                setMessages(prev => [
                    ...prev.filter(m => m !== userMsg),
                    { role: "user", content: currentMessage, createdAt: new Date().toISOString() }
                ]);

                setSending(false);
                setIsAnimating(true);

                let currentText = "";
                const fullText = data.reply;
                const typingSpeed = 5;

                setMessages(prev => [...prev, {
                    role: "assistant",
                    content: "",
                    createdAt: new Date().toISOString(),
                    isAnimating: true
                }]);

                const typeChar = (index) => {
                    if (window.location.pathname.split('/').pop() !== agentId) {
                        setIsAnimating(false);
                        return;
                    }
                    if (index < fullText.length) {
                        currentText += fullText[index];
                        setMessages(prev => {
                            const newMessages = [...prev];
                            if (newMessages.length > 0 && newMessages[newMessages.length - 1].role === "assistant") {
                                newMessages[newMessages.length - 1].content = currentText;
                            }
                            return newMessages;
                        });
                        setTimeout(() => typeChar(index + 1), typingSpeed);
                    } else {
                        setMessages(prev => {
                            const newMessages = [...prev];
                            if (newMessages.length > 0 && newMessages[newMessages.length - 1].role === "assistant") {
                                newMessages[newMessages.length - 1].isAnimating = false;
                            }
                            return newMessages;
                        });
                        setIsAnimating(false);
                    }
                };

                typeChar(0);

                if (data.discoveries && (data.discoveries.interests?.length > 0 || data.discoveries.personalityTraits?.length > 0)) {
                    const discoveredItems = [
                        ...(data.discoveries.interests || []),
                        ...(data.discoveries.personalityTraits || [])
                    ].join(", ");
                    toast("Self-Discovery Found!", {
                        description: `I noticed you might be into: ${discoveredItems}. Should I add this to your profile?`,
                        duration: 6000,
                        icon: <Sparkles className="w-5 h-5 text-blue-400" />,
                        action: { label: "Accept", onClick: () => handleAcceptDiscovery(data.discoveries) }
                    });
                }
            } else {
                setSending(false);
                setIsAnimating(false);
            }
        } catch (error) {
            console.error("Error sending message:", error);
            toast.error("Communication error. Please try again.");
            setSending(false);
            setIsAnimating(false);
        }
    };

    const filteredAgents = agents.filter(agent =>
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex h-[100dvh] bg-[#060b13] text-white overflow-hidden font-sans">

            {/* ── Mobile Sidebar Backdrop ─────────────────────────────────── */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/70 z-30 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* ── Sidebar ─────────────────────────────────────────────────── */}
            <aside className={[
                "flex flex-col bg-[#0a192f] backdrop-blur-xl border-r border-white/5",
                "fixed md:static inset-y-0 left-0 z-40",
                "w-[280px] sm:w-80 shrink-0",
                "transition-transform duration-300 ease-in-out",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
            ].join(" ")}>

                {/* Sidebar header */}
                <div className="p-4 flex items-center justify-between border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/50 shrink-0">
                            <Brain className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="font-bold text-sm leading-tight">Multi-Personalized</h2>
                            <p className="text-[10px] text-blue-400 font-medium">AI Agent Platform</p>
                        </div>
                    </div>
                    {/* Close button — mobile only */}
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Search */}
                <div className="px-4 py-3">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                        <Input
                            placeholder="Search agents..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 bg-white/5 border-white/10 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 h-9 rounded-xl transition-all text-sm"
                        />
                    </div>
                </div>

                {/* Agent list */}
                <ScrollArea className="flex-1 px-3">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 px-1 pt-1">
                        {searchQuery ? 'Search Results' : 'Active Agents'}
                    </p>
                    <div className="space-y-1 pb-4">
                        {filteredAgents.map((agent) => (
                            <div
                                key={agent._id}
                                onClick={() => {
                                    navigate(`/chat/${agent._id}`);
                                    setIsSidebarOpen(false);
                                }}
                                className={`flex items-center gap-3 p-3 rounded-2xl transition-all cursor-pointer group ${agentId === agent._id
                                    ? 'bg-blue-500/10 border border-blue-500/20 shadow-lg shadow-blue-500/5'
                                    : 'hover:bg-white/5 border border-transparent'
                                    }`}
                            >
                                <div className="relative shrink-0">
                                    <AgentIcon iconName={agent.icon} color={agent.color} size="large" />
                                    {agent.isDefault && (
                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#0a192f] flex items-center justify-center">
                                            <Check className="w-2.5 h-2.5 text-white" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <div className="flex items-center justify-between mb-0.5">
                                        <span className={`font-bold text-sm truncate ${agentId === agent._id ? 'text-blue-400' : 'text-gray-200'}`}>
                                            {agent.name}
                                        </span>
                                        {agent.isDefault && (
                                            <span className="text-[10px] font-bold text-blue-400 shrink-0 ml-1">LIVE</span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 truncate italic">
                                        {agent.description || "Ready to assist..."}
                                    </p>
                                </div>
                                {agent.isCustom && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={(e) => handleDeleteAgent(e, agent._id)}
                                        className="h-7 w-7 text-red-400/50 hover:text-red-400 hover:bg-red-400/10 rounded-full transition-all shrink-0"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                )}
                            </div>
                        ))}
                        {filteredAgents.length === 0 && (
                            <div className="text-center py-8">
                                <p className="text-xs text-gray-500">No agents found matching "{searchQuery}"</p>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </aside>

            {/* ── Main Chat Area ───────────────────────────────────────────── */}
            <main className="flex-1 flex flex-col min-w-0 relative bg-[radial-gradient(circle_at_center,#0a192f_0%,#060b13_100%)]">

                {/* Header */}
                <header className="h-14 sm:h-20 border-b border-white/5 flex items-center justify-between px-3 sm:px-6 bg-[#060b13]/60 backdrop-blur-md sticky top-0 z-20 gap-2">
                    <div className="flex items-center gap-2 min-w-0">

                        {/* Hamburger — mobile only */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsSidebarOpen(true)}
                            className="md:hidden h-9 w-9 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-xl transition-all shrink-0"
                        >
                            <MessageSquare className="w-4 h-4" />
                        </Button>

                        {/* Back — desktop only */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate('/dashboard')}
                            className="hidden md:flex h-9 w-9 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-xl transition-all shrink-0"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Button>

                        {/* Agent icon + name */}
                        <div className="relative shrink-0">
                            <AgentIcon iconName={activeAgent?.icon} color={activeAgent?.color} size="large" />
                            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-[#060b13] flex items-center justify-center">
                                <Check className="w-2 h-2 text-white" />
                            </div>
                        </div>

                        <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                                <h2 className="font-bold text-sm sm:text-base truncate">{activeAgent?.name || 'AI Assistant'}</h2>
                                <Badge variant="success" className="bg-green-500/10 text-green-400 text-[9px] py-0 px-1.5 border-green-500/30 shrink-0">ONLINE</Badge>
                            </div>
                            <p className="text-[11px] text-gray-400 truncate hidden sm:block">{activeAgent?.description || 'Your Emotional OS Companion'}</p>
                        </div>
                    </div>

                    {/* Menu */}
                    <div className="flex items-center gap-2 relative shrink-0" ref={menuRef}>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className={`rounded-xl h-9 w-9 transition-all ${isMenuOpen ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-gray-400 hover:bg-blue-500/10 hover:text-blue-400'}`}
                        >
                            <MoreVertical className="w-4 h-4" />
                        </Button>
                        {isMenuOpen && (
                            <Card className="absolute top-11 right-0 w-44 bg-[#0f1b2d] border-white/10 shadow-2xl p-1 z-30 animate-in fade-in zoom-in duration-200">
                                <Button
                                    variant="ghost"
                                    onClick={handleClearChat}
                                    className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-400/10 gap-2 h-9 text-xs font-medium"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    Clear Conversation
                                </Button>
                            </Card>
                        )}
                    </div>
                </header>

                {/* Messages */}
                <ScrollArea className="flex-1 px-3 sm:px-6 py-4" viewportRef={scrollRef}>
                    <div className="max-w-3xl mx-auto space-y-4 pb-32">

                        <div className="flex justify-center">
                            <Badge variant="outline" className="bg-white/5 text-[10px] text-gray-500 px-3 py-0.5 rounded-full border-white/5">TODAY</Badge>
                        </div>

                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                <div className="flex items-center gap-2 mb-1 px-1">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                        {msg.role === 'user' ? 'YOU' : activeAgent?.name || 'AI'} • {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <div className={`max-w-[88%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed break-words overflow-hidden ${msg.role === 'user'
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/10 rounded-tr-none'
                                    : 'bg-[#0f1b2d] border border-white/5 text-gray-200 rounded-tl-none'
                                    }`}>
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            code({ node, inline, className, children, ...props }) {
                                                return inline ? (
                                                    <code className="bg-white/10 px-1 py-0.5 rounded text-blue-300 font-mono text-[11px]" {...props}>
                                                        {children}
                                                    </code>
                                                ) : (
                                                    <pre className="bg-black/30 p-3 rounded-lg my-2 overflow-x-auto border border-white/5">
                                                        <code className="text-blue-200 font-mono text-[11px]" {...props}>
                                                            {children}
                                                        </code>
                                                    </pre>
                                                );
                                            },
                                            ul: ({ children }) => <ul className="list-disc ml-4 my-2 space-y-1">{children}</ul>,
                                            ol: ({ children }) => <ol className="list-decimal ml-4 my-2 space-y-1">{children}</ol>,
                                            h1: ({ children }) => <h1 className="text-lg font-bold my-2 text-blue-400">{children}</h1>,
                                            h2: ({ children }) => <h2 className="text-base font-bold my-2 text-blue-400">{children}</h2>,
                                            h3: ({ children }) => <h3 className="text-sm font-bold my-2 text-blue-400">{children}</h3>,
                                            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                            a: ({ children, href }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{children}</a>
                                        }}
                                    >
                                        {msg.content}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        ))}

                        {sending && (
                            <div className="flex flex-col items-start animate-pulse">
                                <div className="flex items-center gap-2 mb-1 px-1">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{activeAgent?.name || 'AI'} IS TYPING...</span>
                                </div>
                                <div className="max-w-[80%] rounded-2xl px-4 py-3 text-sm bg-[#0f1b2d] border border-white/5 text-gray-500 rounded-tl-none italic">
                                    Analyzing chat...
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                {/* ── Input Bar ───────────────────────────────────────────── */}
                <div className="shrink-0 border-t border-white/5 bg-[#060b13]/80 backdrop-blur-xl px-3 sm:px-6 py-3">
                    <div className="max-w-3xl mx-auto">
                        <form onSubmit={handleSendMessage} className="flex items-center gap-2 bg-[#0f1b2d] border border-white/10 rounded-2xl px-4 py-2.5 shadow-2xl">
                            <input
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                disabled={sending || isAnimating}
                                placeholder={sending ? "Analysing emotions..." : isAnimating ? "Agent is typing..." : "Type what's on your mind..."}
                                className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500 text-sm disabled:opacity-50 min-w-0"
                            />
                            <Button
                                type="submit"
                                size="icon"
                                disabled={sending || isAnimating}
                                className="h-8 w-8 bg-blue-500 hover:bg-blue-600 rounded-xl shadow-lg shadow-blue-500/20 shrink-0 disabled:opacity-50"
                            >
                                <Send className="w-3.5 h-3.5" />
                            </Button>
                        </form>
                        <p className="text-center text-[10px] text-gray-600 mt-1.5">
                            Emotion AI can make mistakes. Consider checking important information.
                        </p>
                    </div>
                </div>

            </main>
        </div>
    );
}
