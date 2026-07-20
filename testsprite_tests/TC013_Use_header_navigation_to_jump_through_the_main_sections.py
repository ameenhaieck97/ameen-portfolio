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
        
        # -> Click the 'About' header link in the sticky header to jump to the About section.
        # About link
        elem = page.get_by_text('Ameen Haieck', exact=True).locator("xpath=ancestor-or-self::*[.//a][1]").get_by_role('link', name='About', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Skills' link in the sticky header and verify the Skills section becomes visible on the page.
        # Skills link
        elem = page.get_by_text('Ameen Haieck', exact=True).locator("xpath=ancestor-or-self::*[.//a][1]").get_by_role('link', name='Skills', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Experience' header link in the sticky header to jump to the Experience section.
        # Experience link
        elem = page.get_by_text('Ameen Haieck', exact=True).locator("xpath=ancestor-or-self::*[.//a][1]").get_by_role('link', name='Experience', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Partners' header link in the sticky header and verify the Partners section becomes visible.
        # Partners link
        elem = page.get_by_text('Ameen Haieck', exact=True).locator("xpath=ancestor-or-self::*[.//a][1]").get_by_role('link', name='Partners', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Contact' button in the sticky header to jump to the Contact section and verify the contact details are visible.
        # Contact link
        elem = page.get_by_text('ENAR', exact=True).locator("xpath=ancestor-or-self::*[.//a][1]").get_by_role('link', name='Contact', exact=True)
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> Verify the contact section is visible
        # Assert: URL contains '/en#contact', confirming the contact anchor is active.
        await expect(page).to_have_url(re.compile("/en\\#contact"), timeout=15000), "URL contains '/en#contact', confirming the contact anchor is active."
        # Assert: The contact email ameen.haieck@yahoo.com is visible in the Contact section.
        await expect(page.locator("xpath=/html/body/main/section[8]/div/div[2]/div[1]/div/a").nth(0)).to_contain_text("ameen.haieck@yahoo.com", timeout=15000), "The contact email ameen.haieck@yahoo.com is visible in the Contact section."
        # Assert: The WhatsApp number 9647812376048 is visible in the Contact section.
        await expect(page.locator("xpath=/html/body/main/section[8]/div/div[2]/div[2]/div/a").nth(0)).to_contain_text("9647812376048", timeout=15000), "The WhatsApp number 9647812376048 is visible in the Contact section."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    