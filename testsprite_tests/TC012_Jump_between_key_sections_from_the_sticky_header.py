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
        
        # -> Click the header link labeled 'About' to verify the page scrolls to the About section.
        # About link
        elem = page.get_by_text('Ameen Haieck', exact=True).locator("xpath=ancestor-or-self::*[.//a][1]").get_by_role('link', name='About', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Portfolio' header link in the page header to verify the page scrolls to the Portfolio section.
        # Portfolio link
        elem = page.get_by_text('Ameen Haieck', exact=True).locator("xpath=ancestor-or-self::*[.//a][1]").get_by_role('link', name='Portfolio', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Contact' header link to navigate/scroll to the Contact section.
        # Contact link
        elem = page.get_by_text('ENAR', exact=True).locator("xpath=ancestor-or-self::*[.//a][1]").get_by_role('link', name='Contact', exact=True)
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> Verify the page scrolls to the requested sections
        await page.locator("xpath=/html/body/main/section[7]/div[2]/div/div/div[1]/div[2]").nth(0).scroll_into_view_if_needed()
        # Assert: Portfolio section content is visible after clicking the Portfolio link.
        await expect(page.locator("xpath=/html/body/main/section[7]/div[2]/div/div/div[1]/div[2]").nth(0)).to_be_visible(timeout=15000), "Portfolio section content is visible after clicking the Portfolio link."
        # Assert: The URL contains '#contact', indicating the page scrolled to the Contact section.
        await expect(page).to_have_url(re.compile("\\#contact"), timeout=15000), "The URL contains '#contact', indicating the page scrolled to the Contact section."
        await page.locator("xpath=/html/body/main/section[8]/div/div[2]/div[1]/div/a").nth(0).scroll_into_view_if_needed()
        # Assert: The Contact email link is visible in the Contact section.
        await expect(page.locator("xpath=/html/body/main/section[8]/div/div[2]/div[1]/div/a").nth(0)).to_be_visible(timeout=15000), "The Contact email link is visible in the Contact section."
        
        # --> Verify the contact section is displayed
        # Assert: URL contains '#contact', indicating the Contact section anchor is active.
        await expect(page).to_have_url(re.compile("\\#contact"), timeout=15000), "URL contains '#contact', indicating the Contact section anchor is active."
        # Assert: Contact email 'ameen.haieck@yahoo.com' is visible in the Contact section.
        await expect(page.locator("xpath=/html/body/main/section[8]/div/div[2]/div[1]/div/a").nth(0)).to_contain_text("ameen.haieck@yahoo.com", timeout=15000), "Contact email 'ameen.haieck@yahoo.com' is visible in the Contact section."
        # Assert: Contact WhatsApp number '+9647812376048' is visible in the Contact section.
        await expect(page.locator("xpath=/html/body/main/section[8]/div/div[2]/div[2]/div/a").nth(0)).to_contain_text("9647812376048", timeout=15000), "Contact WhatsApp number '+9647812376048' is visible in the Contact section."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    