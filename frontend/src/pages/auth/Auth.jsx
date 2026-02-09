import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Lock, User, Loader2, Sparkles, Shield, Zap } from "lucide-react";
import { useAuthSubmit } from "./useAuthSubmit";

export default function AuthPage() {
  const [mode, setMode] = useState("login");
  const [particles, setParticles] = useState([]);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const { submitAuth, loading, error } = useAuthSubmit();

  // Generate floating particles for background animation
  useEffect(() => {
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 10 + 15,
      delay: Math.random() * 5
    }));
    setParticles(newParticles);
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submitAuth(mode, formData);
  };

  return (
    <div className="min-h-screen relative flex bg-[radial-gradient(circle_at_top_right,#0a192f_0%,#060b13_100%)] text-white overflow-hidden">

      {/* Animated Background Particles */}
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
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <main className="flex-1 flex items-center justify-center px-4 py-16 relative z-10">
        <div className="w-full max-w-md">

          {/* Header Section with Animation */}
          <div className="text-center mb-10 space-y-4 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 backdrop-blur-sm mb-4">
              <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
              <span className="text-sm font-medium text-blue-300">AI-Powered Platform</span>
            </div>

            <h1 className="text-5xl font-bold mb-4 bg-linear-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient">
              Your AI Companion
            </h1>
            <p className="text-lg text-gray-300 font-light">
              Connect with specialized agents designed to understand you
            </p>

            {/* Feature Pills */}
            <div className="flex items-center justify-center gap-3 mt-6 flex-wrap">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                <Shield className="w-3.5 h-3.5 text-green-400" />
                <span className="text-xs text-gray-300">Secure</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                <Zap className="w-3.5 h-3.5 text-yellow-400" />
                <span className="text-xs text-gray-300">Fast</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-xs text-gray-300">Smart</span>
              </div>
            </div>
          </div>

          {/* Card with Enhanced Glassmorphism */}
          <Card className="bg-white/5 backdrop-blur-xl border border-white/10
                           transition-all duration-500 
                           hover:bg-white/10 hover:border-blue-500/30
                           hover:shadow-[0_0_50px_10px_rgba(59,130,246,0.3)]
                           animate-slide-up
                           relative overflow-hidden group">

            {/* Card Glow Effect */}
            <div className="absolute inset-0 bg-linear-to-br from-blue-500/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <CardHeader className="relative z-10">
              <Tabs value={mode} onValueChange={setMode} className="w-full">
                <TabsList className="grid grid-cols-2 bg-white/5 backdrop-blur-sm border border-white/10 p-1 rounded-xl">
                  <TabsTrigger
                    value="login"
                    className="rounded-lg data-[state=active]:bg-linear-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/50 transition-all duration-300 font-semibold"
                  >
                    Login
                  </TabsTrigger>
                  <TabsTrigger
                    value="register"
                    className="rounded-lg data-[state=active]:bg-linear-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/50 transition-all duration-300 font-semibold"
                  >
                    Sign Up
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>

            <CardContent className="relative z-10">
              <form onSubmit={handleSubmit} className="space-y-5">

                {error && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 backdrop-blur-sm animate-shake">
                    <p className="text-red-400 text-sm font-medium">{error}</p>
                  </div>
                )}

                {mode === "register" && (
                  <div className="space-y-2 animate-fade-in">
                    <label className="text-sm font-semibold text-blue-300 flex items-center gap-2">
                      <User className="w-3.5 h-3.5" />
                      Full Name
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-linear-to-r from-blue-500/20 to-purple-500/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-hover:text-blue-400 transition-colors duration-300" />
                        <Input
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleChange}
                          placeholder="Enter your full name"
                          className="pl-10 bg-black/40 border-white/10 text-white placeholder-gray-500
                                     focus:ring-2 focus:ring-blue-500 focus:border-blue-500/50 focus:outline-none
                                     hover:border-blue-500/30 hover:bg-black/50
                                     transition-all duration-300 rounded-lg h-12"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-blue-300 flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5" />
                    Email
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-linear-to-r from-blue-500/20 to-purple-500/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-hover:text-blue-400 transition-colors duration-300" />
                      <Input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        className="pl-10 bg-black/40 border-white/10 text-white placeholder-gray-500
                                   focus:ring-2 focus:ring-blue-500 focus:border-blue-500/50 focus:outline-none
                                   hover:border-blue-500/30 hover:bg-black/50
                                   transition-all duration-300 rounded-lg h-12"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-blue-300 flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5" />
                    Password
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-linear-to-r from-blue-500/20 to-purple-500/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-hover:text-blue-400 transition-colors duration-300" />
                      <Input
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        className="pl-10 bg-black/40 border-white/10 text-white placeholder-gray-500
                                   focus:ring-2 focus:ring-blue-500 focus:border-blue-500/50 focus:outline-none
                                   hover:border-blue-500/30 hover:bg-black/50
                                   transition-all duration-300 rounded-lg h-12"
                        required
                      />
                    </div>
                  </div>
                </div>

                {mode === "register" && (
                  <div className="space-y-2 animate-fade-in">
                    <label className="text-sm font-semibold text-blue-300 flex items-center gap-2">
                      <Lock className="w-3.5 h-3.5" />
                      Confirm Password
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-linear-to-r from-blue-500/20 to-purple-500/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-hover:text-blue-400 transition-colors duration-300" />
                        <Input
                          name="confirmPassword"
                          type="password"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          placeholder="Confirm your password"
                          className="pl-10 bg-black/40 border-white/10 text-white placeholder-gray-500
                                     focus:ring-2 focus:ring-blue-500 focus:border-blue-500/50 focus:outline-none
                                     hover:border-blue-500/30 hover:bg-black/50
                                     transition-all duration-300 rounded-lg h-12"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 mt-6
                             bg-linear-to-r from-blue-500 to-blue-600
                             hover:from-blue-600 hover:to-blue-700
                             hover:shadow-[0_0_30px_5px_rgba(59,130,246,0.5)]
                             hover:scale-[1.02]
                             active:scale-[0.98]
                             transition-all duration-300
                             font-semibold text-base
                             rounded-lg
                             disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {mode === "login" ? "Logging in..." : "Creating account..."}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      {mode === "login" ? "Login" : "Create Account"}
                      <Sparkles className="w-4 h-4" />
                    </span>
                  )}
                </Button>

              </form>

            </CardContent>
          </Card>

          {/* Footer Text */}
          <p className="text-center text-gray-500 text-sm mt-6 animate-fade-in">
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setMode(mode === "login" ? "register" : "login")}
              className="text-blue-400 hover:text-blue-300 font-semibold transition-colors duration-200 hover:underline"
            >
              {mode === "login" ? "Sign up" : "Login"}
            </button>
          </p>
        </div>
      </main>

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
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        .animate-float {
          animation: float linear infinite;
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.8s ease-out;
        }

        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}
