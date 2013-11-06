define([
  'tpl!spike/graph.html'
],
function (baseTemplate) {

  return function render (req, res) {
    context = {
      requirePath: req.app.get('requirePath'),
      assetPath: req.app.get('assetPath'),
      environment: req.app.get('environment'),
      backdropUrl: req.app.get('backdropUrl')
    };
    require('sleep').sleep(5);
    res.send(baseTemplate(context));
  };
});
