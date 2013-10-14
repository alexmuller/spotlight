define([
  'tpl!spike/graph.html'
],
function (baseTemplate) {

  return function (queue) {
    return function render (req, res) {
      queue.push({url: 'http://localhost:3000/view/graph'}, function (err, file) {
        res.sendfile(file);
      });
    }
  };
});
