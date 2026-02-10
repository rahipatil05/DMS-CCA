import React, { useState } from 'react';
import { X, User, Mail, Loader2, CheckCircle, Calendar, Hash, Smile, Heart } from 'lucide-react';

export default function EditProfileModal({ isOpen, onClose, user, onSuccess }) {
    const [formData, setFormData] = useState({
        fullName: user?.fullName || '',
        email: user?.email || '',
        dob: user?.dob || '',
        interests: user?.interests?.join(', ') || '',
        personalityTraits: user?.personalityTraits?.join(', ') || ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const response = await fetch("http://localhost:5000/api/user/profile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData),
                credentials: "include"
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to update profile');
            }

            const data = await response.json();
            setSuccess(true);

            // Prepare user data for success callback (ensure interests/traits are arrays)
            const updatedUser = {
                ...data.user,
                interests: formData.interests.split(',').map(i => i.trim()).filter(i => i !== ''),
                personalityTraits: formData.personalityTraits.split(',').map(i => i.trim()).filter(i => i !== '')
            };

            onSuccess(updatedUser);

            // Auto close after success? Or let user see success message
            setTimeout(() => {
                onClose();
                setSuccess(false);
            }, 1500);
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
            <div className="relative w-full max-w-4xl bg-[#0a192f] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-fade-in mx-auto">
                <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-blue-500 to-purple-500" />

                <div className="p-6 md:p-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-white">Edit Profile</h2>
                            <p className="text-sm text-gray-400">Update your account information for better AI personalization</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-3">
                            <span className="shrink-0">⚠️</span>
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm flex items-center gap-3">
                            <CheckCircle className="w-5 h-5" />
                            Profile updated successfully!
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Left Column: Basic Info */}
                            <div className="space-y-5">
                                <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">Basic Information</h3>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300 ml-1">Full Name</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <User className="w-5 h-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                                        </div>
                                        <input
                                            type="text"
                                            required
                                            value={formData.fullName}
                                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                            className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                            placeholder="Your full name"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300 ml-1">Email Address</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Mail className="w-5 h-5 text-gray-400 group-focus-within:text-blue-400 transition-colors" />
                                        </div>
                                        <input
                                            type="email"
                                            readOnly
                                            disabled
                                            value={formData.email}
                                            className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-500 cursor-not-allowed opacity-70 focus:outline-none transition-all"
                                            placeholder="your@email.com"
                                            title="Email cannot be changed"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300 ml-1">Date of Birth</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Calendar className="w-5 h-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                                        </div>
                                        <input
                                            type="date"
                                            value={formData.dob}
                                            onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                                            className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all scheme-dark"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: AI Personalization */}
                            <div className="space-y-5">
                                <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-2">AI Personalization</h3>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300 ml-1">Interests & Hobbies</label>
                                    <div className="relative group">
                                        <div className="absolute top-3 left-4 pointer-events-none">
                                            <Heart className="w-5 h-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                                        </div>
                                        <textarea
                                            value={formData.interests}
                                            onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                                            className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none h-28"
                                            placeholder="e.g. Reading, Traveling, AI (comma separated)"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300 ml-1">Personality & Traits</label>
                                    <div className="relative group">
                                        <div className="absolute top-3 left-4 pointer-events-none">
                                            <Smile className="w-5 h-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                                        </div>
                                        <textarea
                                            value={formData.personalityTraits}
                                            onChange={(e) => setFormData({ ...formData, personalityTraits: e.target.value })}
                                            className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none h-28"
                                            placeholder="e.g. Introverted, Logical, Empathetic"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row gap-4 pt-4 border-t border-white/5">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-300 font-semibold hover:bg-white/10 transition-all order-2 md:order-1"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading || success}
                                className="flex-1 py-3 rounded-xl bg-linear-to-r from-blue-500 to-purple-600 text-white font-bold hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 order-1 md:order-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    "Save Changes"
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
