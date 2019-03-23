const nodemailer = require('nodemailer');

// Create transporter with the required configuration
let transporter = nodemailer.createTransport({
    host: 'smtp-mail.outlook.com',
    secureConnection: false, // Outlook's connection thru TLS requires this
    port: 587, // port for secure SMTP
    tls: {
        ciphers: 'SSLv3'
    },
    auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASS
    }
});

async function send(options) {
    options.from = process.env.EMAIL_FROM
    return new Promise((resolve, reject) => {
        transporter.sendMail(options, (err, info) => {
            if (err) {
                console.error(`Error during mail send: ${err}`);
                reject(err);
            }
            resolve(info);
        });
    });
}
module.exports.send = send;
