# Get a website by email
This small Node app is designed to automatically retrieve a webpage, then email it to a distribution list at a specified time.

Used for generating "reports" to email from data-filled websites.

## Workings
Node spawns a child PhantomJS process, then emails out the resulting HTML with Nodemailer.

## Install
Install PhantomJS and add it to the system path.

Create a `.env` file specifying a `URL` environment variable. This is the page that will be emailed.
