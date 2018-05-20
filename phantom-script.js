var system = require('system');
var page = require('webpage').create();
var loadInProgress = false;

/*****************************************************************************/
// Phantom Page configuration
/*****************************************************************************/
// Loading status
page.onLoadStarted = function() {
    loadInProgress = true;
    console.log('Loading started');
};
page.onLoadFinished = function() {
    loadInProgress = false;
    console.log('Loading finished');
};
page.onConsoleMessage = function(msg) {
    console.log(msg);
};

//viewportSize being the actual size of the headless browser
page.viewportSize = { width: 1680, height: 1050 };
//the clipRect is the portion of the page you are taking a screenshot of
page.clipRect = { top: 0, left: 0, width: 1680, height: 1050 };

function errFun(msg, trace) {
    console.log('--------------------- Err! --------------------- ');
    console.log(msg);
    console.log(trace);
    phantom.exit(1);
};
page.onError = errFun;
phantom.onError = errFun;

// Pretty-print utility
function pprint(object) {
    console.log(JSON.stringify(object, null, 2));
}

/*****************************************************************************/
// Configure settings based on args passed in from Node
/*****************************************************************************/
var loginUrl = system.args[1];
var pageUrl = system.args[2];
if (loginUrl === undefined || pageUrl === undefined) {
    throw new Error('Login or page address not specified for PhantomJS process!');
}
var username = system.args[3];
var password = system.args[4];
if (username === undefined || password === undefined) {
    throw new Error('Username or password not specified for PhantomJS process!');
}
// Settings for login POST
var postBody = 'username=' + username + '&password=' + password;


/*****************************************************************************/
// Perform login & page retrieval! Killin' it!
/*****************************************************************************/
page.open(loginUrl, 'POST', postBody, function(status) {
    console.log("Status:  " + status);
    console.log("Loaded:  " + page.url);
    pprint(page.cookies);
    console.log(page.content);
    // var html = page.evaluate(function() {
    //     return document.getElementsByClassName('content-wrapper')[0].outerHTML;
    // });
    // console.log(html);
    phantom.exit();
});


// Open website
// page.open(websiteAddress, function(status) {
//     // Show some message in the console
//     console.log("Status:  " + status);
//     console.log("Loaded:  " + page.url);
//     var html = page.evaluate(function() {
//         return document.getElementsByClassName('content-wrapper')[0].outerHTML;
//     });
//     console.log(html);
//     phantom.exit();
// });
