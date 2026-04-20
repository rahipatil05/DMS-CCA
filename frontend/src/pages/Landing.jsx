import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
    Sparkles, Brain, Heart, Code,
    ArrowRight, Rocket, MessageSquare, Wand2, BarChart2,
    ChevronDown, Star, Check, Users, Activity, Lock, Zap
} from "lucide-react";

// ─── Hook: scroll parallax ────────────────────────────────────────────────────
function useScrollEffect(ref, options = {}) {
    const [progress, setProgress] = useState(0);
    const [inView, setInView] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => setInView(entry.isIntersecting),
            { threshold: 0.1, ...options }
        );
        observer.observe(el);

        const handleScroll = () => {
            const rect = el.getBoundingClientRect();
            const windowH = window.innerHeight;
            const raw = 1 - (rect.top / windowH);
            setProgress(Math.min(Math.max(raw, 0), 1));
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();

        return () => { observer.disconnect(); window.removeEventListener("scroll", handleScroll); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return { progress, inView };
}

// ─── 3-D browser mockup component ────────────────────────────────────────────
function BrowserMockup({ src, alt, tiltX = 0, tiltY = 0, scale = 1, style = {} }) {
    return (
        <div
            className="rounded-xl overflow-hidden border border-white/10 bg-[#0d1117] shadow-[0_30px_80px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.05)]"
            style={{
                transform: `perspective(1200px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(${scale})`,
                transition: "transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)",
                ...style
            }}
        >
            {/* Browser chrome */}
            <div className="bg-[#161b22] px-3.5 py-2.5 flex items-center gap-3 border-b border-white/[0.07]">
                <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                </div>
                <div className="flex-1 bg-white/5 rounded-md px-2.5 py-1 text-[11px] text-slate-500 flex items-center max-w-[280px] overflow-hidden whitespace-nowrap">
                    <Lock style={{ width: 10, height: 10, marginRight: 4, opacity: 0.6 }} />
                    <span>app.dmsm-cca.local</span>
                </div>
            </div>
            {/* Screenshot */}
            <div>
                <img src={src} alt={alt} draggable={false} className="w-full h-auto block max-h-[520px] object-cover object-top" />
            </div>
        </div>
    );
}

// ─── Animated counter ─────────────────────────────────────────────────────────
function Counter({ value, suffix = "", duration = 2000 }) {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const started = useRef(false);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && !started.current) {
                started.current = true;
                const start = performance.now();
                const animate = (now) => {
                    const elapsed = now - start;
                    const pct = Math.min(elapsed / duration, 1);
                    const ease = 1 - Math.pow(1 - pct, 3);
                    setCount(Math.floor(ease * value));
                    if (pct < 1) requestAnimationFrame(animate);
                };
                requestAnimationFrame(animate);
            }
        }, { threshold: 0.5 });
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [value, duration]);

    return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// ─── Static data (outside component to avoid stale-closure lint warnings) ────
const AGENTS = [
    { name: "Empathy AI", icon: Heart, gradient: "from-pink-500 to-rose-600", glow: "#f43f5e", desc: "Your emotional support companion", traits: ["Always validates your feelings", "Warm & non-judgmental", "Deep emotional awareness"] },
    { name: "Code Mentor", icon: Code, gradient: "from-cyan-400 to-blue-600", glow: "#38bdf8", desc: "Expert programming assistant", traits: ["Multi-language expertise", "Clean, efficient solutions", "Debug & explain code"] },
    { name: "Creative Muse", icon: Sparkles, gradient: "from-purple-500 to-pink-500", glow: "#a855f7", desc: "Unleash your creative potential", traits: ["Endless brainstorming", "Artistic direction", "Imaginative narratives"] },
    { name: "Study Buddy", icon: Brain, gradient: "from-emerald-400 to-teal-600", glow: "#10b981", desc: "Patient educational companion", traits: ["Simplifies complex topics", "Adapts to your learning pace", "Quizzes & summaries"] },
];

const FEATURES = [
    { icon: Brain, title: "Multi-Agent System", desc: "Switch seamlessly between specialized AI agents, each with a distinct personality tuned for your needs.", tag: "Agents" },
    { icon: Brain, title: "Self-Discovery Engine", desc: "The AI organically listens. Mention a new hobby and it asks to remember it forever in your profile.", tag: "AI" },
    { icon: BarChart2, title: "Wellness Dashboard", desc: "Rich analytics with emotion heatmaps, mood distribution charts, and a 1-click AI Weekly Journal.", tag: "Analytics" },
    { icon: MessageSquare, title: "Persistent Memory", desc: "Your name, interests, and traits are injected into every conversation — it truly knows you.", tag: "Memory" },
    { icon: Activity, title: "Emotion Intelligence", desc: "Every message is analyzed in real-time, tracking happy, anxious, lonely, and 7 other emotional states.", tag: "Emotion" },
    { icon: Wand2, title: "Build Custom Agents", desc: "Define any persona with custom system prompts, icons, and color themes. Make it uniquely yours.", tag: "Custom" },
];

const SCREENSHOTS = [
    { src: "/assets/ss/chat_page.jpg", alt: "Chat Interface", label: "AI Chat", desc: "Real-time conversations with specialized AI agents" },
    { src: "/assets/ss/analysis 1.jpg", alt: "Analytics Overview", label: "Analytics", desc: "Comprehensive mental wellness tracking dashboard" },
    { src: "/assets/ss/user_dashboard.jpg", alt: "User Dashboard", label: "Dashboard", desc: "Welcome hub showing all your AI agents at a glance" },
    { src: "/assets/ss/create_agent.jpg", alt: "Create Agent", label: "Create Agent", desc: "Design your own custom AI companion from scratch" },
    { src: "/assets/ss/analysis 2 .jpg", alt: "Analytics Charts", label: "Charts & Insights", desc: "Emotion distribution and 6-month activity overview" },
];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Landing() {
    const navigate = useNavigate();
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [navScrolled, setNavScrolled] = useState(false);

    const heroRef = useRef(null);
    const previewRef = useRef(null);
    const featuresRef = useRef(null);
    const agentsRef = useRef(null);
    const analyticsRef = useRef(null);

    useScrollEffect(heroRef);
    const previewScroll = useScrollEffect(previewRef);
    const featuresScroll = useScrollEffect(featuresRef);
    const agentsScroll = useScrollEffect(agentsRef);
    const analyticsScroll = useScrollEffect(analyticsRef);

    const [particles] = useState(() =>
        Array.from({ length: 40 }, (_, i) => ({
            id: i,
            left: Math.random() * 100,
            top: Math.random() * 100,
            size: Math.random() * 4 + 1,
            duration: Math.random() * 20 + 25,
            delay: Math.random() * 8,
            color: ["#38bdf8", "#818cf8", "#f472b6", "#34d399"][Math.floor(Math.random() * 4)]
        }))
    );

    // mouse parallax
    useEffect(() => {
        const handle = (e) => {
            setMousePos({
                x: (e.clientX / window.innerWidth - 0.5) * 2,
                y: (e.clientY / window.innerHeight - 0.5) * 2
            });
        };
        window.addEventListener("mousemove", handle);
        return () => window.removeEventListener("mousemove", handle);
    }, []);

    // nav shadow on scroll
    useEffect(() => {
        const handle = () => setNavScrolled(window.scrollY > 40);
        window.addEventListener("scroll", handle, { passive: true });
        return () => window.removeEventListener("scroll", handle);
    }, []);

    // static data moved to module scope (AGENTS, FEATURES, SCREENSHOTS)

    const [activeScreenshot, setActiveScreenshot] = useState(0);

    useEffect(() => {
        const t = setInterval(() => setActiveScreenshot(p => (p + 1) % SCREENSHOTS.length), 4500);
        return () => clearInterval(t);
    }, []);

    const heroTiltX = -mousePos.y * 3;
    const heroTiltY = mousePos.x * 3;
    const previewTilt = Math.max(0, 20 - previewScroll.progress * 30);
    const previewScale = 0.85 + previewScroll.progress * 0.15;

    return (
        <div className="min-h-screen bg-[#060b13] text-slate-200 font-sans overflow-x-hidden relative" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

            {/* ── Keyframe animations via style tag (only animations, no layout) ── */}
            <style>{`
                @keyframes floatParticle {
                    0%   { transform: translate(0,0) scale(1); }
                    25%  { transform: translate(15px,-25px) scale(1.1); }
                    50%  { transform: translate(-10px,-15px) scale(0.9); }
                    75%  { transform: translate(-20px,-35px) scale(1.05); }
                    100% { transform: translate(0,0) scale(1); }
                }
                @keyframes pulseSlow {
                    from { opacity: 0.7; }
                    to   { opacity: 1; }
                }
                @keyframes bounce {
                    0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)}
                }
                @keyframes gradMove {
                    0%,100%{background-position:0% 50%} 50%{background-position:100% 50%}
                }
                @keyframes slideUp {
                    from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)}
                }
                @keyframes fadein {
                    from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)}
                }
                @keyframes scrollDrop {
                    0%{transform:scaleY(0);transform-origin:top}
                    50%{transform:scaleY(1);transform-origin:top}
                    51%{transform-origin:bottom}
                    100%{transform:scaleY(0);transform-origin:bottom}
                }
                @keyframes shimmer {
                    from{background-position:200% 0} to{background-position:-200% 0}
                }
                .anim-fadein  { animation: fadein 0.8s ease forwards; }
                .anim-fadein-03 { animation: fadein 0.8s 0.3s ease forwards; opacity: 0; }
                .anim-fadein-05 { animation: fadein 0.8s 0.5s ease forwards; opacity: 0; }
                .anim-fadein-07 { animation: fadein 0.8s 0.7s ease forwards; opacity: 0; }
                .anim-fadein-12 { animation: fadein 1s 1.2s ease forwards; opacity: 0; }
                .anim-slideup   { animation: slideUp 0.8s ease forwards; }
                .anim-slideup-01{ animation: slideUp 0.8s 0.1s ease forwards; }
                .anim-slideup-02{ animation: slideUp 0.8s 0.2s ease forwards; }
                .anim-bounce    { animation: bounce 2s ease-in-out infinite; }
                .anim-gradmove  {
                    background-size: 200% 200%;
                    animation: gradMove 4s ease infinite, slideUp 0.8s 0.1s ease forwards;
                }
                .anim-pulse-slow { animation: pulseSlow 6s ease-in-out infinite alternate; }
                .anim-scroll-drop { animation: scrollDrop 1.5s ease-in-out infinite; }
                .feature-card-hover:hover .shimmer-el { opacity: 1; animation: shimmer 1.5s infinite; }
                .feature-card-hover:hover .icon-wrap-el { transform: scale(1.1); box-shadow: 0 0 20px rgba(59,130,246,0.3); }
                .feature-card-hover:hover { transform: translateY(-4px) !important; }
                .agent-card-hover:hover .agent-icon-inner { transform: scale(1.12) rotate(3deg); }
                .agent-card-hover:hover .agent-glow-ring { opacity: 1; }
            `}</style>

            {/* ── Ambient particle background ── */}
            <div className="fixed inset-0 pointer-events-none z-0">
                {particles.map(p => (
                    <div key={p.id} className="absolute rounded-full opacity-25 blur-[1px]" style={{
                        left: `${p.left}%`, top: `${p.top}%`,
                        width: p.size, height: p.size,
                        background: p.color,
                        animationName: "floatParticle",
                        animationTimingFunction: "linear",
                        animationIterationCount: "infinite",
                        animationDuration: `${p.duration}s`,
                        animationDelay: `${p.delay}s`
                    }} />
                ))}
            </div>

            {/* ── Gradient orbs ── */}
            <div className="anim-pulse-slow fixed w-[500px] h-[500px] -top-[150px] -left-[150px] rounded-full blur-[80px] pointer-events-none z-0 bg-blue-500/18 transition-transform duration-[800ms]"
                style={{ transform: `translate(${mousePos.x * -20}px, ${mousePos.y * -20}px)` }} />
            <div className="anim-pulse-slow fixed w-[600px] h-[600px] -bottom-[200px] -right-[200px] rounded-full blur-[80px] pointer-events-none z-0 bg-violet-500/15 [animation-delay:-3s] transition-transform duration-[800ms]"
                style={{ transform: `translate(${mousePos.x * 15}px, ${mousePos.y * 15}px)` }} />
            <div className="anim-pulse-slow fixed w-[350px] h-[350px] top-[40%] left-[40%] rounded-full blur-[80px] pointer-events-none z-0 bg-pink-500/10 [animation-delay:-1.5s] transition-transform duration-[800ms]"
                style={{ transform: `translate(${mousePos.x * -10}px, ${mousePos.y * -10}px)` }} />

            {/* ═══════ NAVIGATION ═══════ */}
            <nav className={`fixed top-0 left-0 right-0 z-[100] px-4 sm:px-6 py-3 sm:py-4 transition-all duration-300 ${navScrolled ? "bg-[rgba(6,11,19,0.85)] backdrop-blur-[20px] shadow-[0_1px_0_rgba(255,255,255,0.06)]" : ""}`}>
                <div className="max-w-[1200px] mx-auto flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 bg-gradient-to-br from-blue-500 to-violet-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.4)] text-white">
                            <Brain size={18} />
                        </div>
                        <div className="hidden sm:block">
                            <div className="text-[14px] font-bold text-white whitespace-nowrap">Multi-Personalized</div>
                            <div className="text-[11px] text-slate-500 mt-px">AI Agent Platform</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            className="px-3.5 sm:px-5 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-300 text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-white/[0.09] hover:border-blue-500/30 hover:text-white"
                            onClick={() => navigate("/auth")}
                        >
                            Sign In
                        </button>
                        <button
                            className="inline-flex items-center gap-1.5 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 text-white text-sm font-semibold cursor-pointer border-none transition-all duration-300 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:-translate-y-px hover:shadow-[0_0_35px_rgba(59,130,246,0.5)]"
                            onClick={() => navigate("/auth")}
                        >
                            <span className="hidden sm:inline">Get Started</span>
                            <span className="sm:hidden">Start</span>
                            <ArrowRight size={14} />
                        </button>
                    </div>
                </div>
            </nav>

            {/* ═══════ HERO ═══════ */}
            <section ref={heroRef} className="relative z-[1] min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 pt-24 sm:pt-[120px] pb-16 sm:pb-20 text-center">
                <div className="max-w-[900px] mx-auto w-full">

                    {/* Badge */}
                    <div className="anim-fadein inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-blue-500/10 border border-blue-500/25 text-sky-300 text-[12px] sm:text-[13px] font-medium mb-6 sm:mb-8">
                        <Rocket size={13} className="anim-bounce text-blue-400 shrink-0" />
                        <span>Next-Gen Multi-Personalized AI Platform</span>
                    </div>

                    {/* Title */}
                    <div className="mb-5 sm:mb-7" style={{ transform: `perspective(800px) rotateX(${heroTiltX * 0.3}deg) rotateY(${heroTiltY * 0.3}deg)` }}>
                        <h1 className="text-[clamp(36px,8vw,82px)] font-extrabold leading-[1.08] flex flex-col gap-1 tracking-tight">
                            <span className="anim-gradmove bg-gradient-to-r from-sky-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
                                Multi-Personalized
                            </span>
                            <span className="anim-slideup-02 text-white/80 font-normal">AI Agent Platform</span>
                        </h1>
                    </div>

                    <p className="anim-fadein-03 text-slate-400 text-[clamp(14px,2.2vw,20px)] leading-[1.65] max-w-[680px] mx-auto mb-8 sm:mb-10 px-2">
                        Interact with <span className="text-sky-400 font-semibold">emotionally intelligent AI agents</span>, each with their own unique personality.
                        Choose from multiple specialized agents or <span className="text-violet-400 font-semibold">build your own</span> — tailored
                        entirely to <span className="text-pink-400 font-semibold">you</span>.
                    </p>

                    {/* CTA */}
                    <div className="anim-fadein-05 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-3.5 mb-10 sm:mb-14">
                        <button
                            className="w-full sm:w-auto relative inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-[14px] bg-gradient-to-br from-blue-500 to-violet-600 text-white text-base font-bold border-none cursor-pointer transition-all duration-300 shadow-[0_0_30px_rgba(59,130,246,0.35)] overflow-hidden hover:-translate-y-[3px] hover:scale-[1.02] hover:shadow-[0_10px_50px_rgba(59,130,246,0.5)]"
                            onClick={() => navigate("/auth")}
                        >
                            <Sparkles size={17} />
                            Start for Free
                        </button>
                        <button
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-[14px] bg-white/[0.04] border border-white/10 text-slate-400 text-[15px] font-semibold cursor-pointer transition-all duration-200 hover:bg-white/[0.08] hover:text-white hover:border-blue-500/30"
                            onClick={() => {
                                document.getElementById("preview-section")?.scrollIntoView({ behavior: "smooth" });
                            }}
                        >
                            See it in Action
                            <ChevronDown size={16} />
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="anim-fadein-07 flex gap-6 sm:gap-12 justify-center">
                        {[
                            { v: 4, s: "+", label: "AI Agents" },
                            { v: 7, s: "", label: "Emotions Tracked" },
                            { v: 10, s: "+", label: "Custom Prompts" },
                        ].map((stat, i) => (
                            <div key={i} className="text-center">
                                <div className="text-[26px] sm:text-[32px] font-extrabold text-white tracking-tight">
                                    <Counter value={stat.v} suffix={stat.s} />
                                </div>
                                <div className="text-[11px] sm:text-[13px] text-slate-500 mt-0.5">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Scroll indicator — hidden on short mobile viewports */}
                <div className="anim-fadein-12 hidden sm:flex absolute bottom-8 left-1/2 -translate-x-1/2 flex-col items-center gap-1.5 text-slate-600 text-[11px] tracking-widest">
                    <div className="anim-scroll-drop w-px h-10 bg-gradient-to-b from-blue-500 to-transparent" />
                    <span>Scroll to explore</span>
                </div>
            </section>

            {/* ═══════ APP PREVIEW ═══════ */}
            <section className="relative z-[1] py-16 sm:py-[120px] px-4 sm:px-6 text-center" id="preview-section" ref={previewRef}>
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.08em] text-sky-400 uppercase bg-blue-500/[0.08] border border-blue-500/20 px-3.5 py-1.5 rounded-full mb-4">
                    <Star size={14} /> Live Preview
                </div>
                <h2 className="text-[clamp(32px,5vw,52px)] font-extrabold text-white tracking-tight leading-[1.1] mb-4">
                    See <span className="bg-gradient-to-r from-sky-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">AI-Agents</span> in Action
                </h2>
                <p className="text-slate-500 text-[17px] leading-[1.65] max-w-[560px] mx-auto mb-14">
                    Real screenshots from the application — this is exactly what you'll experience
                </p>

                {/* Primary 3D browser */}
                <div className="max-w-[1000px] mx-auto mb-10 relative" style={{
                    transformOrigin: "50% 50%", willChange: "transform",
                    transform: `perspective(1400px) rotateX(${previewTilt}deg) scale(${previewScale})`,
                    opacity: 0.4 + previewScroll.progress * 0.6,
                    transition: "transform 0.05s linear, opacity 0.3s ease"
                }}>
                    <BrowserMockup src={SCREENSHOTS[activeScreenshot].src} alt={SCREENSHOTS[activeScreenshot].alt} />
                    <div className="absolute -inset-10 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.2)_0%,transparent_70%)] pointer-events-none -z-[1]" />
                </div>

                {/* Tabs — horizontal scroll on mobile */}
                <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
                    <div className="flex gap-2 sm:justify-center min-w-max sm:min-w-0 sm:flex-wrap max-w-[900px] mx-auto">
                        {SCREENSHOTS.map((ss, i) => (
                            <button
                                key={i}
                                className={`px-3.5 sm:px-4 py-2.5 rounded-xl border cursor-pointer text-left transition-all duration-200 min-w-[130px] sm:min-w-[140px] shrink-0 sm:shrink ${activeScreenshot === i
                                    ? "bg-blue-500/12 border-blue-500/40"
                                    : "bg-white/[0.03] border-white/[0.07] hover:bg-white/[0.07] hover:border-blue-500/20"
                                    }`}
                                onClick={() => setActiveScreenshot(i)}
                            >
                                <span className="block text-[12px] sm:text-[13px] font-semibold text-white">{ss.label}</span>
                                <span className="hidden sm:block text-[11px] text-slate-500 mt-0.5">{ss.desc}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════ FEATURES GRID ═══════ */}
            <section ref={featuresRef} className="relative z-[1] py-16 sm:py-[120px] px-4 sm:px-6 bg-white/[0.015] text-center">
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.08em] text-sky-400 uppercase bg-blue-500/[0.08] border border-blue-500/20 px-3.5 py-1.5 rounded-full mb-4">
                    <Zap size={14} /> Core Capabilities
                </div>
                <h2 className="text-[clamp(32px,5vw,52px)] font-extrabold text-white tracking-tight leading-[1.1] mb-4">
                    Built for <span className="bg-gradient-to-r from-sky-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">Real Connection</span>
                </h2>
                <p className="text-slate-500 text-[17px] leading-[1.65] max-w-[560px] mx-auto mb-14">
                    Not just another chatbot — a platform architected around your privacy, emotions, and personal growth.
                </p>

                <div className="grid gap-4 max-w-[1100px] mx-auto" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
                    {FEATURES.map((f, i) => {
                        const Icon = f.icon;
                        const delay = i * 0.08;
                        return (
                            <div
                                key={i}
                                className={`feature-card-hover relative bg-white/[0.03] border border-white/[0.07] rounded-[18px] p-7 text-left overflow-hidden transition-all duration-300 ${featuresScroll.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-[30px]"}`}
                                style={{ transitionDelay: `${delay}s`, transitionProperty: "opacity, transform, background, border-color, box-shadow" }}
                            >
                                <div className="text-[10px] font-bold tracking-[0.08em] text-sky-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-[3px] rounded-full inline-block mb-4">
                                    {f.tag}
                                </div>
                                <div className="icon-wrap-el w-12 h-12 bg-gradient-to-br from-blue-500/20 to-violet-500/20 rounded-[14px] flex items-center justify-center text-sky-400 mb-4 transition-all duration-300">
                                    <Icon size={22} />
                                </div>
                                <h3 className="text-[17px] font-bold text-white mb-2">{f.title}</h3>
                                <p className="text-[14px] text-slate-500 leading-[1.65]">{f.desc}</p>
                                <div className="shimmer-el absolute inset-0 opacity-0 transition-opacity duration-300 pointer-events-none"
                                    style={{ background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.03) 60%, transparent 80%)", backgroundSize: "200% 100%" }} />
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* ═══════ AGENTS SHOWCASE ═══════ */}
            <section ref={agentsRef} className="relative z-[1] py-16 sm:py-[120px] px-4 sm:px-6 text-center">
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.08em] text-sky-400 uppercase bg-blue-500/[0.08] border border-blue-500/20 px-3.5 py-1.5 rounded-full mb-4">
                    <Users size={14} /> The Team
                </div>
                <h2 className="text-[clamp(32px,5vw,52px)] font-extrabold text-white tracking-tight leading-[1.1] mb-4">
                    Meet Your <span className="bg-gradient-to-r from-sky-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">AI Companions</span>
                </h2>
                <p className="text-slate-500 text-[17px] leading-[1.65] max-w-[560px] mx-auto mb-14">
                    Four deeply specialized agents, each built with distinct personalities, tones, and expertise.
                </p>

                <div className="grid gap-5 max-w-[1100px] mx-auto mb-12" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
                    {AGENTS.map((agent, i) => {
                        const Icon = agent.icon;
                        const delay = i * 0.12;
                        return (
                            <div
                                key={i}
                                className={`agent-card-hover relative bg-white/[0.03] border border-white/[0.07] rounded-[20px] p-8 px-6 text-center overflow-hidden transition-all duration-700 ${agentsScroll.inView ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-[40px] scale-[0.97]"}`}
                                style={{
                                    transitionDelay: `${delay}s`,
                                    "--agent-glow": agent.glow,
                                }}
                                onMouseEnter={e => {
                                    const el = e.currentTarget;
                                    el.style.borderColor = agent.glow;
                                    el.style.boxShadow = `0 0 50px ${agent.glow}33, 0 8px 40px rgba(0,0,0,0.4)`;
                                    el.style.transform = "translateY(-6px) scale(1.01)";
                                }}
                                onMouseLeave={e => {
                                    const el = e.currentTarget;
                                    el.style.borderColor = "";
                                    el.style.boxShadow = "";
                                    el.style.transform = "";
                                }}
                            >
                                <div className={`agent-icon-inner w-16 h-16 rounded-[20px] flex items-center justify-center mx-auto mb-5 shadow-[0_8px_25px_rgba(0,0,0,0.4)] transition-all duration-400 bg-gradient-to-br ${agent.gradient}`}>
                                    <Icon size={28} color="white" />
                                </div>
                                <h3 className="text-[20px] font-bold text-white mb-2">{agent.name}</h3>
                                <p className="text-[14px] text-slate-500 mb-5">{agent.desc}</p>
                                <ul className="list-none p-0 m-0 flex flex-col gap-2 text-left">
                                    {agent.traits.map((t, ti) => (
                                        <li key={ti} className="flex items-center gap-2 text-[13px] text-slate-400">
                                            <Check size={12} className="text-emerald-400 shrink-0" />
                                            {t}
                                        </li>
                                    ))}
                                </ul>
                                <div className="agent-glow-ring absolute inset-[-1px] rounded-[20px] opacity-0 transition-opacity duration-400 pointer-events-none"
                                    style={{ background: `linear-gradient(135deg, transparent 0%, transparent 60%, ${agent.glow}26 100%)` }} />
                            </div>
                        );
                    })}
                </div>

                {/* Custom agent CTA */}
                <div className="max-w-[800px] mx-auto bg-gradient-to-br from-blue-500/[0.08] to-violet-500/[0.08] border border-violet-500/20 rounded-[20px] p-5 sm:p-7 sm:px-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5">
                        <div className="w-12 h-12 sm:w-[52px] sm:h-[52px] shrink-0 bg-gradient-to-br from-blue-500 to-violet-600 rounded-[16px] flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.35)]">
                            <Wand2 size={22} color="white" />
                        </div>
                        <div className="flex-1 text-left">
                            <h3 className="text-[16px] sm:text-[17px] font-bold text-white m-0 mb-1">Build Your Own Agent</h3>
                            <p className="text-[13px] sm:text-[14px] text-slate-500 m-0">Define a custom persona with unique system prompts, icons, and color themes.</p>
                        </div>
                        <button
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 text-white text-sm font-semibold cursor-pointer border-none transition-all duration-300 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:-translate-y-px hover:shadow-[0_0_35px_rgba(59,130,246,0.5)]"
                            onClick={() => navigate("/auth")}
                        >
                            Create Agent <ArrowRight size={15} />
                        </button>
                    </div>
                </div>
            </section>

            {/* ═══════ ANALYTICS SHOWCASE ═══════ */}
            <section ref={analyticsRef} className="relative z-[1] py-16 sm:py-[120px] px-4 sm:px-6 bg-white/[0.015]">
                <div className="max-w-[1200px] mx-auto grid gap-10 sm:gap-16 items-center" style={{ gridTemplateColumns: "1fr" }}>
                <style>{`@media(min-width:768px){.analytics-grid{grid-template-columns:1fr 1.2fr!important}}`}</style>
                <div className="analytics-grid max-w-[1200px] mx-auto grid gap-10 sm:gap-16 items-center w-full" style={{ gridTemplateColumns: "1fr" }}>
                    {/* Left: text */}
                    <div>
                        <div className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.08em] text-sky-400 uppercase bg-blue-500/[0.08] border border-blue-500/20 px-3.5 py-1.5 rounded-full mb-4">
                            <BarChart2 size={14} /> Mental Wellness
                        </div>
                        <h2 className="text-[clamp(28px,4vw,46px)] font-extrabold text-white tracking-tight leading-[1.15] mb-4">
                            Understand Your <span className="bg-gradient-to-r from-sky-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">Emotional Journey</span>
                        </h2>
                        <p className="text-slate-500 text-[16px] leading-[1.7] mb-7">
                            The most unique feature of Multi-Personalized AI Agent Platform — a full mental wellness dashboard powered
                            by real conversation data and AI-generated insights.
                        </p>
                        <ul className="list-none p-0 m-0 mb-9 flex flex-col gap-3">
                            {[
                                "Emotion heatmaps tracking 7+ feelings",
                                "6-month message & conversation charts",
                                "Agent usage vs. emotion correlation",
                                "1-click AI-generated Weekly Wellness Journal"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-2.5 text-[15px] text-slate-400">
                                    <div className="w-[22px] h-[22px] rounded-[7px] bg-emerald-400/15 flex items-center justify-center text-emerald-400 shrink-0">
                                        <Check size={12} />
                                    </div>
                                    {item}
                                </li>
                            ))}
                        </ul>
                        <button
                            className="relative inline-flex items-center gap-2.5 px-8 py-3.5 rounded-[14px] bg-gradient-to-br from-blue-500 to-violet-600 text-white text-base font-bold border-none cursor-pointer transition-all duration-300 shadow-[0_0_30px_rgba(59,130,246,0.35)] overflow-hidden hover:-translate-y-[3px] hover:scale-[1.02] hover:shadow-[0_10px_50px_rgba(59,130,246,0.5)]"
                            onClick={() => navigate("/auth")}
                        >
                            <Rocket size={16} /> Start Tracking
                        </button>
                    </div>

                    {/* Right: stacked browser screenshots */}
                    <div className={`relative transition-all duration-[900ms] ${analyticsScroll.inView ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"}`}>
                        <BrowserMockup
                            src="/assets/ss/analysis 2 .jpg"
                            alt="Analytics Charts"
                            tiltY={-8}
                            style={{ position: "relative", zIndex: 2 }}
                        />
                        <BrowserMockup
                            src="/assets/ss/analysis 1.jpg"
                            alt="Analytics Overview"
                            tiltY={-8}
                            style={{
                                position: "absolute",
                                top: "24px",
                                left: "24px",
                                zIndex: 1,
                                opacity: 0.5,
                                filter: "brightness(0.7) blur(1px)"
                            }}
                        />
                        <div className="absolute -inset-[60px] bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.15)_0%,transparent_70%)] pointer-events-none z-0" />
                    </div>
                </div>
                </div>
            </section>

            {/* ═══════ FINAL CTA ═══════ */}
            <section className="relative z-[1] py-16 sm:py-[120px] px-4 sm:px-6 text-center overflow-hidden">
                <div className="relative max-w-[800px] mx-auto">
                    <div className="absolute w-[400px] h-[400px] -top-[100px] -left-[100px] bg-blue-500/12 rounded-full blur-[80px] pointer-events-none" />
                    <div className="absolute w-[350px] h-[350px] -bottom-[80px] -right-[80px] bg-violet-500/10 rounded-full blur-[80px] pointer-events-none" />
                    <div className="relative z-[1]">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-400/10 border border-emerald-400/25 text-emerald-400 text-[13px] font-medium mb-6">
                            <Sparkles size={14} />
                            <span>Free • Open Source • AI-Powered</span>
                        </div>
                        <h2 className="text-[clamp(36px,6vw,60px)] font-extrabold text-white tracking-tight leading-[1.1] mb-5">
                            Ready to Meet Your <span className="bg-gradient-to-r from-sky-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">AI Companions?</span>
                        </h2>
                        <p className="text-slate-500 text-[18px] leading-[1.6] mb-12">
                            Start your journey with personalized AI agents that understand your emotions, adapt to your style, and grow with you.
                        </p>
                        <div className="flex flex-col items-center gap-5">
                            <button
                                className="relative inline-flex items-center gap-2.5 px-10 py-[18px] rounded-[16px] bg-gradient-to-br from-blue-500 to-violet-600 text-white text-[18px] font-bold border-none cursor-pointer transition-all duration-300 shadow-[0_0_30px_rgba(59,130,246,0.35)] overflow-hidden hover:-translate-y-[3px] hover:scale-[1.02] hover:shadow-[0_10px_50px_rgba(59,130,246,0.5)]"
                                onClick={() => navigate("/auth")}
                            >
                                <Sparkles size={20} />
                                Create Free Account
                            </button>
                            <div className="flex items-center gap-1 text-[13px] text-slate-600 flex-wrap justify-center">
                                <Check size={14} className="text-emerald-400 shrink-0" /> No credit card required
                                &nbsp;&nbsp;·&nbsp;&nbsp;
                                <Check size={14} className="text-emerald-400 shrink-0" /> Free to use
                                &nbsp;&nbsp;·&nbsp;&nbsp;
                                <Check size={14} className="text-emerald-400 shrink-0" /> Open source
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════ FOOTER ═══════ */}
            <footer className="relative z-[1] border-t border-white/[0.06] py-12 px-6 text-center">
                <div className="max-w-[600px] mx-auto">
                    <div className="flex items-center justify-center gap-2.5 mb-2.5">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-violet-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.4)] text-white">
                            <Brain size={16} />
                        </div>
                        <span className="text-[15px] font-bold text-white/60">Multi-Personalized AI Agent Platform</span>
                    </div>
                    <p className="text-[13px] text-slate-700 mb-2">Empowering conversations with personalized AI agents.</p>
                    <p className="text-[12px] text-slate-800">© 2026 DMSM CCA. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
