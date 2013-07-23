var async = require('async');

module['exports'] = function (options, callback) {

  var $ = this.$,
      self = this;

  //console.log("data: ", options.data);
  console.log("options.schema: ", options.schema);
  //console.log("error: ", options.error);

  // if schema is private, do not render
  if (options.schema.private === true) {
    return callback(null, '');
  }

  // use control's default (if it has one) or the empty string
  //control.value = control.default || '';

  //
  // determine schema's type, then render
  //
  var schemaType = options.schema.type;

  // if schema type is not given, figure it out
  if (typeof schemaType === 'undefined') {

    // if there's no type but there are properties, this must be an object
    if (options.schema.properties) {
      schemaType = 'object';

    // default everything else to string input
    } else {
      schemaType = 'string';
    }
  }

  // treat any as a string
  if (schemaType === "any") { schemaType = "string"; }

  // JSON schema has no enum type, so check if schema has enums
  if(Array.isArray(options.schema.enum)){
    schemaType = "enum";
  }

  // TODO: remove this?
  if (typeof options.schema.key !== 'undefined') {
    schemaType = "key";
  }

  // make sure there is a view available for this schema's type
  if(typeof self.parent.parent.inputs[schemaType] === 'undefined') {
    throw new Error('invalid schema ' + schemaType);
  }

  // If there is an index.js available, use it. else use the schema.
  // TODO: is parent.parent relaly necessary?
  var v = self.parent.parent.inputs[schemaType].index || self.parent.parent.inputs[schemaType];

  // present this schema
  v.present(options, callback);
};