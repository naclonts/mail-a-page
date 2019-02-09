#!/usr/bin/env nodejs
/**
 * 
 */

// Libraries
const moment = require('moment');
const path = require('path');
const puppeteer = require('puppeteer');
const { URL } = require('url');

// Load .env file to process.env
require('dotenv').config({path: __dirname+'/./../.env'});

// Import modules
const email = require('./email');

// Script Settings
const SITE_CLASS = process.env.SITE_CLASS



// // PhantomJS command-line args and options
// let args = [path.join(__dirname, 'phantom-script.js'),
//     /* args 1 and 2 */ process.env.LOGIN_URL, process.env.URL,
//     /* args 3 and 4 */ process.env.SITE_USERNAME, process.env.SITE_PASSWORD,
//     /* args 5 and 6 */ process.env.AUTH_COOKIE_NAME, process.env.SITE_CLASS
// ];
// // PhantomJS executable path
// let phantomExecutable = process.env.PHANTOMJS_EXE || 'phantomjs';


/**
 * Convert a Uint8Array to its String form
 * @param   {Uint8Array} uint8Arr
 * @return  {String}
 */
function Uint8ArrayToString(uint8Arr) {
    return String.fromCharCode.apply(null, uint8Arr);
}


// Add any desired inline styles here (before being sent in email).
function processHtml(html) {
    let res = html;

    // Draw black borders around table cells
    res = res.replace(
        /<td/g,
        '<td style="border: 1px solid #666; border-collapse: collapse;"'
    );

    return res;
}



async function start(urlToFetch) {
    console.log('starting')
    const browser = await puppeteer.launch();
    const page = await browser.newPage();


    page.on('response', async (response) => {
        console.log('response')
        const buff = await response.buffer();
        console.log(buff)
    });

    await page.goto(urlToFetch, {
        waitUntil: 'networkidle2',
    });

    const htmlContent = await page.evaluate((cssQuery) => {
        const content = document.getElementsByClassName(cssQuery)[0];
        console.log(
            'doing the thing'
        )
        if (content && content.childElementCount > 0) {
            return Promise.resolve(content.outerHTML);
        }
        return Promise.reject(`[${new Date().toLocaleString()}] No HTML content found for ${cssQuery}!`)
    }, SITE_CLASS);

    console.log(htmlContent)

    setTimeout(async () => {
        await browser.close();
        process.exit(0);
    }, 1000);
}

start('https://nathanclonts.com')
















// // Create PhantomJS process
// let child = spawn(phantomExecutable, args);
// let output = '';

// // Receive output
// child.stdout.on('data', (data) => {
//     let text = Uint8ArrayToString(data);
//     console.log(text);
//     output += text;
// });
// child.stderr.on('data', (err) => {
//     console.log(`[${moment()}] Error in PhantomJS process!`);
//     let text = Uint8ArrayToString(err);
//     console.log(text);
// });
// // When finished, ship it off!
// child.on('close', async (code) => {
//     console.log(`[${moment()}] Process closed with status code: ${code}`);
//     // Email results
//     let options = {
//         from: process.env.NODEMAILER_USER,
//         to: process.env.EMAIL_TO.split(';'),
//         subject: `${process.env.EMAIL_SUBJECT} - ${moment().format("M/D/Y")}`,
//         text: '',
//         html: processHtml(output)
//     };
//     let res = await email.send(options);
//     if (!res.accepted || res.accepted.length == 0) {
//         console.error(`[${moment()}] Email not accepted! Response: ${res}`);
//     }
//     if (res.rejected && res.rejected.length > 0) {
//         console.error(`[${moment()}] Email rejected. Response: ${res}`);
//     }
// });
