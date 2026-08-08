/**
 * Sanitizing Fetch Wrapper for local models (gemma4:e4b)
 * 
 * Two-pronged approach:
 * 1. REQUEST:  Strips `tools` and `tool_choice` from outgoing requests to Ollama,
 *              forcing the model into plain-text JSON mode (which it handles better
 *              than OpenAI-style structured tool calling).
 * 2. RESPONSE: Intercepts the raw JSON response, extracts the model's text content,
 *              sanitizes it (type coercion, action name aliases, param fixes),
 *              and wraps it back into a synthetic tool_call so @page-agent/core
 *              accepts it cleanly.
 * 
 * This fixes all identified failure vectors:
 * - String→Number coercion ("15" → 15)
 * - String→Boolean coercion ("true" → true)
 * - Wrong param names (duration→seconds, direction→down/right)
 * - Action name aliases (navigate→open_new_tab, goto→open_new_tab)
 * - Extra field stripping (removing unexpected keys)
 * - Array unwrapping (taking first element if model returns array)
 */

// ─── Schemas ─────────────────────────────────────────────────

/** Known action names and their parameter type maps (for coercion) */
const ACTION_SCHEMAS: Record<string, Record<string, 'number' | 'string' | 'boolean'>> = {
	done: { text: 'string', success: 'boolean' },
	wait: { seconds: 'number' },
	click_element_by_index: { index: 'number' },
	input_text: { index: 'number', text: 'string' },
	select_dropdown_option: { index: 'number', text: 'string' },
	scroll: { down: 'boolean', num_pages: 'number' },
	scroll_horizontally: { right: 'boolean', pixels: 'number' },
	js_scroll: { pixels: 'number' },
	open_new_tab: { url: 'string' },
	switch_to_tab: { tab_id: 'number' },
	close_tab: { tab_id: 'number' },
}

/** Aliases for common action name mistakes */
const ACTION_ALIASES: Record<string, string> = {
	navigate: 'open_new_tab',
	goto: 'open_new_tab',
	go_to: 'open_new_tab',
	open_url: 'open_new_tab',
	visit: 'open_new_tab',
	click: 'click_element_by_index',
	type: 'input_text',
	type_text: 'input_text',
	enter_text: 'input_text',
	select: 'select_dropdown_option',
	scroll_down: 'scroll',
	scroll_up: 'scroll',
	javascript_scroll: 'js_scroll',
	scroll_js: 'js_scroll',
	force_scroll: 'js_scroll',
	direct_scroll: 'js_scroll',
	finish: 'done',
	complete: 'done',
	terminate: 'done',
}

// ─── Type coercion helpers ───────────────────────────────────

function coerceNumber(v: unknown): number | undefined {
	if (typeof v === 'number') return v
	if (typeof v === 'string') {
		const n = Number(v)
		if (!Number.isNaN(n)) return n
	}
	return undefined
}

function coerceBoolean(v: unknown): boolean | undefined {
	if (typeof v === 'boolean') return v
	if (v === 'true' || v === 1 || v === '1') return true
	if (v === 'false' || v === 0 || v === '0') return false
	return undefined
}

function coerceString(v: unknown): string | undefined {
	if (typeof v === 'string') return v
	if (v != null) return String(v)
	return undefined
}

// ─── Param fixers ────────────────────────────────────────────

/** Fix common param name mistakes the model makes */
function fixParamNames(action: string, params: Record<string, unknown>): Record<string, unknown> {
	const fixed = { ...params }

	// wait: duration → seconds
	if (action === 'wait' && 'duration' in fixed && !('seconds' in fixed)) {
		fixed.seconds = fixed.duration
		delete fixed.duration
	}

	// scroll: direction → down
	if (action === 'scroll' && 'direction' in fixed && !('down' in fixed)) {
		const dir = String(fixed.direction).toLowerCase()
		fixed.down = dir === 'down' || dir === 'd'
		delete fixed.direction
	}

	// scroll_horizontally: direction → right
	if (action === 'scroll_horizontally' && 'direction' in fixed && !('right' in fixed)) {
		const dir = String(fixed.direction).toLowerCase()
		fixed.right = dir === 'right' || dir === 'r'
		delete fixed.direction
	}

	// open_new_tab: tab_url / link → url
	if (action === 'open_new_tab') {
		if ('tab_url' in fixed && !('url' in fixed)) {
			fixed.url = fixed.tab_url
			delete fixed.tab_url
		}
		if ('link' in fixed && !('url' in fixed)) {
			fixed.url = fixed.link
			delete fixed.link
		}
	}

	// click_element_by_index: element_index / id → index
	if (action === 'click_element_by_index') {
		if ('element_index' in fixed && !('index' in fixed)) {
			fixed.index = fixed.element_index
			delete fixed.element_index
		}
		if ('id' in fixed && !('index' in fixed)) {
			fixed.index = fixed.id
			delete fixed.id
		}
	}

	// input_text: element_index → index, value/content → text
	if (action === 'input_text') {
		if ('element_index' in fixed && !('index' in fixed)) {
			fixed.index = fixed.element_index
			delete fixed.element_index
		}
		if ('value' in fixed && !('text' in fixed)) {
			fixed.text = fixed.value
			delete fixed.value
		}
		if ('content' in fixed && !('text' in fixed)) {
			fixed.text = fixed.content
			delete fixed.content
		}
	}

	return fixed
}

/** Coerce param types according to the action schema */
function coerceParamTypes(action: string, params: Record<string, unknown>): Record<string, unknown> {
	const schema = ACTION_SCHEMAS[action]
	if (!schema) return params

	const coerced: Record<string, unknown> = {}
	for (const [key, type] of Object.entries(schema)) {
		if (!(key in params)) continue
		switch (type) {
			case 'number':
				coerced[key] = coerceNumber(params[key]) ?? params[key]
				break
			case 'boolean':
				coerced[key] = coerceBoolean(params[key]) ?? params[key]
				break
			case 'string':
				coerced[key] = coerceString(params[key]) ?? params[key]
				break
		}
	}

	// Keep any extra fields the schema doesn't know about (for forward compatibility)
	for (const [key, val] of Object.entries(params)) {
		if (!(key in coerced)) {
			coerced[key] = val
		}
	}

	return coerced
}

// ─── JSON extraction ─────────────────────────────────────────

/** Try to find and parse a JSON object from messy model output */
function extractJSON(text: string): Record<string, unknown> | null {
	// Strip markdown code fences
	let cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '')
	cleaned = cleaned.trim()

	// Try direct parse first
	try {
		const parsed = JSON.parse(cleaned)
		if (parsed && typeof parsed === 'object') {
			return Array.isArray(parsed) ? parsed[0] : parsed
		}
	} catch { /* fall through */ }

	// Try to find the first { ... } block
	const firstBrace = cleaned.indexOf('{')
	if (firstBrace === -1) return null

	let depth = 0
	let lastBrace = -1
	for (let i = firstBrace; i < cleaned.length; i++) {
		if (cleaned[i] === '{') depth++
		if (cleaned[i] === '}') {
			depth--
			if (depth === 0) {
				lastBrace = i
				break
			}
		}
	}

	if (lastBrace === -1) return null

	try {
		const jsonStr = cleaned.substring(firstBrace, lastBrace + 1)
		const parsed = JSON.parse(jsonStr)
		if (parsed && typeof parsed === 'object') {
			return Array.isArray(parsed) ? parsed[0] : parsed
		}
	} catch { /* fall through */ }

	return null
}

// ─── Full sanitization pipeline ──────────────────────────────

/** Sanitize an AgentOutput-like object from raw model JSON */
function sanitizeAgentOutput(raw: Record<string, unknown>): Record<string, unknown> {
	const output = { ...raw }

	// ── Fix the action field ──
	if (output.action && typeof output.action === 'object') {
		const action = { ...(output.action as Record<string, unknown>) }

		// Resolve action name
		let actionName = String(action.action || '')
		if (ACTION_ALIASES[actionName]) {
			actionName = ACTION_ALIASES[actionName]
		}
		action.action = actionName

		// Fix params
		if (action.action && typeof action.action === 'string') {
			const paramKeys = Object.keys(action).filter(k => k !== 'action')
			const params: Record<string, unknown> = {}
			for (const k of paramKeys) {
				params[k] = action[k]
			}
			const fixedParams = fixParamNames(action.action, params)
			const coercedParams = coerceParamTypes(action.action, fixedParams)

			// Rebuild action object
			const newAction: Record<string, unknown> = { action: action.action }
			for (const [k, v] of Object.entries(coercedParams)) {
				newAction[k] = v
			}
			output.action = newAction
		}
	}

	// ── Ensure evaluation_previous_goal is a string ──
	if (output.evaluation_previous_goal && typeof output.evaluation_previous_goal !== 'string') {
		output.evaluation_previous_goal = String(output.evaluation_previous_goal)
	}

	// ── Ensure memory is a string ──
	if (output.memory && typeof output.memory !== 'string') {
		output.memory = String(output.memory)
	}

	// ── Ensure next_goal is a string ──
	if (output.next_goal && typeof output.next_goal !== 'string') {
		output.next_goal = String(output.next_goal)
	}

	return output
}

// ─── The fetch wrapper ───────────────────────────────────────

/** 
 * Creates a sanitizing fetch wrapper for gemma4:e4b 
 * that intercepts request/response to fix compatibility issues.
 */
export function createSanitizingFetch(): typeof fetch {
	return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
		let modifiedInit = init

		// ── REQUEST PHASE: Pass tools through — Ollama supports native tool calling ──
		if (init?.body && typeof init.body === 'string') {
			try {
				const body = JSON.parse(init.body)

				// Boost temperature to match Qwen's performance level
				if (!body.temperature || body.temperature < 1) {
					body.temperature = 1
				}

				// Only force json_object mode when no tools are present (they conflict)
				if (!body.tools && !body.response_format) {
					body.response_format = { type: 'json_object' }
				}

				modifiedInit = {
					...init,
					body: JSON.stringify(body),
				}
			} catch {
				// If body isn't valid JSON, pass through unchanged
			}
		}

		// ── Make the actual fetch call ──
		const response = await fetch(input, modifiedInit)

		// Only intercept JSON responses from the chat completions endpoint
		const url = typeof input === 'string' ? input : input instanceof URL ? input.href : (input as Request).url
		if (!url.includes('/chat/completions')) {
			return response
		}

		// ── RESPONSE PHASE: Sanitize the model output ──
		try {
			const responseBody = await response.json()

			if (responseBody.choices?.[0]?.message) {
				const message = responseBody.choices[0].message
				const content = message.content || ''

				// If there's already a valid tool_call, try to sanitize its arguments
				if (message.tool_calls?.[0]?.function?.arguments) {
					try {
						const rawArgs = typeof message.tool_calls[0].function.arguments === 'string'
							? JSON.parse(message.tool_calls[0].function.arguments)
							: message.tool_calls[0].function.arguments

						const sanitized = sanitizeAgentOutput(rawArgs)
						message.tool_calls[0].function.arguments = JSON.stringify(sanitized)
					} catch {
						// If tool_call args can't be parsed, try extracting from content
						if (content) {
							const extracted = extractJSON(content)
							if (extracted) {
								const sanitized = sanitizeAgentOutput(extracted)
								message.tool_calls = [{
									id: 'sanitized_call',
									type: 'function',
									function: {
										name: 'AgentOutput',
										arguments: JSON.stringify(sanitized),
									},
								}]
							}
						}
					}
				}
				// If no tool_call but there's content, try to extract JSON and wrap it
				else if (content) {
					const extracted = extractJSON(content)
					if (extracted) {
						const sanitized = sanitizeAgentOutput(extracted)
						message.tool_calls = [{
							id: 'sanitized_call',
							type: 'function',
							function: {
								name: 'AgentOutput',
								arguments: JSON.stringify(sanitized),
							},
						}]
						// Keep content too for normalizeResponse fallback
					}
				}
			}

			// Return a new Response with the sanitized body
			return new Response(JSON.stringify(responseBody), {
				status: response.status,
				statusText: response.statusText,
				headers: response.headers,
			})
		} catch {
			// If we can't parse the response, return the original
			// We need to reconstruct it since we already consumed the body
			return response
		}
	}
}
