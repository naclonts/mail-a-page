var system = require('system');
var page = require('webpage').create();
var websiteAddress = system.args[1];
console.log(websiteAddress);
//viewportSize being the actual size of the headless browser
page.viewportSize = { width: 1680, height: 1050 };
//the clipRect is the portion of the page you are taking a screenshot of
page.clipRect = { top: 0, left: 0, width: 1680, height: 1050 };

function errFun(msg, trace) {
    console.error('--------------------- Err! --------------------- ');
    // console.log(msg);
    // console.log(trace);
    phantom.exit(1);
};
page.onError = errFun;
phantom.onError = errFun;

// Open website
page.open(websiteAddress, function(status) {
    // Show some message in the console
    console.log("Status:  " + status);
    console.log("Loaded:  " + page.url);
    var html = page.evaluate(function() {
        return document.getElementsByClassName('content-wrapper')[0].outerHTML;
    });
    console.log(html);
    phantom.exit();
});
