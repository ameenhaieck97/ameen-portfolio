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
        
        # -> Navigate to the Arabic version of the site by opening the URL http://localhost:3000/ar
        await page.goto("http://localhost:3000/ar")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Click the 'نبذة عني' header link to navigate to the About section and verify the About section content is displayed in Arabic.
        # نبذة عني link
        elem = page.get_by_text('أمين الحايك', exact=True).locator("xpath=ancestor-or-self::*[.//a][1]").get_by_role('link', name='نبذة عني', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'تواصل' header link to open the Contact section and verify the contact section is displayed in Arabic.
        # تواصل link
        elem = page.get_by_text('ENAR', exact=True).locator("xpath=ancestor-or-self::*[.//a][1]").get_by_role('link', name='تواصل', exact=True)
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> Verify the About section is displayed in Arabic
        # Assert: The 'نبذة عني' (About) header link is displayed in Arabic.
        await expect(page.locator("xpath=/html/body/header/div/nav/a[1]").nth(0)).to_have_text("\u0646\u0628\u0630\u0629 \u0639\u0646\u064a", timeout=15000), "The '\u0646\u0628\u0630\u0629 \u0639\u0646\u064a' (About) header link is displayed in Arabic."
        # Assert: The 'نبذة عني' (About) footer link is displayed in Arabic.
        await expect(page.locator("xpath=/html/body/footer/div[1]/div[2]/nav/a[1]").nth(0)).to_have_text("\u0646\u0628\u0630\u0629 \u0639\u0646\u064a", timeout=15000), "The '\u0646\u0628\u0630\u0629 \u0639\u0646\u064a' (About) footer link is displayed in Arabic."
        
        # --> Verify the contact section is displayed in Arabic
        # Assert: Contact section displays the Arabic label 'البريد الإلكتروني'.
        await expect(page.locator("xpath=/html/body/main/section[8]/div/div[2]/div[1]/div/a").nth(0)).to_contain_text("\u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a", timeout=15000), "Contact section displays the Arabic label '\u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a'."
        # Assert: Contact section displays the Arabic label 'واتساب'.
        await expect(page.locator("xpath=/html/body/main/section[8]/div/div[2]/div[2]/div/a").nth(0)).to_contain_text("\u0648\u0627\u062a\u0633\u0627\u0628", timeout=15000), "Contact section displays the Arabic label '\u0648\u0627\u062a\u0633\u0627\u0628'."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    