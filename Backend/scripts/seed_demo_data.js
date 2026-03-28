import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../src/models/User.model.js';
import Agent from '../src/models/Agent.model.js';
import Conversation from '../src/models/Conversation.model.js';

dotenv.config({ path: '.env' });

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MS_PER_HOUR = 60 * 60 * 1000;

async function seedData() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected.');

    // 1. CREATE USER
    const email = 'rahip021@gmail.com';
    let user = await User.findOne({ email });
    if (!user) {
      console.log('Creating user rahip021@gmail.com...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('rahip021', salt);
      user = new User({
        fullName: 'Rahip',
        email,
        password: hashedPassword,
        role: 'user'
      });
      await user.save();
    } else {
      console.log('User already exists. Updating password to rahip021 just in case...');
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash('rahip021', salt);
      await user.save();
    }
    
    // Clean old demo data for this user to avoid duplicates
    await Conversation.deleteMany({ userId: user._id });
    console.log('Cleared old conversations for user.');

    // 2. FETCH AGENTS
    const agents = await Agent.find({});
    if (agents.length === 0) {
      console.error('No agents found in DB! Please make sure agents exist.');
      process.exit(1);
    }
    
    // 3. GENERATE FAKE CHAT DATA
    console.log('Generating fake conversations... This might take a second.');
    const emotions = ['happy', 'sad', 'anxious', 'angry', 'neutral', 'confused', 'lonely'];
    
    // We want to simulate about 15 conversations scattered over the last 30 days
    const numConversations = 18;
    const now = Date.now();
    
    for (let c = 0; c < numConversations; c++) {
      // Pick a random agent
      const agent = agents[Math.floor(Math.random() * agents.length)];
      
      // Determine conversation start date (between now and 60 days ago)
      const daysAgo = Math.floor(Math.random() * 60);
      let convoTime = now - (daysAgo * MS_PER_DAY);
      
      const messages = [];
      const numMessages = Math.floor(Math.random() * 10) + 4; // 4 to 13 messages per convo
      
      // Pick a primary emotion for this conversation to simulate a mood
      const primaryEmotion = emotions[Math.floor(Math.random() * emotions.length)];
      
      for (let m = 0; m < numMessages; m++) {
        // User message
        const isUserPositive = ['happy', 'neutral'].includes(primaryEmotion);
        messages.push({
          role: 'user',
          content: `Demo message ${m + 1} for ${primaryEmotion} mood`,
          emotion: Math.random() > 0.3 ? primaryEmotion : emotions[Math.floor(Math.random() * emotions.length)],
          createdAt: new Date(convoTime)
        });
        
        convoTime += (5 * 60 * 1000); // AI replies 5 mins later
        
        // AI message
        messages.push({
          role: 'assistant',
          content: `Demo AI response ${m + 1} acknowledging your feelings.`,
          createdAt: new Date(convoTime)
        });
        
        convoTime += (2 * 60 * 1000); // wait 2 mins before user replies again
      }
      
      const conversation = new Conversation({
        userId: user._id,
        agentId: agent._id,
        messages: messages
      });
      
      // Override createdAt and updatedAt to manipulate the timestamp
      await conversation.save();
      
      // Mongoose save overrides timestamps, so we use updateOne to force historical dates
      await Conversation.updateOne(
        { _id: conversation._id },
        { 
          $set: { 
            createdAt: new Date(now - (daysAgo * MS_PER_DAY)),
            updatedAt: new Date(convoTime)
          } 
        }
      );
    }
    
    console.log(`\n✅ SUCCESSFULLY SEEDED DATA!`);
    console.log(`User: rahip021@gmail.com`);
    console.log(`Password: rahip021`);
    console.log(`Added ${numConversations} dummy conversations using ${agents.length} agents.\n`);
    
  } catch (err) {
    console.error('Error seeding data:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedData();
