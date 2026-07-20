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
        
        # --> Assertions to verify final state
        
        # --> Verify the English portfolio landing page is displayed
        # Assert: The page URL contains '/en', indicating the English locale.
        await expect(page).to_have_url(re.compile("/en"), timeout=15000), "The page URL contains '/en', indicating the English locale."
        await page.locator("xpath=/html/body/main/section[1]/div[2]/div/div[1]/span[2]").nth(0).scroll_into_view_if_needed()
        # Assert: The hero tagline 'Available for new projects' is visible.
        await expect(page.locator("xpath=/html/body/main/section[1]/div[2]/div/div[1]/span[2]").nth(0)).to_be_visible(timeout=15000), "The hero tagline 'Available for new projects' is visible."
        await page.locator("xpath=/html/body/main/section[1]/div[2]/div/div[5]/div[1]/a").nth(0).scroll_into_view_if_needed()
        # Assert: The hero call-to-action 'View Portfolio' is visible.
        await expect(page.locator("xpath=/html/body/main/section[1]/div[2]/div/div[5]/div[1]/a").nth(0)).to_be_visible(timeout=15000), "The hero call-to-action 'View Portfolio' is visible."
        
        # --> Verify the hero section is visible
        await page.locator("xpath=/html/body/main/section[1]/div[2]/div/div[5]/div[1]/a").nth(0).scroll_into_view_if_needed()
        # Assert: The 'View Portfolio' CTA in the hero is visible.
        await expect(page.locator("xpath=/html/body/main/section[1]/div[2]/div/div[5]/div[1]/a").nth(0)).to_be_visible(timeout=15000), "The 'View Portfolio' CTA in the hero is visible."
        await page.locator("xpath=/html/body/main/section[1]/div[2]/div/div[5]/div[2]/a").nth(0).scroll_into_view_if_needed()
        # Assert: The 'Contact Me' CTA in the hero is visible.
        await expect(page.locator("xpath=/html/body/main/section[1]/div[2]/div/div[5]/div[2]/a").nth(0)).to_be_visible(timeout=15000), "The 'Contact Me' CTA in the hero is visible."
        await page.locator("xpath=/html/body/main/section[1]/div[2]/div/div[1]/span[2]").nth(0).scroll_into_view_if_needed()
        # Assert: The 'Available for new projects' label in the hero is visible.
        await expect(page.locator("xpath=/html/body/main/section[1]/div[2]/div/div[1]/span[2]").nth(0)).to_be_visible(timeout=15000), "The 'Available for new projects' label in the hero is visible."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    