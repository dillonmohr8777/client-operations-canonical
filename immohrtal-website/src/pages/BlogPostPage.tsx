import { posts } from '../content/blog'
import { SubPage } from '../components/SubPage'
import { TiltBox } from '../components/TiltBox'

/**
 * A single blog post at its own URL (blog/<slug>.html). The slug is
 * baked into the generated entry HTML as <body data-slug="...">.
 */
export function BlogPostPage() {
  const slug = document.body.dataset.slug
  const idx = Math.max(
    0,
    posts.findIndex((p) => p.slug === slug),
  )
  const post = posts[idx]
  const prev = posts[idx - 1]
  const next = posts[idx + 1]

  return (
    <SubPage tone="dark" base="../">
      <p className="section-eyebrow reveal" data-decode="">
        Blog / {post.tag}
      </p>
      <h1
        className="font-display chrome-text reveal mt-5 uppercase"
        style={{ fontSize: 'clamp(2.4rem, 6.5vw, 4.8rem)', lineHeight: 0.98 }}
      >
        {post.title}
      </h1>
      <p className="mono-tag reveal reveal-late mt-4" style={{ color: 'var(--signal-txt)' }}>
        {post.date} / IMMOHRTAL
      </p>

      <p className="blog-answer reveal reveal-late mt-8 max-w-2xl">{post.answer}</p>

      <div className="mt-12 flex flex-col gap-6">
        {post.sections.map((section, i) => (
          <div key={section.heading} className={`reveal-pop ${i % 2 === 1 ? 'reveal-late' : ''}`}>
            <TiltBox max={3}>
              <section className="blog-section-block sheen">
                <h3 className="font-display uppercase">{section.heading}</h3>
                <div className="mt-4 flex max-w-2xl flex-col gap-4">
                  {section.paragraphs.map((paragraph, j) => (
                    <p key={j}>{paragraph}</p>
                  ))}
                </div>
              </section>
            </TiltBox>
          </div>
        ))}
      </div>

      <div className="reveal reveal-later mt-14 flex flex-col gap-4 sm:flex-row">
        <a className="btn btn-chrome" href="../blog.html">
          Back to the blog
        </a>
        {prev && (
          <a className="btn btn-ghost" href={`./${prev.slug}.html`}>
            Previous entry
          </a>
        )}
        {next && (
          <a className="btn btn-ghost" href={`./${next.slug}.html`}>
            Next entry
          </a>
        )}
      </div>
    </SubPage>
  )
}
