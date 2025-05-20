var H5P = H5P || {};

H5P.TwitterUserFeed = (function ($) {

  /**
   * Constructor function.
   */
  function C(options, id) {
    H5P.EventDispatcher.call(this);
  }

  // Inheritance
  C.prototype = Object.create(H5P.EventDispatcher.prototype);
  C.prototype.constructor = C;

  /**
   * Attach function called by H5P framework to insert H5P content into
   * page
   *
   * @param {jQuery} $container
   */
  C.prototype.attach = function ($container) {
    var self = this;
    
    $container.append($('<div>', {
      'class': 'h5p-twitter-user-feed-deprecation-message',
      html: 'The <i>Twitter User Feed</i> H5P content type is no longer supported since the Twitter API used is no longer available'
    }));
  };

  return C;
})(H5P.jQuery);
