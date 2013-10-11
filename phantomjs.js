var page = require('webpage').create();
page.open('https://www.gov.uk/performance/licensing', function () {
    page.render('pp.png');
    phantom.exit();
});
