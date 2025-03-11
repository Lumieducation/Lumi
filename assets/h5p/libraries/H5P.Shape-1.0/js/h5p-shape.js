var H5P = H5P || {};

/**
 * Shape module
 *
 * @param {jQuery} $
 */
H5P.Shape = (function ($) {
  /**
   * Initialize module.
   *
   * @param {Object} params Behavior settings
   * @param {Number} id Content identification
   * @returns {C} self
   */
  function C(params, id) {
    H5P.EventDispatcher.call(this);
    this.params = $.extend(true, {
      type: 'rectangle',
      shape: {
        fillColor: '#ccc',
        borderWidth: 0,
        borderStyle: 'solid',
        borderColor: '#000',
        borderRadius: 0
      }
    }, params);
    this.contentId = id;
  }

  C.prototype = Object.create(H5P.EventDispatcher.prototype);
  C.prototype.constructor = C;

  /**
   * Attach h5p inside the given container.
   *
   * @param {jQuery} $container
   */
  C.prototype.attach = function ($container) {
    this.$inner = $container.addClass('h5p-shape');
    this.$shape = $('<div class="h5p-shape-element h5p-shape-' + this.params.type + '"></div>');
    this.styleShape();
    this.$shape.appendTo(this.$inner);
  };

  /**
   * Is this a line?
   * @return {boolean}
   */
  C.prototype.isLine = function () {
    return this.params.type === 'vertical-line' ||
           this.params.type === 'horizontal-line';
  };

  /**
   * Style the shape
   */
  C.prototype.styleShape = function () {
    var props = this.isLine() ? this.params.line : this.params.shape;
    var borderWidth = (props.borderWidth * 0.0835) + 'em';
    var css = {
      'border-color': props.borderColor
    };

    if (this.params.type == "vertical-line") {
      css['border-left-width'] = borderWidth;
      css['border-left-style'] = props.borderStyle;
      this.trigger('set-size', {width: borderWidth, maxWidth: borderWidth});
    }
    else if (this.params.type == "horizontal-line") {
      css['border-top-width'] = borderWidth;
      css['border-top-style'] = props.borderStyle;
      this.trigger('set-size', {height: borderWidth, maxHeight: borderWidth});
    }
    else {
      css['background-color'] = props.fillColor;
      css['border-width'] = borderWidth;
      css['border-style'] = props.borderStyle;
    }

    if (this.params.type == "rectangle") {
      css['border-radius'] = props.borderRadius * 0.25 + 'em';
    }

    this.$shape.css(css);
  };

  return C;
})(H5P.jQuery);
