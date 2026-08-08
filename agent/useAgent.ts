import type {
	AgentActivity,
	AgentStatus,
	ExecutionResult,
	HistoricalEvent,
	SupportedLanguage,
} from '@page-agent/core'
import type { LLMConfig } from '@page-agent/llms'
import { useCallback, useEffect, useRef, useState } from 'react'
import { DEFAULT_CONFIG, isProxyEndpoint } from './constants'
import { createSanitizingFetch } from './sanitizingFetch'
import { createGeminiFetch } from './geminiFetch'
import { MultiPageAgent } from './MultiPageAgent'

interface AdvancedConfig {
	maxSteps?: number
	systemInstruction?: string
	experimentalLlmsTxt?: boolean
	experimentalIncludeAllTabs?: boolean
	disableNamedToolChoice?: boolean
}

type ExtConfig = LLMConfig &
	AdvancedConfig & {
		language?: SupportedLanguage
	}

export interface UseAgentResult {
	status: AgentStatus
	history: HistoricalEvent[]
	activity: AgentActivity | null
	currentTask: string
	config: ExtConfig | null
	execute: (task: string) => Promise<ExecutionResult>
	stop: () => void
	configure: (config: ExtConfig) => Promise<void>
	reset: () => void
}

export function useAgent(): UseAgentResult {
	const agentRef = useRef<MultiPageAgent | null>(null)
	const [status, setStatus] = useState<AgentStatus>('idle')
	const [history, setHistory] = useState<HistoricalEvent[]>([])
	const [activity, setActivity] = useState<AgentActivity | null>(null)
	const [currentTask, setCurrentTask] = useState('')
	const [config, setConfig] = useState<ExtConfig | null>(null)

	useEffect(() => {
		chrome.storage.local.get(['language', 'advancedConfig']).then((result) => {
			// Always use env-based config (DEFAULT_CONFIG) as the source of truth
			let llmConfig: LLMConfig = { ...DEFAULT_CONFIG }
			const language = (result.language as SupportedLanguage) || undefined
			const advancedConfig = (result.advancedConfig as AdvancedConfig) ?? {}

			// Persist current config to storage
			chrome.storage.local.set({ llmConfig })

			// For local models (Ollama), apply sanitizing fetch and disable named tool choice
			const isLocalModel = llmConfig.baseURL.includes('localhost') || llmConfig.baseURL.includes('127.0.0.1')
			const isGemini = llmConfig.baseURL.includes('generativelanguage.googleapis.com')
			const isProxy = isProxyEndpoint(llmConfig.baseURL)

			if (isLocalModel) {
				llmConfig = { ...llmConfig, disableNamedToolChoice: true, customFetch: createSanitizingFetch() }
			} else if (isGemini) {
				// Route Gemma API through native generateContent endpoint for proper tool calling
				llmConfig = {
					...llmConfig,
					disableNamedToolChoice: true,
					customFetch: createGeminiFetch(llmConfig.apiKey || '', llmConfig.model || ''),
				}
			} else if (isProxy) {
				// For cloud testing proxies: clear apiKey so no Authorization header is sent
				// and use a customFetch that strips any lingering auth headers
				const proxyFetch: typeof fetch = async (input, init) => {
					if (init?.headers) {
						const h = init.headers as Record<string, string>
						const cleaned: Record<string, string> = {}
						for (const [k, v] of Object.entries(h)) {
							if (k.toLowerCase() !== 'authorization') cleaned[k] = v
						}
						return fetch(input, { ...init, headers: cleaned })
					}
					return fetch(input, init)
				}
				llmConfig = { ...llmConfig, apiKey: '', customFetch: proxyFetch }
			}

			setConfig({ ...llmConfig, ...advancedConfig, language })
		})
	}, [])

	useEffect(() => {
		if (!config) return

		const { systemInstruction, ...agentConfig } = config;

		const defaultInstruction = `You are Oryonix AI, a premium autonomous browser copilot. You must navigate the web to solve the user's request.
CRITICAL RULES:
1. TAB MANAGEMENT: ALWAYS try to achieve the user's goal by interacting with the CURRENT TAB first. If you are on a search engine or a page with a search bar, USE THAT SEARCH BAR via \`input_text\` instead of opening a new tab. ONLY use \`open_new_tab\` if you are on a completely blank/irrelevant page and must navigate.
2. COMPLETION: When you complete the task, you MUST return a well-formatted, short summary of your findings and actions to the user using Markdown. Never stop without explaining what you achieved.
3. SCROLLING: When using the \`scroll\` tool, the \`num_pages\` parameter MUST be a number between 0.1 and 10. NEVER set \`num_pages\` greater than 10, or it will throw an error.
4. THINKING: When providing your \`memory\` or \`next_goal\` reflection during execution, write in simple, user-friendly sentences and limit your text to 30 words maximum. The user reads this to know what you are doing.`
		const finalInstruction = systemInstruction ? `${systemInstruction}\n\n${defaultInstruction}` : defaultInstruction

		const agent = new MultiPageAgent({
			...agentConfig,
			instructions: { system: finalInstruction },
		})
		agentRef.current = agent

		const handleStatusChange = (_e: Event) => {
			const newStatus = agent.status as AgentStatus
			setStatus(newStatus)
			if (newStatus === 'idle' || newStatus === 'completed' || newStatus === 'error') {
				setActivity(null)
			}
		}

		const handleHistoryChange = (_e: Event) => {
			setHistory([...agent.history])
		}

		const handleActivity = (e: Event) => {
			const newActivity = (e as CustomEvent).detail as AgentActivity
			setActivity(newActivity)
		}

		agent.addEventListener('statuschange', handleStatusChange)
		agent.addEventListener('historychange', handleHistoryChange)
		agent.addEventListener('activity', handleActivity)

		return () => {
			agent.removeEventListener('statuschange', handleStatusChange)
			agent.removeEventListener('historychange', handleHistoryChange)
			agent.removeEventListener('activity', handleActivity)
			agent.dispose()
		}
	}, [config])

	const execute = useCallback(async (task: string) => {
		const agent = agentRef.current
		console.log('🚀 [useAgent] start executing task:', task)
		if (!agent) throw new Error('Agent not initialized')

		setCurrentTask(task)
		setHistory([])
		return agent.execute(task)
	}, [])

	const stop = useCallback(() => {
		agentRef.current?.stop()
	}, [])

	const configure = useCallback(
		async ({
			language,
			maxSteps,
			systemInstruction,
			experimentalLlmsTxt,
			experimentalIncludeAllTabs,
			disableNamedToolChoice,
			...llmConfig
		}: ExtConfig) => {
			await chrome.storage.local.set({ llmConfig })
			if (language) {
				await chrome.storage.local.set({ language })
			} else {
				await chrome.storage.local.remove('language')
			}
			const advancedConfig: AdvancedConfig = {
				maxSteps,
				systemInstruction,
				experimentalLlmsTxt,
				experimentalIncludeAllTabs,
				disableNamedToolChoice,
			}
			await chrome.storage.local.set({ advancedConfig })
			setConfig({ ...llmConfig, ...advancedConfig, language })
		},
		[]
	)

	const reset = useCallback(() => {
		setStatus('idle')
		setHistory([])
		setActivity(null)
		setCurrentTask('')
	}, [])

	return {
		status,
		history,
		activity,
		currentTask,
		config,
		execute,
		stop,
		configure,
		reset,
	}
}
