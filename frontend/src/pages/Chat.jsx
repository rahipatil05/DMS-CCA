import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { toast } from "sonner";
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Send,
    Paperclip,
    Mic,
    MoreVertical,
    Search,
    Plus,
    History,
    ArrowLeft,
    Sparkles,
    Brain,
    Bot,
    MessageSquare,
    Smile,
    Frown,
    Zap,
    Wind,
    Heart,
    Code,
    Palette,
    Check,
    Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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
        : "w-12 h-12 rounded-2xl";

    return (
        <div className={`${containerClasses} bg-linear-to-br ${color || 'from-blue-500 to-cyan-500'} flex items-center justify-center shadow-lg transition-transform group-hover:scale-105`}>
            <IconComponent className={`${sizeClasses} text-white`} />
        </div>
    );
};

export default function ChatPage() {
    const { agentId } = useParams();
    const navigate = useNavigate();
    const { authUser } = useAuth();
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [agents, setAgents] = useState([]);
    const [activeAgent, setActiveAgent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const user = authUser;
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
                const response = await fetch("http://localhost:5000/api/agents", {
                    credentials: "include"
                });
                if (response.ok) {
                    const data = await response.json();
                    setAgents(data);

                    // Set active agent based on URL or first available
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
                const response = await fetch(`http://localhost:5000/api/chat/${agentId}`, {
                    credentials: "include"
                });
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
                        const response = await fetch(`http://localhost:5000/api/agents/${id}`, {
                            method: "DELETE",
                            credentials: "include"
                        });
                        if (response.ok) {
                            setAgents(prev => prev.filter(a => a._id !== id));
                            toast.success("Agent deleted successfully");
                            if (agentId === id) {
                                navigate('/dashboard');
                            }
                        } else {
                            const data = await response.json();
                            toast.error(data.message || "Failed to delete agent");
                        }
                    } catch (error) {
                        console.error("Error deleting agent:", error);
                        toast.error("An error occurred while deleting the agent");
                    }
                },
            },
            cancel: {
                label: "Cancel",
            }
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
                        const response = await fetch(`http://localhost:5000/api/chat/${agentId}`, {
                            method: "DELETE",
                            credentials: "include"
                        });
                        if (response.ok) {
                            setMessages([]);
                            setIsMenuOpen(false);
                            toast.success("Conversation cleared successfully");
                        } else {
                            toast.error("Failed to clear conversation");
                        }
                    } catch (error) {
                        console.error("Error clearing chat:", error);
                        toast.error("An error occurred while clearing the chat");
                    }
                },
            },
            cancel: {
                label: "Cancel",
            }
        });
    };

    const handleAcceptDiscovery = async (discoveryData) => {
        try {
            // Get current user to merge data
            const currentUser = getStoredUser();
            const updatedInterests = [...new Set([...(currentUser.interests || []), ...(discoveryData.interests || [])])];
            const updatedTraits = [...new Set([...(currentUser.personalityTraits || []), ...(discoveryData.personalityTraits || [])])];

            const response = await fetch("http://localhost:5000/api/user/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    interests: updatedInterests,
                    personalityTraits: updatedTraits
                }),
                credentials: "include"
            });

            if (response.ok) {
                const data = await response.json();
                // Update local storage
                localStorage.setItem("user", JSON.stringify(data.user));
                toast.success("Profile updated with new discoveries!", {
                    icon: <Check className="w-4 h-4 text-green-500" />
                });
            }
        } catch (error) {
            console.error("Error accepting discovery:", error);
            toast.error("Failed to update profile");
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!message.trim() || !agentId || sending) return;

        const userMsg = {
            role: "user",
            content: message,
            createdAt: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMsg]);
        const currentMessage = message;
        setMessage("");
        setSending(true);

        try {
            const response = await fetch("http://localhost:5000/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ agentId, message: currentMessage }),
                credentials: "include"
            });

            if (response.ok) {
                const data = await response.json();
                // Replace predicted history with official history or just add the reply
                setMessages(prev => [
                    ...prev.filter(m => m !== userMsg), // Remove the temporary one
                    { role: "user", content: currentMessage, createdAt: new Date().toISOString() },
                    { role: "assistant", content: data.reply, createdAt: new Date().toISOString() }
                ]);

                // Handle AI Discoveries
                if (data.discoveries && (data.discoveries.interests?.length > 0 || data.discoveries.personalityTraits?.length > 0)) {
                    const discoveredItems = [
                        ...(data.discoveries.interests || []),
                        ...(data.discoveries.personalityTraits || [])
                    ].join(", ");

                    toast("Self-Discovery Found!", {
                        description: `I noticed you might be into: ${discoveredItems}. Should I add this to your profile?`,
                        duration: 6000,
                        icon: <Sparkles className="w-5 h-5 text-blue-400" />,
                        action: {
                            label: "Accept",
                            onClick: () => handleAcceptDiscovery(data.discoveries)
                        }
                    });
                }
            }
        } catch (error) {
            console.error("Error sending message:", error);
            toast.error("Communication error. Please try again.");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="flex h-screen bg-[#060b13] text-white overflow-hidden font-sans">

            {/* Left Sidebar */}
            <aside className="w-80 border-r border-white/5 flex flex-col bg-[#0a192f]/50 backdrop-blur-xl">
                <div className="p-6 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/50">
                        <Brain className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="font-bold text-lg leading-tight">Multi-Personalized</h2>
                        <p className="text-xs text-blue-400 font-medium">AI Agent Platform</p>
                    </div>
                </div>

                <div className="px-4 mb-6">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                        <Input
                            placeholder="Search agents..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 bg-white/5 border-white/10 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 h-10 rounded-xl transition-all"
                        />
                    </div>
                </div>

                <ScrollArea className="flex-1 px-4">
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 px-2">
                                {searchQuery ? 'Search Results' : 'Active Agents'}
                            </h3>
                            <div className="space-y-2">
                                {agents
                                    .filter(agent =>
                                        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                        agent.description?.toLowerCase().includes(searchQuery.toLowerCase())
                                    )
                                    .map((agent) => (
                                        <div
                                            key={agent._id}
                                            onClick={() => navigate(`/chat/${agent._id}`)}
                                            className={`flex items-center gap-3 p-3 rounded-2xl transition-all cursor-pointer group ${agentId === agent._id
                                                ? 'bg-blue-500/10 border border-blue-500/20 shadow-lg shadow-blue-500/5'
                                                : 'hover:bg-white/5 border border-transparent'
                                                }`}
                                        >
                                            <div className="relative">
                                                <AgentIcon
                                                    iconName={agent.icon}
                                                    color={agent.color}
                                                    size="large"
                                                />
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
                                                        <span className="text-[10px] font-bold text-blue-400">LIVE</span>
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
                                                    className="h-8 w-8 text-red-400/50 hover:text-red-400 hover:bg-red-400/10 rounded-full transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                {agents.filter(agent =>
                                    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                    agent.description?.toLowerCase().includes(searchQuery.toLowerCase())
                                ).length === 0 && (
                                        <div className="text-center py-8">
                                            <p className="text-xs text-gray-500">No agents found matching "{searchQuery}"</p>
                                        </div>
                                    )}
                            </div>
                        </div>
                    </div>
                </ScrollArea>
            </aside>

            {/* Main Chat Area */}
            <main className="flex-1 flex flex-col relative bg-[radial-gradient(circle_at_center,#0a192f_0%,#060b13_100%)]">

                {/* Header */}
                <header className="h-24 border-b border-white/5 flex items-center justify-between px-8 bg-[#060b13]/50 backdrop-blur-md sticky top-0 z-20">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate('/dashboard')}
                            className="text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-xl transition-all"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div className="relative">
                            <AgentIcon
                                iconName={activeAgent?.icon}
                                color={activeAgent?.color}
                                size="large"
                            />
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#060b13] flex items-center justify-center">
                                <Check className="w-2.5 h-2.5 text-white" />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="font-bold text-lg">{activeAgent?.name || 'AI Assistant'}</h2>
                                <Badge variant="success" className="bg-green-500/10 text-green-400 text-[10px] py-0 border-green-500/30">ONLINE</Badge>
                            </div>
                            <p className="text-xs text-gray-400">{activeAgent?.description || 'Your Emotional OS Companion'}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 relative" ref={menuRef}>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className={`rounded-xl h-10 w-10 transition-all ${isMenuOpen ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-gray-400 hover:bg-blue-500/10 hover:text-blue-400'}`}
                        >
                            <MoreVertical className="w-5 h-5" />
                        </Button>

                        {isMenuOpen && (
                            <Card className="absolute top-12 right-0 w-48 bg-[#0f1b2d] border-white/10 shadow-2xl p-1 z-30 animate-in fade-in zoom-in duration-200">
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
                <ScrollArea className="flex-1 p-6" viewportRef={scrollRef}>
                    <div className="max-w-4xl mx-auto space-y-6 pb-28">

                        <div className="flex justify-center">
                            <Badge variant="outline" className="bg-white/5 text-[10px] text-gray-500 px-3 py-0.5 rounded-full border-white/5">TODAY</Badge>
                        </div>

                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                <div className="flex items-center gap-2 mb-1.5 px-1">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                        {msg.role === 'user' ? 'YOU' : activeAgent?.name || 'AI'} • {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <div className={`max-w-[75%] rounded-2xl p-4 text-sm leading-relaxed wrap-break-word overflow-hidden ${msg.role === 'user'
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
                                                    <pre className="bg-black/30 p-3 rounded-lg my-2 overflow-x-auto border border-white/5 scrollbar-thin">
                                                        <code className="text-blue-200 font-mono text-[11px]" {...props}>
                                                            {children}
                                                        </code>
                                                    </pre>
                                                )
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
                                <div className="flex items-center gap-2 mb-1.5 px-1">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{activeAgent?.name || 'AI'} IS TYPING...</span>
                                </div>
                                <div className="max-w-[75%] rounded-2xl p-4 text-sm bg-[#0f1b2d] border border-white/5 text-gray-500 rounded-tl-none italic">
                                    Analyzing emotions...
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                {/* Input Area */}
                <div className="absolute bottom-0 left-0 right-0 p-4 pt-0 pointer-events-none">
                    <div className="max-w-[80%] mx-auto pointer-events-auto">

                        {/* Input Footer */}
                        <Card className="bg-[#0f1b2d]/80 backdrop-blur-xl border-white/10 rounded-xl p-1.5 flex items-center shadow-2xl">
                            <form onSubmit={handleSendMessage} className="w-full flex items-center justify-between px-1">
                                <input
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Type what's on your mind..."
                                    className="w-[70%] bg-transparent border-none outline-none text-white placeholder-gray-500 text-xs h-7 ml-1"
                                />
                                <Button
                                    type="submit"
                                    size="icon"
                                    className="h-7 w-7 bg-blue-500 hover:bg-blue-600 rounded-lg shadow-lg shadow-blue-500/20 shrink-0"
                                >
                                    <Send className="w-3.5 h-3.5" />
                                </Button>
                            </form>
                        </Card>
                        <p className="text-center text-[9px] text-gray-500 mt-2 pb-1">
                            Emotion AI can make mistakes. Consider checking important information.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
