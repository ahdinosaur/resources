var resource = require('resource'),
    async = require('async');

module['exports'] = function (options, callback) {

  options = options || {};
  var $ = this.$,
    self = this,
    r = resource.resources[options.resource];

  var finish = function() {
    // call method view to handle rest of 'create' method
    return self.parent.method.present(options, callback);
  };

  // if id is given, make sure it's unique
  if (options.id) {
    r.get(options.id, function(err, _r) {

      // if we can't find the resource, continue as normal
      if (err && (err.message === options.id + " not found")) {
        return finish();
      }
      // pipe other errors to callback
      else if (err) {
        options.err = err;
        options.selector = "#forms-main";
        return self.layout(self.parent.parent.layout, options, callback);
      }

      // id is in use, so display form error
      else {
        options.error = new Error("id must be unique");
          options.error.errors = [{
            property: "id",
            message: "id must be unique"
          }];
        return finish();
      }
    });
  } else {
    return finish();
  }
};