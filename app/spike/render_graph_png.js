define([
  'tpl!spike/graph.html'
],
function (baseTemplate) {

  return function (queue) {
    return function render (req, res) {
      var path = req.url.replace(".png", "");
      console.log(path);
      queue.push({url: "http://localhost:3057" + path}, function (file) {
        res.sendfile(file);
      });
    };
  };
});
