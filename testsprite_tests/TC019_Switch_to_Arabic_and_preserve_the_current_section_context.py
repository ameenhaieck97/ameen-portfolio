import asyncio
import re
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None

    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()

        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",
                "--disable-dev-shm-usage",
                "--ipc=host",
                "--single-process"
            ],
        )

        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        # Wider default timeout to match the agent's DOM-stability budget;
        # auto-waiting Playwright APIs (expect, locator.wait_for) inherit this.
        context.set_default_timeout(15000)

        # Open a new page in the browser context
        page = await context.new_page()

        # Interact with the page elements to simulate user flow
        # -> navigate
        await page.goto("http://localhost:3000")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Click the header language switcher labeled 'EN AR' (Switch to Arabic) to change the site language to Arabic.
        # EN AR link
        elem = page.get_by_text('Contact', exact=True).locator("xpath=ancestor-or-self::*[.//a][1]").get_by_role('link', name='Switch to Arabic', exact=True)
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> Verify Arabic content is displayed
        # Assert: The skip-to-content link displays Arabic text.
        await expect(page.locator("xpath=/html/body/a").nth(0)).to_have_text("\u062a\u062e\u0637\u064e\u0651 \u0625\u0644\u0649 \u0627\u0644\u0645\u062d\u062a\u0648\u0649", timeout=15000), "The skip-to-content link displays Arabic text."
        # Assert: The site title is displayed in Arabic.
        await expect(page.locator("xpath=/html/body/header/div/a").nth(0)).to_have_text("\u0623\u0645\u064a\u0646 \u0627\u0644\u062d\u0627\u064a\u0643", timeout=15000), "The site title is displayed in Arabic."
        # Assert: The header navigation shows Arabic link text.
        await expect(page.locator("xpath=/html/body/header/div/nav/a[1]").nth(0)).to_have_text("\u0646\u0628\u0630\u0629 \u0639\u0646\u064a", timeout=15000), "The header navigation shows Arabic link text."
        current_url = await page.evaluate("() => window.location.href")
        # Assert: page loaded with a URL (final outcome verified by the AI judge during the run)
        assert current_url, 'Page should have loaded with a URL'
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    