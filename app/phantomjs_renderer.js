define([
  'common/utils/path_manipulator',
  'phantom'
],
function (PathManipulator, phantom) {
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

    phantomInstance.createPage(function(page) {
      page.set('viewportSize', { width: 1000, height: 1000 });

      page.open(task.url, function (status) {
        console.log(status);
        var imagePath = imagePathFromUrl(task.url);
        page.render(imagePath, function () {
          callback(imagePath);
          console.log("Task processed");
        });
      });

    });
  };

});
