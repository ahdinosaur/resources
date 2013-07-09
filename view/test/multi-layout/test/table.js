var resource = require('resource');

module['exports'] = function (options, callback) {

  var self = this,
      $ = self.$;

  $('.table').html('steve');

  self.parent.layout.present(options, function(err, result) {
    var query = $.load(result);
    query('#main').html($.html());
    return callback(null, query.html());
  });
};

