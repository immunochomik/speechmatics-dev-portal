import {Page} from "@playwright/test";
import testCfg from "../test-configs";

export default (page: Page) => {
    return {
        async wait(ms?: number) {
            return page.waitForTimeout(ms ?? testCfg.msToWait);
        },
        async clickElement(selector: string, msWait?: number) {
            await page.locator(selector).click();
            await page.waitForTimeout(msWait ?? testCfg.msToWait);
        },
        async goTo(url: string, msWait?: number) {
            await page.goto(url);
            await page.waitForTimeout(msWait ?? testCfg.msToWait);
        },
        async takeScreenshot(name: string) {
            await page.screenshot({path: `./e2e/test-output/screenshots/${name}.png`});
        }
    }
}

