define([
  'tpl!spike/graph.html'
],
function (baseTemplate) {

  return function render (req, res) {
    require('sleep').sleep(5);
    res.send(baseTemplate());
  };
});
