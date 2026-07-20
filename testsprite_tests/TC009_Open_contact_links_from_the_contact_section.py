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
        
        # -> Click the 'Contact' header link in the top navigation to open/scroll to the contact section.
        # Contact link
        elem = page.get_by_text('ENAR', exact=True).locator("xpath=ancestor-or-self::*[.//a][1]").get_by_role('link', name='Contact', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the Email button labeled 'ameen.haieck@yahoo.com' in the Contact section.
        # Email ameen.haieck@yahoo.com link
        elem = page.get_by_role('link', name='Email ameen.haieck@yahoo.com', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the Email button labeled 'ameen.haieck@yahoo.com' in the Contact section.
        # WhatsApp + 9647812376048 link
        elem = page.get_by_role('link', name='WhatsApp + 9647812376048', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the Email button labeled 'ameen.haieck@yahoo.com' in the Contact section.
        # instagram link
        elem = page.locator("xpath=/html/body/main/section[8]/div/div[3]/div[1]/a").nth(0)
        await elem.click(timeout=10000)
        
        # -> Switch to the site tab showing the Contact section (page title: 'Ameen Haieck — Graphic Designe' / URL: http://localhost:3000/en#contact) so the Email link 'ameen.haieck@yahoo.com' can be clicked and a social profile icon can be tested.
        # Switch to tab 1664
        page = context.pages[-1]  # switch to most recently active tab
        
        # -> Click the Email button labeled 'ameen.haieck@yahoo.com' in the Contact section to trigger the email action.
        # Email ameen.haieck@yahoo.com link
        elem = page.get_by_role('link', name='Email ameen.haieck@yahoo.com', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the Email button labeled 'ameen.haieck@yahoo.com' in the Contact section to trigger the email action.
        # instagram link
        elem = page.get_by_text('07', exact=True).locator("xpath=ancestor-or-self::*[.//a][1]").get_by_role('link', name='instagram', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the Email button labeled 'ameen.haieck@yahoo.com' in the Contact section to trigger the email action.
        # Switch to tab EA7F
        page = context.pages[-1]  # switch to most recently active tab
        
        # -> Switch to the site tab titled 'Ameen Haieck — Graphic Designe' and verify the Contact section shows the email address 'ameen.haieck@yahoo.com' and WhatsApp number '+9647812376048'.
        # Switch to tab 1664
        page = context.pages[-1]  # switch to most recently active tab
        
        # --> Assertions to verify final state
        
        # --> Verify the contact actions are available
        # Assert: Email link has a mailto href so visitors can email Ameen.
        await expect(page.locator("xpath=/html/body/main/section[8]/div/div[2]/div[1]/div/a").nth(0)).to_have_attribute("href", "mailto:ameen.haieck@yahoo.com", timeout=15000), "Email link has a mailto href so visitors can email Ameen."
        # Assert: WhatsApp link points to wa.me so visitors can message Ameen.
        await expect(page.locator("xpath=/html/body/main/section[8]/div/div[2]/div[2]/div/a").nth(0)).to_have_attribute("href", "https://wa.me/9647812376048", timeout=15000), "WhatsApp link points to wa.me so visitors can message Ameen."
        # Assert: Instagram social link points to Ameen's profile so visitors can view it.
        await expect(page.locator("xpath=/html/body/main/section[8]/div/div[3]/div[1]/a").nth(0)).to_have_attribute("href", "https://instagram.com/ameenhaieck", timeout=15000), "Instagram social link points to Ameen's profile so visitors can view it."
        
        # --> Verify the social profile area is displayed
        await page.locator("xpath=/html/body/main/section[8]/div/div[3]/div[1]/a").nth(0).scroll_into_view_if_needed()
        # Assert: Instagram social icon is visible in the contact social area.
        await expect(page.locator("xpath=/html/body/main/section[8]/div/div[3]/div[1]/a").nth(0)).to_be_visible(timeout=15000), "Instagram social icon is visible in the contact social area."
        await page.locator("xpath=/html/body/main/section[8]/div/div[3]/div[2]/a").nth(0).scroll_into_view_if_needed()
        # Assert: Behance social icon is visible in the contact social area.
        await expect(page.locator("xpath=/html/body/main/section[8]/div/div[3]/div[2]/a").nth(0)).to_be_visible(timeout=15000), "Behance social icon is visible in the contact social area."
        await page.locator("xpath=/html/body/main/section[8]/div/div[3]/div[3]/a").nth(0).scroll_into_view_if_needed()
        # Assert: LinkedIn social icon is visible in the contact social area.
        await expect(page.locator("xpath=/html/body/main/section[8]/div/div[3]/div[3]/a").nth(0)).to_be_visible(timeout=15000), "LinkedIn social icon is visible in the contact social area."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    