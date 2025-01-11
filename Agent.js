import { promises as fs } from "fs"; // Import fs.promises for async file operations
import { GoogleGenerativeAI } from "@google/generative-ai";
import { chromium } from "playwright";

import dotenv from "dotenv";
dotenv.config();

const geminiApiKeys = [
  process.env.GEMINI_API_KEY_1 || "API_KEY_1",
  process.env.GEMINI_API_KEY_2 || "API_KEY_2",
  process.env.GEMINI_API_KEY_3 || "API_KEY_3",
];

let currentApiKeyIndex = 0; // Keeps track of the current API key in use

const username =   process.env.username;
const password =   process.env.password;
// Function to get the next API key in the list
const getNextApiKey = () => {
  currentApiKeyIndex = (currentApiKeyIndex + 1) % geminiApiKeys.length; // Circular rotation of API keys
  return geminiApiKeys[currentApiKeyIndex];
};

const cookiesPath = "./cookies.json";

async function loginToInstagram() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // If cookies exist, load them
  if (await cookiesExist()) {
    const cookies = JSON.parse(await fs.readFile(cookiesPath, "utf-8"));
    await page.context().addCookies(cookies);
    console.log("Cookies loaded, skipping login...");
    await page.goto("https://www.instagram.com");
  } else {
    // Navigate to Instagram login page if no cookies are available
    await page.goto("https://www.instagram.com/accounts/login/");
    await page.waitForSelector('input[name="username"]');

    // Fill out the login form
    await page.fill('input[name="username"]', username); // Replace with your username
    await page.fill('input[name="password"]', password); // Replace with your password
    await page.click('button[type="submit"]');

    // Wait for navigation after login
    await page.waitForNavigation();

    // Save cookies after login
    const cookies = await page.context().cookies();
    await fs.writeFile(cookiesPath, JSON.stringify(cookies));
    console.log("Login successful, cookies saved.");
  }

  // Optionally take a screenshot after loading the page
  //   await page.screenshot({ path: 'logged_in.png' });

  // Navigate to the Instagram homepage
  await page.goto("https://www.instagram.com/");

  // Interact with the first post
  await interactWithPosts(page);

  // Close the browser
  //   await browser.close();
}



async function interactWithPosts(page) {
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
            // // Dynamically select the like button
            // const likeButtonSelector = `${postSelector} section.x6s0dn4 div.x78zum5 span.xp7jhwk div.x1ypdohk div.x1i10hfl div.x6s0dn4 span svg[aria-label="Like"], ${postSelector} section.x6s0dn4 div.x78zum5 span.xp7jhwk div.x1ypdohk div.x1i10hfl div.x6s0dn4 span svg[aria-label="Unlike"]`;
            const likeButton = await page.$(likeButtonSelector);
            const ariaLabel = await likeButton?.getAttribute("aria-label");

            if (ariaLabel === "Like") {
                console.log(`Liking post ${postIndex}...`);
                // await highlightElement(page, postIndex, "like"); 
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

            let caption = '';
            if (captionElement) {
                caption = await captionElement.evaluate((el) => el.innerText);
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
                const expandedCaption = await captionElement.evaluate((el) => el.innerText);
                console.log(`Expanded Caption for post ${postIndex}: ${expandedCaption}`);
                caption = expandedCaption; // Update caption with expanded content
            }

            // Comment on the post
            const commentBoxSelector = `${postSelector} textarea`;
            const commentBox = await page.$(commentBoxSelector);
            if (commentBox) {
                console.log(`Commenting on post ${postIndex}...`);
                // await highlightElement(page, postIndex, "comment");
                // Randomize comment from the list
                const comment = await generatePostReply(caption); // Pass the updated caption
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


// Check if cookies file exists
async function cookiesExist() {
    try {
      // Check if the cookies file exists
      await fs.access(cookiesPath);
  
      // Read and parse the cookies file
      const cookiesData = await fs.readFile(cookiesPath, "utf-8");
      const cookies = JSON.parse(cookiesData);
  
      // Check if any cookies have expired
      const now = new Date();
      const hasValidCookies = cookies.some((cookie) => {
        const expiryDate = new Date(cookie.expires || 0); // Parse the expires field
        return expiryDate > now; // Cookie is valid if it expires in the future
      });
  
      return hasValidCookies;
    } catch (error) {
      // Return false if the file doesn't exist or an error occurs
      return false;
    }
  }

async function generatePostReply(postCaption) {
    let geminiApiKey = geminiApiKeys[currentApiKeyIndex];
    let currentApiKeyName = `GEMINI_API_KEY_${currentApiKeyIndex + 1}`;

    if (!geminiApiKey) {
        console.error("No Gemini API key available.");
        return;
    }

    const googleAI = new GoogleGenerativeAI(geminiApiKey);
    const model = googleAI.getGenerativeModel({
        model: "gemini-1.5-flash",
    });

    try {
        // Updated prompt to generate a more mature and engaging reply
        const prompt = `Craft a thoughtful, engaging, and mature reply to the following post: "${postCaption}". Ensure the reply is relevant, insightful, and adds value to the conversation. It should reflect empathy and professionalism, and avoid sounding too casual or superficial. also it should be 300 characters or less. and it should not go against instagram Community Standards on spam. so you will have to try your best to humanize the reply`;

        const result = await model.generateContent(prompt);

        console.log("Generated Caption:", result.response.text());
        return result.response.text();
    } catch (error) {
        // Handle rate limit or service unavailable errors
        if (error.message.includes("429 Too Many Requests")) {
            console.error(
                `---${currentApiKeyName} limit exhausted, switching to the next API key...`
            );
            geminiApiKey = getNextApiKey(); // Switch to the next API key
            currentApiKeyName = `GEMINI_API_KEY_${currentApiKeyIndex + 1}`; // Update the name
            return generatePostReply(postCaption); // Retry with the new API key
        } else if (error.message.includes("503 Service Unavailable")) {
            console.error("Service is temporarily unavailable. Retrying...");
            // Implement retry logic, like a small delay before retrying
            await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait for 5 seconds before retrying
            return generatePostReply(postCaption); // Retry the request
        } else {
            console.error(
                "Error generating post reply content:",
                error.message
            );
            return "An error occurred while generating content.";
        }
    }
}



// Function to highlight elements with different colors
async function highlightElement(page, postIndex, elementType) {
    const postSelector = `article:nth-of-type(${postIndex})`;

    // Highlight the whole body in red
    // await page.evaluate(() => {
    //     document.body.style.border = "5px solid red";
    //     document.body.style.transition = "border 0.5s ease";
    // });

    // Select the like button
    const likeButtonSelector = `${postSelector} section.x6s0dn4 div.x78zum5 span.xp7jhwk div.x1ypdohk div.x1i10hfl div.x6s0dn4 span svg[aria-label="Like"], ${postSelector} section.x6s0dn4 div.x78zum5 span.xp7jhwk div.x1ypdohk div.x1i10hfl div.x6s0dn4 span svg[aria-label="Unlike"]`;
    const likeButton = await page.$(likeButtonSelector);

    // Highlight like button in green when active
    if (elementType === "like" && likeButton) {
        await page.evaluate((button) => {
            button.style.border = "3px solid green";
            button.style.transition = "border 0.5s ease";
        }, likeButton);
    } else {
        // If not liking, reset the like button border
        await page.evaluate(() => {
            const buttons = document.querySelectorAll('[aria-label="Like"], [aria-label="Unlike"]');
            buttons.forEach((button) => {
                button.style.border = "";
            });
        });
    }

    // Select the comment box
    const commentBoxSelector = `${postSelector} textarea`;
    const commentBox = await page.$(commentBoxSelector);

    // Highlight comment box in green when commenting
    if (elementType === "comment" && commentBox) {
        await page.evaluate((box) => {
            box.style.border = "3px solid green";
            box.style.transition = "border 0.5s ease";
        }, commentBox);
    } else {
        // If not commenting, reset the comment box border
        await page.evaluate(() => {
            const boxes = document.querySelectorAll('textarea');
            boxes.forEach((box) => {
                box.style.border = "";
            });
        });
    }

    // Optionally, reset the body border if necessary
    if (elementType !== "like" && elementType !== "comment") {
        await page.evaluate(() => {
            document.body.style.border = "";
        });
    }
}

loginToInstagram();
// runTwitterAgent();
