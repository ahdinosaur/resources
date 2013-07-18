//
// input fields for 'number' types
//
module['exports'] = function (options, callback) {

  var self = this,
      $ = self.$,
      input = options.control;

  // handle forms errors
  if(typeof input.error !== 'undefined') {
    $('.control-group').addClass('error');
    $('.help-inline').html(input.error.message);
  }

  // label control
  $('.control-group').attr('id',  input.name);
  $('.control-label').attr('for', input.name);
  $('.control-label').html(input.name);

  // setup input
  $('input').attr('name', input.name);
  $('input').attr('value', input.value.toString());

  return callback(null, $.html());
};
