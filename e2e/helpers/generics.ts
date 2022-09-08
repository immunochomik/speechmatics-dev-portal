import {Page} from "@playwright/test";
import testCfg from "../testConfigs";

export default (page) => {
    return {
        async wait() {
            return page.waitForTimeout(testCfg.msToWait);
        },
        async clickElement(selector: string) {
            await page.locator(selector).click();
            await page.waitForTimeout(testCfg.msToWait);
        },
        async goTo(url: string) {
            await page.goto(url);
            await page.waitForTimeout(testCfg.msToWait);
        },
        async takeScreenshot(name: string) {
            await page.screenshot({path: `./e2e/testOutput/screenshots/${name}.png`});
        }
    }
}

