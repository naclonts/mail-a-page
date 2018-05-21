#!/usr/bin/env nodejs
/**
 * Run phantom-script.js from a node process.
 *
 * Credit to Our Code World for their tutorial:
 *  https://ourcodeworld.com/articles/read/379/how-to-use-phantomjs-with-node-js
 */
// Libraries
const moment = require('moment');
const path = require('path');
const spawn = require('child_process').spawn;
// Load .env file to process.env
require('dotenv').config({path: __dirname+'/./../.env'});

// Import modules
const email = require('./email');


// PhantomJS command-line args and options
let args = [path.join(__dirname, 'phantom-script.js'),
    /* args 1 and 2 */ process.env.LOGIN_URL, process.env.URL,
    /* args 3 and 4 */ process.env.SITE_USERNAME, process.env.SITE_PASSWORD,
    /* args 5 and 6 */ process.env.AUTH_COOKIE_NAME, process.env.SITE_CLASS
];
// PhantomJS executable path
let phantomExecutable = process.env.PHANTOMJS_EXE || 'phantomjs';


/**
 * Convert a Uint8Array to its String form
 * @param   {Uint8Array} uint8Arr
 * @return  {String}
 */
function Uint8ArrayToString(uint8Arr) {
    return String.fromCharCode.apply(null, uint8Arr);
}


// Create PhantomJS process
let child = spawn(phantomExecutable, args);
let output = '';

// Receive output
child.stdout.on('data', (data) => {
    let text = Uint8ArrayToString(data);
    console.log(text);
    output += text;
});
child.stderr.on('data', (err) => {
    console.log(`Error in PhantomJS process!`);
    let text = Uint8ArrayToString(err);
    console.log(text);
});
// When finished, ship it off!
child.on('close', async (code) => {
    console.log(`Process closed with status code: ${code}`);
    // Email results
    let options = {
        from: process.env.NODEMAILER_USER,
        to: process.env.EMAIL_TO.split(';'),
        subject: `${process.env.EMAIL_SUBJECT} - ${moment().format("M/D/Y")}`,
        text: '',
        html: processHtml(output)
    };
    let res = await email.send(options);
    if (!res.accepted || res.accepted.length == 0) {
        console.error(`[${moment()}] Email not accepted! Response: ${res}`);
    }
    if (res.rejected && res.rejected.length > 0) {
        console.error(`[${moment()}] Email rejected. Response: ${res}`);
    }
});

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
