var test = require("tap").test,
  resource = require("resource"),
  html = resource.use("html"),
  view = resource.use('view');

test("start a view", function (t) {
  view.create( {} , function (err, _view) {
    t.ok(!err, 'no error');
    t.ok(_view, 'view is returned');

    // check default properties
    t.equal(_view.name, '', "default name is ''");
    t.equal(_view.template, undefined, "no template is loaded when no path is given");
    t.equal(_view.presenter, undefined, "no presenter is loaded when no path is given");
    t.end();
  });
});

test("start a view with a given template", function (t) {
  var _template = '<div class="user">\n  <div class="name">name</div>\n  <div class="email">email</div>\n</div>\n';
  view.create( { template: _template }, function (err, _view) {
    t.ok(!err, 'no error');
    t.ok(_view, 'view is returned');
    _view.present({}, function (err, result) {
      t.ok(!err, 'no error');
      t.ok(result, 'present returns result');
      t.equal(result, _template, 'present() returns correct result');
      t.end();
    });
  });
});

test("start a view with a given template and presenter", function (t) {
  var _template = '<div class="user">\n  <div class="name">name</div>\n  <div class="email">email</div>\n</div>\n';
  var _presenter = function (options, callback) {
      callback(null, 'hi');
  };
  view.create( { template: _template, presenter: _presenter }, function (err, _view) {
    t.ok(!err, 'no error');
    t.ok(_view, 'view is returned');
    t.equal(_view.presenter, _presenter, 'view loaded given presenter');
    _view.present({}, function (err, result) {
      t.ok(!err, 'no error');
      t.ok(result, 'present returns result');
      t.equal(result, 'hi', 'present() returns correct result');
      t.end();
    });
  });
});

test("start a view with a given presenter but no template", function (t) {
  var _presenter = function (options, callback) {
      callback(null, 'hi');
  };
  view.create( { presenter: _presenter }, function (err, _view) {
    t.ok(!err, 'no error');
    t.ok(_view, 'view is returned');
    t.equal(_view.presenter, _presenter, 'view loaded given presenter');
    t.equal(_view.template, undefined, 'view loaded empty string as template');
    _view.present({}, function (err, result) {
      t.ok(!err, 'no error');
      t.ok(result, 'present returns result');
      t.equal(result, "hi", 'present() returns correct result');
      t.end();
    });
  });
});

test("start view from single template at given viewPath", function (t) {
  var viewPath = __dirname + "/single-template";
  view.create( { path: viewPath } , function(err, _view) {
    t.ok(!err, 'no error');
    t.ok(_view, 'view is returned');
    t.equal(_view.viewPath, viewPath,
      'viewPath was correctly set to path: ' + viewPath);
    _view.index.present({}, function (err, result) {
      t.ok(!err, 'no error');
      t.ok(result, 'present returns result');
      t.equal(result,
        '<div class="user">\n  <div class="name">name</div>\n  <div class="email">email</div>\n</div>\n',
        'present() returns correct result');
      t.end();
    });
  });
});

test("start view from single presenter at given path", function (t) {
  var viewPath = __dirname + "/single-presenter";
  view.create( { path: viewPath } , function(err, _view) {
    t.ok(!err, 'no error');
    t.ok(_view, 'view is returned');
    t.equal(_view.viewPath, viewPath,
      'viewPath was correctly set to path: ' + viewPath);
    _view.index.present({}, function (err, result) {
      t.ok(!err, 'no error');
      t.ok(result, 'present returns result');
      t.equal(result,
        'hi!',
        'present() returns correct result');
      t.end();
    });
  });
});

test("start view from given viewPath containing single template and presenter", function (t) {
  view.create( { path: __dirname + "/single-template-presenter" } , function(err, _view) {
    t.ok(!err, 'no error');
    t.ok(_view, 'view is returned');
    _view.index.present({}, function (err, result) {
      t.ok(!err, 'no error');
      t.ok(result, 'present returns result');
      t.equal(result,
        '<div class="user">\n  <div class="name">Bob</div>\n  <div class="email">bob@bob.com</div>\n</div>\n',
        'present() returns correct result');
      t.end();
    });
  });
});

test("start view from given templatePath and presenterPath containing single template and presenter", function (t) {
  view.create( {
    templatePath: __dirname + "/single-template-presenter/index.html",
    presenterPath: __dirname + "/single-template-presenter/index.js"
  }, function(err, _view) {
    t.ok(!err, 'no error');
    t.ok(_view, 'view is returned');
    _view.present({}, function (err, result) {
      t.ok(!err, 'no error');
      t.ok(result, 'present returns result');
      t.equal(result,
        '<div class="user">\n  <div class="name">Bob</div>\n  <div class="email">bob@bob.com</div>\n</div>\n',
        'present() returns correct result');
      t.end();
    });
  });
});

// TODO: should this maybe test that presenters with no html get the template, but
//       presenters with template get their template?
//test("start view from given viewPath and template", function (t) {
//  view.create( { path: __dirname + "/view23" } , function(err, _view) {
//    t.ok(!err, 'no error');
//    t.ok(_view, 'view is returned');
//    _view.index.present({}, function (err, result) {
//      t.ok(!err, 'no error');
//      t.ok(result, 'present returns result');
//      t.equal(result,
//        '<div class="user">\n  <div class="name">Bob</div>\n  <div class="email">bob@bob.com</div>\n</div>\n',
//        'present() returns correct result');
//      t.end();
//    });
//  });
//});

test("start view from given viewPath containing single template and presenter with layout template", function (t) {
  view.create( { path: __dirname + "/layout-template" } , function(err, _view) {
    t.ok(!err, 'no error');
    t.ok(_view, 'view is returned');
    _view.index.present({}, function (err, result) {
      t.ok(!err, 'no error');
      t.ok(result, 'present returns result');
      t.equal(result,
        '<h1>nothing</h1>\n<div id="main"><div class="user">\n  <div class="name">Bob</div>\n  <div class="email">bob@bob.com</div>\n</div>\n</div>',
        'present() returns correct result');
      t.end();
    });
  });
});

test("start view from given path containing single template and presenter with layout presenter", function (t) {
  view.create( { path: __dirname + "/layout-presenter" } , function(err, _view) {
    t.ok(!err, 'no error');
    t.ok(_view, 'view is returned');
    _view.index.present({}, function (err, result) {
      t.ok(!err, 'no error');
      t.ok(result, 'present returns result');
      t.equal(result,'<div id="main"><div class="user">\n  <div class="name">Bob</div>\n  <div class="email">bob@bob.com</div>\n</div>\n</div>');
      t.end();
    });
  });
});

test("start from view given viewPath containing single template and presenter with layout template and presenter", function (t) {
  view.create( { path: __dirname + "/layout-template-presenter" } , function(err, _view) {
    t.ok(!err, 'no error');
    t.ok(_view, 'view is returned');
    _view.index.present({}, function (err, result) {
      t.ok(!err, 'no error');
      t.ok(result, 'present returns result');
      t.equal(result,
        '<h1>big</h1>\n<div id="main"><div class="user">\n  <div class="name">Bob</div>\n  <div class="email">bob@bob.com</div>\n</div>\n</div>',
        'present() returns correct result');
      t.end();
    });
  });
});

test("multiple views with a layout and presenter", function (t) {
  view.create( { path: __dirname + "/multi-view" } , function(err, _view) {
    t.ok(!err, 'no error');
    t.ok(_view, 'view is returned');
    _view.index.present({}, function (err, result) {
      t.ok(!err, 'no error');
      t.ok(result, 'present returns result');
      t.equal(result,
        '<h1>big</h1>\n<div id="main"><div class="user">\n  <div class="name">Bob</div>\n  <div class="email">bob@bob.com</div>\n</div>\n</div>\n',
        'present() returns correct result');
    });
    _view.table.present({}, function (err, result) {
      t.ok(!err, 'no error');
      t.ok(result, 'present returns result');
      t.equal(result,
        '<h1>big</h1>\n<div id="main"><div class="table">steve</div>\n</div>\n',
        'present() returns correct result');
      t.end();
    });
  });
});

test("layout presenter and template presenter both see passed options", function (t) {
  view.create( { path: __dirname + "/layout-options" } , function(err, _view) {
    t.ok(!err, 'no error');
    t.ok(_view, 'view is returned');
    _view.index.present({
      data: {
        name: "Bob",
        email: "bob@bob.com",
        company: "big"
      }
    }, function (err, result) {
      t.ok(!err, 'no error');
      t.ok(result, 'present returns result');
      t.equal(result,
        '<h1>big</h1>\n<div id="main"><div class="user">\n  <div class="name">Bob</div>\n  <div class="email">bob@bob.com</div>\n</div>\n</div>',
        'present() returns correct result');
      t.end();
    });
  });
});

test("multiple views with a layout and presenter, as well as options", function (t) {
  view.create( { path: __dirname + "/multi-view-options" } , function(err, _view) {
    t.ok(!err, 'no error');
    t.ok(_view, 'view is returned');
    _view.index.present({
      data: {
        name: "Bob",
        email: "bob@bob.com",
        company: "big"
      }
    }, function (err, result) {
      t.ok(!err, 'no error');
      t.ok(result, 'present returns result');
      t.equal(result,
        '<h1>big</h1>\n<div id="main"><div class="user">\n  <div class="name">Bob</div>\n  <div class="email">bob@bob.com</div>\n</div>\n</div>',
        'present() returns correct result');
    });
    _view.table.present({
      data: {
        name: "steve",
        company: "company"
      }
    }, function (err, result) {
      t.ok(!err, 'no error');
      t.ok(result, 'present returns result');
      t.equal(result,
        '<h1>company</h1>\n<div id="main"><div class="table">steve</div>\n</div>',
        'present() returns correct result');
      t.end();
    });
  });
});

test("nested views, no layouts", function(t) {
  view.create( { path: __dirname + "/subviews" } , function(err, _view) {
    t.ok(!err, 'no error');
    t.ok(_view, 'view is returned');
    _view.index.present({}, function (err, result) {
      t.ok(!err, 'no error');
      t.ok(result, 'present returns result');
      t.equal(result,
        '<div class="user">\n  <div class="name">Bob</div>\n  <div class="email">bob@bob.com</div>\n</div>\n',
        'present() returns correct result');
    });
    _view.test.table.present({}, function (err, result) {
      t.ok(!err, 'no error');
      t.ok(result, 'present returns result');
      t.equal(result,
        '<div class="table">steve</div>\n',
        'present() returns correct result');
      t.end();
    });
  });
});

test("nested views, nested layouts affect only appropriate directory level", function(t) {
  view.create( { path: __dirname + "/multi-layout" } , function(err, _view) {
    t.ok(!err, 'no error');
    t.ok(_view, 'view is returned');
    _view.index.present({}, function (err, result) {
      t.ok(!err, 'no error');
      t.ok(result, 'present returns result');
      t.equal(result,
        '<h1>big</h1>\n<h2>nothing</h2>\n<div id="main"><div class="user">\n  <div class="name">Bob</div>\n  <div class="email">bob@bob.com</div>\n</div>\n</div>',
        'present() returns correct result');
    });
    _view.test.table.present({}, function (err, result) {
      t.ok(!err, 'no error');
      t.ok(result, 'present returns result');
      t.equal(result,
        '<h1>nothing</h1>\n<h2>big</h2>\n<div id="main"><div class="table">steve</div>\n</div>',
        'present() returns correct result');
      t.end();
    });
  });
});

test("nested views traverse upward to find parent layout", function(t) {
  view.create( { path: __dirname + "/layout-subviews" } , function(err, _view) {
    t.ok(!err, 'no error');
    t.ok(_view, 'view is returned');
    _view.index.present({}, function (err, result) {
      t.ok(!err, 'no error');
      t.ok(result, 'present returns result');
      t.equal(result,
        '<h1>big</h1>\n<h2>nothing</h2>\n<div id="main"><div class="user">\n  <div class="name">Bob</div>\n  <div class="email">bob@bob.com</div>\n</div>\n</div>',
        'present() returns correct result');
    });
    _view.test.table.present({}, function (err, result) {
      t.ok(!err, 'no error');
      t.ok(result, 'present returns result');
      t.equal(result,
        '<h1>big</h1>\n<h2>nothing</h2>\n<div id="main"><div class="table">steve</div>\n</div>',
        'present() returns correct result');
      t.end();
    });
  });
});

