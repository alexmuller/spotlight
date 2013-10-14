define(
function () {

  return function (task, callback) {
    console.log("New task received");
    var phantom = require('phantom');
    var fs = require('fs');

    phantom.create(function (ph) {
      return ph.createPage(function(page) {
        page.set('viewportSize', { width: 1000, height: 1000 });
        return page.open(task.url, function (status) {
            page.render('./graph.png', function () {
              console.log("Task processed")
              ph.exit();
              callback(null, './graph.png');
            });
        });
      });
    });
  }

}    
);
