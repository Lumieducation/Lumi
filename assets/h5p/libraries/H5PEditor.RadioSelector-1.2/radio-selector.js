/*global ns*/
H5PEditor.widgets.radioSelector = H5PEditor.RadioSelector = (function ($, EventDispatcher) {

  var idCounter = 0;

  /**
   * Creates a Radio Selector widget.
   *
   * @class H5PEditor.RadioSelector
   * @param {Object} parent
   * @param {Object} field
   * @param {Object} params
   * @param {function} setValue
   */
  function RadioSelector(parent, field, params, setValue) {
    var self = this;

    // Inheritance
    EventDispatcher.call(self);

    // Wrapper for widget
    var $container = $('<div class="h5p-radio-selector">');

    // Wrapper for radio buttons
    var $options = $('<div class="h5p-radio-selector-options">').appendTo($container);

    // Wrapper for content corresponding to radio buttons
    var $values = $('<div class="h5p-radio-selector-values">').appendTo($container);

    // Unique radio selector id
    var uniqueId = 'h5p-radio-selector-' + idCounter++;

    // Stored options
    var storedOptions = [];

    // Make parent handle readies
    self.passReadies = true;

    // Processed semantics object
    self.children = [];

    // Default selected option
    var currentOption = 0;

    // Default params
    params = params || {};

    // Set current option from params
    field.fields.forEach(function (semanticField, idx) {
      if (semanticField.name && params[semanticField.name]) {
        currentOption = idx;
      }
    });

    // Make sure params are updated when fields are changed
    setValue(field, params);

    /**
     * @typedef {Object} StoredOption Stored options
     * @property {string} type Type (e.g. 'image', 'bgColor')
     * @property {string|*} value Value of type
     */

    /**
     * Add option at given index
     *
     * @private
     * @param {number} i Index of radio option
     * @param {StoredOption} option Stored option
     */
    var addOption = function (i, option) {
      storedOptions[i] = option;
      triggerOption(i);
    };

    /**
     * Remove given radio option
     *
     * @private
     * @param {number} [i] Index of radio option
     */
    var removeOption = function (i) {
      i = i || currentOption;
      storedOptions[i] = undefined;
      triggerOptionRemoval();
    };

    /**
     * Trigger type removal to parent
     * @private
     */
    var triggerOptionRemoval = function () {
      self.trigger('backgroundRemoved');
    };

    /**
     * Trigger type added to parent
     *
     * @private
     * @param {number} i Index of option triggered
     */
    var triggerOption = function (i) {
      currentOption = i;
      self.trigger('backgroundAdded');
    };

    /**
     * Create radio content and show selected
     * @private
     */
    var createRadioContent = function () {
      H5PEditor.processSemanticsChunk(field.fields, params, $values, self);
      $values.children().eq(currentOption).addClass('show');
    };

    /**
     * Create radio buttons
     * @private
     */
    var createRadioButtons = function () {
      $values.children().each(function (idx) {
        var show = '';
        var label = field.fields[idx].label;

        // Show current option
        if (idx === currentOption) {
          show = ' checked="checked"';
          $(this).addClass('show');
        }

        // Create radio button for content
        $('<label class="h5p-radio-selector-label">' +
            '<input type="radio"' + show + ' name="' + uniqueId + '">' + label +
          '</label>')
          .change(function () {

            // Show radio option
            triggerOptionRemoval();
            triggerOption(idx);
            self.showContent(idx);
            self.reflow();
            currentOption = idx;
          }).appendTo($options);
      });
    };

    /**
     * Store initial options from processed parameters
     * @private
     */
    var storeInitialOptions = function () {
      self.children.forEach(function (child, idx) {

        // Has params, store option
        if (child.params) {
          var type = '';
          var value;
          if (child instanceof ns.File) {
            type = 'image';
            if (child.params && child.params.path) {
              value = H5P.getPath(child.params.path, H5PEditor.contentId);
            }
          }
          else if (child instanceof H5PEditor.ColorSelector && child.params.length) {
            type = 'bgColor';
            value = child.params;
          }

          // Store options if we found a value
          if (value) {
            storedOptions[idx] = {type: type, value: value};
          }
        }
      });
    };

    /**
     * Handle changes in semantics
     * @private
     */
    var handleSemanticsEvents = function () {
      self.children.forEach(function (child, i) {
        handleImages(child, i);
        handleColors(child, i);
      });
    };

    /**
     * Try handling child as image
     *
     * @private
     * @param {Object} child Processed semantics instance
     * @param {number} i Index of instance in semantics
     */
    var handleImages = function (child, i) {
      if (!(child instanceof ns.File) || !child.changes) {
        return;
      }

      // Add to changes callback
      child.changes.push(function (img) {
        var type = 'image';

        // Check for image path
        if (img && img.path) {

          // Add image
          var value = H5P.getPath(img.path, H5PEditor.contentId);
          addOption(i, {type: type, value: value});
        }
        else {

          // Remove image
          removeOption(i);
        }
      });
    };

    /**
     * Try handling child as color selector
     *
     * @private
     * @param {Object} child Processed semantics instance
     * @param {number} i Index of instance in semantics
     */
    var handleColors = function (child, i) {
      if (!(child instanceof H5PEditor.ColorSelector)) {
        return;
      }

      var type = 'bgColor';

      /**
       * Trigger color change, update params and reflow color picker
       *
       * @private
       * @param [tinycolor] Optional new color
       */
      var changeSpectrumColor = function (tinycolor) {
        tinycolor = tinycolor || child.$colorPicker.spectrum('get', tinycolor);

        // Make sure we are the current option, avoid unintentional changes
        if (currentOption === i) {

          // Add color
          if (tinycolor) {
            addOption(i, {type: type, value: tinycolor.toHexString()});
          }
          else {
            // Remove color
            removeOption(i);
          }
        }

        // Update ColorSelector manually, since it does not auto update when flat
        child.setColor(tinycolor);
        child.$colorPicker.spectrum('reflow');
      };

      child.$colorPicker.on('move.spectrum', function (e, tinycolor) {
        changeSpectrumColor(tinycolor);
      }).on('change', function (e, tinycolor) {
        if (tinycolor !== null) {
          changeSpectrumColor(tinycolor);
        }
      });
    };

    /**
     * Append the field to the wrapper.
     *
     * @param {jQuery} $wrapper
     * @returns {H5PEditor.RadioSelector}
     */
    self.appendTo = function ($wrapper) {
      createRadioContent();
      createRadioButtons();
      handleSemanticsEvents();
      storeInitialOptions();
      $container.appendTo($wrapper);

      return self;
    };

    /**
     * Show content with given index
     *
     * @param index Index of content
     * @returns {H5PEditor.RadioSelector}
     */
    self.showContent = function (index) {
      $values.children().removeClass('show');
      $values.children().eq(index).addClass('show');

      return self;
    };

    /**
     * Reset currently selected option
     *
     * @returns {H5PEditor.RadioSelector}
     */
    self.resetCheckedOption = function () {
      var resetOption = self.children[currentOption];

      if (resetOption instanceof ns.File) {
        // TODO: Make core h5peditor-file export a reset function
        // Temp solution, click 'close' using jquery
        $values.children().eq(currentOption)
          .find('.file > a.remove').click();
      }
      else if (resetOption instanceof H5PEditor.ColorSelector) {
        resetOption.$colorPicker.spectrum('set', null);
        removeOption();
      }
    };

    /**
     * Get currently selected option
     *
     * @returns {StoredOption} Stored option
     */
    self.getStoredOption = function () {
      return storedOptions[currentOption];
    };

    /**
     * Get selected index
     *
     * @returns {number} Currently selected index
     */
    self.getSelectedIndex = function () {
      return currentOption;
    };

    /**
     * Reflow/repaint current option if it is a ColorSelector
     *
     * @returns {H5PEditor.RadioSelector}
     */
    self.reflow = function () {
      var selected = self.children[currentOption];
      if (selected instanceof H5PEditor.ColorSelector) {
        selected.$colorPicker.spectrum('reflow');
      }

      return self;
    };

    /**
     * Set selected index
     *
     * @param {number} index Index to select
     * @returns {H5PEditor.RadioSelector}
     */
    self.setSelectedIndex = function (index) {
      var $input = $options.children().eq(index).find('input');
      if (!$input.is(':checked')) {
        $input.attr('checked', true);
        $input.trigger('change');
      }

      return self;
    };

    /**
     * Set radio labels
     *
     * @param {array} radioLabels Labels for radio buttons
     * @returns {boolean} Success
     */
    self.setRadioLabels = function (radioLabels) {
      var $optionLabels = $options.children();

      // Validate length
      if ($optionLabels.length !== radioLabels.length) {
        return false;
      }

      $optionLabels.each(function (idx) {
        $(this).get(0).lastChild.nodeValue = radioLabels[idx];
      });

      return true;
    };

    /**
     * Validate user input and prune unused params.
     *
     * @returns {Boolean} Valid or not
     */
    self.validate = function () {
      // Prune unused params
      $options.find('input').each(function (idx) {
        if (!$(this).is(':checked')) {
          delete params[field.fields[idx].name];
        }
        else if (self.children[idx] instanceof H5PEditor.ColorSelector) {
          // Make sure ColorSelector is saved
          var colorPicker = self.children[idx];
          colorPicker.setColor(colorPicker.$colorPicker.spectrum('get'));
        }
      });

      return true;
    };
  }

  // Inheritance
  RadioSelector.prototype = Object.create(EventDispatcher.prototype);
  RadioSelector.prototype.constructor = RadioSelector;

  /**
   * Communicate that we are ready.
   *
   * @returns {boolean}
   */
  RadioSelector.prototype.ready = function () {
    return true; // Always ready
  };

  /**
   * Remove me. Invoked by core
   */
  RadioSelector.prototype.remove = function () {
  };

  return RadioSelector;
})(H5P.jQuery, H5P.EventDispatcher);
