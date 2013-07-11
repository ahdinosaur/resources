var test = require("tap").test,
  resource = require("resource"),
  supertest = require('supertest'),
  http,
  view,
  server;

//
// -------- Middleware Testing ----------
//

test("start a view server", function(t) {
  view = resource.use('view');
  http = resource.use('http');

  resource.http.start(function(err, _server) {
    t.ok(!err, 'no error');
    t.ok(_server, 'server is returned');
    t.ok(resource.http.app, 'resource.http.app is defined');
    server = _server;

    t.end();
  });
});

test("start a view with a given template", function (t) {
  var _template = '<div class="user">\n  <div class="name">name</div>\n  <div class="email">email</div>\n</div>\n';
  view.create( { template: _template } , function (err, _view) {
    t.ok(!err, 'no error');
    t.ok(_view, 'view is returned');

    http.app.use(view.middle({view: _view})).as("view");

    supertest(server)
      .get('/')
      .end(function(err, res){
        t.ok(!err, 'no error');
        t.equal(res.text, _template,
          'response returns correct result');

        http.app.remove("view");
        t.end();
    });
  });
});

test("start a view with a given presenter but no template", function (t) {
  var _presenter = function (options, callback) {
      callback(null, 'hi');
  };
  view.create( { presenter: _presenter } , function (err, _view) {
    t.ok(!err, 'no error');
    t.ok(_view, 'view is returned');

    http.app.use(view.middle({view: _view})).as("view");

    supertest(server)
      .get('/')
      .end(function(err, res){
        t.ok(!err, 'no error');
        t.equal(res.text, "hi",
          'response returns correct result');

        http.app.remove("view");
        t.end();
    });
  });
});

test("load basic views with http and view.middle", function(t) {
  view.create( { path: __dirname + "/basic-view" } , function(err, _view) {
    t.ok(!err, 'no error');
    t.ok(_view, 'view is returned');

    http.app.use(view.middle({view: _view})).as("view");

    supertest(server)
      .get('/')
      .end(function(err, res){
        t.ok(!err, 'no error');
        t.equal(res.text, '<h1>big</h1>\n<div id="main"><div class="user">\n  <div class="name">Bob</div>\n  <div class="email">bob@bob.com</div>\n</div>\n</div>',
          'response returns correct result');
    });

    supertest(server)
      .get('/index')
      .end(function(err, res){
        t.ok(!err, 'no error');
        t.equal(res.text, '<h1>big</h1>\n<div id="main"><div class="user">\n  <div class="name">Bob</div>\n  <div class="email">bob@bob.com</div>\n</div>\n</div>',
          'response returns correct result');

        http.app.remove("view");
        t.end();
    });
  });
});

test("load nested views/layouts with http and view.middle", function(t) {
  view.create( { path: __dirname + "/multi-layout-more" } , function(err, _view) {
    t.ok(!err, 'no error');
    t.ok(_view, 'view is returned');

    http.app.use(view.middle({view: _view})).as("view");

    supertest(server) // first test index2
      .get('/index2')
      .end(function(err, res){
        t.ok(!err, 'no error');
        t.equal(res.text,
          '<h1>big</h1>\n<h2>nothing</h2>\n<div id="main"><div class="user">\n  <div class="name">Bob</div>\n  <div class="email">bob@bob.com</div>\n</div>\n</div>',
          'response returns correct result');
    });

    supertest(server) // then test table2
      .get('/table2')
      .end(function(err, res){
        t.ok(!err, 'no error');
        t.equal(res.text,
          '<h1>big</h1>\n<h2>nothing</h2>\n<div id="main"><div class="table">steve</div>\n</div>',
          'response returns correct result');
    });

    supertest(server) // then test test2/index
      .get('/test2/')
      .end(function(err, res){
        t.ok(!err, 'no error');
        t.equal(res.text,
          '<h1>nothing</h1>\n<h2>big</h2>\n<div id="main"><div class="user">\n  <div class="name">Bob</div>\n  <div class="email">bob@bob.com</div>\n</div>\n</div>',
          'response returns correct result');
    });

    supertest(server) // then test test2/index
      .get('/test2/index')
      .end(function(err, res){
        t.ok(!err, 'no error');
        t.equal(res.text,
          '<h1>nothing</h1>\n<h2>big</h2>\n<div id="main"><div class="user">\n  <div class="name">Bob</div>\n  <div class="email">bob@bob.com</div>\n</div>\n</div>',
          'response returns correct result');
    });

    supertest(server) // then test test2/table
      .get('/test2/table')
      .end(function(err, res){
        t.ok(!err, 'no error');
        t.equal(res.text,
          '<h1>nothing</h1>\n<h2>big</h2>\n<div id="main"><div class="table">steve</div>\n</div>',
          'response returns correct result');

        http.app.remove("view");
        t.end();
    });
  });
});

test("multiple views with a layout and presenter, as well as options", function (t) {
  view.create( { path: __dirname + "/multi-view-options" } , function(err, _view) {
    t.ok(!err, 'no error');
    t.ok(_view, 'view is returned');

    http.app.use(view.middle({view: _view})).as("view");

    supertest(server)
      .get('/index?name=Bob&email=bob@bob.com&company=big')
      .end(function(err, res){
        t.ok(!err, 'no error');
        t.ok(res, 'response returns result');
        t.equal(res.text,
          '<h1>big</h1>\n<div id="main"><div class="user">\n  <div class="name">Bob</div>\n  <div class="email">bob@bob.com</div>\n</div>\n</div>',
          'response returns correct result');
    });

    supertest(server)
      .get('/table?name=steve&company=company')
      .end(function(err, res){
        t.ok(!err, 'no error');
        t.ok(res, 'response returns result');
        t.equal(res.text,
          '<h1>company</h1>\n<div id="main"><div class="table">steve</div>\n</div>',
          'response returns correct result');

        http.app.remove("view");
        t.end();
    });
  });
});

test("multiple views with a layout and presenter, options, and prefix", function (t) {
  view.create( { path: __dirname + "/multi-view-options" } , function(err, _view) {
    t.ok(!err, 'no error');
    t.ok(_view, 'view is returned');

    http.app.use(view.middle({view: _view, prefix: "/prefix"})).as("view");

    supertest(server) // make sure we can't access original index
      .get('/index')
      .end(function(err, res){
        t.ok(!err, 'no error');
        t.equal(res.text, 'Cannot GET /index');
    });

    supertest(server)
      .get('/prefix/index?name=Bob&email=bob@bob.com&company=big')
      .end(function(err, res){
        t.ok(!err, 'no error');
        t.ok(res, 'response returns result');
        t.equal(res.text,
          '<h1>big</h1>\n<div id="main"><div class="user">\n  <div class="name">Bob</div>\n  <div class="email">bob@bob.com</div>\n</div>\n</div>',
          'response returns correct result');
    });

    supertest(server)
      .get('/prefix/table?name=steve&company=company')
      .end(function(err, res){
        t.ok(!err, 'no error');
        t.ok(res, 'response returns result');
        t.equal(res.text,
          '<h1>company</h1>\n<div id="main"><div class="table">steve</div>\n</div>',
          'response returns correct result');

        http.app.remove("view");
        t.end();
    });
  });
});

test("load subview/layout with pathname that collides with prefix", function(t) {
  view.create( { path: __dirname + "/subview-prefix" } , function(err, _view) {
    t.ok(!err, 'no error');
    t.ok(_view, 'view is returned');

    http.app.use(view.middle({view: _view, prefix: '/prefix/'})).as("view");

    supertest(server) // make sure we can't access original path
      .get('/test/prefix/root')
      .end(function(err, res){
        t.ok(!err, 'no error');
        t.equal(res.text, 'Cannot GET /test/prefix/root',
          'cant access original path');
    });

    supertest(server) // test /prefix/test/prefix/root
      .get('/prefix/test/prefix/root')
      .end(function(err, res){
        t.ok(!err, 'no error');
        t.equal(res.text,
          '<h1>big</h1>\n<div id="main"><div class="user">\n  <div class="name">Bob</div>\n  <div class="email">bob@bob.com</div>\n</div>\n</div>',
          'response returns correct result');

        http.app.remove("view");
        t.end();
    });
  });
});

// TODO test layout resource

test("stop a view server", function(t) {
  server.close(function(err) {
    t.ok(!err, 'no error');

    t.end();
  });
});
