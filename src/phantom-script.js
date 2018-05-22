/**
 * PhantomJS process triggered by NodeJS.
 *
 * Logs HTML resulting from Node's `spawn` arguments.
 */
var system = require('system');
var page = require('webpage').create();
var loadInProgress = false;

// debug flag
var dbg = false;

page.onConsoleMessage = function(msg, lineNum, sourceId) {
  pprint(msg);
};

/*****************************************************************************/
// Phantom Page configuration
/*****************************************************************************/
function errFun(msg, trace) {
    pprint('--------------------- Err! --------------------- ');
    pprint(msg);
    pprint(trace);
    phantom.exit(1);
};
page.onError = errFun;
phantom.onError = errFun;

// Pretty-print utility. Only outputs to console if `dbg` is true.
function pprint(object) {
    if (!dbg) return;
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
// Auth cookie name
var authCookieName = system.args[5];
var elementClass = system.args[6];

/*****************************************************************************/
// Perform login & page retrieval! Killin' it!
/*****************************************************************************/
var authCookie;
// Post to login endpoint to get that sweet authentication cookie!
page.open(loginUrl, 'POST', postBody, function(status) {
    pprint("Status:  " + status);
    pprint("Loaded:  " + page.url);
    authCookie = page.cookies.filter(function(cookie) {
        return cookie.name == authCookieName;
    })[0];
    // pprint(authCookie);
    if (!authCookie) {
        pprint('Uh oh! No auth token cookie!')
        throw new Error('No auth token cookie provided by login response!');
    }
});

// Max number of times to try getting HTML element.
var MAX_ATTEMPTS = 50;

// Open data page after 6 seconds, giving time for login to finish
setTimeout(function loadRealPage() {
    phantom.addCookie(authCookie);
    page.open(pageUrl, function(status) {
        pprint("Status:  " + status);
        pprint("Loaded:  " + page.url);
        var attempts = 0;
        // Evaluate page repeatedly, giving time to populate with any AJAX
        // data (and finish front-end JS framework action)
        function checkPageReady() {
            var html = page.evaluate(function(query) {
                var content = document.getElementsByClassName(query)[0];
                if (content && content.childElementCount > 0) {
                    return content.outerHTML;
                }
            }, elementClass);
            pprint(page.errors);
            if (html) {
                // Output HTML and exit!
                console.log(html);
                phantom.exit();
            } else if (attempts < MAX_ATTEMPTS) {
                attempts++;
                pprint('try again... numero ' + attempts);
                setTimeout(checkPageReady, 5000);
            } else {
                // If MAX_ATTEMPTS is exceeded, just return an apology
                console.log('Requested data could not be found! Sorry!');
                phantom.exit();
            }
        }
        checkPageReady();
    });
}, 6000);
