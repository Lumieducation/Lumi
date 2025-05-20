(function ($, Collage, EventDispatcher) {

  /**
   * Collage Clip
   *
   * @class H5P.Collage.Clip
   * @extends H5P.EventDispatcher
   * @param {H5P.jQuery} $container
   * @param {Object} content
   * @param {number} contentId
   */
  Collage.Clip = function ($container, content, contentId) {
    var self = this;

    // Initialize event inheritance
    EventDispatcher.call(self);

    // Photo wrapper
    self.$wrapper = $('<div/>', {
      'class': 'h5p-collage-photo',
      appendTo: $container
    });

    // Clip resource
    var $img;

    // Always available
    self.content = content;

    // Keep track of image has been positioned
    let isPositioned = false;

    /**
     * Position the clip image according to params.
     */
    self.positionImage = function () {
      if (self.$wrapper[0].offsetParent === null || isPositioned || !$img || !$img.length) {
        return; // Not visible, position will not be correct
      }

      // Determine image ratio
      const imageRatio = $img[0].width ? ($img[0].width / $img[0].height) : (content.image.width && content.image.height ? content.image.width / content.image.height : null);
      if (imageRatio === null) {
        return; // Skip
      }
      isPositioned = true;

      // Find container raioratios
      var containerSize = window.getComputedStyle(self.$wrapper[0]);
      var containerRatio = (parseFloat(containerSize.width) / parseFloat(containerSize.height));

      // Make sure image covers the whole container
      if (isNaN(containerRatio) || imageRatio > containerRatio) {
        self.prop = 'height';
      }
      else {
        self.prop = 'width';
      }
      $img.css(self.prop, (content.scale * 100) + '%');

      // Pan image
      $img.css('margin', content.offset.top + '% 0 0 ' + content.offset.left + '%');
    };
    /**
     * Decode html
     */ 
    self.decodeHTML = value => ($('<textarea/>').html(value).text());

    /**
     * Triggers the loading of the image.
     */
    self.load = function () {
      if (self.empty()) {
        self.$wrapper.addClass('h5p-collage-empty');
        return; // No image set
      }
      else {
        self.$wrapper.removeClass('h5p-collage-empty');
      }

      // Create image
      $img = $('<img/>', {
        'class': 'h5p-collage-image',
        alt: self.decodeHTML(content.alt),
        title: self.decodeHTML(content.title),
        src: H5P.getPath(content.image.path, contentId),
        prependTo: self.$wrapper,
        on: {
          load: function () {
            // Make sure it's in the correct position
            self.positionImage();
          }
        }
      });
      setTimeout(function () {
        // Wait for next tick to make sure everything is visible
        self.positionImage();
      }, 0);
      self.trigger('change', $img);
    };

    /**
     * Check if the current clip is empty or set.
     *
     * @returns {boolean}
     */
    self.empty = function () {
      return !content.image;
    };

    /**
     * Check if the current clip is positioned yet.
     *
     * @returns {boolean}
     */
    self.isPositioned = function () {
      return isPositioned;
    };
  };

  // Extends the event dispatcher
  Collage.Clip.prototype = Object.create(EventDispatcher.prototype);
  Collage.Clip.prototype.constructor = Collage.Clip;

})(H5P.jQuery, H5P.Collage, H5P.EventDispatcher);
