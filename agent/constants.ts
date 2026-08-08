import type { LLMConfig } from '@page-agent/llms'

// ─── LLM Config from Environment Variables ───────────────────
// Values are loaded from .env file (VITE_ prefix required for Vite/WXT)
// Fallbacks to local Ollama if .env is not configured
export const DEFAULT_MODEL = import.meta.env.VITE_LLM_MODEL_NAME || 'qwen3.5-plus'
export const DEFAULT_BASE_URL = import.meta.env.VITE_LLM_BASE_URL || 'https://page-ag-testing-ohftxirgbn.cn-shanghai.fcapp.run'
export const DEFAULT_API_KEY = import.meta.env.VITE_LLM_API_KEY || 'NA'

export const DEFAULT_CONFIG: LLMConfig = {
	baseURL: DEFAULT_BASE_URL,
	model: DEFAULT_MODEL,
	apiKey: DEFAULT_API_KEY,
}

/** Legacy proxy endpoints that should be auto-migrated to DEFAULT_BASE_URL */
const LEGACY_PROXY_ENDPOINTS = [
	'https://hwcxiuzfylggtcktqgij.supabase.co/functions/v1/llm-testing-proxy',
]

export function isProxyEndpoint(url: string): boolean {
	const normalized = url.replace(/\/+$/, '')
	return normalized === DEFAULT_BASE_URL || LEGACY_PROXY_ENDPOINTS.some((ep) => normalized === ep)
}

