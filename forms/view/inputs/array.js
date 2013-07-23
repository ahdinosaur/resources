/*


  A single level of an array can have three distinct states:


  an array of non-object values
  an array of object values
  an array of mixed object and non-object values

  This is how the Array.js Presenter deals with them

*/


// an array of non-object values
  // print out a list control with all values
    // sort, shift, pop, unshift, etc
    // bonus: stats / tallies graphs

// an array of object values
  // for each object, create a sub control ..^
    // clone
    // delete
    // edit
  // for each Array.isArray, create a sub control ..^

// an array of mixed object and non-object values
  // for each object, create a sub control ..^
    // clone
    // delete
    // edit
  // for each object, create a sub control ..^

//
// input fields for 'string' types
//
module['exports'] = function (options, callback) {

  var self = this,
      $ = self.$,
      input = options.schema;

  console.log("items", input.items);

  // convert possible string to array
  if (typeof input.value === 'string') {
    input.value = [];
  }

  // handle forms errors
  if(typeof input.error !== 'undefined') {
    $('.control-group').addClass('error');
    $('.help-inline').html(input.error.message);
  }

  // TODO: allow for nested objects/arrays
  // parse submit args
  var submitArgs, submitType = '', submitNumber = 1, submitProp = '';
  if (options.data && options.data.__submit) {
    submitArgs = options.data.__submit.split(":");
    submitType = submitArgs[0] || '';
    submitNumber = parseInt(submitArgs[1], 10);
    submitNumber = (isNaN(submitNumber)) ? 1 : submitNumber;
    submitProp = submitArgs[2] || '';
  }

  // process submit args
  if (input.name === submitProp) {
    switch (submitType) {
      case 'add':
        console.log("submit type is add");
        submitNumber += 1;
        break;
      case 'remove':
        console.log("submit type is remove");
        submitNumber -= 1;
        break;
      }
  } else { submitNumber = input.value.length; }

  // make a new control box for each present element
  for (var i = submitNumber - 1; i >= 0; i--) {
    // TODO: remove defaulting elements to whitespace, it's necessary
    //       because otherwise pressing add multiple times doesn't add many boxes
    var element = input.value[i] || ' ';
    console.log("element: ", element);

    // TODO: do mustache
    $('.controls').prepend('<input type="text" class="input-large" value="' +
      element.toString() +
      '">' +
      '</input>');
  }

  // label control
  $('.control-group').attr('id',  input.name);
  $('.control-label').attr('for', input.name);
  $('.control-label').html(input.name);

  // setup buttons
  $('#add').attr('value', 'add:' + Math.max(submitNumber, 0) + ":" + input.name);
  $('#remove').attr('value', 'remove:' + Math.max(submitNumber, 0) + ":" + input.name);
  $('input').attr('name', input.name  + "[]");

  return callback(null, $.html());
};
