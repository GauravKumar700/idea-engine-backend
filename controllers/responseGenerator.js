// const puppeteer = require('puppeteer');

// let browser;
// let page;

// const fun = () => {
//     (async () => {
//         // Start Chrome with remote debugging enabled
//         browser = await puppeteer.connect({
//             browserURL: 'http://127.0.0.1:9222',
//             defaultViewport: null,
//         });

//         const pages = await browser.pages();
//         page = pages[0];

//         // Make sure user is logged in and on the right page
//         if (!page.url().startsWith('https://gemini.google.com/app')) {
//             console.log('Go to Gemini Chat "https://gemini.google.com" and login.');
//             return;
//         }

//         // Prompt user for what to ask Gemini
//         console.log('Ask Gemini:');
//         const prompt = await new Promise((resolve) => {
//             process.stdin.once('data', (data) => {
//                 resolve(data.toString().trim());
//             });
//         });

//         const responseText = await sendMessage(prompt, page);

//         console.log('\nResponse from Gemini:');
//         console.log(responseText);

//         console.log('\n\nPress any key to exit');
//         process.stdin.setRawMode(true);
//         process.stdin.resume();
//         process.stdin.on('data', process.exit.bind(process, 0));
//     })();
// }

// async function sendMessage(prompt, page) {
//     // Enter prompt into UI
//     const selector = 'rich-textarea > div > p';
//     await page.$eval(selector, (el, content) => el.textContent = content, prompt);
//     await page.waitForTimeout(1000);

//     // Click button
//     const buttonSelector = 'div[class*="send-button-container"] > button';
//     await page.click(buttonSelector);

//     const responseSelector = 'message-content[class*="model-response-text"]';

//     // Wait for response to appear
//     await page.waitForSelector(responseSelector);

//     // It may take a couple of seconds for UI to draw response
//     await page.waitForTimeout(5000);

//     // Get response
//     const responseElement = await page.$(responseSelector);
//     const responseText = await responseElement.evaluate(el => el.innerText);

//     return responseText;
// }

// module.exports = fun