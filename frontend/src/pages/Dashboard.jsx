import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import {
    Brain,
    Sparkles,
    MessageSquare,
    Bot,
    TrendingUp,
    Zap,
    Heart,
    Code,
    Palette,
    Trophy,
    Target,
    Calendar,
    Clock,
    Star,
    Plus,
    Settings,
    LogOut,
    Activity,
    BarChart3,
    Users,
    Rocket,
    Crown,
    Flame,
    Trash2
} from "lucide-react";
import CreateAgentModal from "../components/CreateAgentModal";
import EditProfileModal from "../components/EditProfileModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Icon mapping function
const getIconComponent = (iconName) => {
    const iconMap = {
        Heart,
        Code,
        Palette,
        Brain,
        Bot,
        Sparkles,
        MessageSquare
    };
    return iconMap[iconName] || Bot;
};

export default function Dashboard() {
    const navigate = useNavigate();
    const { authUser, logout: contextLogout } = useAuth();
    const [particles, setParticles] = useState([]);
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dashboardData, setDashboardData] = useState({
        totalChats: 0,
        defaultAgents: 0,
        customAgents: 0,
        agents: []
    });

    // Get user info from context
    const user = authUser;
    const userName = user?.fullName?.split(' ')[0] || "User";

    // Logout handler
    const handleLogout = async () => {
        try {
            // Attempt to call backend logout to clear cookie
            await fetch("http://localhost:5000/api/auth/logout", {
                method: "POST",
                credentials: "include"
            });
        } catch (err) {
            console.error("Logout API error:", err);
        } finally {
            contextLogout();
            toast.success("Logged out successfully");
            navigate("/");
        }
    };

    // Generate floating particles
    useEffect(() => {
        const newParticles = Array.from({ length: 25 }, (_, i) => ({
            id: i,
            left: Math.random() * 100,
            top: Math.random() * 100,
            size: Math.random() * 3 + 1,
            duration: Math.random() * 15 + 20,
            delay: Math.random() * 5
        }));
        setParticles(newParticles);
    }, []);

    // Fetch dashboard data
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const response = await fetch("http://localhost:5000/api/user/dashboard-stats", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include",
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || "Failed to fetch dashboard data");
                }

                const data = await response.json();
                setDashboardData(data);
                setError(null);
            } catch (err) {
                console.error("Error fetching dashboard data:", err);
                setError(err.message);
                toast.error(`Error: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const handleCreateSuccess = (newAgent) => {
        setDashboardData(prev => ({
            ...prev,
            customAgents: prev.customAgents + 1,
            agents: [newAgent, ...prev.agents]
        }));
    };

    const handleDeleteAgent = async (e, agentId) => {
        e.stopPropagation(); // Prevent triggering handleSelectAgent or navigation

        toast("Delete Agent", {
            description: "Are you sure you want to delete this agent?",
            action: {
                label: "Delete",
                onClick: async () => {
                    try {
                        const response = await fetch(`http://localhost:5000/api/agents/${agentId}`, {
                            method: "DELETE",
                            credentials: "include"
                        });

                        if (!response.ok) {
                            const data = await response.json();
                            throw new Error(data.message || "Failed to delete agent");
                        }

                        // Remove from local state
                        setDashboardData(prev => ({
                            ...prev,
                            customAgents: prev.customAgents - 1,
                            agents: prev.agents.filter(a => a._id !== agentId)
                        }));
                        toast.success("Agent deleted successfully");
                    } catch (err) {
                        console.error("Delete agent error:", err);
                        toast.error(err.message || "Failed to delete agent");
                    }
                },
            },
            cancel: {
                label: "Cancel"
            }
        });
    };

    const handleProfileUpdate = (updatedUser) => {
        // Update local storage for non-sensitive data
        localStorage.setItem("user", JSON.stringify(updatedUser));
        window.location.reload();
    };

    // Prepare stats from fetched data
    const stats = [
        {
            icon: Bot,
            label: "Default Agents",
            value: loading ? "..." : dashboardData.defaultAgents,
            color: "from-purple-500 to-pink-500",
            bgColor: "bg-purple-500/10"
        },
        {
            icon: Sparkles,
            label: "Custom Agents",
            value: loading ? "..." : dashboardData.customAgents,
            color: "from-green-500 to-emerald-500",
            bgColor: "bg-green-500/10"
        }
    ];

    // Map agents from API with icon components
    const aiAgents = (dashboardData?.agents || [])
        .map(agent => ({
            id: agent._id,
            name: agent.name,
            icon: getIconComponent(agent.icon),
            color: agent.color,
            description: agent.description,
            status: "online",
            isDefault: agent.isDefault
        }))
        .sort((a, b) => {
            // Pin default agents (isDefault: true) to the top
            if (a.isDefault && !b.isDefault) return -1;
            if (!a.isDefault && b.isDefault) return 1;
            return 0; // Maintain order for same type
        });

    return (
        <div className="min-h-screen relative bg-[radial-gradient(circle_at_top_right,#0a192f_0%,#060b13_100%)] text-white overflow-hidden">

            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {particles.map((particle) => (
                    <div
                        key={particle.id}
                        className="absolute rounded-full bg-blue-400/20 blur-sm animate-float"
                        style={{
                            left: `${particle.left}%`,
                            top: `${particle.top}%`,
                            width: `${particle.size}px`,
                            height: `${particle.size}px`,
                            animationDuration: `${particle.duration}s`,
                            animationDelay: `${particle.delay}s`
                        }}
                    />
                ))}
            </div>

            {/* Gradient Orbs */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />

            {/* Navigation */}
            <nav className="relative z-20 px-6 py-6 border-b border-white/10 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/50">
                            <Brain className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold leading-tight">
                                Multi-Personalized
                            </h1>
                            <p className="text-xs text-blue-400 font-medium whitespace-nowrap">AI Agent Platform</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setIsProfileModalOpen(true)}
                            className="bg-white/5 border-white/10 hover:bg-white/10 hover:border-blue-500/30 transition-all duration-300"
                        >
                            <Settings className="w-5 h-5 text-gray-300" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleLogout}
                            className="bg-white/5 border-white/10 hover:bg-white/10 hover:border-red-500/30 transition-all duration-300"
                        >
                            <LogOut className="w-5 h-5 text-gray-300" />
                        </Button>
                        <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                            <div className="text-3xl">👤</div>
                            <div>
                                <p className="font-semibold text-sm">Hello, {userName}!</p>
                                <p className="text-xs text-gray-400">User Dashboard</p>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="relative z-10 px-6 py-8 max-w-7xl mx-auto">

                {/* Welcome Section */}
                <div className="mb-8 animate-fade-in">
                    {error && (
                        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                            <p className="text-red-400 text-sm">⚠️ {error}</p>
                        </div>
                    )}
                    <div className="flex items-center gap-2 mb-2">
                        <h2 className="text-4xl font-bold">Welcome back, {userName}! 👋</h2>
                    </div>
                    <p className="text-gray-400 text-lg">Ready to continue your AI journey today?</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {stats.map((stat, idx) => {
                        const Icon = stat.icon;
                        return (
                            <Card
                                key={idx}
                                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/10 hover:border-blue-500/30 hover:shadow-[0_0_30px_5px_rgba(59,130,246,0.2)] transition-all duration-300 group animate-fade-in py-0"
                                style={{ animationDelay: `${idx * 0.1}s` }}
                            >
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-center mb-4">
                                        <div className={`w-14 h-14 rounded-xl bg-linear-to-br ${stat.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                            <Icon className="w-7 h-7 text-white" />
                                        </div>
                                    </div>
                                    <p className="text-gray-400 text-sm mb-2 text-center">{stat.label}</p>
                                    <p className="text-3xl font-bold text-white text-center">{stat.value}</p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Main Grid - AI Agents */}
                <div className="mb-8">

                    {/* AI Agents Section */}
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-2xl font-bold mb-1">Your AI Agents</h3>
                                <p className="text-gray-400 text-sm">Choose an agent to start chatting</p>
                            </div>
                            <Button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 font-semibold"
                            >
                                <Plus className="w-4 h-4" />
                                Create New
                            </Button>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {aiAgents.map((agent, idx) => {
                                const Icon = agent.icon;
                                return (
                                    <Card
                                        key={agent.id}
                                        onClick={() => setSelectedAgent(agent.id)}
                                        className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/10 hover:border-blue-500/30 hover:shadow-[0_0_30px_5px_rgba(59,130,246,0.2)] transition-all duration-300 cursor-pointer group animate-fade-in py-0 relative overflow-hidden ${selectedAgent === agent.id ? 'border-blue-500/50 bg-white/10' : ''}`}
                                        style={{ animationDelay: `${idx * 0.1}s` }}
                                    >
                                        {/* Corner Badges */}
                                        <div className="absolute top-4 right-4 flex flex-col gap-2 items-end z-20">
                                            {!agent.isDefault && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon-xs"
                                                    onClick={(e) => handleDeleteAgent(e, agent.id)}
                                                    className="bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all duration-300 h-8 w-8 rounded-full shadow-lg shadow-red-500/10"
                                                    title="Delete Agent"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            )}
                                            <Badge variant="success" className="gap-1 px-2 py-0.5 backdrop-blur-md">
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                                {agent.status}
                                            </Badge>
                                            <Badge
                                                className={`px-2 py-0.5 bg-linear-to-r ${agent.color} border-transparent text-white backdrop-blur-md shadow-sm`}
                                            >
                                                {agent.isDefault ? "Default" : "Custom"}
                                            </Badge>
                                        </div>

                                        <CardHeader className="p-6 pb-0 flex-row items-start justify-between space-y-0">
                                            <div className={`w-14 h-14 rounded-xl bg-linear-to-br ${agent.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                                <Icon className="w-7 h-7 text-white" />
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-6">
                                            <CardTitle className="text-xl font-bold mb-2 text-white p-0">
                                                {agent.name}
                                            </CardTitle>
                                            <CardDescription className="text-gray-400 text-sm">
                                                {agent.description}
                                            </CardDescription>
                                        </CardContent>
                                        <CardFooter className="p-6 pt-0">
                                            <Button
                                                onClick={() => navigate(`/chat/${agent.id}`)}
                                                className={`w-full py-2.5 rounded-lg bg-linear-to-r ${agent.color} hover:shadow-lg transition-all duration-300 font-semibold flex items-center justify-center gap-2 h-auto`}
                                            >
                                                <MessageSquare className="w-4 h-4" />
                                                Start Chat
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                </div>

            </main>

            {/* Animations */}
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0) translateX(0); }
                    25% { transform: translateY(-20px) translateX(10px); }
                    50% { transform: translateY(-10px) translateX(-10px); }
                    75% { transform: translateY(-30px) translateX(5px); }
                }

                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .animate-float {
                    animation: float linear infinite;
                }

                .animate-fade-in {
                    animation: fade-in 0.8s ease-out forwards;
                    opacity: 0;
                }
            `}</style>

            {/* Create Agent Modal */}
            <CreateAgentModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={handleCreateSuccess}
            />

            {/* Edit Profile Modal */}
            <EditProfileModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
                user={user}
                onSuccess={handleProfileUpdate}
            />
        </div>
    );
}
