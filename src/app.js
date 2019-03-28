#!/usr/bin/env nodejs
/**
 * 
 */

// Libraries
const moment = require('moment');
const puppeteer = require('puppeteer');
require('dotenv').config({path: __dirname+'/./../.env'}); // Load .env file to process.env
const email = require('./email');

//////////////////////////////
// Script Settings
const SITE_CLASS = process.env.SITE_CLASS;
const LOGIN_URL = process.env.LOGIN_URL;
const SITE_URL = process.env.URL;
const SITE_USERNAME = process.env.SITE_USERNAME;
const SITE_PASSWORD = process.env.SITE_PASSWORD;
const NODEMAILER_USER = process.env.NODEMAILER_USER;
const EMAIL_TO = process.env.EMAIL_TO;
const EMAIL_SUBJECT = process.env.EMAIL_SUBJECT;

// Hardcoded login form inputs. Change as needed.
const LOGIN_USERNAME_SELECTOR = 'input[name="username"]';
const LOGIN_PASSWORD_SELECTOR = 'input[name="password"]';
const LOGIN_SUBMIT_SELECTOR = 'button[type="submit"]';


/**
 * Add inline styles here
 */
function processHtml(html) {
    let res = html;

    // Draw black collapsed borders around table cells
    res = res.replace(
        /<table/g,
        '<table style="border: 1px solid #666; border-collapse: collapse;"'
    );
    res = res.replace(
        /<td/g,
        '<td style="border: 1px solid #666;"'
    );

    return res;
}


async function start() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    //////////////////////////////
    // Log in
    await page.goto(LOGIN_URL, {
        waitUntil: 'networkidle0',
    });

    await page.click(LOGIN_USERNAME_SELECTOR);
    await page.keyboard.type(SITE_USERNAME);
    await page.click(LOGIN_PASSWORD_SELECTOR);
    await page.keyboard.type(SITE_PASSWORD);
    await page.click(LOGIN_SUBMIT_SELECTOR);
    await page.waitForNavigation();

    //////////////////////////////
    // Go to the target page
    await page.goto(SITE_URL, {
        waitUntil: 'networkidle2',
	timeout: 0, // never timeout
    });

    try {
        const htmlContent = await page.evaluate((cssQuery) => {
            const content = document.getElementsByClassName(cssQuery)[0];
            if (content && content.childElementCount > 0) {
                return Promise.resolve(content.outerHTML);
            }
            return Promise.reject(`[${new Date().toLocaleString()}] No HTML content found for ${cssQuery}!`)
        }, SITE_CLASS);

        // Email results
        let options = {
            from: NODEMAILER_USER,
            to: EMAIL_TO.split(';'),
            subject: `${EMAIL_SUBJECT} - ${moment().format("M/D/Y")}`,
            text: '',
            html: processHtml(htmlContent),
        };
        let res = await email.send(options);
        if (!res.accepted || res.accepted.length == 0) {
            console.error(`[${moment()}] Email not accepted! Response: ${res}`);
        }
        if (res.rejected && res.rejected.length > 0) {
            console.error(`[${moment()}] Email rejected. Response: ${res}`);
        }

    }
    catch (e) {
        console.error(`[${moment()}] Error during HTML pull or email:`);
        console.error(e);
    }

    //////////////////////////////
    // Exit the process after a minimum of 15 seconds
    setTimeout(async () => {
        await browser.close();
        process.exit(0);
    }, 15000);
}

start()
