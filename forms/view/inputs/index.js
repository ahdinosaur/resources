module['exports'] = function (options, callback) {

  var output = "",
      self = this,
      control = options.control;

  // if control is private, do not render
  if (control.private === true) {
    return callback(null, '');
  }

  //
  // determine the type of control to render
  //
  // default everything to string input
  var _control = (control.type) ? control.type : 'string';

  // treat any as a string
  if (_control === "any") { _control = "string"; }

  // JSON schema has no enum type, so check if control has enums
  if(Array.isArray(control.enum)){
    _control = "enum";
  }

  // TODO: remove this?
  if (typeof control.key !== 'undefined') {
    _control = "key";
  }

  // make sure there is a view available for this control's type
  if(typeof self.parent.parent.inputs[_control] === 'undefined') {
    throw new Error('invalid control ' + _control);
  }

  // If there is an index.js available, use it. else use the control.
  var v = self.parent.parent.inputs[_control].index || self.parent.parent.inputs[_control];

  // present the view template
  v.present(options, callback);
};