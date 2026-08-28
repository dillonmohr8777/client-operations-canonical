import type { ReactNode } from 'react'
import { useAfterHours } from '../hooks/useAfterHours'
import { useReveal } from '../hooks/useReveal'
import { Nav } from './Nav'
import { Footer } from './Contact'

/**
 * Shared shell for About / Blog / Contact — lighter than the home
 * page: static gradient backdrop instead of the WebGL world.
 */
export function SubPage({
  children,
  tone = 'light',
  base = './',
}: {
  children: ReactNode
  tone?: 'light' | 'dark'
  /** relative path back to the site root, '../' from /blog/ pages */
  base?: string
}) {
  useReveal()
  const { dark } = useAfterHours()
  return (
    <div className={`grain ${tone === 'dark' || dark ? 'page-dark' : ''}`}>
      <div aria-hidden="true" className="stage-fallback" />
      <Nav home={false} base={base} />
      <main className="relative z-10 mx-auto min-h-[80svh] w-full max-w-4xl px-5 pb-24 pt-36">{children}</main>
      <Footer base={base} />
    </div>
  )
}
