/**
 * content script for RemotePageController
 */
import type { PageController as PageControllerType } from '@page-agent/page-controller'

export function initPageController() {
	let pageController: PageControllerType | null = null
	let intervalID: number | null = null

	const myTabIdPromise = chrome.runtime
		.sendMessage({ type: 'PAGE_CONTROL', action: 'get_my_tab_id' })
		.then((response) => {
			return (response as { tabId: number | null }).tabId
		})
		.catch((error) => {
			console.error('[RemotePageController.ContentScript]: Failed to get my tab id', error)
			return null
		})

	async function getPCPromise(): Promise<PageControllerType> {
		if (!pageController) {
			const { PageController } = await import('@page-agent/page-controller')
			pageController = new PageController({
				enableMask: false,
				viewportExpansion: 400,
			})
		}
		return pageController
	}

	intervalID = window.setInterval(async () => {
		// Extension was reloaded — stop the interval immediately to prevent
		// "Extension context invalidated" errors flooding the console.
		if (!chrome.runtime?.id) {
			if (intervalID !== null) window.clearInterval(intervalID)
			return
		}

		try {
			const agentHeartbeat = (await chrome.storage.local.get('agentHeartbeat')).agentHeartbeat
			const now = Date.now()
			const agentInTouch = typeof agentHeartbeat === 'number' && now - agentHeartbeat < 2_000

			const isAgentRunning = (await chrome.storage.local.get('isAgentRunning')).isAgentRunning
			const currentTabId = (await chrome.storage.local.get('currentTabId')).currentTabId

			const shouldShowMask = isAgentRunning && agentInTouch && currentTabId === (await myTabIdPromise)

			if (shouldShowMask) {
				const pc = await getPCPromise()
				pc.initMask()
				await pc.showMask()
			} else {
				if (pageController) {
					pageController.hideMask()
					pageController.cleanUpHighlights()
				}
			}

			if (!isAgentRunning && agentInTouch) {
				if (pageController) {
					pageController.dispose()
					pageController = null
				}
			}
		} catch (error) {
			if (error instanceof Error && error.message.includes('Extension context invalidated')) {
				if (intervalID !== null) window.clearInterval(intervalID)
			}
		}
	}, 500)

	chrome.runtime.onMessage.addListener((message, sender, sendResponse): true | undefined => {
		if (message.type !== 'PAGE_CONTROL') {
			return
		}

		const { action, payload } = message
		const methodName = getMethodName(action)

		getPCPromise().then((pc: any) => {
			switch (action) {
				case 'get_last_update_time':
				case 'get_browser_state':
				case 'update_tree':
				case 'clean_up_highlights':
				case 'click_element':
				case 'select_option':
				case 'scroll':
				case 'scroll_horizontally':
					pc[methodName](...(payload || []))
						.then((result: any) => sendResponse(result))
						.catch((error: any) =>
							sendResponse({
								success: false,
								error: error instanceof Error ? error.message : String(error),
							})
						)
					break

				case 'fallback_scroll': {
					const pixels = (payload || [])[0] ?? 0
					window.scrollBy(0, pixels)
					sendResponse({ success: true, message: `Scrolled by ${pixels}px` })
					break
				}

				case 'input_text': {
					const isGoogleSheets = window.location.hostname.includes('docs.google.com') && window.location.pathname.includes('/spreadsheets')

					if (isGoogleSheets) {
						console.log('[Sheets] Intercepting input_text — blocking blur, redirecting cursor to cell')

						// Auto-dismiss blocking dialogs
						try {
							const btns = document.querySelectorAll('button, [role="button"]')
							for (const b of btns) {
								const t = (b as HTMLElement).textContent?.trim().toLowerCase()
								if (t === 'got it' || t === 'dismiss' || t === 'no thanks') {
									(b as HTMLElement).click()
									break
								}
							}
						} catch (_) {}

						// Helper: get cell position from Name Box value or active cell overlay
						function getCellPosition(cellRef: string): DOMRect | null {
							const activeCell = document.querySelector('.active-cell-border, [class*="cell-border"]') as HTMLElement
							if (activeCell) {
								const rect = activeCell.getBoundingClientRect()
								if (rect.width > 0 && rect.height > 0) return rect
							}
							const match = cellRef.match(/^([A-Z]+)(\d+)$/)
							if (match) {
								const colIdx = match[1].charCodeAt(0) - 65
								const rowIdx = parseInt(match[2]) - 1
								const x = 32 + colIdx * 100
								const y = 105 + rowIdx * 21
								return new DOMRect(x, y, 100, 21)
							}
							return null
						}

						// Read current cell BEFORE typing
						let currentCellRef = ''
						try {
							const nameBox = document.querySelector('#t-name-box, .docs-name-input, [class*="name-box"]') as HTMLInputElement
							if (nameBox) currentCellRef = nameBox.value || ''
						} catch (_) {}
						const cellRect = getCellPosition(currentCellRef)

						// Override getBoundingClientRect on the target element so the library's
						// clickElement() computes CELL coordinates for the cursor, not formula bar
						let targetElement: HTMLElement | null = null
						let origGetBCR: (() => DOMRect) | null = null
						if (cellRect) {
							try {
								const node = pc.selectorMap?.get((payload || [])[0])
								if (node?.ref) {
									targetElement = node.ref as HTMLElement
									origGetBCR = targetElement.getBoundingClientRect.bind(targetElement)
									targetElement.getBoundingClientRect = () => cellRect
								}
							} catch (_) {}
						}

						// Block blur
						const origBlur = HTMLElement.prototype.blur
						HTMLElement.prototype.blur = function () {}

						pc[methodName](...(payload || []))
							.then(async (result: any) => {
								// Restore everything
								HTMLElement.prototype.blur = origBlur
								if (targetElement && origGetBCR) {
									targetElement.getBoundingClientRect = origGetBCR
								}

								await new Promise(r => setTimeout(r, 150))

								// Dispatch Enter to commit
								let target: HTMLElement | null = document.activeElement as HTMLElement
								try {
									const node = pc.selectorMap?.get((payload || [])[0])
									if (node?.ref) target = node.ref as HTMLElement
								} catch (_) {}

								const enterOpts = {
									key: 'Enter', code: 'Enter',
									keyCode: 13, which: 13,
									bubbles: true, cancelable: true
								}
								for (const el of [target, document.activeElement as HTMLElement].filter(Boolean)) {
									el!.dispatchEvent(new KeyboardEvent('keydown', enterOpts))
									el!.dispatchEvent(new KeyboardEvent('keypress', enterOpts))
									el!.dispatchEvent(new KeyboardEvent('keyup', enterOpts))
								}

								// Wait for commit
								await new Promise(r => setTimeout(r, 500))

								// Move cursor to the NEXT cell (after Enter moved selection down)
								try {
									let nextRef = ''
									const nb = document.querySelector('#t-name-box, .docs-name-input, [class*="name-box"]') as HTMLInputElement
									if (nb) nextRef = nb.value || ''
									const nextRect = getCellPosition(nextRef)
									if (nextRect) {
										window.dispatchEvent(new CustomEvent('PageAgent::MovePointerTo', {
											detail: { x: nextRect.left + nextRect.width / 2, y: nextRect.top + nextRect.height / 2 }
										}))
									}
								} catch (_) {}

								sendResponse({
									success: true,
									message: `✅ Typed "${(payload || [])[1]}" and pressed Enter in Google Sheets.`
								})
							})
							.catch((error: any) => {
								HTMLElement.prototype.blur = origBlur
								if (targetElement && origGetBCR) {
									targetElement.getBoundingClientRect = origGetBCR
								}
								sendResponse({
									success: false,
									error: error instanceof Error ? error.message : String(error),
								})
							})
					} else if (window.location.hostname.includes('docs.google.com') && window.location.pathname.includes('/document')) {
						console.log('[Google Docs] Intercepting input_text — focusing event target');
						(async () => {
							const target = document.querySelector('.docs-texteventtarget, [class*="texteventtarget"]') as HTMLElement
							if (target) {
								target.focus()
								await new Promise(r => setTimeout(r, 100))

								const text = (payload || [])[1] ?? ''

								// Dispatch standard textInput event first
								const textInputEvent = new CustomEvent('textInput', {
									bubbles: true,
									cancelable: true,
								}) as any
								textInputEvent.data = text
								target.dispatchEvent(textInputEvent)

								// Trigger fallback keyboard sequence to ensure rich editor registers characters
								for (let i = 0; i < text.length; i++) {
									const char = text[i]
									const keydown = new KeyboardEvent('keydown', {
										key: char,
										code: char === ' ' ? 'Space' : `Key${char.toUpperCase()}`,
										bubbles: true,
										cancelable: true,
									})
									target.dispatchEvent(keydown)

									const beforeinput = new InputEvent('beforeinput', {
										data: char,
										inputType: 'insertText',
										bubbles: true,
										cancelable: true,
									})
									target.dispatchEvent(beforeinput)

									if (target instanceof HTMLTextAreaElement) {
										const start = target.selectionStart || 0
										const end = target.selectionEnd || 0
										const val = target.value
										target.value = val.substring(0, start) + char + val.substring(end)
										target.selectionStart = target.selectionEnd = start + 1
										target.dispatchEvent(new Event('input', { bubbles: true }))
									}

									const keypress = new KeyboardEvent('keypress', {
										key: char,
										bubbles: true,
										cancelable: true,
									})
									target.dispatchEvent(keypress)

									const keyup = new KeyboardEvent('keyup', {
										key: char,
										bubbles: true,
										cancelable: true,
									})
									target.dispatchEvent(keyup)
								}

								sendResponse({ success: true, message: `✅ Injected text into Google Doc editor.` })
							} else {
								sendResponse({ success: false, error: 'Could not locate Google Docs text editor target.' })
							}
						})();
					} else {
						// Generic contenteditable / rich-text editor injection.
						// Covers Notion, Slack, Trello, Confluence, Gmail, Asana, Linear,
						// and any ProseMirror/Slate/Draft.js/Quill-based editor — anything
						// that isn't a plain <input>/<textarea> but exposes contenteditable.
						let ceTarget: HTMLElement | null = null
						try {
							const node = pc.selectorMap?.get((payload || [])[0])
							const ref = node?.ref as HTMLElement | undefined
							if (ref) {
								const editableAncestor = ref.closest('[contenteditable="true"], [contenteditable=""]') as HTMLElement | null
								if (ref.isContentEditable || editableAncestor) {
									ceTarget = editableAncestor || ref
								}
							}
						} catch (_) {}

						if (ceTarget) {
							console.log('[Generic RichText] Intercepting input_text — contenteditable target detected')
							const target = ceTarget
							;(async () => {
								const text = (payload || [])[1] ?? ''
								target.focus()
								await new Promise((r) => setTimeout(r, 50))

								let inserted = false
								try {
									inserted = document.execCommand('insertText', false, text)
								} catch (_) {
									inserted = false
								}

								if (!inserted || !(target.textContent || '').includes(text)) {
									// Fallback: manual Selection/Range insertion with full event simulation,
									// for editors that block execCommand or intercept beforeinput.
									for (let i = 0; i < text.length; i++) {
										const char = text[i]
										target.dispatchEvent(new KeyboardEvent('keydown', { key: char, bubbles: true, cancelable: true }))
										target.dispatchEvent(
											new InputEvent('beforeinput', { data: char, inputType: 'insertText', bubbles: true, cancelable: true })
										)

										const selection = window.getSelection()
										if (selection && selection.rangeCount > 0) {
											const range = selection.getRangeAt(0)
											range.deleteContents()
											const textNode = document.createTextNode(char)
											range.insertNode(textNode)
											range.setStartAfter(textNode)
											range.setEndAfter(textNode)
											selection.removeAllRanges()
											selection.addRange(range)
										} else {
											target.appendChild(document.createTextNode(char))
										}

										target.dispatchEvent(new InputEvent('input', { data: char, inputType: 'insertText', bubbles: true, cancelable: true }))
										target.dispatchEvent(new KeyboardEvent('keypress', { key: char, bubbles: true, cancelable: true }))
										target.dispatchEvent(new KeyboardEvent('keyup', { key: char, bubbles: true, cancelable: true }))
									}
								} else {
									target.dispatchEvent(new Event('input', { bubbles: true }))
								}

								sendResponse({ success: true, message: `✅ Injected text into rich text editor.` })
							})()
						} else {
							pc[methodName](...(payload || []))
								.then((result: any) => sendResponse(result))
								.catch((error: any) =>
									sendResponse({
										success: false,
										error: error instanceof Error ? error.message : String(error),
									})
								)
						}
					}
					break
				}

				case 'click_element_at_offset': {
					const [index, xPercent, yPercent] = payload || []
					const node = pc.selectorMap?.get(index)
					if (node?.ref) {
						const rect = (node.ref as HTMLElement).getBoundingClientRect()
						const clientX = rect.left + rect.width * xPercent
						const clientY = rect.top + rect.height * yPercent
						const eventInit = {
							bubbles: true,
							cancelable: true,
							clientX,
							clientY,
							view: window,
						}
						const el = document.elementFromPoint(clientX, clientY) || (node.ref as HTMLElement)
						el.dispatchEvent(new MouseEvent('mousedown', eventInit))
						el.dispatchEvent(new MouseEvent('mouseup', eventInit))
						el.dispatchEvent(new MouseEvent('click', eventInit))
						sendResponse({ success: true, message: `Clicked element at offset (${xPercent}, ${yPercent})` })
					} else {
						sendResponse({ success: false, error: 'Element not found' })
					}
					break
				}

				default:
					sendResponse({
						success: false,
						error: `Unknown PAGE_CONTROL action: ${action}`,
					})
			}
		});

		return true
	})
}

function getMethodName(action: string): string {
	switch (action) {
		case 'get_last_update_time':
			return 'getLastUpdateTime' as const
		case 'get_browser_state':
			return 'getBrowserState' as const
		case 'update_tree':
			return 'updateTree' as const
		case 'clean_up_highlights':
			return 'cleanUpHighlights' as const

		// DOM actions

		case 'click_element':
			return 'clickElement' as const
		case 'input_text':
			return 'inputText' as const
		case 'select_option':
			return 'selectOption' as const
		case 'scroll':
			return 'scroll' as const
		case 'scroll_horizontally':
			return 'scrollHorizontally' as const

		default:
			return action
	}
}

