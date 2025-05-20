H5PEditor.CoursePresentation.SlideSelector = (function ($, EventDispatcher) {

  /**
   * Create a Slide Selector with background settings
   *
   * @class H5PEditor.CoursePresentation.SlideSelector
   * @extends H5P.EventDispatcher Enables pub/sub
   * @param {H5PEditor.CoursePresentation} cpEditor CP editor for listening to events
   * @param {jQuery} $slides Targeted slides
   * @param {Object} globalFields Global semantic fields
   * @param {Object} slideFields Single slide semantic fields
   * @param {Object} params Parameters for semantic fields
   */
  function SlideSelector(cpEditor, $slides, globalFields, slideFields, params) {
    var self = this;

    // Inheritance
    EventDispatcher.call(self);

    // Background selector open state
    var isOpen = false;

    // Keep track of single slides
    var singleSlides = [];

    // Keep track of the global background selector
    var globalBackground;

    // Keep track of current slide
    var currentSlide = 0;

    // DOM elements
    var $popup = $('<div class="h5p-background-selector">');
    var $title = $('<div class="h5p-background-selector-title">')
      .html(H5PEditor.t('H5PEditor.CoursePresentation', 'slideBackground', {}))
      .appendTo($popup);
    $('<div>', {
      class: 'h5p-background-selector-close',
      role: 'button',
      tabIndex: '0',
      click: function () {
        cpEditor.slideControls.$background.click();
      },
      keydown: function (e) {
        if (e.which ===32) {
          $(this).click();
          e.preventDefault();
        }
      }
    }).prependTo($title);
    var $header = $('<div>').appendTo($popup);
    var $contentWrapper = $('<div class="h5p-background-selector-content-wrapper">').appendTo($popup);
    var $globalContent;
    var $slideContent;

    // Single slide semantic fields
    var singleSlideFields = H5PEditor.CoursePresentation.findField('slideBackgroundSelector', slideFields.field.fields);

    /**
     * Init background selectors
     * @private
     */
    var initBgSelectors = function () {

      // Global bg selector
      var templateString = H5PEditor.t('H5PEditor.CoursePresentation', 'template');
      var currentSlideString = H5PEditor.t('H5PEditor.CoursePresentation', 'currentSlide');
      $globalContent = createSlideSelector(templateString, true);
      globalBackground = new H5PEditor.CoursePresentation.BackgroundSelector($slides.children())
        .addBgSelector(globalFields, params, $globalContent, {isVisible: true})
        .setDescription(H5PEditor.t('H5PEditor.CoursePresentation', 'templateDescription', {':currentSlide': currentSlideString}))
        .addResetButton();

      // Single slide bg selector
      $slideContent = createSlideSelector(currentSlideString, false);
      $slides.children().each(function (idx) {
        initSingleSlide($slideContent, idx)
          .setDescription(H5PEditor.t('H5PEditor.CoursePresentation', 'currentSlideDescription', {':template': templateString}))
          .addResetButton(H5PEditor.t('H5PEditor.CoursePresentation', 'resetToTemplate'));
      });

      // Select single slide if first slide has single slide options
      if (singleSlides[0].getSettings()) {
        changeSlideType($slideContent);
      }

      // Resize header items
      $header.children().css('width', (100 / $header.children().length) + '%');
    };

    /**
     * Init listeners for slide operations
     * @private
     */
    var initSlideOperationsListeners = function () {
      // Register changed slide listener
      cpEditor.cp.on('changedSlide', function (e) {
        if (currentSlide !== e.data) {
          changeToSlide(e.data);
        }
      });

      cpEditor.on('sortSlide', function (e) {
        sortSlide(e.data);
      });

      cpEditor.on('removeSlide', function (e) {
        removeSlide(e.data);
      });
      cpEditor.on('addedSlide', function (e) {
        addSlide(e.data);
      });
    };

    /**
     * Sanitize parameters of slide index, so they can be easily processed
     *
     * @private
     * @param {number} idx Index of slide parameters
     */
    var sanitizeSlideParams = function (idx) {
      var slideParams =  params.slides[idx].slideBackgroundSelector;
      if (!slideParams) {
        return;
      }

      if (slideParams.fillSlideBackground && !slideParams.fillSlideBackground.length) {
        slideParams.fillSlideBackground = undefined;
      }

      if (slideParams.imageSlideBackground && !slideParams.imageSlideBackground.path) {
        slideParams.imageSlideBackground = undefined;
      }
    };

    /**
     * Add slide selector at specified index
     *
     * @private
     * @param {number} newSlideIndex Index for new slide
     */
    var addSlide = function (newSlideIndex) {
      // Must sanitize params before processing semantics
      sanitizeSlideParams(newSlideIndex);
      initSingleSlide($slideContent, newSlideIndex)
        .setDescription(H5PEditor.t('H5PEditor.CoursePresentation', 'currentSlideDescription', {
          ':template': H5PEditor.t('H5PEditor.CoursePresentation', 'template')
        }))
        .addResetButton(H5PEditor.t('H5PEditor.CoursePresentation', 'resetToTemplate'));

      // Change to selected radio button
      var selectedIndex = singleSlides[newSlideIndex - 1].getSelectedIndex();
      singleSlides[newSlideIndex].setSelectedIndex(selectedIndex);
    };

    /**
     * Remove slide selector at specified index
     *
     * @private
     * @param {number} removeIndex Index of removed slide
     */
    var removeSlide = function (removeIndex) {
      var removed = singleSlides.splice(removeIndex, 1);
      removed.forEach(function (singleSlide) {
        singleSlide.removeElement();
      });
    };

    /**
     * Sort current slide selector to the specified direction
     *
     * @private
     * @param {number} dir Negative or positive direction and value of sort.
     */
    var sortSlide = function (dir) {
      // Validate sort
      if ((currentSlide + dir >= 0) && (currentSlide + dir < $slides.children().length)) {

        // Sort single slide settings in direction
        var temp = singleSlides[currentSlide + dir];
        singleSlides[currentSlide + dir] = singleSlides[currentSlide];
        singleSlides[currentSlide] = temp;

        // Swap elements
        var prev = currentSlide + (dir < 0 ? 0 : dir);
        var next = currentSlide + (dir < 0 ? dir : 0);
        $slideContent.children().eq(prev)
          .insertBefore($slideContent.children().eq(next));

        // Must update internal current slide, since CPs is transition based
        currentSlide += dir;
      }
    };

    /**
     * Initialize a single slide
     *
     * @private
     * @param {jQuery} $wrapper Element the single slide will be attached to
     * @param {number} idx Index single slide will be inserted at
     * @returns {H5PEditor.CoursePresentation.BackgroundSelector} Background selector that was created
     */
    var initSingleSlide = function ($wrapper, idx) {
      var slideParams = params.slides[idx];

      var singleSlide = new H5PEditor.CoursePresentation.BackgroundSelector($slides.children().eq(idx), true);

      // Trigger fallback to global background when single slide is removed
      globalBackground.setBackgroundSlides($slides.children());
      singleSlide.on('turnedGlobal', function () {
        globalBackground.addBackground();
      });

      // Create background selector
      singleSlide.addBgSelector(singleSlideFields, slideParams, $wrapper, {
        isSingle: true,
        isVisible: (idx === 0),
        index: idx
      });

      singleSlides.splice(idx, 0, singleSlide);
      return singleSlide;
    };

    /**
     * Change to specified slide
     *
     * @private
     * @param {number} index Index of slide we will change to
     */
    var changeToSlide = function (index) {
      // Slide has not been created yet
      if (index >= singleSlides.length) {
        return;
      }

      // Show new slide if we changed slide
      $slideContent.children().removeClass('show');
      $slideContent.children().eq(index).addClass('show');

      // Show slide specific options
      var $changeToSlide = singleSlides[index].getSettings() ? $slideContent : $globalContent;
      changeSlideType($changeToSlide);

      // Show new slide bg selector
      currentSlide = index;
      updateColorPicker();
    };

    /**
     * Change slide type
     *
     * @private
     * @param {jQuery} $content The element that we will show
     */
    var changeSlideType = function ($content) {
      var $headerButton = $header.children().eq($content.index());
      if ($content.hasClass('show') && $headerButton.hasClass('active')) {
        return;
      }

      // Show new content
      $contentWrapper.children().removeClass('show');
      $content.addClass('show');

      // Set button as active
      $header.children().removeClass('active').attr('aria-pressed', false);
      $headerButton.addClass('active').attr('aria-pressed', true);

      updateColorPicker();
    };

    /**
     * Create slide selector
     *
     * @private
     * @param {string} option Label of slide selector
     * @param {boolean} isVisible Initial visibility of slide selector
     * @returns {jQuery} Slide selector that was created
     */
    var createSlideSelector = function (option, isVisible) {
      // First slide selector will be active
      var first = isVisible ? ' show' : '';
      var active = isVisible ? ' active' : '';

      // Content element
      var $content = $('<div>', {
        class: 'h5p-slide-selector-content' + first
      }).appendTo($contentWrapper);

      // Option for showing content
      var $slideSelectorOption = $('<a>', {
        'class': 'h5p-slide-selector-option' + active,
        href: 'javascript:void(0)',
        html: option,
        on: {
          click: function () {
            changeSlideType($content);
          },
          keypress: function (event) {
            if (event.which === 32) { // Space
              changeSlideType($content);
              return false;
            }

          }
        },
        appendTo: $header
      });

      if (isVisible) {
        $slideSelectorOption.attr('aria-pressed', true);
      }

      return $content;
    };

    /**
     * Update color picker in current slide
     *
     * @private
     */
    var updateColorPicker = function () {
      if (isSingleSlide()) {
        singleSlides[currentSlide].updateColorPicker();
      }
      else {
        globalBackground.updateColorPicker();
      }
    };

    /**
     * Determine if selected slide is a single slide
     *
     * @private
     * @returns {boolean} True if currently selected slide is a single slide
     */
    var isSingleSlide = function () {
      return $slideContent.hasClass('show');
    };

    /**
     * Append slide selector to wrapper
     *
     * @param {jQuery} $wrapper Wrapper we attach to
     * @returns {H5PEditor.CoursePresentation.SlideSelector}
     */
    self.appendTo = function ($wrapper) {
      self.$wrapper = $wrapper;
      initBgSelectors();
      initSlideOperationsListeners();
      $popup.appendTo($wrapper);

      return self;
    };

    /**
     * Open popup
     * @returns {H5PEditor.CoursePresentation.SlideSelector}
     */
    self.open = function () {
      if (self.$wrapper) {
        self.$wrapper.removeClass('hidden');
        isOpen = true;
      }

      return self;
    };

    /**
     * Close popup
     * @returns {H5PEditor.CoursePresentation.SlideSelector}
     */
    self.close = function () {
      if (self.$wrapper) {
        self.$wrapper.addClass('hidden');
        isOpen = false;
      }

      return self;
    };

    /**
     * Toggle popup state
     * @returns {H5PEditor.CoursePresentation.SlideSelector}
     */
    self.toggleOpen = function () {
      if (self.$wrapper) {
        if (isOpen) {
          self.close();
        }
        else {
          self.open();
        }

        updateColorPicker();
      }

      return self;
    };

    /**
     * Communicate when we are ready
     *
     * @returns {boolean} True if ready
     */
    self.ready = function () {
      return true; // Always ready
    };

    /**
     * Checks validity of user input
     *
     * @returns {boolean} True if valid
     */
    self.validate = function () {
      var valid = true;
      valid &= globalBackground.validate();

      singleSlides.forEach(function (singleSlide) {
        valid &= singleSlide.validate();
      });

      return valid;
    };
  }

  // Inheritance
  SlideSelector.prototype = Object.create(EventDispatcher.prototype);
  SlideSelector.prototype.constructor = SlideSelector;

  return SlideSelector;
})(H5P.jQuery, H5P.EventDispatcher);
