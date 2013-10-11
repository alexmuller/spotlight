define([
  'tpl!spike/graph.html'
],
function (baseTemplate) {

  return function render (req, res) {
    res.send(baseTemplate());
  };
});
