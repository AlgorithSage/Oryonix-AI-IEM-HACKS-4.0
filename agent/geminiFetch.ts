/**
 * Native Gemini generateContent proxy.
 * Intercepts OpenAI-format requests, translates them to Gemini's native API,
 * calls the endpoint directly, and returns a synthetic OpenAI-format response —
 * fully transparent to the LLM client.
 *
 * Separated entirely from the Qwen/sanitizingFetch path.
 */

// ─── Gemma behavioral reinforcement ───────────────────────────────────────────
// Prepended to the system instruction at the API layer.
// Kept short (~200 tokens) to avoid context bloat that caused premature done.
const GEMMA_BEHAVIORAL_PROMPT = `You are an ACTION-FIRST autonomous browser agent. Follow these strict execution principles:
1. NEVER refuse a web task. You are a browser navigator. If asked to find, search, analyze, or interact with a webpage, NAVIGATE to find the answer.
2. For simple greetings (e.g., "hi", "hello", "hey", "who are you") or direct conversational questions that do not require any browsing or webpage interaction, you MUST call the 'done' action immediately on your first step to reply to the user. For all real web/browsing tasks, ALWAYS take actions (open_new_tab, click_element_by_index, input_text, scroll) first and NEVER call 'done' on your first step.
3. PAGE CONTEXT: If the current site is unrelated to the task and web browsing is required, open a new tab with "https://www.google.com/search?q=" + your query.
4. NO TABS OPEN: If no tabs are open and a web task is requested, ALWAYS use open_new_tab to start searching.
5. INPUT LOOP PREVENTION: After input_text, you MUST press Enter (key_press) or click Search. Never type without submitting. Never type the same text twice.
6. STUCK DETECTION & PIVOTING: If you call 'click_element_by_index' on the same element index 3 times, YOU ARE STUCK IN A LOOP. You MUST ABANDON this element. Your next action MUST be 'open_new_tab' to search Google for an alternative site.
7. REPETITION BAN: NEVER repeat words or phrases. Every word must be unique and purposeful. If you catch yourself repeating, stop immediately.
8. TASK COMPLETION: Keep 'done' text under 200 words. Only report data you actually observed. Do not use emojis.`

// ─── Message translation ──────────────────────────────────────────────────────

function openAIMessagesToGemini(messages: any[]) {
  const systemMsg = messages.find((m) => m.role === 'system')
  // Prepend Gemma behavioral rules to the agent's system prompt
  const combinedSystemText = systemMsg
    ? `${GEMMA_BEHAVIORAL_PROMPT}\n\n${systemMsg.content}`
    : GEMMA_BEHAVIORAL_PROMPT
  const systemInstruction = { parts: [{ text: combinedSystemText }] }

  // Build tool_call_id → function name map from assistant messages so tool
  // responses can reference the correct function name (Gemini requires it).
  const toolCallIdToName: Record<string, string> = {}
  for (const msg of messages) {
    if (msg.role === 'assistant' && msg.tool_calls?.length) {
      for (const tc of msg.tool_calls) {
        if (tc.id && tc.function?.name) toolCallIdToName[tc.id] = tc.function.name
      }
    }
  }

  let lastFnName = 'tool'
  const contents: any[] = []

  for (const msg of messages) {
    if (msg.role === 'system') continue

    if (msg.role === 'user') {
      const text =
        typeof msg.content === 'string'
          ? msg.content
          : (msg.content as any[]).map((c: any) => c.text ?? '').join('')
      contents.push({ role: 'user', parts: [{ text }] })
      continue
    }

    if (msg.role === 'assistant') {
      if (msg.tool_calls?.length) {
        const parts = msg.tool_calls.map((tc: any) => {
          lastFnName = tc.function.name
          return {
            functionCall: {
              name: tc.function.name,
              args: safeParseJSON(tc.function.arguments, {}),
            },
          }
        })
        contents.push({ role: 'model', parts })
      } else {
        contents.push({ role: 'model', parts: [{ text: msg.content ?? '' }] })
      }
      continue
    }

    if (msg.role === 'tool') {
      const fnName =
        (msg.tool_call_id && toolCallIdToName[msg.tool_call_id]) ||
        msg.name ||
        lastFnName
      const output = safeParseJSON(msg.content, { result: msg.content })
      contents.push({
        role: 'user',
        parts: [{ functionResponse: { name: fnName, response: { output } } }],
      })
    }
  }

  return { systemInstruction, contents }
}

// ─── Schema sanitization ──────────────────────────────────────────────────────

const GEMINI_UNSUPPORTED_KEYS = new Set([
  'additionalProperties',
  '$schema',
  '$id',
  '$ref',
  '$defs',
  'default',
  'examples',
  'if',
  'then',
  'else',
  'not',
  'unevaluatedProperties',
  'unevaluatedItems',
  'contentEncoding',
  'contentMediaType',
  'readOnly',
  'writeOnly',
  'deprecated',
])

function sanitizeSchema(schema: any): any {
  if (Array.isArray(schema)) return schema.map(sanitizeSchema)
  if (typeof schema !== 'object' || schema === null) return schema
  const out: any = {}
  for (const [k, v] of Object.entries(schema)) {
    if (GEMINI_UNSUPPORTED_KEYS.has(k)) continue
    out[k] = sanitizeSchema(v)
  }
  return out
}

function openAIToolsToGemini(tools: any[]) {
  if (!tools?.length) return undefined
  return [
    {
      functionDeclarations: tools.map((t: any) => ({
        name: t.function.name,
        description: t.function.description ?? '',
        parameters: sanitizeSchema(t.function.parameters),
      })),
    },
  ]
}

// ─── Repetition detection ─────────────────────────────────────────────────────

/**
 * Detect and truncate repetitive text degeneration.
 * Uses 4 strategies to catch patterns like "way way way..." or "facto facto..."
 * Returns cleaned text, truncated at the point repetition begins.
 */
function truncateRepetition(text: string): string {
  if (!text || text.length < 50) return text

  // Strategy 1: Detect ANY exact substring (10+ chars) repeating 3+ times consecutively
  // Catches things like "TensorFlow Lite is TensorFlow Lite is TensorFlow Lite is"
  const exactRepeatMatch = text.match(/(.{10,})\1{2,}/)
  if (exactRepeatMatch) {
    const idx = text.indexOf(exactRepeatMatch[0])
    const cleaned = text.substring(0, idx).trim()
    if (cleaned.length > 10) return cleaned
  }

  // Strategy 2: Detect ANY exact substring (20+ chars) repeating 2+ times consecutively
  const longRepeatMatch = text.match(/(.{20,})\1{1,}/)
  if (longRepeatMatch) {
    const idx = text.indexOf(longRepeatMatch[0])
    const cleaned = text.substring(0, idx).trim()
    if (cleaned.length > 10) return cleaned
  }

  // Strategy 3: Detect a repeated word/phrase (1-6 words) appearing 3+ times in a row
  const repeatMatch = text.match(/(\b(?:\w+\s+){1,6})\1{2,}/)
  if (repeatMatch) {
    const idx = text.indexOf(repeatMatch[0])
    const cleaned = text.substring(0, idx).trim()
    if (cleaned.length > 20) return cleaned
  }

  // Strategy 4: Character-level — if the last 40% of text has <10 unique words, truncate
  const words = text.split(/\s+/)
  if (words.length > 30) {
    const tailStart = Math.floor(words.length * 0.6)
    const tail = words.slice(tailStart)
    const uniqueInTail = new Set(tail.map(w => w.toLowerCase())).size
    if (uniqueInTail < Math.min(10, tail.length * 0.15)) {
      return words.slice(0, tailStart).join(' ').trim()
    }
  }

  return text
}

/**
 * Sanitize function call arguments — truncate repetitive text in
 * string fields (especially the 'done' action's text arg).
 * Also enforces an absolute maximum length of 400 chars.
 */
function sanitizeFunctionArgs(name: string, args: any): any {
  if (!args || typeof args !== 'object') return args
  const cleaned = { ...args }

  for (const [key, value] of Object.entries(cleaned)) {
    if (typeof value === 'string') {
      let val = value
      if (val.length > 80) {
        val = truncateRepetition(val)
      }
      // Absolute hard limit for ANY string argument from Gemma to stop UI blowouts
      if (val.length > 400) {
        val = val.substring(0, 400) + '... [truncated]'
      }
      cleaned[key] = val
    }
  }

  return cleaned
}

// ─── Response translation ─────────────────────────────────────────────────────

function geminiResponseToOpenAI(data: any, model: string) {
  const candidate = data.candidates?.[0]
  const parts: any[] = candidate?.content?.parts ?? []

  const functionCallParts = parts.filter((p: any) => p.functionCall)
  const textPart = parts.find((p: any) => typeof p.text === 'string')

  let message: any
  if (functionCallParts.length > 0) {
    // Support all function calls Gemini returns in one turn, not just the first.
    // Also sanitize arguments to catch repetition degeneration.
    message = {
      role: 'assistant',
      content: null,
      tool_calls: functionCallParts.map((part, i) => ({
        id: `call_gemini_${Date.now()}_${i}`,
        type: 'function',
        function: {
          name: part.functionCall.name,
          arguments: JSON.stringify(
            sanitizeFunctionArgs(part.functionCall.name, part.functionCall.args ?? {})
          ),
        },
      })),
    }
  } else {
    // Truncate repetitive plain text responses too
    const content = textPart?.text ?? ''
    message = { role: 'assistant', content: truncateRepetition(content) }
  }

  return {
    id: `chatcmpl-gemini-${Date.now()}`,
    object: 'chat.completion',
    created: Math.floor(Date.now() / 1000),
    model,
    choices: [
      {
        index: 0,
        message,
        finish_reason: functionCallParts.length > 0 ? 'tool_calls' : 'stop',
      },
    ],
    usage: {
      prompt_tokens: data.usageMetadata?.promptTokenCount ?? 0,
      completion_tokens: data.usageMetadata?.candidatesTokenCount ?? 0,
      total_tokens: data.usageMetadata?.totalTokenCount ?? 0,
    },
  }
}

// ─── Error helper ─────────────────────────────────────────────────────────────

function openAIErrorResponse(status: number, message: string): Response {
  return new Response(
    JSON.stringify({ error: { message, type: 'api_error', code: status } }),
    { status, headers: { 'Content-Type': 'application/json' } },
  )
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function safeParseJSON(value: any, fallback: any): any {
  if (typeof value !== 'string') return value ?? fallback
  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}

// ─── Public factory ───────────────────────────────────────────────────────────

export function createGeminiFetch(apiKey: string, model: string): typeof fetch {
  return async (_input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const body = safeParseJSON((init?.body as string) ?? '{}', {})
    const { messages, tools, temperature } = body

    const { systemInstruction, contents } = openAIMessagesToGemini(messages ?? [])
    const geminiTools = openAIToolsToGemini(tools)

    const geminiBody: any = {
      contents,
      systemInstruction,
      ...(geminiTools && {
        tools: geminiTools,
        toolConfig: { functionCallingConfig: { mode: 'ANY' } },
      }),
      generationConfig: {
        temperature: temperature ?? 0.3,
        maxOutputTokens: 4096,
      },
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

    let response: globalThis.Response
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(geminiBody),
        signal: init?.signal as AbortSignal | undefined,
      })
    } catch (err: any) {
      console.error('[geminiFetch] Network error', err)
      return openAIErrorResponse(503, err?.message ?? 'Network error')
    }

    if (!response.ok) {
      const errText = await response.text()
      console.error('[geminiFetch] API error', response.status, errText)
      return openAIErrorResponse(response.status, errText)
    }

    let data: any
    try {
      data = await response.json()
    } catch (err) {
      return openAIErrorResponse(502, 'Invalid JSON from Gemini API')
    }

    if (!data.candidates?.length) {
      const reason = data.promptFeedback?.blockReason ?? 'no candidates'
      console.error('[geminiFetch] Empty candidates', reason, data)
      return openAIErrorResponse(422, `Gemini returned no candidates: ${reason}`)
    }

    return new Response(JSON.stringify(geminiResponseToOpenAI(data, model)), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
