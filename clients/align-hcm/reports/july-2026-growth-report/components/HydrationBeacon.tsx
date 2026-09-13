'use client'

import { useEffect } from 'react'

/**
 * Reports that React actually hydrated, which disarms the layout's
 * failsafe timer. If this never runs, the timer applies `.no-js` and
 * every animated block is forced visible.
 */
export function HydrationBeacon() {
  useEffect(() => {
    ;(window as unknown as { __reportHydrated: boolean }).__reportHydrated = true
  }, [])
  return null
}
