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
        
        # -> Click the 'Portfolio' link in the header.
        # Portfolio link
        elem = page.get_by_text('Ameen Haieck', exact=True).locator("xpath=ancestor-or-self::*[.//a][1]").get_by_role('link', name='Portfolio', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Syrian Doctors Syndicate — Logo' button to open its image preview.
        # Logo Design Syrian Doctors Syndicate — Logo View... button
        elem = page.get_by_role('button', name='Syrian Doctors Syndicate — Logo', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Next' button in the lightbox to move to the next portfolio image.
        # Next button
        elem = page.get_by_role('button', name='Next', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Previous' button in the lightbox to navigate back to the prior portfolio image.
        # Previous button
        elem = page.get_by_role('button', name='Previous', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Close' button (the X at the top-right of the lightbox) to close the image viewer and return to the portfolio section.
        # Close button
        elem = page.get_by_role('button', name='Close', exact=True)
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> Verify the image viewer opens and closes successfully
        # Assert: The portfolio card 'Syrian Doctors Syndicate — Logo' is visible again, indicating the viewer was closed and portfolio content is shown.
        await expect(page.locator("xpath=/html/body/main/section[4]/div/div[2]/div[1]/div[2]/div[1]/div/button").nth(0)).to_contain_text("Syrian Doctors Syndicate \u2014 Logo", timeout=15000), "The portfolio card 'Syrian Doctors Syndicate \u2014 Logo' is visible again, indicating the viewer was closed and portfolio content is shown."
        # Assert: The URL contains '#portfolio', confirming the page returned to the portfolio section after closing the image viewer.
        await expect(page).to_have_url(re.compile("\\#portfolio"), timeout=15000), "The URL contains '#portfolio', confirming the page returned to the portfolio section after closing the image viewer."
        
        # --> Verify the portfolio content is visible again
        # Assert: Portfolio project 'Syrian Doctors Syndicate — Logo' is visible again.
        await expect(page.locator("xpath=/html/body/main/section[4]/div/div[2]/div[1]/div[2]/div[1]/div/button").nth(0)).to_contain_text("Syrian Doctors Syndicate \u2014 Logo", timeout=15000), "Portfolio project 'Syrian Doctors Syndicate \u2014 Logo' is visible again."
        # Assert: Portfolio project 'Ashjan Al-Talaqani — Brand Identity' is visible again.
        await expect(page.locator("xpath=/html/body/main/section[4]/div/div[2]/div[1]/div[2]/div[2]/div/button").nth(0)).to_contain_text("Ashjan Al-Talaqani \u2014 Brand Identity", timeout=15000), "Portfolio project 'Ashjan Al-Talaqani \u2014 Brand Identity' is visible again."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    