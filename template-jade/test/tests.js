var tap = require("tap"),
    resource = require('resource');

tap.test('can render data onto jade', function (t) {

  var jade = resource.use('template-jade');
  jade.init(function() {

    var tpl = 'p #{name}';

    var res = jade.render(tpl, { name: "Bob" });
    t.equal(res, '<p>Bob</p>');
    t.end();
  });
});
