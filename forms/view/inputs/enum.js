//
// enum.js - input fields for String types, bound by enum constraint
//

module['exports'] = function (options, callback) {

  var $ = this.$,
      input = options.control;

  // handle errors
  if(typeof input.error !== 'undefined') {
    $('.control-group').addClass('error');
    $('.help-inline').html(input.error.message);
  }

  // label control
  $('.control-group').attr('id', input.name);
  $('.control-label').attr('for', input.name);
  $('.control-label').html(input.name);

  // setup input
  $('select').attr('name', input.name);
  $('select').attr('placeholder', input.description || '');
  $('select option').html('Please select ' + input.name + '...');

  // add each possible enum to dropdown and label the currently selected one
  input.enum.forEach(function(option) {
    var selected = (option === input.value) ? ' SELECTED ' : '';
    $('select').append('<option value=' + option + selected + '>' + option + '</option>'); // Bad string concat!
  });

  return callback(null, $.html());
};
