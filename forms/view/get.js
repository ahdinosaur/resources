var resource = require('resource'),
    async = require('async');

module['exports'] = function (options, callback) {
  options = options || {};

  var self = this;

  // if this is a post, first check that the id exists
  if (options.action === 'post' && options.id) {
    r.get(options.id, function(err, _r) {
        // if this id wasn't found, add to errors to display on form and don't post
      if (err && err.message === options.id + " not found") {
        options.action = 'get';
        options.error = err;
        options.error.errors = [{
          property: "id",
          message: err.message
        }];
      }
      return self.parent.method.present(options, callback);
    });
  } else {
    return self.parent.method.present(options, callback);
  }
};