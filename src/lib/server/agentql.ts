import { wrap, configure } from 'agentql';
import { chromium } from 'playwright';

if (!process.env.AGENTQL_API_KEY) {
    throw new Error('AGENTQL_API_KEY is not set in environment variables');
}

configure({ apiKey: process.env.AGENTQL_API_KEY });

const PRODUCT_QUERY = `
{
  product_name(Use first-letter capitals. Try to get the brand name, product name, and if applicable, the color. Limit the term to 10 words. Avoid words that are not relevant to the product, such as "LAST CHANCE" or "CLEARANCE" to name a few.)
  current_price(This is the big obvious price of the product, usually the one you see first. This should keep the currency symbol and provide commas accordingly where applicable.)
  original_price(This is the price before any discounts, usually higher than the current price. This should keep the currency symbol and provide commas accordingly where applicable.)
  url(This should be the full URL of the product page, starting from the domain name.)
}
`;

export async function getProductData(url: string) {
    let browser;
    try {
        browser = await chromium.launch();
        const context = await browser.newContext();
        const agentqlPage = await wrap(await context.newPage());

        await agentqlPage.goto(url);
        const data = await agentqlPage.queryData(PRODUCT_QUERY);
        
        const formattedData = {
            ...data,
            order: 0
        };
        
        return formattedData;
    } catch (error) {
        throw error;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}
