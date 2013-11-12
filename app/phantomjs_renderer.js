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

    phantomInstance.createPage(function(page) {
      var render = function () {
        var ready = page.evaluate(function () {
          return $('body').hasClass('ready');
        });
        console.log(ready);

        if (ready) {
          var imagePath = imagePathFromUrl(task.url);
          page.render(imagePath, function () {
            callback(imagePath);
            console.log("Task processed");
          });
        } else {
          setTimeout(render, 100);
        }
      };

      page.set('viewportSize', { width: 1000, height: 1000 });

      page.open(task.url, function (status) {
        render();
      });

    });
  };

});
