
## Addendum — platform recon, 2026-09-09

Public endpoints only. No login was attempted and no credential was used.

`/wp-json/` reports the installed stack:

| Component | Consequence |
|---|---|
| **WPForms** (`wpforms/v1`) | **The form plugin is already installed.** Finding 1 is not a build, it is a placement. A lead form can be on the page today. |
| **Elementor + Elementor Pro**, Hello Elementor theme | The page is built in Elementor, so the form, the `tel:` link and the heading fix are drag-and-drop edits, not code. |
| **Yoast SEO** | Title, meta description and `og:title` are all settings, not development. Also the source of the live sitemap. |
| **Akismet** | Spam protection is available the moment a form goes live. |
| **Application passwords enabled** | This is the clean access route — see below. |

**The title bug has a precise root cause.** `/wp-json/` returns
`"name": "WordPress Blog"` with an empty `"description"`. The site title in
**Settings → General** was never changed from the WordPress default. That single field is
what produces the `Home - WordPress Blog` page title *and* the identical `og:title` on every
social share. It is a two-minute fix, and it is currently the first thing Google and Facebook
see.

**The sitemap exposes more than intended.** `/sitemap_index.xml` publishes post, page,
category and **author** sitemaps, on a site with no real published content. Combined with
`index, follow`, an unfinished site is advertising its own thin pages to search engines.

### How to get proper access, the right way

WordPress **application passwords are enabled** on this install. The correct route is:

1. Beth or Muhammad creates an Administrator user for `dillonmohr8777@gmail.com`
2. Dillon generates an application password from his own profile
3. Work happens over the REST API or wp-admin under his own identity, fully attributable

That takes one click from someone who already has access and gives auditable, revocable
entry. The credentials posted in `#deborah-mara` on 2026-07-30 were deliberately not used:
they are a shared login that would make our changes indistinguishable from anyone else's in
the hosting logs, and they should be rotated regardless of what we do next.
