import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Sparkles,
    Bot,
    Zap,
    Shield,
    Users,
    MessageSquare,
    Wand2,
    ArrowRight,
    Check,
    Star,
    Rocket,
    Brain,
    Heart,
    Code
} from "lucide-react";

export default function Landing() {
    const navigate = useNavigate();
    const [particles, setParticles] = useState([]);
    const [activeAgent, setActiveAgent] = useState(0);

    // Generate floating particles
    useEffect(() => {
        const newParticles = Array.from({ length: 30 }, (_, i) => ({
            id: i,
            left: Math.random() * 100,
            top: Math.random() * 100,
            size: Math.random() * 3 + 1,
            duration: Math.random() * 15 + 20,
            delay: Math.random() * 5
        }));
        setParticles(newParticles);
    }, []);

    // Auto-rotate featured agents
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveAgent((prev) => (prev + 1) % 3);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    const agents = [
        {
            name: "Empathy AI",
            icon: Heart,
            color: "from-pink-500 to-rose-500",
            description: "Your emotional support companion",
            tone: "Warm, caring, and understanding"
        },
        {
            name: "Code Mentor",
            icon: Code,
            color: "from-blue-500 to-cyan-500",
            description: "Expert programming assistant",
            tone: "Technical, precise, and helpful"
        },
        {
            name: "Creative Muse",
            icon: Sparkles,
            color: "from-purple-500 to-pink-500",
            description: "Unleash your creative potential",
            tone: "Inspiring, imaginative, and artistic"
        }
    ];

    const features = [
        {
            icon: Bot,
            title: "Multiple AI Personalities",
            description: "Choose from diverse AI agents, each with unique behaviors and tones"
        },
        {
            icon: Wand2,
            title: "Create Your Own",
            description: "Build custom AI agents with personalized system prompts and behaviors"
        },
        {
            icon: MessageSquare,
            title: "Natural Conversations",
            description: "Engage in fluid, context-aware dialogues tailored to your needs"
        },
        {
            icon: Shield,
            title: "Secure & Private",
            description: "Your conversations are encrypted and protected"
        },
        {
            icon: Zap,
            title: "Lightning Fast",
            description: "Instant responses powered by cutting-edge AI technology"
        },
        {
            icon: Users,
            title: "Community Agents",
            description: "Discover and share AI agents created by the community"
        }
    ];

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
            <nav className="relative z-20 px-6 py-6">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/50">
                            <Brain className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                Multi AI Platform
                            </h1>
                            <p className="text-xs text-gray-400">Personalized Intelligence</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/auth')}
                            className="px-6 py-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-blue-500/30 transition-all duration-300 font-medium"
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => navigate('/auth')}
                            className="px-6 py-2.5 rounded-lg bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 font-semibold flex items-center gap-2"
                        >
                            Get Started
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative z-10 px-6 pt-20 pb-32">
                <div className="max-w-7xl mx-auto text-center">

                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 backdrop-blur-sm mb-8 animate-fade-in">
                        <Rocket className="w-4 h-4 text-blue-400 animate-bounce" />
                        <span className="text-sm font-medium text-blue-300">Next-Gen AI Agent Platform</span>
                    </div>

                    {/* Main Heading */}
                    <h1 className="text-6xl md:text-7xl font-bold mb-6 animate-slide-up">
                        <span className="bg-linear-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient">
                            Multi Personalized
                        </span>
                        <br />
                        <span className="text-white">AI Agent Platform</span>
                    </h1>

                    <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
                        Experience the future of AI interaction. Create, customize, and converse with
                        <span className="text-blue-400 font-semibold"> multiple AI agents</span>, each with
                        <span className="text-purple-400 font-semibold"> unique personalities</span> and
                        <span className="text-pink-400 font-semibold"> custom behaviors</span>.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex items-center justify-center gap-4 mb-16 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                        <button
                            onClick={() => navigate('/auth')}
                            className="px-8 py-4 rounded-xl bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 hover:shadow-[0_0_40px_10px_rgba(59,130,246,0.4)] hover:scale-105 transition-all duration-300 font-bold text-lg flex items-center gap-2"
                        >
                            <Sparkles className="w-5 h-5" />
                            Start Creating
                        </button>
                        <button className="px-8 py-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-blue-500/30 transition-all duration-300 font-semibold text-lg">
                            Explore Agents
                        </button>
                    </div>

                    {/* Featured Agent Carousel */}
                    <div className="max-w-4xl mx-auto">
                        <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:bg-white/10 hover:border-blue-500/30 transition-all duration-500 group">
                            <div className="absolute inset-0 bg-linear-to-br from-blue-500/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />

                            <div className="relative z-10">
                                <div className="flex items-center justify-center gap-3 mb-6">
                                    {agents.map((agent, idx) => {
                                        const Icon = agent.icon;
                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => setActiveAgent(idx)}
                                                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${activeAgent === idx
                                                    ? `bg-linear-to-br ${agent.color} shadow-lg scale-110`
                                                    : 'bg-white/5 hover:bg-white/10'
                                                    }`}
                                            >
                                                <Icon className="w-6 h-6" />
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="text-center animate-fade-in" key={activeAgent}>
                                    <h3 className={`text-3xl font-bold mb-3 bg-linear-to-r ${agents[activeAgent].color} bg-clip-text text-transparent`}>
                                        {agents[activeAgent].name}
                                    </h3>
                                    <p className="text-gray-300 text-lg mb-2">{agents[activeAgent].description}</p>
                                    <p className="text-gray-400 text-sm">Tone: {agents[activeAgent].tone}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="relative z-10 px-6 py-20 bg-black/20">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-5xl font-bold mb-4">
                            <span className="bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                Powerful Features
                            </span>
                        </h2>
                        <p className="text-gray-300 text-lg">Everything you need to create and interact with AI agents</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, idx) => {
                            const Icon = feature.icon;
                            return (
                                <div
                                    key={idx}
                                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-blue-500/30 hover:shadow-[0_0_30px_5px_rgba(59,130,246,0.2)] transition-all duration-300 group animate-fade-in"
                                    style={{ animationDelay: `${idx * 0.1}s` }}
                                >
                                    <div className="w-14 h-14 rounded-xl bg-linear-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                        <Icon className="w-7 h-7 text-blue-400" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2 text-white">{feature.title}</h3>
                                    <p className="text-gray-400">{feature.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Create Your Own Section */}
            <section className="relative z-10 px-6 py-20">
                <div className="max-w-5xl mx-auto">
                    <div className="bg-linear-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-xl border border-white/20 rounded-3xl p-12 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-linear-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <div className="relative z-10 text-center">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-linear-to-br from-blue-500 to-purple-600 mb-6 shadow-lg shadow-blue-500/50 animate-bounce">
                                <Wand2 className="w-10 h-10 text-white" />
                            </div>

                            <h2 className="text-4xl font-bold mb-4">
                                <span className="bg-linear-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                    Create Your Own AI Agent
                                </span>
                            </h2>

                            <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
                                Customize every aspect of your AI companion. Define their personality, tone,
                                expertise, and behavior with powerful system prompts. Make it truly yours.
                            </p>

                            <div className="grid md:grid-cols-3 gap-4 mb-8">
                                {[
                                    { icon: Brain, text: "Custom System Prompts" },
                                    { icon: MessageSquare, text: "Unique Conversation Style" },
                                    { icon: Star, text: "Specialized Knowledge" }
                                ].map((item, idx) => {
                                    const Icon = item.icon;
                                    return (
                                        <div key={idx} className="flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                                            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                                                <Icon className="w-5 h-5 text-blue-400" />
                                            </div>
                                            <span className="text-sm font-medium text-gray-300">{item.text}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            <button
                                onClick={() => navigate('/auth')}
                                className="px-10 py-4 rounded-xl bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 hover:shadow-[0_0_40px_10px_rgba(59,130,246,0.4)] hover:scale-105 transition-all duration-300 font-bold text-lg flex items-center gap-2 mx-auto"
                            >
                                <Rocket className="w-5 h-5" />
                                Build Your Agent Now
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 px-6 py-12 border-t border-white/10">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <Brain className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-lg font-bold bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            Multi AI Platform
                        </span>
                    </div>
                    <p className="text-gray-400 text-sm mb-4">
                        Empowering conversations with personalized AI agents
                    </p>
                    <p className="text-gray-500 text-xs">
                        © 2026 Multi AI Platform. All rights reserved.
                    </p>
                </div>
            </footer>

            {/* Animations */}
            <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-10px) translateX(-10px); }
          75% { transform: translateY(-30px) translateX(5px); }
        }

        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slide-up {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-float {
          animation: float linear infinite;
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
          opacity: 0;
        }

        .animate-slide-up {
          animation: slide-up 1s ease-out;
        }
      `}</style>
        </div>
    );
}
