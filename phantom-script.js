var system = require('system');
var page = require('webpage').create();
var loadInProgress = false;

page.onConsoleMessage = function(msg, lineNum, sourceId) {
  pprint(msg);
};

/*****************************************************************************/
// Phantom Page configuration
/*****************************************************************************/
//viewportSize being the actual size of the headless browser
page.viewportSize = { width: 1680, height: 1050 };
//the clipRect is the portion of the page you are taking a screenshot of
page.clipRect = { top: 0, left: 0, width: 1680, height: 1050 };

function errFun(msg, trace) {
    console.log('--------------------- Err! --------------------- ');
    pprint(msg);
    pprint(trace);
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
// Auth cookie name
var authCookieName = system.args[5];
var elementClass = system.args[6];

/*****************************************************************************/
// Perform login & page retrieval! Killin' it!
/*****************************************************************************/
var authCookie;
// Post to login endpoint to get that sweet authentication cookie!
page.open(loginUrl, 'POST', postBody, function(status) {
    console.log("Status:  " + status);
    console.log("Loaded:  " + page.url);
    authCookie = page.cookies.filter(function(cookie) {
        return cookie.name == authCookieName;
    })[0];
    pprint(authCookie);
    if (!authCookie) {
        console.log('Uh oh! No auth token cookie!')
        throw new Error('No auth token cookie provided by login response!');
    }
});

// Open data page after 3 seconds, giving time for login to finish
setTimeout(function loadRealPage() {
    phantom.addCookie(authCookie);
    page.open(pageUrl, function(status) {
        console.log("Status:  " + status);
        console.log("Loaded:  " + page.url);
        // Evaluate page asynchronously, giving time to populate with any AJAX
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
                pprint(html);
                phantom.exit();
            } else {
                console.log('try again...');
                setTimeout(checkPageReady, 1000);
            }
        }
        checkPageReady();
    });
}, 3000);
