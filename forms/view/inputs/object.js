var async = require('async');

module['exports'] = function (options, callback) {

  // TODO: make it so load works
  var $ = this.$.load(''),
      self = this;

  if (typeof options.schema.properties === 'undefined') {
    return callback(new Error("inputs/object.js given schema without properties!"));
  }

  var props = options.schema.properties;

  // if props has an argument called "options",
  // use it as properties instead
  //if (props.options &&
  //  typeof props.options.properties !== 'undefined') {
  //  props = props.options.properties;
  //}

  // TODO: is this still necessary?
  // clone props so we don't modify schema directly
  props = Object.clone(props);

  // remove callback from properties
  if (props.callback) {
    delete props.callback;
  }

  //
  // for each property, render appropriate view and append it to the dom
  //
  //console.log("\n");
  //console.log("OBJECT SCHEMA: ", options.schema);
  //console.log("\n");
  async.eachSeries(Object.keys(props), function(property, callback) {

    //
    // create control as viewable property
    //
    // TODO: is the below cloning still necessary?
    // make a shallow clone of this property as the control
    var control = {};
    for(var p in props[property]) {
      control[p] = props[property][p];
    }

    // label the control
    control.name = property;

    // if we have errors, add them to the control
    // TODO: can/should this be in inputs index?
    if (options.error && options.error.errors) {
      for (var i = 0; i < options.error.errors.length; i++) {
        var e = options.error.errors[i];
        if (e.property === control.name) {
          control.error = e;
          // pop from errors after adding error message to forms.
          options.error.errors.splice(i, i+1);
          // if we now have no more errors, forms handled it so dont pass error
          if (options.error.errors.length === 0) {
            // TODO: somehow pass this info back
            options.error = null;
            break;
          }
        }
      }
    }
    //console.log("async series. current control: ",control);

    // if the data we were given has this property, add it to control.
    // TODO: with the recursion, won't this cause name collisions?
    if(typeof options.data[property] !== 'undefined') {
      control.value = options.data[property];
    }
    // else, use control's default (if it has one) or the empty string
    else {
      control.value = control.default || '';
    }

    //
    // present this control and add its view to the dom
    //
    options.schema = control;
    self.parent.index.present(options, function(err, result) {
      if (err) { return callback(err); }
      //console.log("\n");
      //console.log("result: ",result);
      //console.log("\n");
      $.root().append(result);
      return callback(null);
    });

  // async series callback
  }, function(err) {
    //console.log("ASYNC CALLBACK WITH: ", $.html());
      if (err) { return callback(err); }
      return callback(null, $.html());
    });
};




function showForm (data, error) {

  data = data || {};
  var errors = (error) ? error.errors : [];
  if(typeof rMethod.schema.properties !== 'undefined') {
    var props = rMethod.schema.properties || {};

    // if this rMethod has an argument of "options",
    // use it as properties
    if (rMethod.schema.properties.options &&
      typeof rMethod.schema.properties.options.properties !== 'undefined') {
      props = rMethod.schema.properties.options.properties;
    }

    // clone props so we don't modify schema directly
    props = Object.clone(props);

    // remove callback from properties
    if (props.callback) {
      delete props.callback;
    }

    //
    // for each property key (in series),
    // append the property control to the dom
    //
    async.eachSeries(Object.keys(props),
      function(property, callback) {

        // make a shallow clone of this property as the control
        var control = {};
        for(var p in props[property]) {
          control[p] = props[property][p];
        }

        // label the control
        control.name = property;

        // if we have errors, add them to the control
        if (error && error.errors) {
          for (var i = 0; i < errors.length; i++) {
            var e = errors[i];
            if (e.property === control.name) {
              control.error = e;
              // pop from errors after adding error message to forms.
              errors.splice(i, i+1);
              // if we now have no more errors, forms handled it so dont pass error
              if (errors.length === 0) {
                error = null;
              }
            }
          }
        }

        // if the data we were given has this property, add it to control.
        if(typeof data[property] !== 'undefined') {
          control.value = data[property];
        }
        // else, use control's default (if it has one) or the empty string
        else {
          control.value = control.default || '';
        }

        // add the control to options
        options.control = control;

        // call inputs presenter, which will handle delegation appropriately
        self.parent.inputs.index.present(options, function(err, result){
          if (err) { return callback(err); }
          $('.inputs').append(result);
          return callback(null);
        });
      },


      function(err) {
        if (err) { return domWithLayout(err); }
        // return the dom
        return domWithLayout(error);
      });

  // no properties remain, return the rendered form
  } else {
    return domWithLayout(error);
  }
}