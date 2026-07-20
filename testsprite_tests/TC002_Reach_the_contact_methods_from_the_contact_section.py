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
        
        # -> Click the 'Contact' link in the header
        # Contact link
        elem = page.get_by_text('ENAR', exact=True).locator("xpath=ancestor-or-self::*[.//a][1]").get_by_role('link', name='Contact', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Email' button labeled "ameen.haieck@yahoo.com" in the Contact section.
        # Email ameen.haieck@yahoo.com link
        elem = page.get_by_role('link', name='Email ameen.haieck@yahoo.com', exact=True)
        await elem.click(timeout=10000)
        
        # -> Verify the Email mailto: href and LinkedIn profile href, then open the LinkedIn profile and the WhatsApp contact link from the Contact section.
        # linkedin link
        elem = page.get_by_text('07', exact=True).locator("xpath=ancestor-or-self::*[.//a][1]").get_by_role('link', name='linkedin', exact=True)
        await elem.click(timeout=10000)
        
        # -> Verify the Email mailto: href and LinkedIn profile href, then open the LinkedIn profile and the WhatsApp contact link from the Contact section.
        # WhatsApp + 9647812376048 link
        elem = page.get_by_role('link', name='WhatsApp + 9647812376048', exact=True)
        await elem.click(timeout=10000)
        
        # -> Switch to the tab showing the Contact section (the tab titled 'Ameen Haieck — Graphic Designe') and inspect the email, WhatsApp, and LinkedIn link hrefs.
        # Switch to tab 09DF
        page = context.pages[-1]  # switch to most recently active tab
        
        # -> Inspect the 'Email' and 'WhatsApp' link targets in the Contact section, then click the 'LinkedIn' social profile link.
        # linkedin link
        elem = page.get_by_text('07', exact=True).locator("xpath=ancestor-or-self::*[.//a][1]").get_by_role('link', name='linkedin', exact=True)
        await elem.click(timeout=10000)
        
        # -> Scroll the page to reveal the Contact section (showing 'ameen.haieck@yahoo.com') and then locate the Email, WhatsApp, and LinkedIn links to capture their hrefs.
        await page.mouse.wheel(0, 300)
        
        # -> Read the href targets for the Email (ameen.haieck@yahoo.com), WhatsApp (9647812376048), and LinkedIn icons from the Contact section, then click the 'WhatsApp' button to open it.
        # WhatsApp + 9647812376048 link
        elem = page.get_by_role('link', name='WhatsApp + 9647812376048', exact=True)
        await elem.click(timeout=10000)
        
        # -> Switch to the Contact tab titled 'Ameen Haieck — Graphic Designe' so the 'LinkedIn' social profile link in the Contact section can be clicked and verified.
        # Switch to tab 09DF
        page = context.pages[-1]  # switch to most recently active tab
        
        # -> Capture the Email, WhatsApp, and LinkedIn href attributes from the Contact section, then click the 'LinkedIn' social profile link labeled 'linkedin'.
        # linkedin link
        elem = page.get_by_text('07', exact=True).locator("xpath=ancestor-or-self::*[.//a][1]").get_by_role('link', name='linkedin', exact=True)
        await elem.click(timeout=10000)
        
        # -> Locate and read the 'Email' mailto link, the 'WhatsApp' contact link, and the 'LinkedIn' social link hrefs from the Contact section on the page titled 'Ameen Haieck — Graphic Designe'.
        # Switch to tab 09DF
        page = context.pages[-1]  # switch to most recently active tab
        
        # -> Capture the hrefs for the 'ameen.haieck@yahoo.com' Email button, the '+9647812376048' WhatsApp button, and the 'linkedin' social icon, then click the 'linkedin' icon to open the profile in a new tab.
        # linkedin link
        elem = page.get_by_text('07', exact=True).locator("xpath=ancestor-or-self::*[.//a][1]").get_by_role('link', name='linkedin', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Contact' link in the header to scroll to the contact section so the email, WhatsApp, and social links become visible.
        # Contact link
        elem = page.get_by_text('ENAR', exact=True).locator("xpath=ancestor-or-self::*[.//a][1]").get_by_role('link', name='Contact', exact=True)
        await elem.click(timeout=10000)
        
        # -> Read the Email, WhatsApp, and LinkedIn hrefs visible in the Contact section and then click the 'linkedin' social icon to open the profile.
        # linkedin link
        elem = page.get_by_text('07', exact=True).locator("xpath=ancestor-or-self::*[.//a][1]").get_by_role('link', name='linkedin', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Contact' link in the header to bring the Contact section into view and capture the mailto, WhatsApp, and LinkedIn href attributes.
        # Contact link
        elem = page.get_by_text('ENAR', exact=True).locator("xpath=ancestor-or-self::*[.//a][1]").get_by_role('link', name='Contact', exact=True)
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> Verify the contact section is visible
        await page.locator("xpath=/html/body/main/section[8]/div/div[2]/div[1]/div/a").nth(0).scroll_into_view_if_needed()
        # Assert: The contact section is visible because the Email link is visible.
        await expect(page.locator("xpath=/html/body/main/section[8]/div/div[2]/div[1]/div/a").nth(0)).to_be_visible(timeout=15000), "The contact section is visible because the Email link is visible."
        # Assert: The URL contains the #contact fragment, confirming the contact section is in view.
        await expect(page).to_have_url(re.compile("\\#contact"), timeout=15000), "The URL contains the #contact fragment, confirming the contact section is in view."
        
        # --> Verify the contact methods are available
        # Assert: The contact section includes the email address ameen.haieck@yahoo.com.
        await expect(page.locator("xpath=/html/body/main/section[8]/div/div[2]/div[1]/div/a").nth(0)).to_contain_text("ameen.haieck@yahoo.com", timeout=15000), "The contact section includes the email address ameen.haieck@yahoo.com."
        # Assert: The contact section includes the WhatsApp number +9647812376048.
        await expect(page.locator("xpath=/html/body/main/section[8]/div/div[2]/div[2]/div/a").nth(0)).to_contain_text("9647812376048", timeout=15000), "The contact section includes the WhatsApp number +9647812376048."
        await page.locator("xpath=/html/body/main/section[8]/div/div[3]/div[3]/a").nth(0).scroll_into_view_if_needed()
        # Assert: A LinkedIn social profile link is available in the contact section.
        await expect(page.locator("xpath=/html/body/main/section[8]/div/div[3]/div[3]/a").nth(0)).to_be_visible(timeout=15000), "A LinkedIn social profile link is available in the contact section."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    