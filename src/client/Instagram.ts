
import { Browser, DEFAULT_INTERCEPT_RESOLUTION_PRIORITY } from "puppeteer";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import AdblockerPlugin from "puppeteer-extra-plugin-adblocker";
import UserAgent from "user-agents";
import { Server } from "proxy-chain";
import { IGpassword, IGusername } from "../secret";
import logger from "../config/logger";
import { Instagram_cookiesExist, loadCookies, saveCookies } from "../utils";
import { runAgent } from "../Agent";
import { getInstagramCommentSchema } from "../Agent/schema";

// Add stealth plugin to puppeteer
puppeteer.use(StealthPlugin());
puppeteer.use(
    AdblockerPlugin({
        // Optionally enable Cooperative Mode for several request interceptors
        interceptResolutionPriority: DEFAULT_INTERCEPT_RESOLUTION_PRIORITY,
    })
);


async function runInstagram() {
    // Create a local proxy server
    const server = new Server({ port: 8000 });
    await server.listen();
    const checkMode = process.env.NODE_ENV === "production" ? true : false;
    const proxyUrl = `http://localhost:8000`;
    const browser: Browser = await puppeteer.launch({
        headless: checkMode,
        args: [`--proxy-server=${proxyUrl}`], // Use the proxy server
    });

    // Check if cookies exist and load them into the page
    if (await Instagram_cookiesExist()) {
        logger.info("Loading cookies...:🚧");
        const cookies = await loadCookies("./cookies/Instagramcookies.json");
        await browser.setCookie(...cookies);
    }
    const page = await browser.newPage();
    // await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 });

    // Set a random PC user-agent
    const userAgent = new UserAgent({ deviceCategory: "desktop" });
    const randomUserAgent = userAgent.toString();
    logger.info(`Using user-agent: ${randomUserAgent}`);
    await page.setUserAgent(randomUserAgent);

    // Check if cookies
    if (await Instagram_cookiesExist()) {
        logger.info("Cookies loaded, skipping login...");
        await page.goto("https://www.instagram.com", { waitUntil: "networkidle2" });

        // Check if login was successful by verifying page content (e.g., user profile or feed)
        const isLoggedIn = await page.$("a[href='/direct/inbox/']");
        if (isLoggedIn) {
            logger.info("Login verified with cookies.");
        } else {
            logger.warn("Cookies invalid or expired. Logging in again...");
            await loginWithCredentials(page, browser);
        }
    } else {
        // If no cookies are available, perform login with credentials
        await loginWithCredentials(page, browser);
    }

    // Optionally take a screenshot after loading the page
    await page.screenshot({ path: "logged_in.png" });

    // Navigate to the Instagram homepage
    await page.goto("https://www.instagram.com/");

    // Interact with the first post
    await interactWithPosts(page);

    // Close the browser
    await browser.close();
    await server.close(true); // Stop the proxy server and close connections
}




const loginWithCredentials = async (page: any, browser: Browser) => {
    try {
        await page.goto("https://www.instagram.com/accounts/login/");
        await page.waitForSelector('input[name="username"]');

        // Fill out the login form
        await page.type('input[name="username"]', IGusername); // Replace with your username
        await page.type('input[name="password"]', IGpassword); // Replace with your password
        await page.click('button[type="submit"]');

        // Wait for navigation after login
        await page.waitForNavigation();

        // Save cookies after login
        const cookies = await browser.cookies();
        await saveCookies("./cookies/Instagramcookies.json", cookies);
    } catch (error) {
        logger.error("Error logging in with credentials:", error);
    }
}

async function interactWithPosts(page: any) {
    let postIndex = 1; // Start with the first post
    const maxPosts = 50; // Limit to prevent infinite scrolling

    while (postIndex <= maxPosts) {
        try {
            const postSelector = `article:nth-of-type(${postIndex})`;

            // Check if the post exists
            if (!(await page.$(postSelector))) {
                console.log("No more posts found. Exiting loop...");
                break;
            }

            const likeButtonSelector = `${postSelector} svg[aria-label="Like"]`;
            const likeButton = await page.$(likeButtonSelector);
            const ariaLabel = await likeButton?.evaluate((el: Element) =>
                el.getAttribute("aria-label")
            );

            if (ariaLabel === "Like") {
                console.log(`Liking post ${postIndex}...`);
                await likeButton.click();
                console.log(`Post ${postIndex} liked.`);
            } else if (ariaLabel === "Unlike") {
                console.log(`Post ${postIndex} is already liked.`);
            } else {
                console.log(`Like button not found for post ${postIndex}.`);
            }

            // Extract and log the post caption
            const captionSelector = `${postSelector} div.x9f619 span._ap3a div span._ap3a`;
            const captionElement = await page.$(captionSelector);

            let caption = "";
            if (captionElement) {
                caption = await captionElement.evaluate((el: HTMLElement) => el.innerText);
                console.log(`Caption for post ${postIndex}: ${caption}`);
            } else {
                console.log(`No caption found for post ${postIndex}.`);
            }

            // Check if there is a '...more' link to expand the caption
            const moreLinkSelector = `${postSelector} div.x9f619 span._ap3a span div span.x1lliihq`;
            const moreLink = await page.$(moreLinkSelector);
            if (moreLink) {
                console.log(`Expanding caption for post ${postIndex}...`);
                await moreLink.click(); // Click the '...more' link to expand the caption
                await page.waitForTimeout(1000); // Wait for the caption to expand
                const expandedCaption = await captionElement.evaluate(
                    (el: HTMLElement) => el.innerText
                );
                console.log(
                    `Expanded Caption for post ${postIndex}: ${expandedCaption}`
                );
                caption = expandedCaption; // Update caption with expanded content
            }

            // Comment on the post
            const commentBoxSelector = `${postSelector} textarea`;
            const commentBox = await page.$(commentBoxSelector);
            if (commentBox) {
                console.log(`Commenting on post ${postIndex}...`);
                const prompt = `Craft a thoughtful, engaging, and mature reply to the following post: "${caption}". Ensure the reply is relevant, insightful, and adds value to the conversation. It should reflect empathy and professionalism, and avoid sounding too casual or superficial. also it should be 300 characters or less. and it should not go against instagram Community Standards on spam. so you will have to try your best to humanize the reply`;
                const schema = getInstagramCommentSchema();
                const comment = await runAgent(schema, prompt); // Pass the updated caption
                await commentBox.type(comment); // Replace with random comment

                const postButtonSelector = `${postSelector} div[role="button"]:not([disabled]):has-text("Post")`;
                const postButton = await page.$(postButtonSelector);
                if (postButton) {
                    console.log(`Posting comment on post ${postIndex}...`);
                    await postButton.click();
                    console.log(`Comment posted on post ${postIndex}.`);
                } else {
                    console.log("Post button not found.");
                }
            } else {
                console.log("Comment box not found.");
            }

            // Wait before moving to the next post (randomize between 5 and 10 seconds)
            const delay = Math.floor(Math.random() * 5000) + 5000; // Random delay between 5 and 10 seconds
            console.log(
                `Waiting ${delay / 1000} seconds before moving to the next post...`
            );
            await page.waitForTimeout(delay);

            // Scroll to the next post
            await page.evaluate(() => {
                window.scrollBy(0, window.innerHeight);
            });

            postIndex++; // Move to the next post
        } catch (error) {
            console.error(`Error interacting with post ${postIndex}:`, error);
            break;
        }
    }
}



export { runInstagram };

