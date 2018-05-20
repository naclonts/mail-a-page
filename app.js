/**
 * Run phantom-script.js from a node process.
 *
 * Credit to Our Code World for their tutorial:
 *  https://ourcodeworld.com/articles/read/379/how-to-use-phantomjs-with-node-js
 */

const spawn = require('child_process').spawn;
require('dotenv').config();

// PhantomJS command-line args and options
let args = ['./phantom-script.js', process.env.URL];
let options = {};

// PhantomJS executable path
let phantomExecutable = 'phantomjs';

/**
 * Convert a Uint8Array to its String form
 * @param   {Uint8Array} uint8Arr
 * @return  {String}
 */
function Uint8ArrayToString(uint8Arr) {
    return String.fromCharCode.apply(null, uint8Arr);
}

let child = spawn(phantomExecutable, args, options);

// Receive output
child.stdout.on('data', (data) => {
    let text = Uint8ArrayToString(data);
    console.log(text);
});
child.stderr.on('data', (err) => {
    console.log(`Error in PhantomJS process!`);
    let text = Uint8ArrayToString(data);
    console.log(text);
});
child.on('close', (code) => {
    console.log(`Process closed with status code: ${code}`);
});
