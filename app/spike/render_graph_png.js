define([
  'tpl!spike/graph.html'
],
function (baseTemplate) {

  return function render (req, res) {
    var phantom = require('phantom');
    phantom.create(function (ph) {
      return ph.createPage(function(page) {
        return page.open('http://localhost:3000/view/graph', function (status) {
            page.zoomFactor = 0.25;
            page.render('graph.png');
            ph.exit();
            res.sendfile('graph.png');
        });
      });
    });
  };
});
