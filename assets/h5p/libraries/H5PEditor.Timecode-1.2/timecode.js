/**
 * @namespace H5PEditor
 */
H5PEditor.widgets.timecode = H5PEditor.Timecode = (function ($) {

  /**
   * Converts timecodes to seconds.
   *
   * @class
   * @param {*} parent
   * @param {Object} field
   * @param {Number} params
   * @param {Function} setValue
   */
  function Timecode(parent, field, params, setValue) {
    var self = this;

    // Global elements
    var $item, $input, $errors;

    self.field = field;

    /**
     * Initialize timecode fields.
     *
     * @private
     */
    var init = function () {
      if (params !== undefined) {
        // Create timecode
        params = toTimecode(params);
      }

      $item = $(createHtml());
      $input = $item.find('input');
      $errors = $item.children('.h5p-errors');

      // Validate on change
      $input.change(function () {
        // Validate
        var value = self.validate();

        if (value !== false) {
          // Set param
          setValue(field, value);
        }
      });
    };

    /**
     * Create the HTML for the field.
     *
     * @private
     */
    var createHtml = function () {
      const id = H5PEditor.getNextFieldId(self.field);
      const descriptionId = (self.field.description !== undefined ? H5PEditor.getDescriptionId(id) : undefined)
      return H5PEditor.createFieldMarkup(field, H5PEditor.createText(params, 15, undefined, id, descriptionId), id);
    };

    /**
     * Converts seconds to timecode.
     *
     * @private
     * @param {Number} seconds
     * @returns {String}
     */
    var toTimecode = function (seconds) {
      var time = '';
      var minutes = Math.floor(seconds / 60);
      var hours = Math.floor(minutes / 60);

      minutes = minutes % 60;
      seconds = Math.floor((seconds % 60) * 1000) / 1000;

      if (hours !== 0) {
        time += hours + ':';

        if (minutes < 10) {
          // Leading zero
          time += '0';
        }
      }

      time += minutes + ':';

      if (seconds < 10) {
        // Leading zero
        time += '0';
      }

      time += seconds;

      return time;
    };


    /**
     * Converts seconds to timecode.
     *
     * @private
     * @param {Number} seconds
     * @returns {String}
     */
    var toSeconds = function (timecode) {
      // Split time format and check that we have between one and two colons.
      var values = timecode.split(':', 4);
      if (values.length !== 2 && values.length !== 3) {
        throw t('invalidTime', {':property': field.name});
      }

      // Validate seconds and add to value
      var allowedChars = new RegExp('^[0-9]+$');
      var j = values.length - 1;

      var seconds = parseFloat(values[j]);
      if (!values[j].match(/^[0-9]{2}$|\.[0-9]{1,3}$/) || seconds >= 60 || seconds < 0) {
        throw t('invalidTime', {':property': field.name});
      }

      // Validate minutes
      j = j - 1;
      var minutes = parseInt(values[j]);
      if (!values[j].match(allowedChars) || (values[j - 1] !== undefined && values[j].length !== 2) || (values[j - 1] === undefined && values[j].length !== (minutes + '').length) || minutes > 59) {
        throw t('invalidTime', {':property': field.name});
      }
      // Convert to seconds and add to value
      seconds += minutes * 60;

      // Validate hours
      j = j - 1;
      if (values[j] !== undefined) {
        var hours = parseInt(values[j]);
        if (!values[j].match(allowedChars) || values[j].length !== (hours + '').length || hours < 1) {
          throw t('invalidTime', {':property': field.name});
        }
        // Convert to seconds and add to value
        seconds += hours * 3600;
      }

      return seconds;
    };

    /**
     * Append field to given wrapper.
     *
     * @public
     * @param {jquery} $wrapper
     */
    self.appendTo = function ($wrapper) {
      $item.appendTo($wrapper);
    };

    self.getDomElement = function () {
      return $item;
    };

    /**
     * Validate field.
     *
     * @return {*} valid value or false
     */
    self.validate = function () {
      // Retrieve timecode
      var value = H5P.trim($input.val());

      // Reset error messages
      $errors.html('');

      try {
        if (!value.length) {
          if (field.optional === true) {
            // Field is optional and does not have a value, nothing more to validate
            return;
          }

          // Field must have a value
          throw ct('requiredProperty', {':property': 'number field'});
        }
        else {
          // Convert timecode to seconds
          value = toSeconds(value);

          // Check that field doesn't exceed its min and max values.
          if (field.max !== undefined && value > field.max) {
            throw ct('exceedsMax', {':property': field.name, ':max': toTimecode(field.max)});
          }
          else if (field.min !== undefined && value < field.min) {
            throw ct('exceedsMin', {':property': field.name, ':min': toTimecode(field.min)});
          }
        }
      }
      catch (error) {
        $errors.append(H5PEditor.createError(error));
      }

      return H5PEditor.checkErrors($errors, $input, value);
    };

    /**
     * Remove field.
     *
     * @public
     */
    self.remove = function () {
      $item.remove();
    };

    init();
  }

  /**
   * Retrieve local translation.
   *
   * @private
   * @param {String} key
   * @param {Object} [placeholders]
   * @returns {String}
   */
  var t = function (key, placeholders) {
    return H5PEditor.t('H5PEditor.Timecode', key, placeholders);
  };

  /**
   * Retrieve core translation.
   *
   * @private
   * @param {String} key
   * @param {Object} [placeholders]
   * @returns {String}
   */
  var ct = function (key, placeholders) {
    return H5PEditor.t('core', key, placeholders);
  };

  return Timecode;
})(H5P.jQuery);
