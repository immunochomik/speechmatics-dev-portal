import {Page} from "@playwright/test";
import testCfg from "../testConfigs";

export default (page) => {
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
            await page.screenshot({path: `./e2e/testOutput/screenshots/${name}.png`});
        }
    }
}

