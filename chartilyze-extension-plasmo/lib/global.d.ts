interface PageData {
  url: string
  title: string
  domain: string
  timestamp: string
  selectedText: string
  pageContent: string
}

declare global {
  interface Window {
    chartilyzeExtractPageData: () => PageData
  }
}

export {}