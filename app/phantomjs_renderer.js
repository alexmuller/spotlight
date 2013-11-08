define([
  'common/utils/path_manipulator'
],
function (PathManipulator) {
  var phantom = require('phantom');
  var fs = require('fs');
  var phantomInstance;
  
  phantom.create(function (ph) {
    phantomInstance = ph;
  });

  var imagePathFromUrl = function (url) {
    return PathManipulator.imagePathFromUrl(url);
  };

  return function (task, callback) {
    console.log("New task received");

    return phantomInstance.createPage(function(page) {
      page.set('viewportSize', { width: 1000, height: 1000 });
      return page.open(task.url, function (status) {
          console.log(status);
          var imagePath = "./graph.png";//imagePathFromUrl(task.url);
          console.log(imagePath);
          page.render(imagePath, function () {
            console.log("here");
            callback(imagePath);
            console.log("Task processed");
          });
      });
    });
  };

});
