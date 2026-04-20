import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../src/models/User.model.js';
import Agent from '../src/models/Agent.model.js';
import Conversation from '../src/models/Conversation.model.js';

dotenv.config({ path: '.env' });

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MS_PER_MIN = 60 * 1000;

// ---------------------------------------------------------------------------
// Realistic message pools per agent type
// ---------------------------------------------------------------------------
const CHATS = {
  empathy: [
    {
      emotion: "lonely",
      messages: [
        { role: "user",      content: "I've been feeling really disconnected from everyone lately. Like I'm in the room but not really there." },
        { role: "assistant", content: "That kind of loneliness is one of the hardest — being surrounded by people but still feeling invisible. You're not broken for feeling that way. What's been going on?" },
        { role: "user",      content: "I don't even know. I just feel like nobody really sees me, you know?" },
        { role: "assistant", content: "I see you. And I don't mean that in a hollow way — I mean what you just said took guts. Feeling unseen is exhausting. Has something happened recently that made it worse, or has it been building for a while?" },
        { role: "user",      content: "Building for a while I think. Since college honestly." },
        { role: "assistant", content: "That's a long time to be carrying that quietly. College can be isolating even when it doesn't look like it from the outside. Have you had anyone in your life you felt really understood by, even briefly?" },
      ]
    },
    {
      emotion: "anxious",
      messages: [
        { role: "user",      content: "I have a big presentation tomorrow and I can't sleep. My mind won't stop." },
        { role: "assistant", content: "That racing-mind feeling before something important is exhausting. What's your brain fixating on most — forgetting something, how people will react, or something else?" },
        { role: "user",      content: "That I'll blank out completely. Just freeze in front of everyone." },
        { role: "assistant", content: "That fear is so real. But here's something worth sitting with — you've prepared for this. Your knowledge doesn't disappear when you're nervous, it just gets harder to access. What's one thing you know cold, without even thinking?" },
        { role: "user",      content: "The opening section. I could do that in my sleep." },
        { role: "assistant", content: "Then hold onto that. You don't need to have the whole thing perfect — you just need to start. The rest usually follows when you get moving. Try to breathe slowly and just trust that opening." },
      ]
    },
    {
      emotion: "sad",
      messages: [
        { role: "user",      content: "My best friend and I had a huge fight. We haven't spoken in two weeks." },
        { role: "assistant", content: "Two weeks of silence with someone that close — that cuts deep. Do you want to talk about what happened, or more about how you're feeling right now?" },
        { role: "user",      content: "Both I guess. We said some really harsh things." },
        { role: "assistant", content: "Harsh words in a heated moment leave marks on both sides. Do you think you both meant what you said, or was it more the kind of thing that came out in the heat of it?" },
        { role: "user",      content: "Mostly heat of the moment. But it still hurt." },
        { role: "assistant", content: "Pain doesn't care much about intent — it lands anyway. The fact that you're still thinking about it this much tells me this friendship matters to you. Have you thought about reaching out first?" },
      ]
    },
    {
      emotion: "happy",
      messages: [
        { role: "user",      content: "I finally got the internship I applied for! I've been waiting for weeks." },
        { role: "assistant", content: "That is genuinely wonderful — weeks of waiting and uncertainty, and it paid off. How are you feeling right now? Like, actually sitting in the moment?" },
        { role: "user",      content: "Relieved more than anything. And excited I think." },
        { role: "assistant", content: "That mix of relief and excitement is such a specific kind of good. You earned this. What does this opportunity mean to you beyond just the job itself?" },
      ]
    },
  ],
  code: [
    {
      emotion: "confused",
      messages: [
        { role: "user",      content: "Why does my useEffect keep running infinitely? I added an array as a dependency." },
        { role: "assistant", content: "Classic one — arrays in dependency arrays are compared by reference, not value. So every render creates a new array object, even if the contents look identical, and React sees it as 'changed'. Move the array definition outside the component or wrap it in useMemo." },
        { role: "user",      content: "Oh that makes sense. What about objects? Same issue?" },
        { role: "assistant", content: "Exact same problem. Objects are compared by reference too. Object literals inside the component body get recreated every render. Either lift them out, useMemo them, or restructure your logic to only pass primitives as dependencies when possible." },
        { role: "user",      content: "Okay got it. What's useMemo actually doing under the hood?" },
        { role: "assistant", content: "It memoizes the return value of a function — React stores the result and only re-runs the function when the dependencies change. It's essentially a cache that lives inside the component. Use it when a computation is expensive or when you need stable object references. Don't use it everywhere — it has its own overhead." },
      ]
    },
    {
      emotion: "neutral",
      messages: [
        { role: "user",      content: "What's the difference between SQL and NoSQL? When would you actually choose one over the other?" },
        { role: "assistant", content: "Short version: SQL is structured, relational, great when your data has clear relationships and you need strict consistency — think banking, inventory. NoSQL is flexible, scales horizontally, great for unstructured or rapidly changing data — think user activity logs, social feeds, real-time stuff. The real question is whether your data has a fixed schema or evolves over time." },
        { role: "user",      content: "What about for a chat app like this one? Which would you use?" },
        { role: "assistant", content: "Honestly, MongoDB (NoSQL) is a solid call for chat. Messages are document-like, conversations grow dynamically, and you don't need complex multi-table joins. If you were building something that needed billing or strict financial records on the side, you'd keep SQL for that piece specifically. MongoDB for the chat layer, SQL if you add a payment system." },
      ]
    },
    {
      emotion: "anxious",
      messages: [
        { role: "user",      content: "I have a technical interview tomorrow for a full stack role. Any last minute tips?" },
        { role: "assistant", content: "Don't cram tonight — that's probably the most useful thing I can say. Fatigue during a coding interview is brutal. Review the fundamentals you're already comfortable with rather than trying to learn something new. Arrays, hashmaps, basic complexity. Talk out loud while you code — interviewers care a lot about seeing your thought process, not just the answer." },
        { role: "user",      content: "What if I get stuck on a problem?" },
        { role: "assistant", content: "Say 'let me think through this' out loud and start with what you *do* know about the problem. Break it down: input, output, edge cases. A brute force answer that works is better than silence leading to nothing. Interviewers would rather see you reason through a suboptimal solution than watch you freeze." },
        { role: "user",      content: "Makes sense. Thanks." },
        { role: "assistant", content: "You've got it. Go sleep early, you'll do better with a rested brain than a panicked one." },
      ]
    },
  ],
  creative: [
    {
      emotion: "happy",
      messages: [
        { role: "user",      content: "I want to write a short story but I have no idea where to start." },
        { role: "assistant", content: "Okay, don't start with a plot — start with a feeling or an image. Tell me one scene you can picture vividly, even if it goes nowhere. A place, a moment, a face. Anything." },
        { role: "user",      content: "A girl standing on a bridge at night, throwing something into the river." },
        { role: "assistant", content: "That's already a story. What's she throwing — and why tonight of all nights? That's the tension right there. You don't need to explain it yet. Just follow her. Where does she go after she lets go?" },
        { role: "user",      content: "Maybe she walks home and tries to pretend everything's fine." },
        { role: "assistant", content: "Perfect — and we immediately know she's failed at that, because she's the kind of person who throws things into rivers at night. That tension between the gesture and the performance afterward is what makes a story feel real. Write that scene. Just that one. The rest will come." },
      ]
    },
    {
      emotion: "neutral",
      messages: [
        { role: "user",      content: "Can you help me brainstorm names for a sci-fi city that exists underwater?" },
        { role: "assistant", content: "Oh this is fun. What's the vibe — is it ancient and overgrown (think ruins reclaimed by the deep), or built and clinical (engineered to survive pressure), or somewhere in between, a living city that's adapted over generations?" },
        { role: "user",      content: "Built and clinical, very high tech but also kind of cold and oppressive." },
        { role: "assistant", content: "Then you want names that feel constructed rather than discovered. Something with hard consonants and a slight bureaucratic ugliness. Bathos. Ventriss. Abyxal. Merithos-7. Pressura. Maybe something that sounds almost like a serial number — DEEPSECT-4 — because a city that clinical wouldn't bother with poetry." },
        { role: "user",      content: "I love Abyxal. That one has a really good sound to it." },
        { role: "assistant", content: "It does — there's something in the x that feels alien but not cartoonish. And 'abyss' lives inside it without being obvious. If you're going oppressive, lean into the city's slogan being something that sounds generous but is actually sinister. 'Abyxal: The City That Never Surfaces.' That kind of thing." },
      ]
    },
  ],
  study: [
    {
      emotion: "confused",
      messages: [
        { role: "user",      content: "Can you explain how neural networks actually work? Like actually actually." },
        { role: "assistant", content: "Okay, the clearest way I can put it: imagine you're learning to recognize cats. You look at thousands of cat photos and slowly your brain figures out patterns — pointy ears, certain eye shapes, fur texture. A neural network does the same thing but with numbers. Each 'neuron' is just a math function. It takes inputs, multiplies them by weights (how important is each input?), adds them up, and passes the result through. The 'learning' part is adjusting those weights based on how wrong it was." },
        { role: "user",      content: "What does backpropagation mean then? I've heard that word a hundred times." },
        { role: "assistant", content: "Backpropagation is just: after the network makes a prediction and gets it wrong, figure out which weights were most responsible for that mistake, and nudge them slightly in the right direction. It works backwards — from the output layer to the input layer — calculating how much each weight contributed to the error. Do this millions of times and the network gradually gets better. The 'gradient descent' you hear about is the 'nudging in the right direction' part." },
        { role: "user",      content: "Ohhhh. That actually makes sense. So it's basically just error correction repeated forever." },
        { role: "assistant", content: "Exactly that. It's obsessively iterative error correction with math. The magic everyone talks about is really just doing that at massive scale with a lot of data. When people say 'AI learned to do X' they mostly mean 'we let the error correction run long enough on enough examples that the weights converged to something useful.'" },
      ]
    },
    {
      emotion: "neutral",
      messages: [
        { role: "user",      content: "What's the French Revolution in one paragraph? I have an exam and I need the essentials." },
        { role: "assistant", content: "The French Revolution (1789–1799) was a period of radical political and social upheaval in France triggered by financial crisis, social inequality, and Enlightenment ideas. The Third Estate (commoners) rose against the monarchy and aristocracy, storming the Bastille in July 1789 as a symbolic flash point. The Revolution produced the Declaration of the Rights of Man, abolished feudalism, executed King Louis XVI, and descended into the Reign of Terror before Napoleon Bonaparte eventually seized power. The core engine: a society where 97% of people had almost no rights and the 3% owned everything — and then everyone ran out of food." },
        { role: "user",      content: "What should I make sure to remember for the exam specifically?" },
        { role: "assistant", content: "Lock in: 1789 as the start, the three Estates and why the Third Estate mattered, the storming of the Bastille (symbolism more than military significance), the Declaration of the Rights of Man, the Reign of Terror under Robespierre (why it happened — fear of counterrevolution), and Napoleon as the Revolution's end point. Also worth knowing: the revolution exported Enlightenment ideas across Europe, which is why it matters beyond France." },
      ]
    },
    {
      emotion: "anxious",
      messages: [
        { role: "user",      content: "I have three exams this week and I genuinely don't know where to start. I'm panicking." },
        { role: "assistant", content: "Okay, deep breath. Panicking blocks the exact part of your brain you need right now. Let's get tactical. Tell me the three exams — subject and which day each one is. We'll figure out the order and what to actually study." },
        { role: "user",      content: "Physics on Wednesday, Maths on Thursday, History on Friday." },
        { role: "assistant", content: "Good news: that's actually spaced out reasonably. Today and tomorrow: Physics — specifically the topics you know you're shaky on, not the ones you already get. Wednesday evening after the exam: brief Maths review, focus on problem types not theory. Thursday evening: History — bullet points of key events and dates only, don't try to read chapters. You don't need to master everything, you need to not drop marks on the things you almost know. What's your shakiest topic in Physics?" },
        { role: "user",      content: "Definitely electromagnetism." },
        { role: "assistant", content: "Then that's your first two hours. Find three or four past paper questions on electromagnetism specifically and work through them. Identify where you keep getting stuck — that's your actual gap. Don't read the textbook top to bottom, it's too slow. Target the gap and drill it." },
      ]
    },
  ],
};

// ---------------------------------------------------------------------------
// Helper — find agent by name keyword, fallback to first agent
// ---------------------------------------------------------------------------
const findAgent = (agents, keyword) =>
  agents.find(a => a.name.toLowerCase().includes(keyword)) || agents[0];

// ---------------------------------------------------------------------------
// Main seed function
// ---------------------------------------------------------------------------
async function seedData() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected.\n');

    // -----------------------------------------------------------------------
    // 1. UPSERT USER  (email: rahip021@gmail.com / pass: rahi123)
    // -----------------------------------------------------------------------
    const email    = 'rahip021@gmail.com';
    const password = 'rahi123';

    let user = await User.findOne({ email });
    const hashedPassword = await bcrypt.hash(password, 10);

    if (!user) {
      console.log('Creating user rahip021@gmail.com...');
      user = await User.create({
        fullName: 'Rahi Patil',
        email,
        password: hashedPassword,
        role: 'user',
        dob: '2003-05-21',
        interests: ['coding', 'sci-fi', 'creative writing', 'chess', 'anime'],
        personalityTraits: ['introverted', 'analytical', 'creative', 'curious'],
      });
    } else {
      console.log('User already exists — updating password and profile...');
      user.password          = hashedPassword;
      user.fullName          = 'Rahi Patil';
      user.dob               = '2003-05-21';
      user.interests         = ['coding', 'sci-fi', 'creative writing', 'chess', 'anime'];
      user.personalityTraits = ['introverted', 'analytical', 'creative', 'curious'];
      await user.save();
    }
    console.log(`✅ User ready: ${email} / ${password}`);

    // Clear existing conversations for a clean slate
    const deleted = await Conversation.deleteMany({ userId: user._id });
    console.log(`🗑️  Cleared ${deleted.deletedCount} old conversations.\n`);

    // -----------------------------------------------------------------------
    // 2. FETCH AGENTS
    // -----------------------------------------------------------------------
    const agents = await Agent.find({});
    if (agents.length === 0) {
      console.error('❌ No agents in DB! Run the main seed script first: npm run seed');
      process.exit(1);
    }

    const empathyAgent  = findAgent(agents, 'empathy');
    const codeAgent     = findAgent(agents, 'code');
    const creativeAgent = findAgent(agents, 'creative');
    const studyAgent    = findAgent(agents, 'study');

    console.log(`Found agents: ${agents.map(a => a.name).join(', ')}\n`);

    // -----------------------------------------------------------------------
    // 3. SEED 18 RICH CONVERSATIONS spread over the last 45 days
    //    Format: { agent, pool (emotion + messages), daysAgo }
    // -----------------------------------------------------------------------
    const schedule = [
      // -- Last 7 days --
      { agent: empathyAgent,  pool: CHATS.empathy[0], daysAgo: 1  },
      { agent: studyAgent,    pool: CHATS.study[2],   daysAgo: 2  },
      { agent: codeAgent,     pool: CHATS.code[2],    daysAgo: 3  },
      { agent: creativeAgent, pool: CHATS.creative[0],daysAgo: 4  },
      { agent: empathyAgent,  pool: CHATS.empathy[1], daysAgo: 5  },
      { agent: studyAgent,    pool: CHATS.study[0],   daysAgo: 6  },
      // -- 8–20 days ago --
      { agent: codeAgent,     pool: CHATS.code[0],    daysAgo: 9  },
      { agent: empathyAgent,  pool: CHATS.empathy[2], daysAgo: 11 },
      { agent: studyAgent,    pool: CHATS.study[1],   daysAgo: 13 },
      { agent: creativeAgent, pool: CHATS.creative[1],daysAgo: 15 },
      { agent: codeAgent,     pool: CHATS.code[1],    daysAgo: 17 },
      { agent: empathyAgent,  pool: CHATS.empathy[3], daysAgo: 19 },
      // -- 21–45 days ago --
      { agent: studyAgent,    pool: CHATS.study[2],   daysAgo: 22 },
      { agent: empathyAgent,  pool: CHATS.empathy[0], daysAgo: 27 },
      { agent: codeAgent,     pool: CHATS.code[0],    daysAgo: 30 },
      { agent: creativeAgent, pool: CHATS.creative[0],daysAgo: 35 },
      { agent: studyAgent,    pool: CHATS.study[0],   daysAgo: 40 },
      { agent: empathyAgent,  pool: CHATS.empathy[1], daysAgo: 45 },
    ];

    const now = Date.now();
    let created = 0;

    for (const entry of schedule) {
      const startTime = now - (entry.daysAgo * MS_PER_DAY);

      // Build messages with realistic timestamps (6 min spacing)
      const messages = entry.pool.messages.map((msg, i) => ({
        role:      msg.role,
        content:   msg.content,
        emotion:   msg.role === 'user' ? entry.pool.emotion : 'neutral',
        createdAt: new Date(startTime + i * 6 * MS_PER_MIN),
      }));

      const convo = await Conversation.create({
        userId:   user._id,
        agentId:  entry.agent._id,
        messages,
      });

      // Force historical timestamps (Mongoose auto-sets these to now)
      await Conversation.updateOne(
        { _id: convo._id },
        { $set: {
          createdAt: new Date(startTime),
          updatedAt: new Date(startTime + messages.length * 6 * MS_PER_MIN),
        }}
      );

      created++;
      console.log(`  ✓ [${entry.agent.name.padEnd(14)}] emotion: ${entry.pool.emotion.padEnd(8)} — ${entry.daysAgo} day(s) ago`);
    }

    console.log(`\n🎉 Done! Created ${created} conversations across 4 agents.`);
    console.log(`\n  📧  Email    → ${email}`);
    console.log(`  🔑  Password → ${password}\n`);

  } catch (err) {
    console.error('❌ Seeding error:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedData();
