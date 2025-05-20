H5PEditor.CoursePresentation.BackgroundSelector = (function ($, EventDispatcher) {

  /**
   * Create a Background Selector.
   *
   * @class H5PEditor.CoursePresentation.BackgroundSelector
   * @extends H5P.EventDispatcher Allows pub/sub
   * @param {jQuery} $backgroundSlides Elements to paint
   * @param {boolean} [isSingleSlide] Background selector is for a single element
   */
  function BackgroundSelector($backgroundSlides, isSingleSlide) {
    var self = this;

    // Inheritance
    EventDispatcher.call(self);

    // Background selector wrapper
    var $bgSelector = $('<div>', {
      'class': 'h5p-bg-selector'
    });

    // Description field
    var $descriptionField = $('<div>', {
      'class': 'h5p-bg-selector-description',
      appendTo: $bgSelector
    });

    // Bg selector widget
    var $bgSelectorContent = $('<div>', {
      'class': 'h5p-bg-selector-content',
      appendTo: $bgSelector
    });

    // Area for reset button
    var $resetButtonArea = $('<div>', {
      'class': 'h5p-bg-selector-reset-area',
      appendTo: $bgSelector
    });

    // Button for resetting background
    var $resetButton;

    // Outsource readies
    self.passReadies = true;

    // Collection of processed semantics
    self.children = [];

    // Default to false
    isSingleSlide = isSingleSlide || false;

    // Labels for radio buttons
    var radioLabels = [
      H5PEditor.t('H5PEditor.CoursePresentation', 'setImageBackground', {}),
      H5PEditor.t('H5PEditor.CoursePresentation', 'setColorFillBackground', {})
    ];

    /**
     * Get slide(s) that will be painted
     *
     * @private
     * @returns {jQuery} Slide(s)
     */
    var getTargetSlides = function () {
      return isSingleSlide ? $backgroundSlides : $backgroundSlides.filter('.global');
    };

    /**
     * Paint slide(s) with current settings
     * @private
     */
    var paintElement = function () {
      var settings = self.getSettings();

      if (!settings) {
        settings = {
          type: 'reset'
        };
      }
      var $targetSlides = getTargetSlides();

      // Reset
      $targetSlides.removeClass('has-background')
        .css('background', '')
        .css('background-image', '')
        .css('background-color', '');

      if (settings.type === 'image') {
        $targetSlides.addClass('has-background')
          .css('background-image', 'url(' + settings.value + ')');
      }
      else if (settings.type === 'bgColor') {
        $targetSlides.addClass('has-background')
          .css('background-color', settings.value);
      }
    };

    /**
     * Add listener for when backgrounds are changed
     * @private
     */
    var addOptionListeners = function () {
      var radioSelector = getRadioSelector();
      radioSelector.on('backgroundAdded', function () {
        self.addBackground();
      });

      radioSelector.on('backgroundRemoved', function () {
        removeBackground();
      });
    };

    /**
     * Get processed Radio Selector instance
     *
     * @private
     * @returns {H5PEditor.RadioSelector}
     */
    var getRadioSelector = function () {
      return self.children[0];
    };

    /**
     * Remove background from slide(s)
     * @private
     */
    var removeBackground = function () {

      // Trigger global background
      if (isSingleSlide) {
        $backgroundSlides.addClass('global');
        self.trigger('turnedGlobal');
      }
      else {
        // Remove global background
        paintElement();
      }

      if ($resetButton) {
        $resetButton.removeClass('show');
      }
    };

    /**
     * Add background to slide(s) with current settings
     */
    self.addBackground = function () {
      var settings = self.getSettings();

      // Invalid background
      if (!settings) {
        removeBackground();
        return;
      }

      // Store single slide data
      if (isSingleSlide && settings.value) {
        $backgroundSlides.removeClass('global');
      }

      paintElement();

      if ($resetButton) {
        $resetButton.addClass('show');
      }
    };


    /**
     * @typedef {Object} bgOptions Background options object
     * @property {boolean} [isSingle] Initialized for single slides
     * @property {boolean} [isVisible] Initialized as visible
     * @property {number} [index] Optional insert index
     */

    /**
     * Create a new background selector and add to collection
     *
     * @param {array|Object} fields Semantics for processing background selector
     * @param {Object} params Parameters belonging to semantics
     * @param {jQuery} $wrapper Element that we will append to
     * @param {bgOptions} [options] Additional background options
     */
    self.addBgSelector = function (fields, params, $wrapper, options) {
      options = options || {};

      $bgSelector.toggleClass('single', options.isSingle)
        .toggleClass('show', options.isVisible);

      // Process semantics into background selector
      H5PEditor.processSemanticsChunk(H5P.jQuery.makeArray(fields), params, $bgSelectorContent, self);
      addOptionListeners();
      getRadioSelector().setRadioLabels(radioLabels);

      // Check if single slide should use global settings
      if (isSingleSlide && !self.getSettings()) {
        $backgroundSlides.addClass('global');
        self.trigger('turnedGlobal');
      }
      else {
        paintElement();
      }

      // Insert after previous index
      if (options.index && (options.index > 0) && (options.index < $wrapper.children().length)) {
        $bgSelector.insertAfter($wrapper.children('.single').eq(options.index - 1));
      }
      else {
        $bgSelector.appendTo($wrapper);
      }

      return self;
    };


    /**
     * Add reset button for resetting background slides
     *
     * @param {string} [text] Optional text for reset button
     * @returns {H5PEditor.CoursePresentation.BackgroundSelector}
     */
    self.addResetButton = function (text) {
      text = text || H5PEditor.t('H5PEditor.CoursePresentation', 'resetToDefault');

      $resetButton = $('<button>', {
        'html': text,
        'class': 'h5p-background-selector-reset'
      }).click(function () {
        getRadioSelector().resetCheckedOption();
      });

      if (self.getSettings()) {
        $resetButton.addClass('show');
      }

      // Remove reset button elements
      $resetButtonArea.children().each(function () {
        $(this).remove();
      });

      // Add reset button to reset button area
      $resetButton.appendTo($resetButtonArea);

      return self;
    };

    /**
     * Set description at the top of the background selector
     *
     * @param {string} description
     * @returns {H5PEditor.CoursePresentation.BackgroundSelector}
     */
    self.setDescription = function (description) {
      $descriptionField.html(description);

      return self;
    };

    /**
     * Validate background selector.
     *
     * @returns {Boolean} Validity of inputs
     */
    self.validate = function () {
      return getRadioSelector().validate();
    };

    /**
     * Get current settings
     */
    self.getSettings = function () {
      return getRadioSelector().getStoredOption();
    };

    /**
     * Set target elements for background operations
     *
     * @param {jQuery} $newBackgroundSlides Target elements
     * @returns {H5PEditor.CoursePresentation.BackgroundSelector}
     */
    self.setBackgroundSlides = function ($newBackgroundSlides) {
      $backgroundSlides = $newBackgroundSlides;
      return self;
    };

    /**
     * Remove background selector element, used when deleting slides.
     *
     * @returns {H5PEditor.CoursePresentation.BackgroundSelector}
     */
    self.removeElement = function () {
      if ($bgSelector) {
        $bgSelector.remove();
      }
      return self;
    };

    /**
     * Update color picker in Radio Selector, used when changing slides.
     *
     * @returns {H5PEditor.CoursePresentation.BackgroundSelector}
     */
    self.updateColorPicker = function () {
      getRadioSelector().reflow();
      return self;
    };

    /**
     * Get selected index in Radio Selector.
     */
    self.getSelectedIndex = function () {
      return getRadioSelector().getSelectedIndex();
    };

    /**
     * Set selected index in Radio Selector.
     *
     * @param {number} index New index for Radio Selector
     * @returns {H5PEditor.CoursePresentation.BackgroundSelector}
     */
    self.setSelectedIndex = function (index) {
      getRadioSelector().setSelectedIndex(index);
      return self;
    };
  }

  // Inheritance
  BackgroundSelector.prototype = Object.create(EventDispatcher.prototype);
  BackgroundSelector.prototype.constructor = BackgroundSelector;

  return BackgroundSelector;
})(H5P.jQuery, H5P.EventDispatcher);
