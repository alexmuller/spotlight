define(
function () {
  var phantom = require('phantom');
  var fs = require('fs');
  var phantomInstance;
  
  phantom.create(function (ph) {
    phantomInstance = ph;
  });


  return function (task, callback) {
    console.log("New task received");

    return phantomInstance.createPage(function(page) {
      page.set('viewportSize', { width: 1000, height: 1000 });
      return page.open(task.url, function (status) {
          page.render('./graph.png', function () {
            callback('./graph.png');
            console.log("Task processed")
          });
      });
    });
  }

}    
);
