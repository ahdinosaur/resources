var render = function (options, callback) {
  var self = this,
      $ = self.$,
      html;

  // if our template has a render fn, use it
  if (self.templateRender) {
    html = self.templateRender(self.template, options);
  }
  // default to returning template
  else {
    html = self.template;
  }

  if (typeof callback === "function") {
    callback(null, html);
  } else {
    return html;
  }
};

module['exports'] = render;