import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import UserAgent from "user-agents";
import fs from "fs/promises";
import { Server } from "proxy-chain";
import dotenv from "dotenv";
import logger from "./src/config/logger";
dotenv.config();

// Add stealth plugin to puppeteer
puppeteer.use(StealthPlugin());

const cookiesPath = "./cookies.json";

const username = "riona_zen"; // Replace with your username
const password = "Chuks#chuks5686"; // Replace with your password

async function cookiesExist() {
    const cookiesData = await fs.readFile("./cookies.json", "utf-8");
    const cookies = JSON.parse(cookiesData);
    // Find the sessionid cookie
    const sessionIdCookie = cookies.find(cookie => cookie.name === 'sessionid');
  
    // If sessionid cookie is not found, return false
    if (!sessionIdCookie) return false;
  
    // Check if the sessionid cookie has expired
    const currentTimestamp = Math.floor(Date.now() / 1000);
    return sessionIdCookie.expires > currentTimestamp;
  }
  

cookiesExist().then((result) => logger.debug("Cookies checking:", result)).catch((error)=>console.error);


async function loginToInstagram() {
  // Create a local proxy server
  const server = new Server({ port: 8000 });
  await server.listen();

  const proxyUrl = `http://localhost:8000`;
  const browser = await puppeteer.launch({
    headless: false,
    args: [`--proxy-server=${proxyUrl}`], // Use the proxy server
  });

  // Check if cookies exist and load them into the page
  if (await cookiesExist()) {
    logger.info("Loading cookies...:🚧");
    const cookies = JSON.parse(await fs.readFile(cookiesPath, "utf-8"));
    await browser.setCookie(...cookies);
  } 
  const page = await browser.newPage();

  // Set a random PC user-agent
  const userAgent = new UserAgent({ deviceCategory: "desktop" });
  const randomUserAgent = userAgent.toString();
  logger.info(`Using user-agent: ${randomUserAgent}`);
  await page.setUserAgent(randomUserAgent);

  // Check if cookies
  if (await cookiesExist()) {
    logger.info("Cookies loaded, skipping login...");
    await page.goto("https://www.instagram.com", { waitUntil: "networkidle2" });

    // Check if login was successful by verifying page content (e.g., user profile or feed)
    const isLoggedIn = await page.$("a[href='/direct/inbox/']");
    if (isLoggedIn) {
      logger.info("Login verified with cookies.");
    } else {
      logger.warn("Cookies invalid or expired. Logging in again...");
      await loginWithCredentials(page);
    }
  } else {
    // If no cookies are available, perform login with credentials
    await loginWithCredentials(page);
  }

  // Optionally take a screenshot after loading the page
  await page.screenshot({ path: "logged_in.png" });

  // Navigate to the Instagram homepage
  await page.goto("https://www.instagram.com/");

  // Interact with the first post
  await interactWithPosts(page);

  // Close the browser
  await browser.close();
  await server.close(); // Stop the proxy server
}

async function loginWithCredentials(page) {
  // Navigate to Instagram login page
  await page.goto("https://www.instagram.com/accounts/login/", {
    waitUntil: "networkidle2",
  });
  await page.waitForSelector('input[name="username"]');

  // Fill out the login form
  await page.type('input[name="username"]', username, { delay: 200 });
  await page.type('input[name="password"]', password, { delay: 200 });

  // Wait for the submit button to be enabled
  await page.waitForSelector('button[type="submit"]:not([disabled])', {
    timeout: 5000,
  });

  // Click the button
  await page.click('button[type="submit"]');

  // Wait for navigation after login
  await page.waitForNavigation({ waitUntil: "networkidle2" });

  // Save cookies after login
  const cookies = await page.cookies(); // Get cookies from the page
  await fs.writeFile(cookiesPath, JSON.stringify(cookies, null, 2));
  logger.info("Login successful, cookies saved.");
}

async function interactWithPosts(page) {
  let postIndex = 1; // Start with the first post
  const maxPosts = 50; // Limit to prevent infinite scrolling

  while (postIndex <= maxPosts) {
    try {
      const postSelector = `article:nth-of-type(${postIndex})`;

      // Check if the post exists
      if (!(await page.$(postSelector))) {
        logger.warn("No more posts found. Exiting loop...");
        break;
      }

      const likeButtonSelector = `${postSelector} svg[aria-label="Like"]`;
      const likeButton = await page.$(likeButtonSelector);
      const ariaLabel = await likeButton?.evaluate((el) =>
        el.getAttribute("aria-label")
      );

      if (ariaLabel === "Like") {
        logger.info(`Liking post ${postIndex}...`);
        await likeButton.click();
        logger.info(`Post ${postIndex} liked.`);
      } else if (ariaLabel === "Unlike") {
        logger.info(`Post ${postIndex} is already liked.`);
      } else {
        logger.error(`Like button not found for post ${postIndex}.`);
      }

      // Extract and log the post caption
      const captionSelector = `${postSelector} div.x9f619 span._ap3a div span._ap3a`;
      const captionElement = await page.$(captionSelector);

      let caption = "";
      if (captionElement) {
        caption = await captionElement.evaluate((el) => el.innerText);
        logger.info(`Caption for post ${postIndex}: ${caption}`);
      } else {
        logger.error(`No caption found for post ${postIndex}.`);
      }

      // Check if there is a '...more' link to expand the caption
      const moreLinkSelector = `${postSelector} div.x9f619 span._ap3a span div span.x1lliihq`;
      const moreLink = await page.$(moreLinkSelector);
      if (moreLink) {
        logger.info(`Expanding caption for post ${postIndex}...`);
        await moreLink.click();

        const expandedCaption = await captionElement.evaluate(
          (el) => el.innerText
        );
        logger.info(
          `Expanded Caption for post ${postIndex}: ${expandedCaption}`
        );
        caption = expandedCaption; // Update caption with expanded content
      }

      // Comment on the post
      const commentBoxSelector = `${postSelector} textarea`;
      const commentBox = await page.$(commentBoxSelector);
      if (commentBox) {
        logger.info(`Commenting on post ${postIndex}...`);
        const comment = await generatePostReply(caption);
        await commentBox.type(comment);

        const postButtonSelector = `${postSelector} div[role="button"]:not([disabled])`;
        const postButton = await page.$(postButtonSelector);
        if (postButton) {
          logger.info(`Posting comment on post ${postIndex}...`);
          await postButton.click();
          logger.info(`Comment posted on post ${postIndex}.`);
        } else {
          logger.warn("Post button not found.");
        }
      } else {
        logger.error("Comment box not found.");
      }

     

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

// Check if cookies file exists

// Mock generatePostReply function
async function generatePostReply(caption) {
  return `Nice post! Loved the part: "${caption.substring(0, 20)}..."`;
}

// Start the script
loginToInstagram();
