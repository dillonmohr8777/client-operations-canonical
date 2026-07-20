const ORIGIN = 'https://bigorange.marketing';
const REQUEST_TIMEOUT_MS = 6500;

const endpoints = {
  home: `${ORIGIN}/`,
  posts: `${ORIGIN}/wp-json/wp/v2/posts?per_page=1&orderby=modified&order=desc&_fields=id,date,modified,link,title,slug,status`,
  pages: `${ORIGIN}/wp-json/wp/v2/pages?per_page=1&_fields=id`,
  postSitemap: `${ORIGIN}/post-sitemap.xml`,
  pageSitemap: `${ORIGIN}/page-sitemap.xml`,
  robots: `${ORIGIN}/robots.txt`,
  mcp: `${ORIGIN}/wp-json/mcp`,
  mcpServer: `${ORIGIN}/wp-json/mcp/mcp-adapter-default-server`,
  yoast: `${ORIGIN}/wp-json/yoast/v1`,
};

const fetchPublic = async (url, options = {}) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const started = Date.now();
  try {
    const response = await fetch(url, {
      ...options,
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        Accept: 'application/json,text/plain,application/xml,text/xml,text/html;q=0.8',
        'User-Agent': 'BigOrange-Public-Pulse/1.0',
        ...(options.headers || {}),
      },
    });
    const body = options.method === 'HEAD' ? '' : await response.text();
    return {
      ok: response.ok,
      status: response.status,
      body,
      headers: response.headers,
      responseMs: Date.now() - started,
    };
  } catch {
    return { ok: false, status: 0, body: '', headers: new Headers(), responseMs: Date.now() - started };
  } finally {
    clearTimeout(timeout);
  }
};

const toCount = (value) => {
  const number = Number.parseInt(value || '0', 10);
  return Number.isFinite(number) ? number : 0;
};

const countLocations = (xml) => (xml.match(/<loc>/gi) || []).length;
const latestLastModified = (xml) => {
  const values = [...xml.matchAll(/<lastmod>([^<]+)<\/lastmod>/gi)].map((match) => match[1]);
  return values.sort().at(-1) || null;
};

const decodeTitle = (value = '') => value
  .replace(/<[^>]*>/g, '')
  .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
  .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
  .replace(/&nbsp;/gi, ' ')
  .replace(/&amp;/gi, '&')
  .replace(/&quot;/gi, '"')
  .replace(/&#039;|&apos;/gi, "'")
  .replace(/\s+/g, ' ')
  .trim();

const parseLatestPost = (body) => {
  try {
    const [post] = JSON.parse(body);
    if (!post) return null;
    const link = new URL(post.link);
    if (link.hostname !== 'bigorange.marketing') return null;
    return {
      title: decodeTitle(post.title?.rendered),
      link: link.toString(),
      publishedAt: post.date || null,
      modifiedAt: post.modified || null,
    };
  } catch {
    return null;
  }
};

const routeNames = (body) => {
  try {
    return Object.keys(JSON.parse(body)?.routes || {});
  } catch {
    return [];
  }
};

const botRulePresent = (robots, bot, directive) => {
  const escaped = bot.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`User-agent:\\s*${escaped}[\\s\\S]{0,900}?${directive}:\\s*\\/`, 'i').test(robots);
};

export const handler = async () => {
  const generatedAt = new Date().toISOString();
  const [home, posts, pages, postSitemap, pageSitemap, robots, mcp, mcpServer, yoast] = await Promise.all([
    fetchPublic(endpoints.home, { method: 'HEAD' }),
    fetchPublic(endpoints.posts),
    fetchPublic(endpoints.pages),
    fetchPublic(endpoints.postSitemap),
    fetchPublic(endpoints.pageSitemap),
    fetchPublic(endpoints.robots),
    fetchPublic(endpoints.mcp),
    fetchPublic(endpoints.mcpServer),
    fetchPublic(endpoints.yoast),
  ]);

  const latestPost = parseLatestPost(posts.body);
  const sitemapPosts = postSitemap.ok ? countLocations(postSitemap.body) : 0;
  const sitemapPages = pageSitemap.ok ? countLocations(pageSitemap.body) : 0;
  const restPosts = toCount(posts.headers.get('x-wp-total'));
  const restPages = toCount(pages.headers.get('x-wp-total'));
  const lastTouchCandidates = [
    latestPost?.modifiedAt,
    postSitemap.ok ? latestLastModified(postSitemap.body) : null,
    pageSitemap.ok ? latestLastModified(pageSitemap.body) : null,
  ].filter(Boolean).sort();

  const searchBotsAllowed = ['OAI-SearchBot', 'PerplexityBot', 'SemrushBot'].every((bot) => botRulePresent(robots.body, bot, 'Allow'));
  const trainingBotsBlocked = ['GPTBot', 'ClaudeBot', 'CCBot'].every((bot) => botRulePresent(robots.body, bot, 'Disallow'));
  const yoastRoutes = routeNames(yoast.body);
  const criticalSources = [home.ok, posts.ok, postSitemap.ok, pageSitemap.ok];
  const sourceCount = [home, posts, pages, postSitemap, pageSitemap, robots, mcp, mcpServer, yoast].filter((source) => source.status > 0).length;

  const payload = {
    mode: 'live_public',
    state: criticalSources.every(Boolean) ? 'live' : criticalSources.some(Boolean) ? 'partial' : 'offline',
    generatedAt,
    refreshSeconds: 60,
    site: {
      online: home.ok,
      status: home.status || null,
      originResponseMs: home.responseMs,
    },
    content: {
      indexableTotal: sitemapPosts + sitemapPages,
      sitemapPosts,
      sitemapPages,
      publishedPosts: restPosts,
      publishedPages: restPages,
      lastContentTouch: lastTouchCandidates.at(-1) || null,
      latestUpdated: latestPost,
    },
    integrations: {
      wordpressRest: posts.ok && pages.ok,
      mcpRouteDiscovered: mcp.ok && mcp.body.includes('mcp-adapter-default-server'),
      mcpServerProtected: mcpServer.status === 401 || mcpServer.status === 403,
      semrushRoutesDiscovered: yoast.ok && yoastRoutes.includes('/yoast/v1/semrush/authenticate') && yoastRoutes.includes('/yoast/v1/semrush/related_keyphrases'),
    },
    robots: {
      searchBotsAllowed,
      trainingBotsBlocked,
      searchExamples: ['OAI-SearchBot', 'PerplexityBot', 'SemrushBot'],
      blockedExamples: ['GPTBot', 'ClaudeBot', 'CCBot'],
    },
    evidence: {
      respondingSources: sourceCount,
      checkedSources: 9,
      privacy: 'Public aggregate and configuration data only. No visitors, leads, form answers, credentials, cookies, or account data.',
    },
  };

  return {
    statusCode: payload.state === 'offline' ? 503 : 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=0, s-maxage=60, stale-while-revalidate=300',
      'Netlify-CDN-Cache-Control': 'public, durable, s-maxage=60, stale-while-revalidate=300',
      'X-Content-Type-Options': 'nosniff',
      'X-Data-Mode': 'live-public',
    },
    body: JSON.stringify(payload),
  };
};
