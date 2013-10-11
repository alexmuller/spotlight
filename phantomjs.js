var page = require('webpage').create();
page.viewportSize = {width: 1000, height: 1000};
page.open('http://localhost:3000/view/graph', function() {
    page.render('pp.png');
    phantom.exit();
});
