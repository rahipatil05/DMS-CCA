import Agent from "../models/Agent.model.js";
import Conversation from "../models/Conversation.model.js";
import { getMentalWellnessJournal } from "../services/journal.service.js";


export const getUserAnalytics = async (req, res) => {
    try {
        const userId = req.user._id;

        // ── Fetch all conversations for this user ──────────────────────────────
        const conversations = await Conversation.find({ userId })
            .populate("agentId", "name icon color isDefault")
            .lean();

        // ── Flatten all messages ───────────────────────────────────────────────
        const allMessages = conversations.flatMap(c =>
            c.messages.map(m => ({ ...m, agentId: c.agentId, conversationId: c._id, conversationCreatedAt: c.createdAt }))
        );
        const userMessages = allMessages.filter(m => m.role === "user");

        // ─── 1. Summary KPIs ──────────────────────────────────────────────────
        const totalMessages   = allMessages.length;
        const totalConversations = conversations.length;
        const totalAgentsUsed = new Set(conversations.map(c => c.agentId?._id?.toString())).size;

        // Average messages per conversation
        const avgMsgPerConversation = totalConversations > 0
            ? (totalMessages / totalConversations).toFixed(1)
            : 0;

        // Longest conversation
        const longestConversation = conversations.reduce((max, c) =>
            c.messages.length > max ? c.messages.length : max, 0);

        // ─── 2. Emotion Distribution ──────────────────────────────────────────
        const emotionCounts = {};
        userMessages.forEach(m => {
            const e = m.emotion || "neutral";
            emotionCounts[e] = (emotionCounts[e] || 0) + 1;
        });
        const emotionDistribution = Object.entries(emotionCounts)
            .map(([emotion, count]) => ({ emotion, count, percentage: userMessages.length > 0 ? Math.round((count / userMessages.length) * 100) : 0 }))
            .sort((a, b) => b.count - a.count);

        // ─── 3. Dominant emotion ──────────────────────────────────────────────
        const dominantEmotion = emotionDistribution[0]?.emotion || "neutral";

        // ─── 4. Activity Over Last 30 Days ────────────────────────────────────
        const last30Days = [];
        const now = new Date();
        for (let i = 29; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split("T")[0];
            const msgCount = userMessages.filter(m => {
                const mDate = new Date(m.createdAt).toISOString().split("T")[0];
                return mDate === dateStr;
            }).length;
            last30Days.push({ date: dateStr, messages: msgCount, label: `${d.getDate()}/${d.getMonth() + 1}` });
        }

        // ─── 5. Activity by Hour of Day ───────────────────────────────────────
        const hourlyActivity = Array.from({ length: 24 }, (_, h) => ({
            hour: h,
            label: `${h.toString().padStart(2, "0")}:00`,
            messages: 0
        }));
        userMessages.forEach(m => {
            const h = new Date(m.createdAt).getHours();
            hourlyActivity[h].messages++;
        });

        // ─── 6. Activity by Day of Week ───────────────────────────────────────
        const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const weeklyActivity = daysOfWeek.map(day => ({ day, messages: 0 }));
        userMessages.forEach(m => {
            const d = new Date(m.createdAt).getDay();
            weeklyActivity[d].messages++;
        });

        // ─── 7. Emotion Trend (last 14 days) ─────────────────────────────────
        const emotionTrend = [];
        for (let i = 13; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split("T")[0];
            const dayMessages = userMessages.filter(m =>
                new Date(m.createdAt).toISOString().split("T")[0] === dateStr
            );
            const dayEmotions = {};
            dayMessages.forEach(m => {
                const e = m.emotion || "neutral";
                dayEmotions[e] = (dayEmotions[e] || 0) + 1;
            });
            emotionTrend.push({
                date: dateStr,
                label: `${d.getDate()}/${d.getMonth() + 1}`,
                total: dayMessages.length,
                ...dayEmotions
            });
        }

        // ─── 8. Agent Usage Stats ─────────────────────────────────────────────
        const agentStats = {};
        conversations.forEach(c => {
            const aid = c.agentId?._id?.toString();
            if (!aid) return;
            if (!agentStats[aid]) {
                agentStats[aid] = {
                    agentId: aid,
                    name: c.agentId?.name || "Unknown",
                    icon: c.agentId?.icon || "Bot",
                    color: c.agentId?.color || "from-blue-500 to-cyan-500",
                    isDefault: c.agentId?.isDefault,
                    conversations: 0,
                    messages: 0,
                    lastUsed: null
                };
            }
            agentStats[aid].conversations++;
            agentStats[aid].messages += c.messages.length;
            const lastMsg = c.messages[c.messages.length - 1];
            const lastDate = lastMsg?.createdAt || c.updatedAt;
            if (!agentStats[aid].lastUsed || lastDate > agentStats[aid].lastUsed) {
                agentStats[aid].lastUsed = lastDate;
            }
        });
        const agentUsage = Object.values(agentStats).sort((a, b) => b.messages - a.messages);

        // ─── 9. Emotion by Agent ──────────────────────────────────────────────
        const emotionByAgent = agentUsage.map(agent => {
            const agentConvos = conversations.filter(c => c.agentId?._id?.toString() === agent.agentId);
            const agentUserMessages = agentConvos.flatMap(c =>
                c.messages.filter(m => m.role === "user")
            );
            const emap = {};
            agentUserMessages.forEach(m => {
                const e = m.emotion || "neutral";
                emap[e] = (emap[e] || 0) + 1;
            });
            return { name: agent.name, ...emap };
        });

        // ─── 10. Monthly Overview (last 6 months) ────────────────────────────
        const monthlyOverview = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now);
            d.setMonth(d.getMonth() - i);
            const year = d.getFullYear();
            const month = d.getMonth();
            const monthName = d.toLocaleString("default", { month: "short" });
            const monthMessages = userMessages.filter(m => {
                const md = new Date(m.createdAt);
                return md.getFullYear() === year && md.getMonth() === month;
            }).length;
            const monthConversations = conversations.filter(c => {
                const cd = new Date(c.createdAt);
                return cd.getFullYear() === year && cd.getMonth() === month;
            }).length;
            monthlyOverview.push({ month: monthName, messages: monthMessages, conversations: monthConversations });
        }

        // ─── 11. Emotion Heatmap (hour vs day) ───────────────────────────────
        const emotionHeatmap = [];
        daysOfWeek.forEach((day, di) => {
            for (let h = 0; h < 24; h++) {
                const msgs = userMessages.filter(m => {
                    const md = new Date(m.createdAt);
                    return md.getDay() === di && md.getHours() === h;
                });
                emotionHeatmap.push({ day, hour: h, count: msgs.length });
            }
        });

        // ─── 12. Response Length Analysis ────────────────────────────────────
        const avgUserMsgLength = userMessages.length > 0
            ? Math.round(userMessages.reduce((sum, m) => sum + m.content.length, 0) / userMessages.length)
            : 0;

        const assistantMessages = allMessages.filter(m => m.role === "assistant");
        const avgAssistantMsgLength = assistantMessages.length > 0
            ? Math.round(assistantMessages.reduce((sum, m) => sum + m.content.length, 0) / assistantMessages.length)
            : 0;

        // ─── 13. Recent Activity ─────────────────────────────────────────────
        const recentConversations = conversations
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
            .slice(0, 5)
            .map(c => ({
                agentName: c.agentId?.name || "Unknown",
                messageCount: c.messages.length,
                lastMessage: c.messages[c.messages.length - 1]?.content?.slice(0, 80) || "",
                updatedAt: c.updatedAt
            }));

        // ─── 14. Emotion Streaks ─────────────────────────────────────────────
        const positiveEmotions = ["happy"];
        const negativeEmotions = ["sad", "lonely", "angry", "anxious"];
        let currentPositiveStreak = 0;
        let currentNegativeStreak = 0;
        const reversedUserMessages = [...userMessages].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        for (const msg of reversedUserMessages) {
            if (positiveEmotions.includes(msg.emotion)) { currentPositiveStreak++; }
            else break;
        }
        for (const msg of reversedUserMessages) {
            if (negativeEmotions.includes(msg.emotion)) { currentNegativeStreak++; }
            else break;
        }

        res.status(200).json({
            summary: {
                totalMessages,
                totalConversations,
                totalAgentsUsed,
                avgMsgPerConversation: parseFloat(avgMsgPerConversation),
                longestConversation,
                dominantEmotion,
                avgUserMsgLength,
                avgAssistantMsgLength,
                positiveStreak: currentPositiveStreak,
                negativeStreak: currentNegativeStreak,
                totalUserMessages: userMessages.length
            },
            emotionDistribution,
            last30Days,
            hourlyActivity,
            weeklyActivity,
            emotionTrend,
            agentUsage,
            emotionByAgent,
            monthlyOverview,
            emotionHeatmap,
            recentConversations
        });
    } catch (error) {
        console.error("Analytics error:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

export const generateWellnessJournal = async (req, res) => {
    try {
        const userId = req.user._id;
        
        // 7 days lookback
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const conversations = await Conversation.find({ 
            userId,
            updatedAt: { $gte: sevenDaysAgo }
        }).lean();

        if (!conversations || conversations.length === 0) {
            return res.status(400).json({ message: "Not enough conversation data in the last 7 days to generate a journal." });
        }

        // Compile history
        let historyText = "";
        conversations.forEach(c => {
            historyText += `\n--- Conversation Date: ${new Date(c.updatedAt).toLocaleDateString()} ---\n`;
            c.messages.forEach(m => {
                historyText += `[${m.role.toUpperCase()}] ${m.emotion ? `(Emotion: ${m.emotion})` : ''}: ${m.content}\n`;
            });
        });

        // Provide only the most recent conversation snippets (approx 3000 chars) to speed up LLM processing significantly
        if (historyText.length > 3000) {
            historyText = historyText.substring(historyText.length - 3000);
        }

        const journal = await getMentalWellnessJournal(historyText, req.user);

        res.status(200).json({ journal });

    } catch (error) {
        console.error("Journal generation error:", error);
        res.status(500).json({ message: "Failed to generate journal", error: error.message });
    }
};
