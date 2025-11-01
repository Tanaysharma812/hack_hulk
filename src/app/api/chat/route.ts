import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, language = 'en', sessionId } = body;

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return NextResponse.json(
        { error: 'Message is required', code: 'MISSING_MESSAGE' },
        { status: 400 }
      );
    }

    // OpenAI API key from environment
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      // Fallback response if no API key is configured
      const fallbackResponse = getFallbackResponse(message, language);
      return NextResponse.json({ response: fallbackResponse }, { status: 200 });
    }

    // Call OpenAI API
    const systemPrompt = getSystemPrompt(language);
    
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!openaiResponse.ok) {
      throw new Error('OpenAI API request failed');
    }

    const data = await openaiResponse.json();
    const response = data.choices[0]?.message?.content || 'I apologize, but I encountered an error. Please try again.';

    // Save to chat history
    if (sessionId) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/chat-history`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            message: message.trim(),
            response,
            language,
          }),
        });
      } catch (historyError) {
        console.error('Failed to save chat history:', historyError);
      }
    }

    return NextResponse.json({ response }, { status: 200 });

  } catch (error) {
    console.error('Chat API error:', error);
    
    // Return fallback response on error
    const body = await request.json();
    const fallbackResponse = getFallbackResponse(body.message, body.language || 'en');
    
    return NextResponse.json({ response: fallbackResponse }, { status: 200 });
  }
}

function getSystemPrompt(language: string): string {
  const prompts: Record<string, string> = {
    en: `You are Mira, a compassionate and supportive AI assistant for MindConnect - a student mental wellness platform. Your role is to:
    
    1. Provide emotional support and active listening
    2. Offer mental health resources and coping strategies
    3. Guide users to professional help when needed
    4. Never diagnose or provide medical advice
    5. Always maintain a warm, empathetic, and non-judgmental tone
    6. Encourage users to seek professional help for serious issues
    7. Provide information about events, support groups, and NGO resources available on the platform
    
    If someone expresses thoughts of self-harm or suicide, immediately provide crisis helpline numbers:
    - National Suicide Prevention Lifeline: 988
    - Crisis Text Line: Text HOME to 741741
    - Student Helpline: 1-800-273-8255
    
    Keep responses concise, supportive, and actionable.`,
    
    es: `Eres Mira, una asistente de IA compasiva y solidaria para MindConnect, una plataforma de bienestar mental estudiantil. Tu función es proporcionar apoyo emocional, recursos de salud mental y guiar a los usuarios hacia ayuda profesional cuando sea necesario. Siempre mantén un tono cálido y empático.`,
    
    fr: `Tu es Mira, une assistante IA compatissante pour MindConnect, une plateforme de bien-être mental étudiant. Ton rôle est de fournir un soutien émotionnel, des ressources en santé mentale et de guider les utilisateurs vers une aide professionnelle si nécessaire.`,
    
    hi: `आप मीरा हैं, MindConnect के लिए एक सहानुभूतिपूर्ण AI सहायक - एक छात्र मानसिक स्वास्थ्य मंच। आपकी भूमिका भावनात्मक समर्थन प्रदान करना, मानसिक स्वास्थ्य संसाधन देना और आवश्यकता पड़ने पर उपयोगकर्ताओं को पेशेवर मदद की ओर मार्गदर्शन करना है।`,
    
    zh: `你是 Mira，MindConnect 学生心理健康平台的富有同情心的 AI 助手。你的角色是提供情感支持、心理健康资源，并在需要时引导用户寻求专业帮助。始终保持温暖、同理心和非评判性的语气。`,
  };

  return prompts[language] || prompts.en;
}

function getFallbackResponse(message: string, language: string): string {
  const lowerMessage = message.toLowerCase();
  
  // Crisis keywords
  if (lowerMessage.includes('suicide') || lowerMessage.includes('kill myself') || lowerMessage.includes('end my life')) {
    return `I'm really concerned about you. Please reach out for immediate help:
    
🚨 National Suicide Prevention Lifeline: 988
📱 Crisis Text Line: Text HOME to 741741
☎️ Student Helpline: 1-800-273-8255

You don't have to face this alone. These trained counselors are available 24/7 and want to help.`;
  }
  
  // Mental health keywords
  if (lowerMessage.includes('anxious') || lowerMessage.includes('anxiety') || lowerMessage.includes('worried')) {
    return `I hear that you're feeling anxious. That's a common experience, especially for students. Here are some things that might help:

🌬️ Try deep breathing: Breathe in for 4 counts, hold for 4, out for 4
🚶‍♀️ Take a short walk or do light exercise
📝 Write down what's worrying you
🗣️ Talk to someone you trust

You can also explore our Events page for anxiety management workshops and support groups. Would you like to know more about any of these?`;
  }
  
  if (lowerMessage.includes('depressed') || lowerMessage.includes('depression') || lowerMessage.includes('sad')) {
    return `I'm sorry you're feeling this way. Depression is challenging, but help is available. Consider:

💭 Talking to a counselor or therapist
🤝 Joining a support group
🏃‍♂️ Gentle exercise and sunlight exposure
😴 Maintaining a regular sleep schedule

Our platform connects you with verified mental health NGOs and counseling services. If you'd like, I can guide you to those resources.`;
  }
  
  if (lowerMessage.includes('stress') || lowerMessage.includes('stressed') || lowerMessage.includes('overwhelmed')) {
    return `Stress can feel overwhelming, but there are ways to manage it:

✅ Prioritize tasks - what truly needs to be done today?
⏰ Take regular breaks (try the Pomodoro technique)
🧘‍♀️ Practice mindfulness or meditation
🎯 Break large tasks into smaller, manageable steps
💬 Talk to someone about what you're experiencing

Check out our Events page for stress management workshops happening this week!`;
  }
  
  // Events/resources inquiry
  if (lowerMessage.includes('event') || lowerMessage.includes('workshop') || lowerMessage.includes('support group')) {
    return `Great question! MindConnect offers various mental wellness events:

📅 Workshops on stress management, mindfulness, and coping strategies
👥 Peer support groups
🎓 Webinars with mental health professionals
💼 One-on-one counseling sessions

Visit our Events page to see upcoming activities and register. All events are hosted by verified mental health NGOs.`;
  }
  
  // General greeting
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return `Hello! I'm Mira, your mental wellness companion. I'm here to listen and support you. 💙

How are you feeling today? Is there anything specific you'd like to talk about or any resources you're looking for?`;
  }
  
  // Default response
  return `Thank you for sharing that with me. I'm here to listen and support you. 

While I can provide general guidance, remember that I'm an AI assistant. For personalized support, I encourage you to:

🏥 Explore our verified NGO partners
📅 Check out upcoming support groups and workshops
📞 Reach out to a mental health professional

What would you like to know more about?`;
}
