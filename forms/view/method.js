var resource = require('resource'),
    async = require('async');
require('js-object-clone');

module['exports'] = function (options, callback) {

  options = options || {};
  var $ = this.$,
    self = this,
    r = resource.resources[options.resource],
    rMethod = r.methods[options.method];

 var domWithLayout = function(error) {
    options.err = error;
    options.selector = '#forms-main';
    self.layout(self.parent.layout, options, callback);
  };

  // legend should show method description or method name
  // TODO add to recursive?
  $('legend').html(rMethod.schema.description || options.method || '');

  // submit button should show method name
  $('input[type="submit"]').attr('value', options.method);

  //
  // if the action is to post and submit type exists and is this method,
  // handle form submission
  //
  if (options.action === 'post' && options.data &&
    (!options.data.__submit || options.data.__submit === options.method) &&
    !options.error) {
    var cb = function (err, result) {

      // if there are errors, remove results and display errors on the forms
      if (err) {
        $('.results').remove();
        return showForm(options.data, err);
      }

      $('form').remove();
      $('.result').html(JSON.stringify(result, true, 2));
      // if we were given a redirect, use it
      if (options.redirect) {
        // fill the redirect template
        var redirect = require('mustache').to_html(options.redirect, options.data);
        options.response.redirect(redirect);
      }
      return domWithLayout();
    };
    // submit the data
    return resource.invoke(rMethod, options.data, cb);

  //
  // otherwise if the action is not post or submit type is not this method...
  //
  // show the form
  } else {
    $('.results').remove();
    showForm(options.data, options.error);
  }

  function showForm (data, error) {

    // a method's schema is of type object and has properties
    rMethod.schema.type = rMethod.schema.type || 'object';
    rMethod.schema.properties = rMethod.schema.properties || {};

    // append arguments to options
    options.data = options.data || {};
    options.schema = rMethod.schema;
    options.error = error;

    // call inputs presenter to handle delegation
    self.parent.inputs.index.present(options, function(err, result) {
      console.log("err: ",error);
      if (err) { return domWithLayout(err); }
      $('.inputs').append(result);
      // TODO: make it so that form errors get rid of this .error
      return domWithLayout(options.error);
    });
  }

};
