'use client'

import NextTopLoader from 'nextjs-toploader'
import { useEffect } from 'react'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

export default function GlobalLoader() {
  useEffect(() => {
    const originalFetch = window.fetch

    window.fetch = async (...args) => {
      NProgress.start()
      try {
        const response = await originalFetch(...args)
        return response
      } finally {
        NProgress.done()
      }
    }

    return () => {
      window.fetch = originalFetch
    }
  }, [])

  return (
    <NextTopLoader
      color="hsl(var(--primary))"
      height={3}
      showSpinner={false}
      crawl
      easing="ease"
      speed={250}
      shadow="0 0 10px hsl(var(--primary))"
    />
  )
}
