import type { PlasmoContentScript } from "plasmo"

// Extend Window interface to include custom Chartilyze functions
declare global {
  interface Window {
    chartilyzeExtractPageData: () => {
      url: string
      title: string
      domain: string
      timestamp: string
      selectedText: string
      pageContent: string
    }
  }
}

export const config: PlasmoContentScript = {
  matches: ["<all_urls>"]
}

// Define the page data extraction function
window.chartilyzeExtractPageData = () => {
  return {
    url: window.location.href,
    title: document.title,
    domain: window.location.hostname,
    timestamp: new Date().toISOString(),
    selectedText: getSelectedText(),
    pageContent: getPageSummary()
  }
}

function getSelectedText(): string {
  return window.getSelection()?.toString() || ''
}

function getPageSummary(): string {
  // Get main content, avoiding navigation and ads
  const content = document.querySelector('main, article, .content, #content')?.textContent ||
                 document.body.textContent || ''
  return content.slice(0, 2000) // Limit to 2000 characters
}

// No UI injection - users will click the extension icon instead
export default function ChartilyzeContent() {
  return null
}