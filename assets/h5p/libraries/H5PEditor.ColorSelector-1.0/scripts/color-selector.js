/**
 * ImagePositionSelector widget module
 *
 * @param {H5P.jQuery} $
 */
H5PEditor.widgets.colorSelector = H5PEditor.ColorSelector = (function ($) {

  /**
   * Creates an image position selector.
   *
   * @class H5PEditor.ColorSelector
   * @param {Object} parent
   * @param {Object} field
   * @param {Object} params
   * @param {function} setValue
   */
  function ColorSelector(parent, field, params, setValue) {
    this.parent = parent;
    this.field = field;
    this.params = params;
    this.setValue = setValue;
  }

  /**
   * Append the field to the wrapper.
   * @public
   * @param {H5P.jQuery} $wrapper
   */
  ColorSelector.prototype.appendTo = function ($wrapper) {
    var self = this;

    self.$container = $('<div>', {
      'class': 'field text h5p-color-selector'
    });

    // Add header:
    $('<span>', {
      'class': 'h5peditor-label',
      html: self.field.label
    }).appendTo(self.$container);

    // Create input field
    self.$colorPicker = $('<input>', {
      'type': 'text',
      'class': 'h5p-color-picker'
    }).appendTo(self.$container);

    var config = {
      preferredFormat: 'hex',
      color: self.getColor(),
      change: function (color) {
        self.setColor(color);
      }
    };

    // Make it possible to set spectrum config
    if (self.field.spectrum !== undefined) {
      config = $.extend(self.field.spectrum, config);
    }

    // Create color picker widget
    self.$colorPicker.spectrum(config);

    // Add description:
    $('<span>', {
      'class': 'h5peditor-field-description',
      html: self.field.description
    }).appendTo(self.$container);

    self.$container.appendTo($wrapper);
  };


  /**
   * Save the color
   *
   * @param {Object} color The
   */
  ColorSelector.prototype.setColor = function (color) {
    // Save the value, allow null
    this.params = color === null ? null : color.toHex();
    this.setValue(this.field, this.params);
  };

  ColorSelector.prototype.getColor = function () {
    var isEmpty = this.params === null || this.params === "";
    return isEmpty ? null : '#' + this.params;
  };

  /**
   * Validate the current values.
   */
  ColorSelector.prototype.validate = function () {
    return (this.params.length !== 0);
  };

  ColorSelector.prototype.remove = function () {};

  return ColorSelector;
})(H5P.jQuery);
