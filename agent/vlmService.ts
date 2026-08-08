// agent/vlmService.ts

export interface VlmAnalysisResult {
  visualSummary: string;
  suggestedElements: string[];
  isBottleneckResolved: boolean;
  rawResponse: string;
}

/**
 * Intelligent VLM (Vision-Language Model) Assistant via Groq API.
 * Uses a VISION-CAPABLE model (Llama 4 Scout) to analyze screenshots
 * for navigation guidance, popup/overlay detection, and bottleneck recovery.
 */
export async function analyzeScreenshotWithVlm(
  base64Image: string,
  contextPrompt: string,
  apiKey?: string,
  modelName: string = 'qwen/qwen3.6-27b'
): Promise<VlmAnalysisResult> {
  const groqApiKey = apiKey || import.meta.env.VITE_GROQ_API_KEY || import.meta.env.VITE_LLM_API_KEY || '';
  
  if (!groqApiKey || groqApiKey === 'NA') {
    console.warn('⚠️ Groq API key is missing. Set VITE_GROQ_API_KEY in .env file.');
    return {
      visualSummary: 'VLM analysis skipped: No API Key provided.',
      suggestedElements: [],
      isBottleneckResolved: false,
      rawResponse: 'No Groq API Key',
    };
  }

  // Ensure data URL format
  const imageUrl = base64Image.startsWith('data:') 
    ? base64Image 
    : `data:image/jpeg;base64,${base64Image}`;

  const payload = {
    model: modelName,
    messages: [
      {
        role: 'system',
        content: `You are the VLM (Vision-Language Model) Visual Perception System for Oryonix AI, an autonomous browser agent.
Your job is to analyze screenshots of web pages and provide CRITICAL visual intelligence to the DOM parsing agent.

HIGHEST PRIORITY RULES:
1. POPUP/OVERLAY/MODAL DETECTION: If ANY popup, login modal, cookie banner, newsletter signup, or overlay is blocking the main page content, you MUST report it FIRST and instruct the agent to CLOSE IT (usually via an X button or "Close" link) BEFORE interacting with anything else.
2. SEARCH BAR vs OTHER INPUTS: Clearly distinguish between the page's main SEARCH BAR and other input fields (login forms, email fields, OTP inputs). Always specify which input is the correct search bar.
3. ICON-ONLY BUTTONS: Identify buttons that have NO text label — only icons (e.g., magnifying glass for search, pencil for edit, paper plane for send).
4. Be concise. Under 150 words.`
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: contextPrompt
          },
          {
            type: 'image_url',
            image_url: {
              url: imageUrl
            }
          }
        ]
      }
    ],
    temperature: 0.3,
    max_tokens: 1024,
    top_p: 0.9
  };

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqApiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ [VLM] Groq API error (${response.status}):`, errorText);
      throw new Error(`Groq API VLM error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    console.log('🔍 [VLM] Raw response:', content.substring(0, 200) + '...');

    return {
      visualSummary: content,
      suggestedElements: [],
      isBottleneckResolved: true,
      rawResponse: content
    };
  } catch (error: any) {
    console.error('❌ VLM Analysis Failed:', error);
    return {
      visualSummary: `VLM Error: ${error.message || 'Failed to communicate with Groq API'}`,
      suggestedElements: [],
      isBottleneckResolved: false,
      rawResponse: String(error)
    };
  }
}
