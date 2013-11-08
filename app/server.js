var requirejs = require('requirejs');
var config = requirejs('./config');
config.baseUrl = 'app/';
config.nodeRequire = require;
requirejs.config(config);

var argv = require('optimist').argv;

var express = require('express'),
    http = require('http'),
    path = require('path'),
    winston = require('winston');

global.isServer = true;
global.isClient = false;
global.winston = winston;

var backbone = require('backbone');
var $ = global.$ = backbone.$ = global.jQuery = require('jquery');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
$.support.cors = true;
$.ajaxSettings.xhr = function () {
    return new XMLHttpRequest();
};

var rootDir = path.join(__dirname, '..'),
    environment = process.env.NODE_ENV || argv.env || 'development';

global._ = require('underscore');
global.config = require(path.join(rootDir, 'config', 'config.' + environment + '.json'));
if (argv.backdropUrl) {
  global.config.backdropUrl = argv.backdropUrl;
}
if (argv.p) {
  global.config.port = argv.p;
}

var app = express();

app.configure(function () {
  app.set('environment', environment);
  app.set('requirePath', argv.REQUIRE_BASE_URL || '/app/');
  app.set('assetPath', global.config.assetPath);
  app.set('backdropUrl', global.config.backdropUrl);
  app.set('port', global.config.port);
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.compress());
  app.use('/assets', express.static(path.join(rootDir, 'public')));
  app.use('/assets/images', express.static(path.join(rootDir, 'public')));
});

app.configure('development', function () {
  app.use('/app', express.static(path.join(rootDir, 'app')));
  app.use('/.grunt', express.static(path.join(rootDir, '.grunt')));
  app.use('/test/spec', express.static(path.join(rootDir, 'test', 'spec')));
  app.use('/spec', function (req, res) {
    res.sendfile(path.join(rootDir, '_SpecRunner.html'));
  });
  app.use(express.errorHandler());

  app.get('/backdrop-stub/:service/:api_name', requirejs('./support/backdrop_stub/backdrop_stub_controller'));
});

app.configure('cucumber', function () {
  app.get('/backdrop-stub/:service/:api_name', requirejs('./support/backdrop_stub/backdrop_stub_controller'));
});

app.configure('production', function () {
  winston.add(winston.transports.File, { filename: 'log/spotlight.log' });
  winston.remove(winston.transports.Console);
});

//
var async = requirejs('async');
var renderQueue = async.queue(requirejs('./spike/phantomjs_renderer'), 1);
app.get('*.png', requirejs('./spike/render_graph_png')(renderQueue));

app.get('/view/graph', requirejs('./spike/render_graph'));
/*app.get('/view/graph.png', requirejs('./spike/render_graph_png')(renderQueue));*/
//

app.get('/stagecraft-stub/*', requirejs('./support/stagecraft_stub/stagecraft_stub_controller'));

app.use('/performance/', requirejs('process_request'));

app.get('/_status', requirejs('healthcheck_controller'));

var server = http.createServer(app).listen(app.get('port'), function(){
  winston.info("Express server listening on port " + app.get('port'));
});


exports = module.exports = server;

exports.use = function () {
	app.use.apply(app, arguments);
};
