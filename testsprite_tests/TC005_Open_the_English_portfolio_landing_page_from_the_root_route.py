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
        
        # --> Verify the English hero content is displayed
        # Assert: Hero headline 'Ameen Haieck' is visible.
        await expect(page.locator("xpath=/html/body/header/div/a").nth(0)).to_have_text("Ameen Haieck", timeout=15000), "Hero headline 'Ameen Haieck' is visible."
        # Assert: Hero subtext 'Available for new projects' is visible.
        await expect(page.locator("xpath=/html/body/main/section[1]/div[2]/div/div[1]/span[2]").nth(0)).to_have_text("Available for new projects", timeout=15000), "Hero subtext 'Available for new projects' is visible."
        # Assert: Hero CTA 'View Portfolio' is visible.
        await expect(page.locator("xpath=/html/body/main/section[1]/div[2]/div/div[5]/div[1]/a").nth(0)).to_have_text("View Portfolio", timeout=15000), "Hero CTA 'View Portfolio' is visible."
        # Assert: Hero CTA 'Contact Me' is visible.
        await expect(page.locator("xpath=/html/body/main/section[1]/div[2]/div/div[5]/div[2]/a").nth(0)).to_have_text("Contact Me", timeout=15000), "Hero CTA 'Contact Me' is visible."
        # Assert: Hero supporting text 'Since' is visible.
        await expect(page.locator("xpath=/html/body/main/section[2]/div/div[1]/div/div/span[1]").nth(0)).to_have_text("Since", timeout=15000), "Hero supporting text 'Since' is visible."
        # Assert: Hero supporting text '2015' is visible.
        await expect(page.locator("xpath=/html/body/main/section[2]/div/div[1]/div/div/span[2]").nth(0)).to_have_text("2015", timeout=15000), "Hero supporting text '2015' is visible."
        
        # --> Verify the main single-page sections are available
        await page.locator("xpath=/html/body/header/div/nav/a[1]").nth(0).scroll_into_view_if_needed()
        # Assert: The header shows a visible 'About' navigation link.
        await expect(page.locator("xpath=/html/body/header/div/nav/a[1]").nth(0)).to_be_visible(timeout=15000), "The header shows a visible 'About' navigation link."
        await page.locator("xpath=/html/body/header/div/nav/a[2]").nth(0).scroll_into_view_if_needed()
        # Assert: The header shows a visible 'Skills' navigation link.
        await expect(page.locator("xpath=/html/body/header/div/nav/a[2]").nth(0)).to_be_visible(timeout=15000), "The header shows a visible 'Skills' navigation link."
        await page.locator("xpath=/html/body/header/div/nav/a[3]").nth(0).scroll_into_view_if_needed()
        # Assert: The header shows a visible 'Portfolio' navigation link.
        await expect(page.locator("xpath=/html/body/header/div/nav/a[3]").nth(0)).to_be_visible(timeout=15000), "The header shows a visible 'Portfolio' navigation link."
        await page.locator("xpath=/html/body/header/div/nav/a[4]").nth(0).scroll_into_view_if_needed()
        # Assert: The header shows a visible 'Experience' navigation link.
        await expect(page.locator("xpath=/html/body/header/div/nav/a[4]").nth(0)).to_be_visible(timeout=15000), "The header shows a visible 'Experience' navigation link."
        await page.locator("xpath=/html/body/header/div/nav/a[5]").nth(0).scroll_into_view_if_needed()
        # Assert: The header shows a visible 'Partners' navigation link.
        await expect(page.locator("xpath=/html/body/header/div/nav/a[5]").nth(0)).to_be_visible(timeout=15000), "The header shows a visible 'Partners' navigation link."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    