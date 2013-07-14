var wd = require('wd')
  , assert = require('assert')
  , resource = require('resource')
  , view = resource.use('view')
  , forms = resource.use('forms')
  , creature
  , creatures = {}
  , server
  , browser = wd.remote();


//
// init stuff
//
var tap = require("tap")
  , baseUrl = "http://localhost:8888";

tap.test("create test creature resource", function(t) {
  creature = resource.define('creature');
  t.ok(creature, "creature is defined");

  creature.schema.description = "example resource for creatures like dragons, unicorns, and ponies";

  creature.persist('memory');

  creature.property('type', { type: "string", enum: ['dragon', 'unicorn', 'pony'], default: "dragon"});
  creature.property('isAwesome', { type: "boolean", default: true });
  creature.property('secret', { type: "string", private: true, default: "i touch myself at night"});
  creature.property('life', { type: "number", required: true });


  function poke (callback) {
    return callback(null, 'owe!');
  }

  function fire (options, callback) {
    var result = {
      status: "fired",
      direction: options.direction,
      power: options.power
    };
    return callback(null, result);
  }

  creature.method('poke', poke, {
    "description": "pokes the creature"
  });

  creature.method('fire', fire, {
    "description": "fires a lazer at a certain power and direction",
    "properties": {
      "options": {
        "type": "object",
        "properties": {
          "power": {
            "type": "number",
            "default": 1,
            "required": true
          },
          "direction": {
            "type": "string",
            "enum": ["up", "down", "left", "right"],
            "required": true,
            "default": "up"
          }
        },
        "callback": {
          "type": "function",
          "required": false
        }
      }
  }});

  t.end();
});

// add layout which provides bootstrap
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
      ',
    presenter: function(options, callback) {
      if (options.err) {
        console.log("LAYOUT RECEIVED ERROR");
        return callback(options.err);
      }
      return callback(null, this.$.html());
    }
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

//
// utility functions
//
var deepEqual = function(actual, expected) {
  try {
    assert.deepEqual(actual, expected);
  }
  catch (err) {
    return false;
  }
  return true;
};

var submitElement = function (selector, callback) {
  browser.elementByCssSelector(selector, function (err, element) {
    if (err) { return callback(err); }
    browser.submit(element, function (err) {
      if (err) { return callback(err); }
      return callback(null);
    });
  });
};

var getElementText = function (selector, callback) {
  browser.elementByCssSelector(selector, function (err, element) {
    if (err) { return callback(err); }
    browser.text(element, function (err, resultText) {
      if (err) { return callback(err); }
      return callback(null, resultText);
    });
  });
};

var submitElementWithResult = function (elementSelector, resultSelector, callback) {
  submitElement(elementSelector, function(err) {
    if (err) { return callback(err); }
    getElementText(resultSelector, function(err, resultText) {
      if (err) { return callback(err); }
      return callback(null, resultText);
    });
  });
};

var typeIntoElement = function (selector, text, callback) {
  browser.elementByCssSelector(selector, function (err, element) {
    if (err) { return callback(err); }
    browser.type(element, text, function (err) {
      if (err) { return callback(err); }
      return callback(null);
    });
  });
};

//
// forms tests
//
tap.test("get / with no creatures", function (t) {

  browser.get(baseUrl, function (err, html) {
    t.ok(!err, 'no error');
    browser.title(function(err, title) {
      t.ok(!err, 'no error');
      t.equal(title, 'big forms test', 'title is correct');
      getElementText('.result', function (err, result) {
        t.ok(!err, 'no error');
          t.equal(result, "[]");
          t.end();
      });
    });
  });
});

// NOTE: in addition to the signature,
//       this inherently tests that create fills with default properties
//       and that creating a resource with an empty id generates an id,
tap.test("create a creature with default properties, must specify required property", function (t) {

  // go to create page
  browser.get(baseUrl + "/creature/create", function (err, html) {
    t.ok(!err, 'no error');

    //// try submitting with required field empty
    //submitElementWithResult('form', '#life  > .controls > .help-inline', function(err, resultText) {
    //  t.ok(!err, 'no error');
    //  t.equal(resultText, 'life is required', 'form shows error when required field is blank');

      // fill required field, then submit
      typeIntoElement('#life > .controls > input', "10", function(err) {
        t.ok(!err, 'no error');
        submitElementWithResult('form', '.result', function(err, resultText) {
          t.ok(!err, 'no error');
          creatures['default'] = JSON.parse(resultText);
          t.equal(creatures['default'].type,
            creature.schema.properties.type.default,
            "created creature has default type");
          t.equal(creatures['default'].isAwesome,
            creature.schema.properties.isAwesome.default,
            "created creature has default awesomeness");
          t.equal(creatures['default'].secret,
            creature.schema.properties.secret.default,
            "created creature has default secret");
          t.equal(creatures['default'].life, 10,
            "created creature has given life");
          t.end();
        });
    //  });
    });
  });
});


tap.test("get / with a creature, should default to all", function (t) {

  browser.get(baseUrl, function (err, result) {
    t.ok(!err, 'no error');
    browser.title(function(err, title) {
      t.ok(!err, 'no error');
      getElementText('.result', function(err, resultText) {
        t.ok(!err, 'no error');
        t.ok(deepEqual([creatures['default']], JSON.parse(resultText)), "created creature is in all");
        t.end();
      });
    });
  });
});

tap.test("create a creature (frank) with specified properties, can't use forms to access private property", function (t) {

  browser.get(baseUrl + "/creature/create", function (err, html) {
    t.ok(!err, 'no error');
    typeIntoElement('#id > .controls > input', "frank", function(err) {
      t.ok(!err, 'no error');
      typeIntoElement('#life > .controls > input', "10", function(err) {
        t.ok(!err, 'no error');
        browser.elementByCssSelector('#secret', function (err, result) {
          t.ok(err, 'error when selecting private input');
          t.equal(result, undefined, 'private input is undefined');
          submitElementWithResult('form', '.result', function(err, resultText){
            t.ok(!err, 'no error');
            creatures['frank'] = JSON.parse(resultText);
            t.equal(creatures['frank'].id, "frank", "created creature has id frank");
            t.equal(creatures['frank'].life, 10, "frank has life 10");
            t.end();
          });
        });
      });
    });
  });
});

tap.test("there is only one frank: cannot create resource with duplicate id", function(t) {

  browser.get(baseUrl + "/creature/create", function (err, html) {
    t.ok(!err, 'no error');
    typeIntoElement('#id > .controls > input', "frank", function(err) {
      t.ok(!err, 'no error');
      submitElementWithResult('form', '#id  > .controls > .help-inline', function(err, resultText){
        t.ok(!err, 'no error');
        t.equal(resultText, 'id must be unique', 'error message shows cannot use duplicate id');
        t.end();
      });
    });
  });
});

tap.test("find both creatures with empty form", function (t) {

  browser.get(baseUrl + "/creature/find", function (err, html) {
    t.ok(!err, 'no error');
    submitElementWithResult('form', '.result', function(err, resultText) {
      t.ok(!err, 'no error');
      t.ok(deepEqual([creatures['default'],creatures['frank']],
        JSON.parse(resultText)),
        "created creatures are in find");
      t.end();
    });
  });
});

/*
// TODO: should find show the dropdown for type? ie dragon unicorn puppy?
// TODO: related, find fails to require types on properties (ie string in life and isAwesome)
tap.test("find both creatures by type", function (t) {

  browser.get(baseUrl + "/creature/find", function (err, html) {
    t.ok(!err, 'no error');
    typeIntoElement('#type > .controls > input', 'dragon', function(err) {
      t.ok(!err, 'no error');
      submitElementWithResult('form', '.result', function(err, resultText) {
        t.ok(!err, 'no error');
        t.ok(deepEqual([creatures['default'],creatures['frank']], JSON.parse(resultText)), "found both creatures by type");
        t.end();
      });
    });
  });
});

// TODO: should find show the checkbox for booleans?
tap.test("find no creatures that aren't awesome", function(t) {

  browser.get(baseUrl + "/creature/find", function (err, html) {
    t.ok(!err, 'no error');
    typeIntoElement('#isAwesome > .controls > input', 'false', function(err) {
      t.ok(!err, 'no error');
      submitElementWithResult('form', '.result', function(err, resultText) {
        t.ok(!err, 'no error');
        t.equal(resultText, '[]', "no not-awesome creatures exist");
        t.end();
      });
    });
  });
});
*/

tap.test("update frank's life by id, then find him by updated life", function (t) {

  // update frank
  browser.get(baseUrl + "/creature/update", function (err, html) {
    t.ok(!err, 'no error');
    typeIntoElement('#id > .controls > input', 'frank', function(err) {
      t.ok(!err, 'no error');
      typeIntoElement('#life > .controls > input', '\uE003\uE00369', function(err) {
        t.ok(!err, 'no error');
        submitElementWithResult('form', '.result', function(err, resultText) {
          t.ok(!err, 'no error');
          creatures['frank'] = JSON.parse(resultText);
          t.equal(creatures['frank'].life, 69,
            "updated frank's life to 69 by id");

          // find frank
          browser.get(baseUrl + "/creature/find", function (err, html) {
            t.ok(!err, 'no error');
            typeIntoElement('#life > .controls > input', '69', function(err) {
              t.ok(!err, 'no error');
              submitElementWithResult('form', '.result', function(err, resultText) {
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

tap.test("(fail to) update frank's life to a string, form shows error", function (t) {

  browser.get(baseUrl + "/creature/update", function (err, html) {
    t.ok(!err, 'no error');
    typeIntoElement('#id > .controls > input', 'frank', function(err) {
      t.ok(!err, 'no error');
      typeIntoElement('#life > .controls > input', '\uE003\uE003infinity', function(err) {
        t.ok(!err, 'no error');
        submitElementWithResult('form', '#life  > .controls > .help-inline', function(err, resultText) {
          t.ok(!err, 'no error');
          t.equal(resultText, 'must be of number type', 'life requires a number');
          t.end();
        });
      });
    });
  });
});

tap.test("form handles error when trying to update resource with nonexistent id", function(t) {

  browser.get(baseUrl + "/creature/update?id=franky", function (err, html) {
    t.ok(!err, 'no error');
    getElementText('#id > .controls > .help-inline', function(err, resultText) {
      t.ok(!err, 'no error');
      t.equal(resultText, 'franky not found', 'error message shows when going to update with id in url');
      submitElementWithResult('form', '#id  > .controls > .help-inline', function(err, resultText){
        t.ok(!err, 'no error');
        t.equal(resultText, 'franky not found', 'error message shows when updating with id that does not exist');
        t.end();
      });
    });
  });
});

tap.test("poke frank", function (t) {

  browser.get(baseUrl + "/creature/poke", function (err, html) {
    t.ok(!err, 'no error');
    submitElementWithResult('form', '.result', function(err, resultText) {
      t.ok(!err, 'no error');
      t.equal(resultText, '\"owe!\"', 'frank was poked');
      t.end();
    });
  });
});

tap.test("fire frank's lazer", function(t) {

  browser.get(baseUrl + "/creature/fire", function (err, html) {
    t.ok(!err, 'no error');
    typeIntoElement('#power > .controls > input', '\uE003999', function(err) {
      t.ok(!err, 'no error');
      submitElementWithResult('form', '.result', function(err, resultText) {
        t.ok(!err, 'no error');
        console.log(JSON.parse(resultText));
        t.ok(deepEqual({
          "status": "fired",
          "direction": "up",
          "power": 999
        },
        JSON.parse(resultText)),
        'frank fired ze lazerz');
        t.end();
      });
    });
  });
});

tap.test("destroy frank by id, then fail to get him", function (t) {

  // destroy frank
  browser.get(baseUrl + "/creature/destroy", function (err, html) {
    t.ok(!err, 'no error');
    typeIntoElement('#id > .controls > input', 'frank', function(err) {
      t.ok(!err, 'no error');
      submitElement('form', function(err) {
        t.ok(!err, 'no error');

        // (fail to) get frank
        browser.get(baseUrl + "/creature/get", function (err, html) {
          t.ok(!err, 'no error');
          typeIntoElement('#id > .controls > input', 'frank', function(err) {
            t.ok(!err, 'no error');
            submitElementWithResult('form', '#id  > .controls > .help-inline', function(err, resultText) {
              t.ok(!err, 'no error');
              t.equal(resultText, 'frank not found', 'could not get dead frank');
              t.end();
            });
          });
        });
      });
    });
  });
});

tap.test("resurrect then update frank with updateOrCreate", function (t) {

  // recreate frank
  browser.get(baseUrl + "/creature/updateOrCreate", function (err, html) {
    t.ok(!err, 'no error');
    typeIntoElement('#id > .controls > input', 'frank', function(err) {
      t.ok(!err, 'no error');
      submitElementWithResult('form', '.result', function(err, resultText) {
        creatures['frank'] = JSON.parse(resultText);
        t.equal(creatures['frank'].id,
          "frank",
          "created creature has id frank");

        // update frank's life
        browser.get(baseUrl + "/creature/updateOrCreate", function (err, html) {
          t.ok(!err, 'no error');
          typeIntoElement('#id > .controls > input', 'frank', function(err) {
            t.ok(!err, 'no error');
            typeIntoElement('#life > .controls > input', '\uE003\uE00336', function(err) {
              t.ok(!err, 'no error');
              submitElementWithResult('form', '.result', function(err, resultText) {
                t.ok(!err, 'no error');
                creatures['frank'] = JSON.parse(resultText);
                t.equal(creatures['frank'].life, 36,
                  "updated new frank's life to 36");
                t.end();
              });
            });
          });
        });
      });
    });
  });
});

// TODO: make it so that inputs ids are in control group, not input (done for string)

/*
tap.test('clean up and shut down browser', function (t) {
  browser.quit();
  t.end();
});

tap.test('clean up and shut down server', function (t) {
  server.close();
  t.end();
});
*/