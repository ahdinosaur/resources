var resource = require('resource'),
    errors = require('./errors');

module['exports'] = function (layout, options, callback) {
  options = options || {};

  var self = this,
      logger = resource.use('logger'),
      selector = options.selector,
      html = self.$.html();

  //
  // if options.layout does not exist, traverse upwards and return the first found
  //
  if (typeof layout !== 'object') {
    return callback(new Error("no layout given and no layout found"));
  }
  // found an acceptable layout, so return it
  //
  // call the given layout's presenter
  //
  layout.present(options, function (err, result) {
    if (err) { return callback(err); }
    // load the rendered layout into the dom
    var $ = self.$.load(result);

    // TODO: warn when the selector is an ID and matches two different elements in the DOM,
    //       as this is likely unintentional and will probably cause breakage.
    // logger.warn('gdsjklagdsj');

    // place given html into selection
    // if not provided, default selector to #main
    $(selector || '#main').html(html);
    // return the rendered dom
    callback(null, $.html());
  });
};