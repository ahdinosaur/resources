var tap = require("tap"),
    resource = require('resource');

tap.test('can render swig into html', function (t) {
  var swig = resource.use('template-swig');
  swig.init(function() {
    var str = "what is {{direction}}";
    var res = swig.render(str, { direction: 'up' });
    t.equal(res, "what is up");
    t.end();
  });
});

tap.test('initialize swig with empty options', function (t) {
  var swig = resource.use('template-swig');
  swig.init({}, function() {
    var str = "what is {{direction}}";
    var res = swig.render(str, { direction: 'up' });
    t.equal(res, "what is up");
    t.end();
  });
});
