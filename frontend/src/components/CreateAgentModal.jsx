import React, { useState } from 'react';
import { X, Bot, Sparkles, MessageSquare, Brain, Code, Palette, Heart, Plus, Loader2 } from 'lucide-react';

const ICONS = [
    { name: 'Bot', icon: Bot },
    { name: 'Sparkles', icon: Sparkles },
    { name: 'MessageSquare', icon: MessageSquare },
    { name: 'Brain', icon: Brain },
    { name: 'Code', icon: Code },
    { name: 'Palette', icon: Palette },
    { name: 'Heart', icon: Heart }
];

const COLORS = [
    { name: 'Blue', value: 'from-blue-500 to-cyan-500' },
    { name: 'Purple', value: 'from-purple-500 to-pink-500' },
    { name: 'Green', value: 'from-green-500 to-emerald-500' },
    { name: 'Orange', value: 'from-orange-500 to-yellow-500' },
    { name: 'Red', value: 'from-red-500 to-rose-500' },
    { name: 'Indigo', value: 'from-indigo-500 to-purple-500' }
];

export default function CreateAgentModal({ isOpen, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        prompt: '',
        icon: 'Bot',
        color: 'from-blue-500 to-cyan-500'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch("http://localhost:5000/api/agents", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    ...formData,
                    isCustom: true,
                    isPublic: false
                }),
                credentials: "include"
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to create agent');
            }

            const newAgent = await response.json();
            onSuccess(newAgent);
            onClose();
            // Reset form
            setFormData({
                name: '',
                description: '',
                prompt: '',
                icon: 'Bot',
                color: 'from-blue-500 to-cyan-500'
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-2xl bg-[#0a192f] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
                <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-blue-500 via-purple-500 to-pink-500" />

                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                <Plus className="w-6 h-6 text-blue-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Create New AI Agent</h2>
                                <p className="text-xs text-gray-400">Design your personal AI assistant</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Agent Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. Code Helper"
                                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Description</label>
                                    <input
                                        type="text"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="What does this agent do?"
                                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1.5">System Prompt</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={formData.prompt}
                                    onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                                    placeholder="How should the agent behave? e.g. You are a helpful assistant..."
                                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all resize-none"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-3">Select Icon</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {ICONS.map((item) => {
                                        const IconComp = item.icon;
                                        return (
                                            <button
                                                key={item.name}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, icon: item.name })}
                                                className={`p-3 rounded-xl border transition-all flex items-center justify-center ${formData.icon === item.name
                                                    ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                                                    : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                                                    }`}
                                            >
                                                <IconComp className="w-5 h-5" />
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-3">Select Color Theme</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {COLORS.map((color) => (
                                        <button
                                            key={color.name}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, color: color.value })}
                                            className={`h-10 rounded-xl border transition-all bg-linear-to-br ${color.value} ${formData.color === color.value
                                                ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0a192f] border-transparent'
                                                : 'border-white/10 hover:border-white/30'
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-300 font-semibold hover:bg-white/10 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-2 py-3 rounded-xl bg-linear-to-r from-blue-500 to-purple-600 text-white font-bold hover:from-blue-600 hover:to-purple-700 hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Plus className="w-5 h-5" />
                                        Create Agent
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
