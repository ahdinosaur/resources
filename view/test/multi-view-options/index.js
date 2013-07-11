var resource = require('resource');

module['exports'] = function (options, callback) {

  var self = this,
      $ = self.$;

  $('.user > .name').html(options.data.name);
  $('.user > .email').html(options.data.email);

  self.parent.layout.present(options, function(err, result) {
    var query = $.load(result);
    query('#main').html($.html());
    return callback(null, query.html());
  });
};
