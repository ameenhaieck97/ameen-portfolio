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
        
        # -> Click the 'Skills' link in the header navigation to jump to the Skills section.
        # Skills link
        elem = page.get_by_text('Ameen Haieck', exact=True).locator("xpath=ancestor-or-self::*[.//a][1]").get_by_role('link', name='Skills', exact=True)
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> Verify the Skills section is displayed
        # Assert: The URL contains '#skills', confirming navigation to the Skills anchor.
        await expect(page).to_have_url(re.compile("\\#skills"), timeout=15000), "The URL contains '#skills', confirming navigation to the Skills anchor."
        # Assert: The Skills section content 'Visual identity systems that hold together' is visible.
        await expect(page.locator("xpath=/html/body/main/section[3]/div/div[2]/div[1]/div").nth(0)).to_contain_text("Visual identity systems that hold together", timeout=15000), "The Skills section content 'Visual identity systems that hold together' is visible."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    