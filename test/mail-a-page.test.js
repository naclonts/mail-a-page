require('dotenv').config();
const email = require('../src/email');

process.env.NODE_ENV = 'test';
const chai = require('chai');
const expect = chai.expect;
const assert = chai.assert;

describe('Send an email', function() {
    this.timeout(5000);
    it('should send', async function() {
        let options = {
            from: process.env.NODEMAILER_USER,
            to: process.env.NODEMAILER_USER,
            subject: 'Hello ',
            text: 'hallo world',
            html: '<h1>Hi There!</h1><ul><li>This is an email from your server-self!</li></ul>'
        };
        let res = await email.send(options);
        console.log(res);
        expect(res.accepted).to.be.an('array').that.is.not.empty;
        expect(res.rejected).to.be.an('array').that.is.empty;
    });
});
