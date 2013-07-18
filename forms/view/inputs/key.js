var resource = require('resource');

//
// key.js - input fields key lookups
//
module['exports'] = function (input, options, callback) {

  var $ = this.$;

  // TODO: does this ever receive input.error?

  // label control
  $('.control-label').attr('for', input.name);
  $('.control-label').html(input.name);

  // setup input
  $('select').attr('id',  input.name);
  $('select').attr('name', input.name);
  $('select').attr('placeholder', input.description || '');

  // add each property of matching resource as an option
  resource[input.key].all(function(err, results){
    results.forEach(function(option){
      var selected = (option === input.value) ? ' SELECTED ' : '';
      $('select').append('<option value="' + option.id + '" ' + selected + '>' + ( option.name || option.id ) + '</option>'); // Bad string concat!
    });
    callback(null, $.html());
  });

};
