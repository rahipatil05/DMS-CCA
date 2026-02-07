// Simple keyword-based emotion detection
// For production, consider using @xenova/transformers or another ML model

export async function detectEmotion(text) {
  const lowerText = text.toLowerCase();
  
  // Emotion keywords
  const emotions = {
    happy: ['happy', 'joy', 'excited', 'great', 'awesome', 'wonderful', 'love', 'amazing', 'good', 'glad'],
    sad: ['sad', 'unhappy', 'depressed', 'down', 'miserable', 'grief', 'disappointed', 'upset'],
    lonely: ['lonely', 'alone', 'isolated', 'abandoned'],
    angry: ['angry', 'mad', 'furious', 'annoyed', 'irritated', 'hate', 'frustrated'],
    anxious: ['anxious', 'worried', 'nervous', 'stressed', 'scared', 'afraid', 'fear'],
    confused: ['confused', 'unsure', 'lost', 'puzzled', 'don\'t understand']
  };
  
  // Count keyword matches
  let maxScore = 0;
  let detectedEmotion = 'neutral';
  
  for (const [emotion, keywords] of Object.entries(emotions)) {
    const score = keywords.filter(keyword => lowerText.includes(keyword)).length;
    if (score > maxScore) {
      maxScore = score;
      detectedEmotion = emotion;
    }
  }
  
  return {
    emotion: detectedEmotion,
    confidence: maxScore > 0 ? 0.8 : 0.5,
    intensity: maxScore > 2 ? 'high' : maxScore > 0 ? 'medium' : 'low',
    rawLabel: detectedEmotion,
  };
}
