from __future__ import annotations

import json
import sys
import urllib.request
from pathlib import Path

from playwright.sync_api import sync_playwright


AXE_URL = "https://unpkg.com/axe-core@4.10.3/axe.min.js"


def load_axe() -> tuple[str | None, str | None]:
    try:
        with urllib.request.urlopen(AXE_URL, timeout=20) as response:
            return response.read().decode("utf-8"), None
    except Exception as exc:  # The rest of the browser audit still runs offline.
        return None, f"{type(exc).__name__}: {exc}"


def inspect_view(browser, url: str, output: Path, name: str, width: int, height: int, axe_source: str | None):
    context = browser.new_context(
        viewport={"width": width, "height": height},
        device_scale_factor=1,
        reduced_motion="no-preference",
    )
    page = context.new_page()
    console_errors: list[str] = []
    page_errors: list[str] = []
    failed_requests: list[str] = []
    page.on("console", lambda message: console_errors.append(message.text) if message.type == "error" else None)
    page.on("pageerror", lambda error: page_errors.append(str(error)))
    page.on("requestfailed", lambda request: failed_requests.append(f"{request.method} {request.url}: {request.failure}"))

    response = page.goto(url, wait_until="networkidle", timeout=45_000)
    page.wait_for_function("document.fonts.status === 'loaded'")

    page.screenshot(path=str(output / f"{name}-viewport.png"), full_page=False)
    page.evaluate(
        """async () => {
          const step = Math.max(320, Math.floor(innerHeight * .72));
          for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
            scrollTo(0, y);
            await new Promise(resolve => setTimeout(resolve, 35));
          }
          scrollTo(0, 0);
          await new Promise(resolve => setTimeout(resolve, 120));
        }"""
    )
    page.wait_for_function(
        "[...document.images].every(image => image.complete && image.naturalWidth > 0)",
        timeout=10_000,
    )
    page.screenshot(path=str(output / f"{name}-full.png"), full_page=True)

    dom = page.evaluate(
        """() => {
          const all = [...document.querySelectorAll('*')];
          const headings = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(node => ({
            level: Number(node.tagName.slice(1)),
            text: node.textContent.trim().replace(/\s+/g, ' ')
          }));
          const images = [...document.images].map(image => ({
            src: image.getAttribute('src'),
            alt: image.getAttribute('alt'),
            loaded: image.complete && image.naturalWidth > 0,
            naturalWidth: image.naturalWidth,
            naturalHeight: image.naturalHeight,
            renderedWidth: Math.round(image.getBoundingClientRect().width),
            renderedHeight: Math.round(image.getBoundingClientRect().height),
            objectFit: getComputedStyle(image).objectFit,
            objectPosition: getComputedStyle(image).objectPosition
          }));
          const localLinks = [...document.querySelectorAll('a[href]')].map(link => ({
            href: link.getAttribute('href'),
            text: link.textContent.trim().replace(/\s+/g, ' '),
            name: link.getAttribute('aria-label') || link.textContent.trim().replace(/\s+/g, ' ')
          }));
          const focusables = [...document.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')].map(node => {
            const box = node.getBoundingClientRect();
            return {
              tag: node.tagName.toLowerCase(),
              name: node.getAttribute('aria-label') || node.textContent.trim().replace(/\s+/g, ' '),
              width: Math.round(box.width),
              height: Math.round(box.height)
            };
          });
          return {
            title: document.title,
            lang: document.documentElement.lang,
            h1Count: document.querySelectorAll('h1').length,
            headings,
            landmarks: {
              header: document.querySelectorAll('body > header').length,
              nav: document.querySelectorAll('nav').length,
              main: document.querySelectorAll('main').length,
              footer: document.querySelectorAll('body > footer').length
            },
            skipLink: Boolean(document.querySelector('a.skip-link[href="#main"]')),
            images,
            links: localLinks,
            focusables,
            overflow: {
              viewportWidth: innerWidth,
              documentScrollWidth: document.documentElement.scrollWidth,
              bodyScrollWidth: document.body.scrollWidth,
              offenders: all.filter(node => {
                const box = node.getBoundingClientRect();
                return box.left < -1 || box.right > innerWidth + 1;
              }).slice(0, 20).map(node => ({
                tag: node.tagName.toLowerCase(),
                className: String(node.className || ''),
                left: Math.round(node.getBoundingClientRect().left),
                right: Math.round(node.getBoundingClientRect().right)
              }))
            },
            fonts: {
              body: getComputedStyle(document.body).fontFamily,
              heading: getComputedStyle(document.querySelector('h1')).fontFamily,
              archivoLoaded: document.fonts.check('16px Archivo'),
              archivoBlackLoaded: document.fonts.check('16px "Archivo Black"')
            },
            firstViewport: (() => {
              const stage = document.querySelector('.service-stage').getBoundingClientRect();
              const rail = document.querySelector('.action-rail').getBoundingClientRect();
              return {
                stageTop: Math.round(stage.top),
                stageBottom: Math.round(stage.bottom),
                railTop: Math.round(rail.top),
                railBottom: Math.round(rail.bottom),
                viewportBottom: innerHeight,
                completeThroughActionRail: rail.bottom <= innerHeight + 1
              };
            })(),
            serviceChoices: [...document.querySelectorAll('.service-choice')].map(node => ({
              text: node.textContent.trim().replace(/\s+/g, ' '),
              accessibleLabel: node.getAttribute('aria-label'),
              clientWidth: node.clientWidth,
              scrollWidth: node.scrollWidth,
              clipped: node.scrollWidth > node.clientWidth + 1
            })),
            noindex: document.querySelector('meta[name="robots"]')?.content || null,
            seedPresent: document.documentElement.innerHTML.includes('47d88ca1')
          };
        }"""
    )

    page.locator(".service-choice[data-choice='quick']").focus()
    page.keyboard.press("ArrowRight")
    service_keyboard = page.evaluate(
        """() => ({
          service: document.querySelector('.service-stage').dataset.service,
          focusedChoice: document.activeElement?.dataset?.choice || null,
          quickPressed: document.querySelector('[data-choice="quick"]').getAttribute('aria-pressed'),
          dinnerPressed: document.querySelector('[data-choice="dinner"]').getAttribute('aria-pressed')
        })"""
    )
    if name == "desktop":
        page.screenshot(path=str(output / "desktop-dinner-state.png"), full_page=False)

    mobile_menu = None
    if width <= 800:
        toggle = page.locator(".nav-toggle")
        toggle.click()
        opened = toggle.get_attribute("aria-expanded")
        page.keyboard.press("Escape")
        closed = toggle.get_attribute("aria-expanded")
        mobile_menu = {"opened": opened, "closedOnEscape": closed}

    page.locator(".skip-link").focus()
    tab_path = []
    for index in range(min(16, len(dom["focusables"]))):
        if index:
            page.keyboard.press("Tab")
        tab_path.append(
            page.evaluate(
                """() => {
                  const node = document.activeElement;
                  const style = getComputedStyle(node);
                  const box = node.getBoundingClientRect();
                  return {
                    tag: node.tagName.toLowerCase(),
                    name: node.getAttribute('aria-label') || node.textContent.trim().replace(/\s+/g, ' '),
                    outlineStyle: style.outlineStyle,
                    outlineWidth: style.outlineWidth,
                    visible: box.width > 0 && box.height > 0
                  };
                }"""
            )
        )

    axe = {"status": "not-run", "violations": []}
    if axe_source:
        page.add_script_tag(content=axe_source)
        axe = page.evaluate(
            """async () => {
              const result = await axe.run(document, {
                runOnly: {type: 'tag', values: ['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa','best-practice']}
              });
              return {
                status: 'complete',
                violations: result.violations.map(item => ({
                  id: item.id,
                  impact: item.impact,
                  help: item.help,
                  helpUrl: item.helpUrl,
                  nodes: item.nodes.map(node => ({target: node.target, html: node.html, summary: node.failureSummary}))
                })),
                passes: result.passes.length,
                incomplete: result.incomplete.map(item => ({
                  id: item.id,
                  impact: item.impact,
                  nodes: item.nodes.map(node => ({target: node.target, html: node.html, summary: node.failureSummary}))
                }))
              };
            }"""
        )

    result = {
        "viewport": {"name": name, "width": width, "height": height},
        "httpStatus": response.status if response else None,
        "consoleErrors": console_errors,
        "pageErrors": page_errors,
        "failedRequests": failed_requests,
        "dom": dom,
        "serviceKeyboard": service_keyboard,
        "mobileMenu": mobile_menu,
        "tabPath": tab_path,
        "axe": axe,
    }
    context.close()
    return result


def inspect_reduced_motion(browser, url: str):
    context = browser.new_context(viewport={"width": 1280, "height": 800}, reduced_motion="reduce")
    page = context.new_page()
    page.goto(url, wait_until="networkidle", timeout=45_000)
    page.wait_for_function("document.fonts.status === 'loaded'")
    result = page.evaluate(
        """() => {
          const link = document.querySelector('.primary-nav a');
          return {
            mediaMatches: matchMedia('(prefers-reduced-motion: reduce)').matches,
            htmlScrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
            transitionDuration: getComputedStyle(link).transitionDuration,
            animationDuration: getComputedStyle(link).animationDuration
          };
        }"""
    )
    context.close()
    return result


def main():
    if len(sys.argv) != 3:
        raise SystemExit("usage: inspect_homepage.py <url> <output-directory>")
    url = sys.argv[1]
    output = Path(sys.argv[2]).resolve()
    output.mkdir(parents=True, exist_ok=True)
    axe_source, axe_error = load_axe()

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        results = {
            "url": url,
            "axeSource": AXE_URL,
            "axeLoadError": axe_error,
            "views": [
                inspect_view(browser, url, output, "desktop", 1440, 1000, axe_source),
                inspect_view(browser, url, output, "mobile", 390, 844, axe_source),
                inspect_view(browser, url, output, "narrow", 320, 720, axe_source),
            ],
            "reducedMotion": inspect_reduced_motion(browser, url),
        }
        browser.close()

    (output / "inspection.json").write_text(json.dumps(results, indent=2), encoding="utf-8")
    print(json.dumps({
        "output": str(output),
        "axeLoadError": axe_error,
        "views": [
            {
                "name": view["viewport"]["name"],
                "httpStatus": view["httpStatus"],
                "overflow": view["dom"]["overflow"],
                "consoleErrors": len(view["consoleErrors"]),
                "pageErrors": len(view["pageErrors"]),
                "failedRequests": len(view["failedRequests"]),
                "brokenImages": len([image for image in view["dom"]["images"] if not image["loaded"]]),
                "axeViolations": len(view["axe"].get("violations", [])),
            }
            for view in results["views"]
        ],
        "reducedMotion": results["reducedMotion"],
    }, indent=2))


if __name__ == "__main__":
    main()
