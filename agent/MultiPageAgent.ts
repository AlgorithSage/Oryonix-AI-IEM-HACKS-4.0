import { type AgentConfig, PageAgentCore } from '@page-agent/core'

import { RemotePageController } from './RemotePageController'
import { TabsController } from './TabsController'
import SYSTEM_PROMPT from './system_prompt.md?raw'
import { createTabTools } from './tabTools'
import { analyzeScreenshotWithVlm } from './vlmService'

/** Detect user language from browser settings */
function detectLanguage(): 'en-US' | 'zh-CN' {
	const lang = navigator.language || navigator.languages?.[0] || 'en-US'
	return lang.startsWith('zh') ? 'zh-CN' : 'en-US'
}

interface MultiPageAgentConfig extends AgentConfig {
	includeInitialTab?: boolean
	experimentalIncludeAllTabs?: boolean
}

/**
 * MultiPageAgent
 * - use with extension
 * - can be used from a side panel or a content script
 * - integrates VLM visual perception for intelligent DOM assistance
 */
export class MultiPageAgent extends PageAgentCore {
	constructor(config: MultiPageAgentConfig) {
		// multi page controller
		const tabsController = new TabsController()
		const pageController = new RemotePageController(tabsController)
		const customTools = createTabTools(
			tabsController,
			(pixels: number) => pageController.fallbackScroll(pixels),
			(index: number, xPercent: number, yPercent: number) => pageController.clickElementAtOffset(index, xPercent, yPercent),
		)

		// system prompt - auto-detect language if not specified
		const language = config.language ?? detectLanguage()
		const targetLanguage = language === 'zh-CN' ? '中文' : 'English'
		const systemPrompt = SYSTEM_PROMPT.replace(
			/Default working language: \*\*.*?\*\*/,
			`Default working language: **${targetLanguage}**`
		)

		const includeInitialTab = config.includeInitialTab ?? true
		const experimentalIncludeAllTabs = config.experimentalIncludeAllTabs ?? false

		/**
		 * When the agent is in side-panel and user closed the side-panel.
		 * There is no chance for isAgentRunning to be set false.
		 * (unload event doesn't work well in side panel.)
		 * (I'm trying not to use long-lived connection because the lifecycle of a sw is hard to predict.)
		 * This heartbeat mechanism acts as a backup.
		 */
		let heartBeatInterval: null | number = null

		// VLM state tracking
		let previousTabUrl: string = ''
		let lastVlmSummary: string = ''
		let consecutiveErrors: number = 0

		super({
			...config,
			pageController: pageController as any,
			customTools: customTools,
			customSystemPrompt: systemPrompt,

			onBeforeTask: async (agent) => {
				await tabsController.init(agent.task, { includeInitialTab, experimentalIncludeAllTabs })

				heartBeatInterval = setInterval(() => {
					chrome.storage.local.set({
						agentHeartbeat: Date.now(),
					})
				}, 1_000) as any

				await chrome.storage.local.set({
					isAgentRunning: true,
				})

				// Reset VLM state at the start of each task
				previousTabUrl = ''
				lastVlmSummary = ''
				consecutiveErrors = 0
			},

			onAfterTask: async () => {
				if (heartBeatInterval) {
					clearInterval(heartBeatInterval)
					heartBeatInterval = null
				}

				await chrome.storage.local.set({
					isAgentRunning: false,
				})
			},

			onBeforeStep: async (agent) => {
				if (!tabsController.currentTabId) return
				// make sure the current tab is loaded before the step starts
				await tabsController.waitUntilTabLoaded(tabsController.currentTabId!)

				// ─── VLM Visual Perception Pipeline ───────────────────────
				// Determine if VLM analysis should run:
				// 1. On new page navigations (URL changed)
				// 2. On error/bottleneck detection (consecutive failures)
				try {
					const currentTab = await tabsController.getTabInfo(tabsController.currentTabId!)
					const currentUrl = currentTab?.url || ''
					const isNewNavigation = currentUrl !== previousTabUrl && currentUrl !== ''

					// Check if the last step had an error or if we are stuck in an action loop (repeating the same action)
					const lastEvent = agent.history?.[agent.history.length - 1] as any
					const secondLastEvent = agent.history?.[agent.history.length - 2] as any

					const hadError = lastEvent?.type === 'error' ||
						(lastEvent?.reflection?.memory?.toLowerCase()?.includes('fail') ?? false) ||
						(lastEvent?.reflection?.memory?.toLowerCase()?.includes('cannot find') ?? false) ||
						(lastEvent?.reflection?.memory?.toLowerCase()?.includes('not found') ?? false)

					const lastAction = lastEvent?.action?.tool
					const lastArgs = JSON.stringify(lastEvent?.action?.args || {})
					const secondLastAction = secondLastEvent?.action?.tool
					const secondLastArgs = JSON.stringify(secondLastEvent?.action?.args || {})
					const isRepeatingAction = lastAction && lastAction === secondLastAction && lastArgs === secondLastArgs

					if (hadError || isRepeatingAction) {
						consecutiveErrors++
					} else {
						consecutiveErrors = 0
					}

					const shouldRunVlm = isNewNavigation || consecutiveErrors >= 2

					if (shouldRunVlm) {
						console.log(`🔍 [VLM] Triggering visual analysis — ${isNewNavigation ? 'New Navigation' : `Bottleneck (${consecutiveErrors} errors)`}`)

						const screenshot = await pageController.captureScreenshot()
						if (screenshot) {
							// Build context-aware VLM prompt
							let vlmPrompt: string
							if (isNewNavigation) {
								vlmPrompt = `A new page has loaded: "${currentTab.title || currentUrl}".
Analyze this screenshot and provide:
1. CRITICAL — OVERLAY/POPUP CHECK: Is there ANY login modal, signup popup, cookie banner, newsletter overlay, or any floating dialog blocking the main page? If YES, describe it and tell the agent to CLOSE IT FIRST by clicking the X/close button BEFORE doing anything else.
2. SEARCH BAR IDENTIFICATION: Where is the main search bar? Clearly distinguish it from login/email/OTP input fields. Specify its approximate position (e.g., "top center of page").
3. Key interactive elements visible on screen — especially icon-only buttons without text labels.
Keep your response under 150 words. Start with "⚠️ OVERLAY DETECTED:" if a popup is blocking, or "✅ PAGE CLEAR:" if no overlay.`
							} else {
								vlmPrompt = `The agent is STUCK after ${consecutiveErrors} consecutive failures on this page: "${currentTab.title || currentUrl}".
The agent could not find the target element using DOM text parsing alone.
Analyze this screenshot and:
1. CRITICAL: Is a popup, modal, or overlay blocking the page? If yes, the agent MUST close it first.
2. Identify ALL clickable elements visible on screen — especially icon-only buttons, unlabelled controls, or elements hidden behind overlays.
3. Clearly identify the CORRECT input field for the task (distinguish search bars from login/OTP fields).
4. Suggest the exact next action the agent should take.
Keep your response under 150 words.`
							}

							const vlmResult = await analyzeScreenshotWithVlm(screenshot, vlmPrompt)

							const isSuccessful = vlmResult.isBottleneckResolved && 
								!vlmResult.visualSummary.startsWith('VLM Error') && 
								!vlmResult.visualSummary.startsWith('VLM analysis skipped');

							if (isSuccessful) {
								lastVlmSummary = vlmResult.visualSummary
								console.log(`✅ [VLM] Analysis complete (${lastVlmSummary.length} chars)`)

								// Reset error counter after VLM provides guidance
								if (consecutiveErrors >= 2) {
									consecutiveErrors = 0
								}
							} else {
								lastVlmSummary = ''
								console.warn('⚠️ [VLM] Skip injecting VLM context due to error or missing API key')
							}
						}

						previousTabUrl = currentUrl
					}

					// ─── VLM Visual Verification Check ────────────────────────
					// If the agent is about to finish/complete the task, perform a visual check
					let verificationFailedMessage = ''

					const isDoneStep = lastEvent?.reflection?.next_goal?.toLowerCase()?.includes('finish') ||
						lastEvent?.reflection?.next_goal?.toLowerCase()?.includes('complete') ||
						lastEvent?.reflection?.next_goal?.toLowerCase()?.includes('done') ||
						lastEvent?.reflection?.next_goal?.toLowerCase()?.includes('conclude') ||
						lastEvent?.action?.tool === 'done'

					const hasVerifiedThisGoal = lastEvent?.reflection?.memory?.includes('VISUAL VERIFICATION')

					if (isDoneStep && !hasVerifiedThisGoal) {
						console.log('🔍 [VLM] Running task visual completion verification...')
						const screenshot = await pageController.captureScreenshot()
						if (screenshot) {
							const verificationPrompt = `The agent is about to declare this task finished: "${agent.task}".
The agent claims to have completed the following steps: "${lastEvent?.reflection?.memory || 'completed the task'}".
Analyze this screenshot of the current page. Is the task actually visually complete?
Specifically, check if the required text/content is actually written, drawn, or visible on the page (e.g. if the document, input field, or post has the correct text written, or if the drawing is visible on canvas).
Respond with:
"VERIFICATION: PASSED" if everything is visually complete and correct.
"VERIFICATION: FAILED - [Reason why, e.g. the Google Doc is completely blank and empty]" if it is incomplete or missing.
Keep your explanation short under 100 words.`

							const verificationResult = await analyzeScreenshotWithVlm(screenshot, verificationPrompt)
							const vlmResponse = verificationResult.visualSummary

							if (vlmResponse.includes('VERIFICATION: FAILED')) {
								console.warn('❌ [VLM] Task verification FAILED! Injecting correction directive.')
								const reason = vlmResponse.split('VERIFICATION: FAILED -')[1] || vlmResponse
								verificationFailedMessage = `⚠️ VISUAL VERIFICATION FAILED: The visual check shows the task is NOT completed yet. Reason: ${reason.trim()}\nDo NOT finish the task yet. You must focus on the target workspace/document/input area, click it to ensure focus is active, type the text/content again, and verify it is visible before completing.`

								// Reset done flag so the agent knows it's not done yet
								if (lastEvent?.reflection) {
									lastEvent.reflection.next_goal = 'Focus on the input area and type the missing text.'
								}
							} else {
								console.log('✅ [VLM] Task verification PASSED!')
							}
						}
					}

					// ─── Unified Browser State Injection ──────────────────────
					// Single override point for both VLM visual context and verification failures
					if (lastVlmSummary || verificationFailedMessage) {
						const originalGetBrowserState = pageController.getBrowserState.bind(pageController)
						const vlmSnapshot = lastVlmSummary
						const verifyMsg = verificationFailedMessage

						pageController.getBrowserState = async function () {
							const state = await originalGetBrowserState()
							let injectedHeader = ''
							if (verifyMsg) {
								injectedHeader += `[SYSTEM NOTIFICATION]\n${verifyMsg}\n[/SYSTEM NOTIFICATION]\n\n`
							}
							if (vlmSnapshot) {
								injectedHeader += `[VLM VISUAL CONTEXT]\n${vlmSnapshot}\n[/VLM VISUAL CONTEXT]\n\n`
							}
							state.header = injectedHeader + (state.header || '')
							// Restore original method after one use
							pageController.getBrowserState = originalGetBrowserState
							return state
						}
					}

				} catch (vlmError) {
					// VLM errors should never block the main agent loop
					console.warn('⚠️ [VLM] Visual analysis failed (non-blocking):', vlmError)
				}
			},

			onDispose: () => {
				if (heartBeatInterval) {
					clearInterval(heartBeatInterval)
					heartBeatInterval = null
				}

				chrome.storage.local.set({
					isAgentRunning: false,
				})

				tabsController.dispose()
			},
		})
	}
}

