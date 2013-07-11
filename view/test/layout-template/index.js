var resource = require('resource');

module['exports'] = function (options, callback) {

  var self = this,
      $ = self.$;

  $('.user > .name').html('Bob');
  $('.user > .email').html('bob@bob.com');

  self.parent.layout.present(options, function(err, result) {
    var query = $.load(result);
    query('#main').html($.html());
    return callback(null, query.html());
  });
};
