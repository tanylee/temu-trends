import { chromium } from 'playwright';

export async function newBrowserWithProxy() {
  const { OXYLABS_USER, OXYLABS_PASS, OXY_ENDPOINT } = process.env;
  const proxy = OXY_ENDPOINT || 'pr.oxylabs.io:7777';
  const browser = await chromium.launch({
    headless: true,
    args: ['--disable-blink-features=AutomationControlled'],
    proxy: {
      server: `http://${proxy}`,
      username: OXYLABS_USER,
      password: OXYLABS_PASS
    }
  });
  return browser;
}
