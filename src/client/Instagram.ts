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
import readline from "readline";
import fs from "fs/promises";

// Add stealth plugin to puppeteer
puppeteer.use(StealthPlugin());
puppeteer.use(
  AdblockerPlugin({
    // Optionally enable Cooperative Mode for several request interceptors
    interceptResolutionPriority: DEFAULT_INTERCEPT_RESOLUTION_PRIORITY,
  })
);

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Function to handle the notification popup
async function handleNotificationPopup(page: any) {
  console.log("Checking for notification popup...");
  const notNowButtonSelectors = ["button", 'div[role="button"]'];

  let notNowButton = null;
  for (const selector of notNowButtonSelectors) {
    const elements = await page.$$(selector);
    for (const element of elements) {
      const text = await element.evaluate((el: Element) => el.textContent);
      if (text && text.trim() === "Not Now") {
        notNowButton = element;
        console.log(`Found 'Not Now' button with selector: ${selector}`);
        break;
      }
    }
    if (notNowButton) break;
  }

  if (notNowButton) {
    console.log("Dismissing notification popup...");
    await notNowButton.click();
    await delay(1000); // Wait for popup to close
    console.log("Notification popup dismissed.");
  } else {
    console.log("Notification popup not found.");
  }
}

async function sendDirectMessage(page: any, username: string, message: string) {
  try {
    // Navigate to the user's profile
    await page.goto(`https://www.instagram.com/${username}/`, {
      waitUntil: "networkidle2",
    });
    console.log("Navigated to user profile");

    // Wait for the page to load completely
    await delay(3000);

    // Try multiple selectors for the message button
    const messageButtonSelectors = [
      'div[role="button"]',
      "button",
      'a[href*="/direct/t/"]',
      'div[role="button"] span',
      'div[role="button"] div',
    ];

    let messageButton = null;
    for (const selector of messageButtonSelectors) {
      console.log(`Trying selector: ${selector}`);
      const elements = await page.$$(selector);
      for (const element of elements) {
        const text = await element.evaluate((el: Element) => el.textContent);
        if (text && text.trim() === "Message") {
          messageButton = element;
          console.log(`Found message button with selector: ${selector}`);
          break;
        }
      }
      if (messageButton) break;
    }

    if (!messageButton) {
      await page.screenshot({ path: "debug-message-button.png" });
      throw new Error(
        "Message button not found. Screenshot saved as debug-message-button.png"
      );
    }

    // Click the message button
    await messageButton.click();
    console.log("Clicked message button");

    // Wait for the DM modal to appear and handle potential popup
    await delay(2000);
    console.log("Waiting for DM modal");
    await handleNotificationPopup(page);

    // Take a screenshot of the DM modal for debugging
    await page.screenshot({ path: "dm-modal.png" });
    console.log("Saved screenshot of DM modal");

    // Try multiple selectors for the message input
    const messageInputSelectors = [
      'textarea[placeholder="Message..."]',
      'div[role="textbox"]',
      'div[contenteditable="true"]',
      'textarea[aria-label="Message"]',
      'div[data-lexical-editor="true"]',
      'div[contenteditable="true"][role="textbox"]',
      'div[data-lexical-editor="true"][contenteditable="true"]',
      'div[aria-label="Message"]',
      'div[aria-label="Message input"]',
      'div[aria-label="Message input field"]',
    ];

    let messageInput = null;
    for (const selector of messageInputSelectors) {
      console.log(`Trying message input selector: ${selector}`);
      messageInput = await page.$(selector);
      if (messageInput) {
        console.log(`Found message input with selector: ${selector}`);
        break;
      }
    }

    if (!messageInput) {
      // Try to find any input-like element in the modal
      console.log("Trying to find any input-like element in the modal...");
      const allElements = await page.$$("div, textarea");
      for (const element of allElements) {
        const attributes = await element.evaluate((el: Element) => {
          return {
            role: el.getAttribute("role"),
            contenteditable: el.getAttribute("contenteditable"),
            placeholder: el.getAttribute("placeholder"),
            "aria-label": el.getAttribute("aria-label"),
          };
        });
        console.log("Found element with attributes:", attributes);
      }

      await page.screenshot({ path: "debug-message-input.png" });
      throw new Error(
        "Message input not found. Screenshot saved as debug-message-input.png"
      );
    }

    // Type the message
    await messageInput.type(message);
    console.log("Typed message");

    await handleNotificationPopup(page);

    // Wait a bit before trying to send
    await delay(2000);

    // Try multiple selectors for the send button
    const sendButtonSelectors = [
      'div[role="button"]',
      "button",
      'div[role="button"] span',
      'div[role="button"] div',
      'div[role="button"]:not([disabled])',
      'div[role="button"]:not([aria-disabled="true"])',
      'div[aria-label="Send"]',
      'div[aria-label="Send message"]',
      'div[aria-label="Send Message"]',
    ];

    let sendButton = null;
    for (const selector of sendButtonSelectors) {
      console.log(`Trying send button selector: ${selector}`);
      const elements = await page.$$(selector);
      for (const element of elements) {
        const text = await element.evaluate((el: Element) => el.textContent);
        const isDisabled = await element.evaluate((el: Element) => {
          return (
            el.hasAttribute("disabled") ||
            el.getAttribute("aria-disabled") === "true"
          );
        });

        if (text && text.trim() === "Send" && !isDisabled) {
          sendButton = element;
          console.log(`Found send button with selector: ${selector}`);
          break;
        }
      }
      if (sendButton) break;
    }

    if (!sendButton) {
      // Try to find the send button by its position (usually at the bottom of the modal)
      console.log("Trying to find send button by position...");
      const modalButtons = await page.$$('div[role="button"]');
      for (const button of modalButtons) {
        const isVisible = await button.evaluate((el: Element) => {
          const rect = el.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0;
        });

        if (isVisible) {
          const text = await button.evaluate((el: Element) => el.textContent);
          if (text && text.trim() === "Send") {
            sendButton = button;
            console.log("Found send button by position");
            break;
          }
        }
      }
    }

    if (!sendButton) {
      await page.screenshot({ path: "debug-send-button.png" });
      throw new Error(
        "Send button not found. Screenshot saved as debug-send-button.png"
      );
    }

    // Try multiple ways to click the send button
    try {
      // Method 1: Direct click
      await sendButton.click();
      console.log("Clicked send button (method 1)");
    } catch (error) {
      console.log("First click method failed, trying alternative methods...");
      try {
        // Method 2: Click using page.evaluate
        await page.evaluate((button: HTMLElement) => {
          button.click();
        }, sendButton);
        console.log("Clicked send button (method 2)");
      } catch (error) {
        console.log("Second click method failed, trying final method...");
        // Method 3: Click using mouse events
        const box = await sendButton.boundingBox();
        if (box) {
          await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
          console.log("Clicked send button (method 3)");
        } else {
          throw new Error("Could not get button position");
        }
      }
    }

    logger.info(`Message sent successfully to ${username}`);
    await delay(2000); // Wait for message to be sent
  } catch (error) {
    logger.error(`Error sending message to ${username}:`, error);
    throw error;
  }
}

async function interactWithPosts(page: any) {
  let postIndex = 1; // Start with the first post
  const maxPosts = 20; // Limit to prevent infinite scrolling

  while (postIndex <= maxPosts) {
    try {
      const postSelector = `article:nth-of-type(${postIndex})`;

      // Check if the post exists
      if (!(await page.$(postSelector))) {
        console.log("No more posts found. Ending iteration...");
        return;
      }

      const likeButtonSelector = `${postSelector} svg[aria-label="Like"]`;
      const likeButton = await page.$(likeButtonSelector);
      const ariaLabel = await likeButton?.evaluate((el: Element) =>
        el.getAttribute("aria-label")
      );

      if (ariaLabel === "Like") {
        console.log(`Liking post ${postIndex}...`);
        await likeButton.click();
        await page.keyboard.press("Enter");
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
        caption = await captionElement.evaluate(
          (el: HTMLElement) => el.innerText
        );
        console.log(`Caption for post ${postIndex}: ${caption}`);
      } else {
        console.log(`No caption found for post ${postIndex}.`);
      }

      // Check if there is a '...more' link to expand the caption
      const moreLinkSelector = `${postSelector} div.x9f619 span._ap3a span div span.x1lliihq`;
      const moreLink = await page.$(moreLinkSelector);
      if (moreLink) {
        console.log(`Expanding caption for post ${postIndex}...`);
        await moreLink.click();
        const expandedCaption = await captionElement.evaluate(
          (el: HTMLElement) => el.innerText
        );
        console.log(
          `Expanded Caption for post ${postIndex}: ${expandedCaption}`
        );
        caption = expandedCaption;
      }

      // Comment on the post
      const commentBoxSelector = `${postSelector} textarea`;
      const commentBox = await page.$(commentBoxSelector);
      if (commentBox) {
        console.log(`Commenting on post ${postIndex}...`);
        const prompt = `human-like Instagram comment based on to the following post: "${caption}". make sure the reply
            Matchs the tone of the caption (casual, funny, serious, or sarcastic).
            Sound organic—avoid robotic phrasing, overly perfect grammar, or anything that feels AI-generated.
            Use relatable language, including light slang, emojis (if appropriate), and subtle imperfections like minor typos or abbreviations (e.g., 'lol' or 'omg').
            If the caption is humorous or sarcastic, play along without overexplaining the joke.
            If the post is serious (e.g., personal struggles, activism), respond with empathy and depth.
            Avoid generic praise ('Great post!'); instead, react specifically to the content (e.g., 'The way you called out pineapple pizza haters 😂👏').
            *Keep it concise (1-2 sentences max) and compliant with Instagram's guidelines (no spam, harassment, etc.).*`;

        const schema = getInstagramCommentSchema();
        const result = await runAgent(schema, prompt);
        const comment = result[0]?.comment;
        await commentBox.type(comment);

        // New selector approach for the post button
        const postButton = await page.evaluateHandle(() => {
          const buttons = Array.from(
            document.querySelectorAll('div[role="button"]')
          );
          return buttons.find(
            (button) =>
              button.textContent === "Post" && !button.hasAttribute("disabled")
          );
        });

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

      // Wait before moving to the next post
      const waitTime = Math.floor(Math.random() * 5000) + 5000;
      console.log(
        `Waiting ${waitTime / 1000} seconds before moving to the next post...`
      );
      await delay(waitTime);

      // Scroll to the next post
      await page.evaluate(() => {
        window.scrollBy(0, window.innerHeight);
      });

      postIndex++;
    } catch (error) {
      console.error(`Error interacting with post ${postIndex}:`, error);
      break;
    }
  }
}

async function scrapeFollowers(
  page: any,
  targetAccount: string,
  maxFollowers: number
) {
  try {
    // Navigate to the target account's followers page
    await page.goto(`https://www.instagram.com/${targetAccount}/followers/`, {
      waitUntil: "networkidle2",
    });
    console.log(`Navigated to ${targetAccount}'s followers page`);

    // Handle potential notification popup
    await handleNotificationPopup(page);

    // Wait for the followers modal to load
    await page.waitForSelector('div a[role="link"] span[title="101"]');
    console.log("Followers modal loaded");

    const followers: string[] = [];
    let previousHeight = 0;
    let currentHeight = 0;
    maxFollowers = maxFollowers + 4;
    // Scroll and collect followers until we reach the desired amount or can't scroll anymore
    console.log(maxFollowers);
    while (followers.length < maxFollowers) {
      // Get all follower links in the current view
      const newFollowers = await page.evaluate(() => {
        const followerElements =
          document.querySelectorAll('div a[role="link"]');
        return Array.from(followerElements)
          .map((element) => element.getAttribute("href"))
          .filter(
            (href): href is string => href !== null && href.startsWith("/")
          )
          .map((href) => href.substring(1)); // Remove leading slash
      });

      // Add new unique followers to our list
      for (const follower of newFollowers) {
        if (!followers.includes(follower) && followers.length < maxFollowers) {
          followers.push(follower);
          console.log(`Found follower: ${follower}`);
        }
      }

      // Scroll the followers modal
      await page.evaluate(() => {
        const dialog = document.querySelector('div[role="dialog"]');
        if (dialog) {
          dialog.scrollTop = dialog.scrollHeight;
        }
      });

      // Wait for potential new content to load
      await delay(1000);

      // Check if we've reached the bottom
      currentHeight = await page.evaluate(() => {
        const dialog = document.querySelector('div[role="dialog"]');
        return dialog ? dialog.scrollHeight : 0;
      });

      if (currentHeight === previousHeight) {
        console.log("Reached the end of followers list");
        break;
      }

      previousHeight = currentHeight;
    }

    console.log(`Successfully scraped ${followers.length - 4} followers`);
    return followers.slice(4);
  } catch (error) {
    console.error(`Error scraping followers for ${targetAccount}:`, error);
    throw error;
  }
}

async function sendDirectMessageWithMedia(
  page: any,
  username: string,
  message: string,
  mediaPath?: string
) {
  try {
    // Navigate to the user's profile
    await page.goto(`https://www.instagram.com/${username}/`, {
      waitUntil: "networkidle2",
    });
    console.log("Navigated to user profile");

    // Wait for the page to load completely
    await delay(3000);

    // Try multiple selectors for the message button
    const messageButtonSelectors = [
      'div[role="button"]',
      "button",
      'a[href*="/direct/t/"]',
      'div[role="button"] span',
      'div[role="button"] div',
    ];

    let messageButton = null;
    for (const selector of messageButtonSelectors) {
      console.log(`Trying selector: ${selector}`);
      const elements = await page.$$(selector);
      for (const element of elements) {
        const text = await element.evaluate((el: Element) => el.textContent);
        if (text && text.trim() === "Message") {
          messageButton = element;
          console.log(`Found message button with selector: ${selector}`);
          break;
        }
      }
      if (messageButton) break;
    }

    if (!messageButton) {
      await page.screenshot({ path: "debug-message-button.png" });
      throw new Error(
        "Message button not found. Screenshot saved as debug-message-button.png"
      );
    }

    // Click the message button
    await messageButton.click();
    console.log("Clicked message button");

    // Wait for the DM modal to appear and handle potential popup
    await delay(2000);
    console.log("Waiting for DM modal");
    await handleNotificationPopup(page);
    await delay(5000);

    // If media is provided, upload it first
    if (mediaPath) {
      console.log("Uploading media...");

      // Find and click the media upload button
      const uploadButtonSelectors = [
        'div[role="button"]:has(svg[aria-label="Add Photo or Video"])',
        'div[role="button"][aria-label="Add to your post"]',
        'div[role="button"][aria-label="Add photos or videos"]',
        'div[role="button"] svg[aria-label="Add photos or videos"]',
        'div div[role="button"] div svg[aria-label="Add photos or videos"][role="img"]',
      ];

      let uploadButton = null;
      for (const selector of uploadButtonSelectors) {
        console.log(`Trying upload button selector: ${selector}`);
        const button = await page.$(selector);
        if (button) {
          uploadButton = button;
          console.log(`Found upload button with selector: ${selector}`);
          break;
        }
      }

      if (!uploadButton) {
        await page.screenshot({ path: "debug-upload-button.png" });
        throw new Error(
          "Media upload button not found. Screenshot saved as debug-upload-button.png"
        );
      }

      await uploadButton.click();
      console.log("Clicked upload button");

      // Wait for file input to be available
      await delay(1000);

      // Upload the file
      const fileInput = await page.$('input[type="file"]');
      if (!fileInput) {
        throw new Error("File input not found after clicking upload button");
      }

      await fileInput.uploadFile(mediaPath);
      console.log("File uploaded");

      // Wait for media to be processed
      await delay(3000);
    }

    // Type the message if provided
    if (message) {
      // Try multiple selectors for the message input
      const messageInputSelectors = [
        'textarea[placeholder="Message..."]',
        'div[role="textbox"]',
        'div[contenteditable="true"]',
        'textarea[aria-label="Message"]',
        'div[data-lexical-editor="true"]',
        'div[contenteditable="true"][role="textbox"]',
        'div[data-lexical-editor="true"][contenteditable="true"]',
        'div[aria-label="Message"]',
        'div[aria-label="Message input"]',
        'div[aria-label="Message input field"]',
      ];

      let messageInput = null;
      for (const selector of messageInputSelectors) {
        console.log(`Trying message input selector: ${selector}`);
        messageInput = await page.$(selector);
        if (messageInput) {
          console.log(`Found message input with selector: ${selector}`);
          break;
        }
      }

      if (!messageInput) {
        throw new Error("Message input not found");
      }

      await messageInput.type(message);
      console.log("Typed message");
    }

    // Wait a bit before trying to send
    await delay(2000);

    // Try multiple selectors for the send button
    const sendButtonSelectors = [
      'div[role="button"]',
      "button",
      'div[role="button"] span',
      'div[role="button"] div',
      'div[role="button"]:not([disabled])',
      'div[role="button"]:not([aria-disabled="true"])',
      'div[aria-label="Send"]',
      'div[aria-label="Send message"]',
      'div[aria-label="Send Message"]',
    ];

    let sendButton = null;
    for (const selector of sendButtonSelectors) {
      console.log(`Trying send button selector: ${selector}`);
      const elements = await page.$$(selector);
      for (const element of elements) {
        const text = await element.evaluate((el: Element) => el.textContent);
        const isDisabled = await element.evaluate((el: Element) => {
          return (
            el.hasAttribute("disabled") ||
            el.getAttribute("aria-disabled") === "true"
          );
        });

        if (text && text.trim() === "Send" && !isDisabled) {
          sendButton = element;
          console.log(`Found send button with selector: ${selector}`);
          break;
        }
      }
      if (sendButton) break;
    }

    if (!sendButton) {
      throw new Error("Send button not found");
    }

    // Click the send button
    await sendButton.click();
    console.log("Clicked send button");

    logger.info(`Message sent successfully to ${username}`);
    await delay(2000); // Wait for message to be sent
  } catch (error) {
    logger.error(`Error sending message to ${username}:`, error);
    throw error;
  }
}

async function sendDirectMessagesFromFile(
  page: any,
  filePath: string,
  message: string,
  mediaPath?: string
) {
  try {
    // Read the file content
    const fileContent = await fs.readFile(filePath, "utf-8");
    console.log("Raw file content:", fileContent);

    // Split the content by newlines and filter out empty lines
    const usernames = fileContent
      .split("\n")
      .map((line: string) => line.trim())
      .filter((line: string) => line) // Only remove empty lines
      .map((line: string) => line.replace(/\/$/, "")); // Remove trailing slash if present

    console.log("Final usernames array:", usernames);

    logger.info(`Found ${usernames.length} usernames in the file`);

    // Send message to each username
    for (const username of usernames) {
      try {
        console.log(`\nAttempting to send message to ${username}...`);

        // Wait for the message to be sent
        await sendDirectMessageWithMedia(page, username, message, mediaPath);

        console.log(`Successfully sent message to ${username}`);

        // Add a longer delay between messages to avoid rate limiting
        console.log("Waiting 10 seconds before next message...");
        await delay(10000);
      } catch (error) {
        logger.error(`Failed to send message to ${username}:`, error);
        console.log(`Skipping ${username} due to error...`);

        // Add a delay even after errors to avoid rate limiting
        console.log("Waiting 10 seconds before next message...");
        await delay(10000);

        // Continue with the next username
        continue;
      }
    }

    logger.info("Finished sending messages to all usernames");
  } catch (error) {
    logger.error("Error reading file or sending messages:", error);
    throw error;
  }
}

async function runInstagram() {
  const server = new Server({ port: 8000 });
  await server.listen();
  const proxyUrl = `http://localhost:8000`;
  const browser = await puppeteer.launch({
    headless: false,
    args: [`--proxy-server=${proxyUrl}`],
  });

  const page = await browser.newPage();
  const cookiesPath = "./cookies/Instagramcookies.json";

  const checkCookies = await Instagram_cookiesExist();
  logger.info(`Checking cookies existence: ${checkCookies}`);

  if (checkCookies) {
    const cookies = await loadCookies(cookiesPath);
    await page.setCookie(...cookies);
    logger.info("Cookies loaded and set on the page.");

    await page.goto("https://www.instagram.com/", {
      waitUntil: "networkidle2",
    });

    const isLoggedIn = await page.$("a[href='/direct/inbox/']");
    if (isLoggedIn) {
      logger.info("Login verified with cookies.");
    } else {
      logger.warn("Cookies invalid or expired. Logging in again...");
      await loginWithCredentials(page, browser);
    }
  } else {
    await loginWithCredentials(page, browser);
  }

  // Create readline interface for user input
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  // Main loop for user interaction
  while (true) {
    const answer = await new Promise<string>((resolve) => {
      rl.question(
        "What would you like to do?\n1. Interact with posts\n2. Send a direct message\n3. Send messages from file\n4. Scrape followers\n5. Exit\nEnter your choice (1, 2, 3, 4, or 5): ",
        resolve
      );
    });

    if (answer === "1") {
      await page.goto("https://www.instagram.com/");
      await handleNotificationPopup(page);
      await interactWithPosts(page);
    } else if (answer === "2") {
      const username = await new Promise<string>((resolve) => {
        rl.question("Enter the username to send message to: ", resolve);
      });

      const message = await new Promise<string>((resolve) => {
        rl.question("Enter your message: ", resolve);
      });

      const mediaPath = await new Promise<string>((resolve) => {
        rl.question(
          "Enter the path to media file (or press Enter to skip): ",
          resolve
        );
      });

      try {
        await sendDirectMessageWithMedia(
          page,
          username,
          message,
          mediaPath || undefined
        );
        logger.info("Message sent successfully.");
      } catch (error) {
        logger.error("Failed to send message:", error);
      }
    } else if (answer === "3") {
      const filePath = await new Promise<string>((resolve) => {
        rl.question(
          "Enter the path to the file containing usernames: ",
          resolve
        );
      });

      const message = await new Promise<string>((resolve) => {
        rl.question("Enter your message: ", resolve);
      });

      const mediaPath = await new Promise<string>((resolve) => {
        rl.question(
          "Enter the path to media file (or press Enter to skip): ",
          resolve
        );
      });

      try {
        await sendDirectMessagesFromFile(
          page,
          filePath,
          message,
          mediaPath || undefined
        );
        logger.info("Messages sent successfully to all usernames.");
      } catch (error) {
        logger.error("Failed to send messages:", error);
      }
    } else if (answer === "4") {
      const targetAccount = await new Promise<string>((resolve) => {
        rl.question("Enter the target account username: ", resolve);
      });

      const maxFollowers = await new Promise<string>((resolve) => {
        rl.question(
          "Enter the maximum number of followers to scrape: ",
          resolve
        );
      });

      try {
        const followers = await scrapeFollowers(
          page,
          targetAccount,
          parseInt(maxFollowers)
        );
        logger.info(
          `Successfully scraped ${followers.length} followers from ${targetAccount}`
        );
        console.log("Followers:", followers);

        // Save followers to a text file
        const filename = `${targetAccount}_followers.txt`;
        const data = followers.join("\n");
        await fs.writeFile(filename, data);
        logger.info(`Saved ${followers.length} followers to ${filename}`);
      } catch (error) {
        logger.error("Failed to scrape followers:", error);
      }
    } else if (answer === "5") {
      logger.info("Exiting.");
      break;
    } else {
      console.log("Invalid choice. Please enter 1, 2, 3, 4, or 5.");
    }
  }

  rl.close();
  await browser.close();
  await server.close(true); // Close the proxy server
}

const loginWithCredentials = async (page: any, browser: Browser) => {
  try {
    await page.goto("https://www.instagram.com/accounts/login/");
    await page.waitForSelector('input[name="username"]');

    // Fill out the login form
    await page.type('input[name="username"]', IGusername);
    await page.type('input[name="password"]', IGpassword);
    await page.click('button[type="submit"]');

    // Wait for navigation after login
    await page.waitForNavigation();

    // Save cookies after login
    const cookies = await browser.cookies();
    // logger.info("Saving cookies after login...",cookies);
    await saveCookies("./cookies/Instagramcookies.json", cookies);

    // Handle potential notification popup after successful login
    await handleNotificationPopup(page);
  } catch (error) {
    // logger.error("Error logging in with credentials:", error);
    logger.error("Error logging in with credentials:");
    throw error; // Re-throw to indicate login failed
  }
};

export { runInstagram };
