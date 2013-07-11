var wd = require('wd')
  , assert = require('assert')
  , resource = require('resource')
  , view = resource.use('view')
  , forms = resource.use('forms')
  , creature = resource.use('creature')
  , creatures = {}
  , server
  , browser = wd.remote();

/*
browser.on('status', function(info) {
  console.log(info.cyan);
});

browser.on('command', function(meth, path, data) {
  console.log(' > ' + meth.yellow, path.grey, data || '');
});

*/

var deepEqual = function(actual, expected) {
  try {
    assert.deepEqual(actual, expected);
  }
  catch (err) {
    return false;
  }
  return true;
}

var tap = require("tap");

//
// add layout that provides bootstrap
//
tap.test('use the layout', function (t) {
  var layout = resource.define('layout');
  t.ok(layout, "layout is defined");
  view.create({
    template:
      /*jshint multistr: true */
      '\
      <html>\
      <head>\
        <title>big forms test</title>\
        <link href="//netdna.bootstrapcdn.com/twitter-bootstrap/2.3.2/css/bootstrap-combined.min.css" rel="stylesheet">\
      </head>\
      <body>\
        <div id="main"><div>\
        <script src="//netdna.bootstrapcdn.com/twitter-bootstrap/2.3.2/js/bootstrap.min.js"></script>\
      </body>\
      </html>\
      '
    }, function(err, _view) {
      t.ok(!err, "no error");
      t.ok(_view, "view is defined");
      layout.view = _view;
      resource.resources.layout = layout;
      resource.layout = layout;
      t.end();
    });
});

tap.test('start the forms resource', function (t) {

  forms.start({}, function(err, app) {
    t.ok(!err, 'no error');
    t.ok(app, 'forms server started');
    server = resource.http.server;
    t.end();
  });

});

tap.test('start the webdriver client', function (t) {

  browser.init({
      browserName: 'firefox'
      , tags : ["examples"]
      , name: "This is an example test"
    }, function() {

    t.ok(true, 'browser started');
    t.end();
  });

});

var baseUrl = "http://localhost:8888";

tap.test("get / with no creatures", function (t) {

  browser.get(baseUrl, function (err, html) {
    t.ok(!err, 'no error');
    browser.title(function(err, title) {
      t.equal(title, 'big forms test', 'title is correct');
      browser.elementByCssSelector('.result', function(err, result) {
        t.ok(!err, 'no error');
        browser.text(result, function(err, resultText) {
          t.ok(!err, 'no error');
          t.equal(resultText, "[]");
          t.end();
        });
      });
    });
  });
});

tap.test("create a creature with default properties", function (t) {

  browser.get(baseUrl + "/creature/create", function (err, html) {
    t.ok(!err, 'no error');
    browser.elementByCssSelector('form', function(err, form) {
      t.ok(!err, 'no error');
      browser.submit(form, function(err) {
        t.ok(!err, 'no error');
        browser.elementByCssSelector('.result', function(err, result) {
          t.ok(!err, 'no error');
          browser.text(result, function(err, resultText) {
            t.ok(!err, 'no error');
            creatures['default'] = JSON.parse(resultText);
            t.equal(creatures['default'].type,
              creature.schema.properties.type.default,
              "created creature has default type");
            t.equal(creatures['default'].life,
              creature.schema.properties.life.default,
              "created creature has default life");
            t.equal(creatures['default'].isAwesome,
              creature.schema.properties.isAwesome.default,
              "created creature has default awesomeness");
            t.end();
          });
        });
      });
    });
  });
});



tap.test("get / with a creature", function (t) {

  browser.get(baseUrl, function (err, result) {
    t.ok(!err, 'no error');
    browser.title(function(err, title) {
      browser.elementByClassName('result', function(err, result) {
        t.ok(!err, 'no error');
        browser.text(result, function(err, resultText) {
          t.ok(!err, 'no error');
          t.ok(deepEqual([creatures['default']], JSON.parse(resultText)), "created creature is in all");
          t.end();
        });
      });
    });
  });
});


tap.test("create a creature with specified properties", function (t) {

  browser.get(baseUrl + "/creature/create", function (err, html) {
    t.ok(!err, 'no error');
    browser.elementById('id', function(err, result) {
      t.ok(!err, 'no error');
      result.type("frank", function(err) {
        t.ok(!err, 'no error');
        browser.elementByCssSelector('form', function(err, form) {
          t.ok(!err, 'no error');
          browser.submit(form, function(err) {
            t.ok(!err, 'no error');
            browser.elementByCssSelector('.result', function(err, result) {
              t.ok(!err, 'no error');
              browser.text(result, function(err, resultText) {
                t.ok(!err, 'no error');
                creatures['frank'] = JSON.parse(resultText);
                t.equal(creatures['frank'].id,
                  "frank",
                  "created creature has id frank");
                t.end();
              });
            });
          });
        });
      });
    });
  });
});

tap.test("get frank by id", function (t) {

  browser.get(baseUrl + "/creature/get", function (err, html) {
    t.ok(!err, 'no error');
    browser.elementById('id', function(err, result) {
      t.ok(!err, 'no error');
      result.type("frank", function(err) {
        t.ok(!err, 'no error');
        browser.elementByCssSelector('form', function(err, form) {
          t.ok(!err, 'no error');
          browser.submit(form, function(err) {
            t.ok(!err, 'no error');
            browser.elementByCssSelector('.result', function(err, result) {
              t.ok(!err, 'no error');
              browser.text(result, function(err, resultText) {
                t.ok(!err, 'no error');
                t.ok(deepEqual(creatures['frank'], JSON.parse(resultText)), "got frank");
                t.end();
              });
            });
          });
        });
      });
    });
  });
});

tap.test("find both creatures with empty form", function (t) {

  browser.get(baseUrl + "/creature/find", function (err, html) {
    t.ok(!err, 'no error');
    browser.elementByCssSelector('form', function(err, form) {
      t.ok(!err, 'no error');
      browser.submit(form, function(err) {
        t.ok(!err, 'no error');
        browser.elementByCssSelector('.result', function(err, result) {
          t.ok(!err, 'no error');
          browser.text(result, function(err, resultText) {
            t.ok(!err, 'no error');
            t.ok(deepEqual([creatures['default'],creatures['frank']], JSON.parse(resultText)), "created creatures are in find");
            t.end();
          });
        });
      });
    });
  });
});

tap.test("find both creatures by type", function (t) {

  browser.get(baseUrl + "/creature/find", function (err, html) {
    t.ok(!err, 'no error');
    browser.elementById('type', function(err, result) {
      t.ok(!err, 'no error');
      result.type("dragon", function(err) {
        t.ok(!err, 'no error');
        browser.elementByCssSelector('form', function(err, form) {
          t.ok(!err, 'no error');
          browser.submit(form, function(err) {
            t.ok(!err, 'no error');
            browser.elementByCssSelector('.result', function(err, result) {
              t.ok(!err, 'no error');
              browser.text(result, function(err, resultText) {
                t.ok(!err, 'no error');
                t.ok(deepEqual([creatures['default'],creatures['frank']], JSON.parse(resultText)), "found both creatures by type");
                t.end();
              });
            });
          });
        });
      });
    });
  });
});

tap.test("find frank by id", function (t) {

  browser.get(baseUrl + "/creature/find", function (err, html) {
    t.ok(!err, 'no error');
    browser.elementById('id', function(err, result) {
      t.ok(!err, 'no error');
      result.type("frank", function(err) {
        t.ok(!err, 'no error');
        browser.elementByCssSelector('form', function(err, form) {
          t.ok(!err, 'no error');
          browser.submit(form, function(err) {
            t.ok(!err, 'no error');
            browser.elementByCssSelector('.result', function(err, result) {
              t.ok(!err, 'no error');
              browser.text(result, function(err, resultText) {
                t.ok(!err, 'no error');
                t.ok(deepEqual([creatures['frank']], JSON.parse(resultText)), "found frank by id");
                t.end();
              });
            });
          });
        });
      });
    });
  });
});

tap.test("update frank's life by id", function (t) {

  browser.get(baseUrl + "/creature/update", function (err, html) {
    t.ok(!err, 'no error');
    browser.elementById('id', function(err, result) {
      t.ok(!err, 'no error');
      result.type('frank', function(err) {
        t.ok(!err, 'no error');
        browser.elementById('life', function(err, result) {
          t.ok(!err, 'no error');
          result.type('\uE003\uE00369', function(err) {
            t.ok(!err, 'no error');
            browser.elementByCssSelector('form', function(err, form) {
              t.ok(!err, 'no error');
              browser.submit(form, function(err) {
                t.ok(!err, 'no error');
                browser.elementByCssSelector('.result', function(err, result) {
                  t.ok(!err, 'no error');
                  browser.text(result, function(err, resultText) {
                    t.ok(!err, 'no error');
                    creatures['frank'] = JSON.parse(resultText);
                    t.equal(creatures['frank'].life, 69,
                      "updated frank's life to 69 by id");
                    t.end();
                  });
                });
              });
            });
          });
        });
      });
    });
  });
});

tap.test("find frank by updated life", function (t) {

  browser.get(baseUrl + "/creature/find", function (err, html) {
    t.ok(!err, 'no error');
    browser.elementById('life', function(err, result) {
      t.ok(!err, 'no error');
      result.type("69", function(err) {
        t.ok(!err, 'no error');
        browser.elementByCssSelector('form', function(err, form) {
          t.ok(!err, 'no error');
          browser.submit(form, function(err) {
            t.ok(!err, 'no error');
            browser.elementByCssSelector('.result', function(err, result) {
              t.ok(!err, 'no error');
              browser.text(result, function(err, resultText) {
                t.ok(!err, 'no error');
                t.ok(deepEqual([creatures['frank']], JSON.parse(resultText)), "found frank by updated life");
                t.end();
              });
            });
          });
        });
      });
    });
  });
});





/*
// TODO: make destroy work
tap.test("destroy frank by id", function (t) {

  browser.get(baseUrl + "/creature/destroy", function (err, html) {
    t.ok(!err, 'no error');
    browser.elementById('id', function(err, result) {
      t.ok(!err, 'no error');
      result.type("frank", function(err) {
        t.ok(!err, 'no error');
        browser.elementByCssSelector('form', function(err, form) {
          t.ok(!err, 'no error');
          browser.submit(form, function(err) {
            t.ok(!err, 'no error');
            browser.elementByCssSelector('.result', function(err, result) {
              t.ok(!err, 'no error');
              browser.text(result, function(err, resultText) {
                t.ok(!err, 'no error');
                console.log(resultText);
                //t.ok(deepEqual([creatures['frank']], JSON.parse(resultText)), "destroyed frank by id");
                t.end();
              });
            });
          });
        });
      });
    });
  });
});

// TODO: make this work once destroy and get work
tap.test("get frank by id fails since frank is dead", function (t) {

  browser.get(baseUrl + "/creature/get", function (err, html) {
    t.ok(!err, 'no error');
    browser.elementById('id', function(err, result) {
      t.ok(!err, 'no error');
      result.type("frank", function(err) {
        t.ok(!err, 'no error');
        browser.elementByCssSelector('form', function(err, form) {
          t.ok(!err, 'no error');
          browser.submit(form, function(err) {
            t.ok(!err, 'no error');
            browser.elementByCssSelector('.result', function(err, result) {
              t.ok(!err, 'no error');
              browser.text(result, function(err, resultText) {
                t.ok(!err, 'no error');
                //t.ok(deepEqual(creatures['frank'], JSON.parse(resultText)), "creatures['frank'] is dead");
                t.end();
              });
            });
          });
        });
      });
    });
  });
});

tap.test('clean up and shut down browser', function (t) {
  browser.quit();
  t.end();
});

tap.test('clean up and shut down server', function (t) {
  server.close();
  t.end();
});
*/