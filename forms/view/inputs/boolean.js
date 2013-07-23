//
// boolean.js - input fields for boolean types
//

module['exports'] = function (options, callback) {
  var $ = this.$,
      input = options.schema;

  // handle errors
  if(typeof input.error !== 'undefined') {
    $('.control-group').addClass('error');
    $('.help-inline').html(input.error.message);
  }

  // label control
  var label = $('.control-label');
  label.attr('for', input.name);
  label.html(input.name);

  // setup input
  var checkbox = $('input[type=checkbox]');
  checkbox.attr('name', input.name);
  // prefill box if checked
  if(input.value.toString() === "true") {
    checkbox.attr('checked', 'CHECKED');
  }

  return callback(null, $.html());
};
