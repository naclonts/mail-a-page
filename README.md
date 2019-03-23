# Get a website by email
This small Node app is designed to automatically retrieve a webpage, then email it to a distribution list at a specified time. Works with SPA's as well as server-rendered pages, including support for authentication through a login page.

- Generate & email reports from dashboards
- Record a site's generated content daily


## Workings
The URL you provide is retrieved, parsed by Chromium, and allowed to execute until the network is idle for 500ms. The HTML contents are then emailed to addresses of your choosing.

The section of the webpage that is emailed is determined by the `SITE_CLASS` variable in `.env`. The contents of the first HTML element with the given CSS class will be included.


## Install
> Note: puppeteer will install a headless Chromium to your machine if it isn't already installed. Be aware!

Run `npm install`.

Create a `.env` file specifying the environment variables listed in `.env.example`.

Running `npm src/app.js` will pull the page and send the email, based on your env settings.

Email is set to go through Outlook by default. This could easily be changed by modifying the `src/email.js` file's `transporter` object.
