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
        
        # -> Click the language switcher labeled 'EN AR' (aria-label: 'Switch to Arabic') in the header to switch the site to Arabic.
        # EN AR link
        elem = page.get_by_text('Contact', exact=True).locator("xpath=ancestor-or-self::*[.//a][1]").get_by_role('link', name='Switch to Arabic', exact=True)
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> Verify the site content is displayed in Arabic
        # Assert: Page URL contains '/ar', indicating the Arabic site is loaded.
        await expect(page).to_have_url(re.compile("/ar"), timeout=15000), "Page URL contains '/ar', indicating the Arabic site is loaded."
        # Assert: Header brand text is displayed in Arabic ('أمين الحايك').
        await expect(page.locator("xpath=/html/body/header/div/a").nth(0)).to_have_text("\u0623\u0645\u064a\u0646 \u0627\u0644\u062d\u0627\u064a\u0643", timeout=15000), "Header brand text is displayed in Arabic ('\u0623\u0645\u064a\u0646 \u0627\u0644\u062d\u0627\u064a\u0643')."
        # Assert: Primary navigation link text is displayed in Arabic ('نبذة عني').
        await expect(page.locator("xpath=/html/body/header/div/nav/a[1]").nth(0)).to_have_text("\u0646\u0628\u0630\u0629 \u0639\u0646\u064a", timeout=15000), "Primary navigation link text is displayed in Arabic ('\u0646\u0628\u0630\u0629 \u0639\u0646\u064a')."
        
        # --> Verify RTL layout is applied
        # Assert: Header element has dir='rtl', confirming RTL layout is applied.
        await expect(page.locator("xpath=/html/body/header").nth(0)).to_have_attribute("dir", "rtl", timeout=15000), "Header element has dir='rtl', confirming RTL layout is applied."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    