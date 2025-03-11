/*global H5P,ns*/
var H5PEditor = H5PEditor || {};

/**
 * Create a field for the form.
 *
 * @param {mixed} parent
 * @param {Object} field
 * @param {mixed} params
 * @param {function} setValue
 * @returns {H5PEditor.Text}
 */
H5PEditor.CoursePresentation = function (parent, field, params, setValue) {
  var that = this;
  H5P.DragNBar.FormManager.call(this, parent, {
    doneButtonLabel: H5PEditor.t('H5PEditor.CoursePresentation', 'done'),
    deleteButtonLabel: H5PEditor.t('H5PEditor.CoursePresentation', 'remove'),
    expandBreadcrumbButtonLabel: H5PEditor.t('H5PEditor.CoursePresentation', 'expandBreadcrumbButtonLabel'),
    collapseBreadcrumbButtonLabel: H5PEditor.t('H5PEditor.CoursePresentation', 'collapseBreadcrumbButtonLabel')
  }, 'coursepresentation');

  if (params === undefined) {
    params = {
      slides: [{
        elements: [],
        keywords: []
      }]
    };

    setValue(field, params);
  }

  this.parent = parent;
  this.field = field;
  this.params = params;
  // Elements holds a mix of forms and params, not element instances
  this.elements = [];
  this.slideRatio = 1.9753;

  this.passReadies = true;
  parent.ready(function () {
    that.passReadies = false;

    // Active surface mode
    var activeSurfaceCheckbox = H5PEditor.findField('override/activeSurface', parent);
    activeSurfaceCheckbox.on('checked', function () {
      // Make note of current height
      var oldHeight = parseFloat(window.getComputedStyle(that.cp.$current[0]).height);

      // Enable adjustments
      that.cp.$container.addClass('h5p-active-surface');
      that.cp.$wrapper.addClass('h5p-course-presentation-active-surface');

      // Remove navigation
      that.cp.$progressbar.remove();

      // Find change in %
      var newHeight = parseFloat(window.getComputedStyle(that.cp.$current[0]).height);
      var change = (newHeight - oldHeight) / newHeight;

      // Account for the progress bar that was removed
      that.slideRatio = H5PEditor.CoursePresentation.RATIO_SURFACE;

      // Update elements
      that.updateElementSizes(1 - change);
    });
  });

  if (H5PEditor.InteractiveVideo !== undefined) {
    // Disable IV's guided tour within CP
    H5PEditor.InteractiveVideo.disableGuidedTour();
  }

  // Update paste button
  H5P.externalDispatcher.on('datainclipboard', function (event) {
    if (!that.libraries) {
      return;
    }
    var canPaste = !event.data.reset;
    if (canPaste) {
      // Check if content type is supported here
      canPaste = that.canPaste(H5P.getClipboard());
    }
    that.dnb.setCanPaste(canPaste);
  });
};

H5PEditor.CoursePresentation.prototype = Object.create(H5P.DragNBar.FormManager.prototype);
H5PEditor.CoursePresentation.prototype.constructor = H5PEditor.CoursePresentation;

/**
 * Must be changed if the semantics for the elements changes.
 * @type {string}
 */
H5PEditor.CoursePresentation.clipboardKey = 'H5PEditor.CoursePresentation';

/**
 * Will change the size of all elements using the given ratio.
 *
 * @param {number} heightRatio
 */
H5PEditor.CoursePresentation.prototype.updateElementSizes = function (heightRatio) {
  var $slides = this.cp.$slidesWrapper.children();

  // Go through all slides
  for (var i = 0; i < this.params.slides.length; i++) {
    var slide = this.params.slides[i];
    var $slideElements = $slides.eq(i).find('.h5p-element');

    for (var j = 0; j < slide.elements.length; j++) {
      var element = slide.elements[j];

      // Update params
      element.height *= heightRatio;
      element.y *= heightRatio;

      // Update visuals if possible
      $slideElements.eq(j).css({
        height: element.height + '%',
        top: element.y + '%'
      });
    }
  }
};

/**
 * Add an element to the current slide and params.
 *
 * @param {string|object} library Content type or parameters
 * @param {object} [options] Override the default options
 * @returns {object}
 */
H5PEditor.CoursePresentation.prototype.addElement = function (library, options) {
  options = options || {};
  var elementParams;
  if (!(library instanceof String || typeof library === 'string')) {
    elementParams = library;
  }

  if (!elementParams) {
    // Create default start parameters
    elementParams = {
      x: 30,
      y: 30,
      width: 40,
      height: 40
    };

    if (library === 'GoToSlide') {
      elementParams.goToSlide = 1;
    }
    else {
      elementParams.action = (options.action ? options.action : {
        library: library,
        params: {}
      });
      elementParams.action.subContentId = H5P.createUUID();

      var libraryName = library.split(' ')[0];
      switch (libraryName) {
        case 'H5P.Audio':
          elementParams.width = 2.577632696;
          elementParams.height = 5.091753604;
          elementParams.action.params.fitToWrapper = true;
          break;

        case 'H5P.DragQuestion':
          elementParams.width = 50;
          elementParams.height = 50;
          break;

        case 'H5P.Video':
          elementParams.width = 50;
          elementParams.height = 50.5553;
          break;

        case 'H5P.InteractiveVideo':
          elementParams.width = 50;
          elementParams.height = 64.5536;
          break;

        case 'H5P.AudioRecorder':
          elementParams.y = 11;
          elementParams.width = 41.89;
          elementParams.height = 78;
          elementParams.backgroundOpacity = 100;
          break;

        case 'H5P.MultiMediaChoice':
          elementParams.action.params.behaviour = { aspectRatio: '16to9' }
          break;
      }
    }

    if (options.width && options.height && !options.displayAsButton) {
      // Use specified size
      elementParams.width = options.width;
      elementParams.height = options.height * this.slideRatio;
    }
    if (options.displayAsButton) {
      elementParams.displayAsButton = true;
    }
  }
  if (options.pasted) {
    elementParams.pasted = true;
  }

  var slideIndex = this.cp.$current.index();
  var slideParams = this.params.slides[slideIndex];

  if (slideParams.elements === undefined) {
    // No previous elements
    slideParams.elements = [elementParams];
  }
  else {
    var containerStyle = window.getComputedStyle(this.dnb.$container[0]);
    var containerWidth = parseFloat(containerStyle.width);
    var containerHeight = parseFloat(containerStyle.height);

    // Make sure we don't overlap another element
    var pToPx = containerWidth / 100;
    var pos = {
      x: elementParams.x * pToPx,
      y: (elementParams.y * pToPx) / this.slideRatio
    };
    this.dnb.avoidOverlapping(pos, {
      width: (elementParams.width / 100) * containerWidth,
      height: (elementParams.height / 100) * containerHeight,
    });
    elementParams.x = pos.x / pToPx;
    elementParams.y = (pos.y / pToPx) * this.slideRatio;

    // Add as last element
    slideParams.elements.push(elementParams);
  }

  this.cp.$boxWrapper.add(this.cp.$boxWrapper.find('.h5p-presentation-wrapper:first')).css('overflow', 'visible');

  const element = this.cp.children[slideIndex].addChild(elementParams);
  return this.cp.attachElement(elementParams, element.instance, this.cp.$current, slideIndex);
};

/**
 * Append field to wrapper.
 *
 * @param {type} $wrapper
 * @returns {undefined}
 */
H5PEditor.CoursePresentation.prototype.appendTo = function ($wrapper) {
  var that = this;

  this.$item = H5PEditor.$(this.createHtml()).appendTo($wrapper);
  this.$editor = this.$item.children('.editor');
  this.$errors = this.$item.children('.h5p-errors');

  // Create new presentation.
  var presentationParams = (this.parent instanceof ns.Library ? this.parent.params.params : this.parent.params);
  if (presentationParams && presentationParams.override && presentationParams.override.activeSurface === true) {
    this.slideRatio = H5PEditor.CoursePresentation.RATIO_SURFACE;
  }
  this.cp = new H5P.CoursePresentation(presentationParams, H5PEditor.contentId, {cpEditor: this});
  this.cp.attach(this.$editor);
  if (this.cp.$wrapper.is(':visible')) {
    this.cp.trigger('resize');
  }
  var $settingsWrapper = H5PEditor.$('<div>', {
    'class': 'h5p-settings-wrapper hidden',
    appendTo: that.cp.$boxWrapper.children('.h5p-presentation-wrapper')
  });


  // Add drag and drop menu bar.
  that.initializeDNB();

  // Find BG selector fields and init slide selector
  var globalBackgroundField = H5PEditor.CoursePresentation.findField('globalBackgroundSelector', this.field.fields);
  var slideFields = H5PEditor.CoursePresentation.findField('slides', this.field.fields);
  this.backgroundSelector = new H5PEditor.CoursePresentation.SlideSelector(that, that.cp.$slidesWrapper, globalBackgroundField, slideFields, that.params)
    .appendTo($settingsWrapper);

  // Add and bind slide controls.
  var slideControls = {
    $add: H5PEditor.$('<a href="#" aria-label="' + H5PEditor.t('H5PEditor.CoursePresentation', 'newSlide') + '" class="h5p-slidecontrols-button h5p-slidecontrols-button-add"></a>'),
    $clone: H5PEditor.$('<a href="#" aria-label="' + H5PEditor.t('H5PEditor.CoursePresentation', 'cloneSlide') + '" class="h5p-clone-slide h5p-slidecontrols-button h5p-slidecontrols-button-clone"></a>'),
    $background: H5PEditor.$('<a href="#" aria-label="' + H5PEditor.t('H5PEditor.CoursePresentation', 'backgroundSlide') + '" class="h5p-slidecontrols-button h5p-slidecontrols-button-background"></a>'),
    $sortLeft: H5PEditor.$('<a href="#" aria-label="' + H5PEditor.t('H5PEditor.CoursePresentation', 'sortSlide', {':dir': 'left'}) + '" class="h5p-slidecontrols-button h5p-slidecontrols-button-sort-left"></a>'),
    $sortRight: H5PEditor.$('<a href="#" aria-label="' + H5PEditor.t('H5PEditor.CoursePresentation', 'sortSlide', {':dir': 'right'}) + '" class="h5p-slidecontrols-button h5p-slidecontrols-button-sort-right"></a>'),
    $delete: H5PEditor.$('<a href="#" aria-label="' + H5PEditor.t('H5PEditor.CoursePresentation', 'removeSlide') + '" class="h5p-slidecontrols-button h5p-slidecontrols-button-delete"></a>')
  };
  this.slideControls = slideControls;

  H5PEditor.$('<div class="h5p-slidecontrols">').append([
    slideControls.$add,
    slideControls.$clone,
    slideControls.$background,
    slideControls.$sortLeft,
    slideControls.$sortRight,
    slideControls.$delete
  ]).appendTo(this.cp.$wrapper)
    .children('a:first')
    .click(function () {
      that.addSlide();
      that.updateSlidesSidebar();
      return false;
    })
    .next()
    .click(function () {
      var newSlide = H5P.cloneObject(that.params.slides[that.cp.$current.index()], true);

      // Set new subContentId for cloned contents
      that.resetSubContentId(newSlide.elements);

      newSlide.keywords = [];
      that.addSlide(newSlide);
      H5P.ContinuousText.Engine.run(that);
      that.updateSlidesSidebar();
      return false;
    })
    .next()
    .click(function () {
      that.backgroundSelector.toggleOpen();
      H5PEditor.$(this).toggleClass('active');
      return false;
    })
    .next()
    .click(function () {
      that.sortSlide(that.cp.$current.prev(), -1);
      return false;
    })
    .next()
    .click(function () {
      that.sortSlide(that.cp.$current.next(), 1);
      return false;
    })
    .next()
    .click(function () {
      that.removeSlide();
      return false;
    });

  if (this.cp.activeSurface) {
    // Enable adjustments
    this.cp.$container.addClass('h5p-active-surface');

    // Remove navigation
    this.cp.$progressbar.remove();
  }

  // Relay window resize to CP view
  H5P.$window.on('resize', function () {
    that.cp.trigger('resize');
  });

  this.updateSlidesSidebar();
};

/**
 * Recursively reset all subContentIds.
 *
 * @param {object} params Parameters to parse.
 */
H5PEditor.CoursePresentation.prototype.resetSubContentId = function (params) {
  const that = this;

  if (Array.isArray(params)) {
    params.forEach(function (param) {
      that.resetSubContentId(param);
    });
  }
  else if (typeof params === 'object') {
    if (params.library && params.subContentId) {
      params.subContentId = H5P.createUUID();
    }

    for (param in params) {
      that.resetSubContentId(params[param]);
    }
  }
};

/**
 * Add Drag and Drop button group.
 *
 * @param {H5P.Library} library Library for which a button will be added.
 * @param {object} options Options.
 */
H5PEditor.CoursePresentation.prototype.addDNBButton = function (library, options) {
  var that = this;
  options = options || {};
  var id = library.name.split('.')[1].toLowerCase();

  return {
    id: options.id || id,
    title: (options.title === undefined) ? library.title : options.title,
    createElement: function () {
      // Mind the functions's context
      return that.addElement(library.uberName, H5P.jQuery.extend(true, {}, options));
    }
  };
};

/**
 * Add Drag and Drop button group.
 *
 * @param {H5P.Library} library Library for which a button will be added.
 * @param {object} groupData Data for the group.
 * @return {object} Button group.
 */
H5PEditor.CoursePresentation.prototype.addDNBButtonGroup = function (library, groupData) {
  var that = this;
  var id = library.name.split('.')[1].toLowerCase();

  const buttonGroup = {
    id: id,
    title: groupData.dropdown.title || library.title,
    titleGroup: groupData.dropdown.titleGroup,
    type: 'group',
    buttons: []
  };

  // Add buttons to button group
  groupData.buttons.forEach(function (button) {
    const options = {
      id: button.id,
      title: button.title,
      width: button.width,
      height: button.height,
      action: {
        library: library.uberName,
        params: button.params || {}
      }
    };

    buttonGroup.buttons.push(that.addDNBButton(library, options));
  });

  return buttonGroup;
};

H5PEditor.CoursePresentation.prototype.setContainerEm = function (containerEm) {
  this.containerEm = containerEm;

  if (this.dnb !== undefined && this.dnb.dnr !== undefined) {
    this.dnb.dnr.setContainerEm(this.containerEm);
  }
};

/**
 * Initialize the drag and drop menu bar.
 *
 * @returns {undefined}
 */
H5PEditor.CoursePresentation.prototype.initializeDNB = function () {
  var that = this;

  this.$bar = H5PEditor.$('<div class="h5p-dragnbar">' + H5PEditor.t('H5PEditor.CoursePresentation', 'loading') + '</div>').insertBefore(this.cp.$boxWrapper);
  var slides = H5PEditor.CoursePresentation.findField('slides', this.field.fields);
  var elementFields = H5PEditor.CoursePresentation.findField('elements', slides.field.fields).field.fields;
  var action = H5PEditor.CoursePresentation.findField('action', elementFields);

  const shapeButtonBase = {
    title: '',
    width: 14.09, // 100 units
    height: 14.09
  };

  const shapeButtonBase1D = {
    params: {
      line: {
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: '#000'
      }
    }
  };

  const shapeButtonBase2D = {
    params: {
      shape: {
        fillColor: '#fff',
        borderWidth: 0,
        borderStyle: 'solid',
        borderColor: '#000',
      }
    }
  };

  // Ideally, this would not be built here
  const dropdownMenus = [];
  dropdownMenus['shape'] = {
    dropdown: {
      id: 'shape'
    },
    buttons: [
      H5P.jQuery.extend(true, {}, shapeButtonBase, shapeButtonBase2D, {
        id: 'shape-rectangle',
        params: {
          type: 'rectangle',
          shape: {
            borderRadius: 0
          }
        }
      }),
      H5P.jQuery.extend(true, {}, shapeButtonBase, shapeButtonBase2D, {
        id: 'shape-circle',
        params: {
          type: 'circle'
        }
      }),
      H5P.jQuery.extend(true, {}, shapeButtonBase, shapeButtonBase1D, {
        id: 'shape-horizontal-line',
        params: {
          type: 'horizontal-line'
        }
      }),
      H5P.jQuery.extend(true, {}, shapeButtonBase, shapeButtonBase1D, {
        id: 'shape-vertical-line',
        params: {
          type: 'vertical-line'
        }
      })
    ]
  };

  H5PEditor.LibraryListCache.getLibraries(action.options, function (libraries) {
    that.libraries = libraries;
    var buttons = [];
    for (var i = 0; i < libraries.length; i++) {
      if (libraries[i].restricted !== true) {
        // Insert button or buttongroup
        const libraryId = libraries[i].name.split('.')[1].toLowerCase();
        if (dropdownMenus[libraryId] === undefined) {
          buttons.push(that.addDNBButton(libraries[i]));
        }
        else {
          buttons.push(that.addDNBButtonGroup(libraries[i], dropdownMenus[libraryId]));
        }
      }
    }

    // Add go to slide button
    var goToSlide = H5PEditor.CoursePresentation.findField('goToSlide', elementFields);
    if (goToSlide) {
      buttons.splice(5, 0, {
        id: 'gotoslide',
        title: H5PEditor.t('H5PEditor.CoursePresentation', 'goToSlide'),
        createElement: function () {
          return that.addElement('GoToSlide');
        }
      });
    }

    that.dnb = new H5P.DragNBar(buttons, that.cp.$current, that.$editor, {$blurHandlers: that.cp.$boxWrapper, libraries: libraries});

    that.$dnbContainer = that.cp.$current;
    that.dnb.dnr.snap = 10;
    that.dnb.dnr.setContainerEm(that.containerEm);

    // Register all attached elements with dnb
    that.elements.forEach(function (slide, slideIndex) {
      slide.forEach(function (element, elementIndex) {
        var elementParams = that.params.slides[slideIndex].elements[elementIndex];
        that.addToDragNBar(element, elementParams);
      });
    });

    var reflowLoop;
    var reflowInterval = 250;
    var reflow = function () {
      H5P.ContinuousText.Engine.run(that);
      reflowLoop = setTimeout(reflow, reflowInterval);
    };

    // Resizing listener
    that.dnb.dnr.on('startResizing', function () {
      var elementParams = that.params.slides[that.cp.$current.index()].elements[that.dnb.$element.index()];

      // Check for continuous text
      if (elementParams.action && elementParams.action.library.split(' ')[0] === 'H5P.ContinuousText') {
        reflowLoop = setTimeout(reflow, reflowInterval);
      }
    });

    // Resizing has stopped
    that.dnb.dnr.on('stoppedResizing', function () {
      var elementParams = that.params.slides[that.cp.$current.index()].elements[that.dnb.$element.index()];

      // Store new element position
      elementParams.width = that.dnb.$element.width() / (that.cp.$current.innerWidth() / 100);
      elementParams.height = that.dnb.$element.height() / (that.cp.$current.innerHeight() / 100);
      elementParams.y = ((parseFloat(that.dnb.$element.css('top')) / that.cp.$current.innerHeight()) * 100);
      elementParams.x = ((parseFloat(that.dnb.$element.css('left')) / that.cp.$current.innerWidth()) * 100);

      // Stop reflow loop and run one last reflow
      if (elementParams.action && elementParams.action.library.split(' ')[0] === 'H5P.ContinuousText') {
        clearTimeout(reflowLoop);
        H5P.ContinuousText.Engine.run(that);
      }

      // Trigger element resize
      var elementInstance = that.cp.elementInstances[that.cp.$current.index()][that.dnb.$element.index()];
      H5P.trigger(elementInstance, 'resize');
    });

    // Update params when the element is dropped.
    that.dnb.stopMovingCallback = function (x, y) {
      var params = that.params.slides[that.cp.$current.index()].elements[that.dnb.$element.index()];
      params.x = x;
      params.y = y;
    };

    // Update params when the element is moved instead, to prevent timing issues.
    that.dnb.dnd.moveCallback = function (x, y) {
      var params = that.params.slides[that.cp.$current.index()].elements[that.dnb.$element.index()];
      params.x = x;
      params.y = y;

      that.dnb.updateCoordinates();
    };

    // Edit element when it is dropped.
    that.dnb.dnd.releaseCallback = function () {
      var params = that.params.slides[that.cp.$current.index()].elements[that.dnb.$element.index()];
      var element = that.elements[that.cp.$current.index()][that.dnb.$element.index()];

      if (that.dnb.newElement) {
        that.cp.$boxWrapper.add(that.cp.$boxWrapper.find('.h5p-presentation-wrapper:first')).css('overflow', '');

        if (params.action !== undefined && H5P.libraryFromString(params.action.library).machineName === 'H5P.ContinuousText') {
          H5P.ContinuousText.Engine.run(that);
          if (!that.params.ct) {
            // No CT text but there could be elements
            var CTs = that.getCTs(false, true);
            if (CTs.length === 1) {
              // First element, open form
              that.showElementForm(element, that.dnb.$element, params);
            }
          }
        }
        else {
          that.showElementForm(element, that.dnb.$element, params);
        }
      }
    };

    /**
     * @private
     * @param {string} lib uber name
     * @returns {boolean}
     */
    that.supported = function (lib) {
      for (var i = 0; i < libraries.length; i++) {
        if (libraries[i].restricted !== true && libraries[i].uberName === lib) {
          return true; // Library is supported and allowed
        }
      }

      return false;
    };

    that.dnb.on('paste', function (event) {
      var pasted = event.data;
      var options = {
        width: pasted.width,
        height: pasted.height,
        pasted: true
      };

      if (pasted.from === H5PEditor.CoursePresentation.clipboardKey) {
        // Pasted content comes from the same version of CP

        if (!pasted.generic) {
          // Non generic part, must be content like gotoslide or similar
          that.dnb.focus(that.addElement(pasted.specific, options));
        }
        else if (that.supported(pasted.generic.library)) {
          // Special case for ETA - can't copy the index, then export won't include
          // the original, since they will have the same index.
          if (pasted.generic.library.split(' ')[0] === 'H5P.ExportableTextArea') {
            delete pasted.generic.params.index;
          }
          // Has generic part and the generic libray is supported
          that.dnb.focus(that.addElement(pasted.specific, options));
        }
        else {
          that.showConfirmationDialog({
            headerText: H5PEditor.t('core', 'pasteError'),
            dialogText: H5PEditor.t('H5P.DragNBar', 'unableToPaste'),
            confirmText: H5PEditor.t('H5PEditor.CoursePresentation', 'ok')
          });
        }
      }
      else if (pasted.generic) {
        if (that.supported(pasted.generic.library)) {
          // Supported library from another content type)

          if (pasted.specific.displayType === 'button') {
            // Make sure buttons from IV  still are buttons.
            options.displayAsButton = true;
          }
          options.action = pasted.generic;
          that.dnb.focus(that.addElement(pasted.generic.library, options));
        }
        else {
          that.showConfirmationDialog({
            headerText: H5PEditor.t('core', 'pasteError'),
            dialogText: H5PEditor.t('H5P.DragNBar', 'unableToPaste'),
            confirmText: H5PEditor.t('H5PEditor.CoursePresentation', 'ok')
          });
        }
      }
    });

    that.dnb.attach(that.$bar);

    // Set paste button
    that.dnb.setCanPaste(that.canPaste(H5P.getClipboard()));

    // Bind keyword interactions.
    that.initKeywordInteractions();

    // Trigger event
    that.trigger('librariesReady');
  });
};

/**
 * Check if the clipboard can be pasted into CP.
 *
 * @param {Object} [clipboard] Clipboard data.
 * @return {boolean} True, if clipboard can be pasted.
 */
H5PEditor.CoursePresentation.prototype.canPaste = function (clipboard) {
  if (clipboard) {
    if (clipboard.from === H5PEditor.CoursePresentation.clipboardKey &&
        (!clipboard.generic || this.supported(clipboard.generic.library))) {
      // Content comes from the same version of CP
      // Non generic part = must be content like gotoslide or similar
      return true;
    }
    else if (clipboard.generic && this.supported(clipboard.generic.library)) {
      // Supported library from another content type
      return true;
    }
  }

  return false;
};

/**
 * Create HTML for the field.
 */
H5PEditor.CoursePresentation.prototype.createHtml = function () {
  return H5PEditor.createFieldMarkup(this.field, '<div class="editor"></div>');
};

/**
 * Validate the current field.
 */
H5PEditor.CoursePresentation.prototype.validate = function () {
  // Validate all form elements
  var valid = true;
  var firstCT = true;
  for (var i = 0; i < this.elements.length; i++) {
    if (!this.elements[i]) {
      continue;
    }
    for (var j = 0; j < this.elements[i].length; j++) {
      // We must make sure form values are stored if the dialog was never closed
      var elementParams = this.params.slides[i].elements[j];
      var isCT = (elementParams.action !== undefined && elementParams.action.library.split(' ')[0] === 'H5P.ContinuousText');
      if (isCT && !firstCT) {
        continue; // Only need to process the first CT
      }

      // Validate element form
      for (var k = 0; k < this.elements[i][j].children.length; k++) {
        if (this.elements[i][j].children[k].validate() === false && valid) {
          valid = false;
        }
      }

      if (isCT) {
        if (!this.params.ct) {
          // Store complete text in CT param
          this.params.ct = elementParams.action.params.text;
        }
        firstCT = false;
      }
    }
  }
  valid &= this.backgroundSelector.validate();

  // Distribute CT text across elements
  H5P.ContinuousText.Engine.run(this);
  this.trigger('validate');
  return valid;
};

/**
 * Remove this item.
 */
H5PEditor.CoursePresentation.prototype.remove = function () {
  this.trigger('remove');
  if (this.dnb !== undefined) {
    this.dnb.remove();
  }
  this.$item.remove();

  this.elements.forEach(function (slides) {
    slides.forEach(function (interaction) {
      H5PEditor.removeChildren(interaction.children);
    });
  });
};

/**
 * Initialize keyword interactions.
 *
 * @returns {undefined} Nothing
 */
H5PEditor.CoursePresentation.prototype.initKeywordInteractions = function () {
  var that = this;
  // Add our own menu to the drag and drop menu bar.
  that.$keywordsDNB = H5PEditor.$(
    '<ul class="h5p-dragnbar-ul h5p-dragnbar-left">' +
      '<li class="h5p-slides-menu">' +
        '<div title="' + H5PEditor.t('H5PEditor.CoursePresentation', 'slides') + '" class="h5p-dragnbar-keywords" role="button" tabindex="0">' +
          '<span>' + H5PEditor.t('H5PEditor.CoursePresentation', 'slides') + '</span>' +
        '</div>' +
        '<div class="h5p-keywords-dropdown">' +
          '<label class="h5p-keywords-enable">' +
            '<input type="checkbox"/>' +
            H5PEditor.t('H5PEditor.CoursePresentation', 'showTitles') +
          '</label>' +
          '<label class="h5p-keywords-always"><input type="checkbox"/>' + H5PEditor.t('H5PEditor.CoursePresentation', 'alwaysShow') + '</label>' +
          '<label class="h5p-keywords-hide"><input type="checkbox"/>' + H5PEditor.t('H5PEditor.CoursePresentation', 'autoHide') + '</label>' +
          '<label class="h5p-keywords-opacity"><input type="text"/> % ' + H5PEditor.t('H5PEditor.CoursePresentation', 'opacity') + '</label>' +
          '<div class="h5peditor-button h5peditor-button-textual importance-low" role="button" tabindex="0" aria-disabled="false">' +
            H5PEditor.t('H5PEditor.CoursePresentation', 'ok') +
          '</div>' +
        '</div>' +
      '</li>' +
    '</ul>').prependTo(this.$bar);

  that.initKeywordMenu();

  // Make keywords drop down menu come alive
  var $slidesMenu = this.$bar.find('.h5p-dragnbar-keywords');
  var $dropdown = this.$bar.find('.h5p-keywords-dropdown');
  var preventClose = false;
  var closeDropdown = function () {
    if (preventClose) {
      preventClose = false;
    }
    else {
      $slidesMenu.removeClass('h5p-open');
      $dropdown.removeClass('h5p-open');
      that.cp.$container.off('click', closeDropdown);
    }
  };

  $dropdown.find('.h5peditor-button').click(closeDropdown);

  // Make sure keywords settings and button is hidden on load if disabled
  if (!this.params.keywordListEnabled) {
    $dropdown.children().first().siblings().hide().last().show();
    that.cp.$keywordsButton.hide();
  }

  // Open dropdown when clicking the dropdown button
  $slidesMenu.click(function () {
    if (!$dropdown.hasClass('h5p-open')) {
      that.cp.$container.on('click', closeDropdown);
      $slidesMenu.addClass('h5p-open');
      $dropdown.addClass('h5p-open');
      preventClose = true;
    }
  });

  // Prevent closing when clicking on the dropdown dialog it self
  $dropdown.click(function () {
    preventClose = true;
  });

  // Enable keywords list
  var $enableKeywords = this.$bar.find('.h5p-keywords-enable input').change(function () {
    that.params.keywordListEnabled = $enableKeywords.is(':checked');
    if (that.params.keywordListEnabled) {
      if (that.params.keywordListAlwaysShow) {
        that.cp.$keywordsWrapper.show().add(that.cp.$keywordsButton).addClass('h5p-open');
        that.cp.$keywordsButton.hide();
      }
      else {
        that.cp.$keywordsWrapper.add(that.cp.$keywordsButton).show();
      }
      ns.$(this).parent().siblings().show();
    }
    else {
      that.cp.$keywordsWrapper.add(that.cp.$keywordsButton).hide();
      ns.$(this).parent().siblings().hide().last().show();
    }
  });

  // Always show keywords list
  var $alwaysKeywords = this.$bar.find('.h5p-keywords-always input').change(function () {
    var checked = $alwaysKeywords.is(':checked');

    that.params.keywordListAlwaysShow = checked;

    if (checked) {
      // Disable auto hide
      that.params.keywordListAutoHide = false;
      that.$bar.find('.h5p-keywords-hide input')
        .attr('checked', false)
        .attr("disabled", true)
        .parent().addClass('h5p-disabled');
    }
    else {
      that.$bar.find('.h5p-keywords-hide input')
        .attr("disabled", false)
        .parent().removeClass('h5p-disabled');
    }

    if (!that.params.keywordListEnabled) {
      that.cp.hideKeywords();
      that.cp.$keywordsButton.hide();
      return;
    }
    else if (!that.params.keywordListAlwaysShow) {
      that.cp.$keywordsButton.show();
    }
    if (that.params.keywordListAlwaysShow) {
      that.cp.$keywordsButton.hide();
      that.cp.showKeywords();
    }
    else if (that.params.keywordListEnabled) {
      that.cp.$keywordsButton.show();
      that.cp.showKeywords();
    }
  });

  // Auto hide keywords list
  var $hideKeywords = this.$bar.find('.h5p-keywords-hide input').change(function () {
    that.params.keywordListAutoHide = $hideKeywords.is(':checked');
  });

  // Opacity for keywords list
  var $opacityKeywords = this.$bar.find('.h5p-keywords-opacity input').change(function () {
    var opacity = parseInt($opacityKeywords.val());
    if (isNaN(opacity)) {
      opacity = 90;
    }
    if (opacity > 100) {
      opacity = 100;
    }
    if (opacity < 0) {
      opacity = 0;
    }
    that.params.keywordListOpacity = opacity;
    that.cp.setKeywordsOpacity(opacity);
  });

  /**
   * Help set default values if undefined.
   *
   * @private
   * @param {String} option
   * @param {*} defaultValue
   */
  var checkDefault = function (option, defaultValue) {
    if (that.params[option] === undefined) {
      that.params[option] = defaultValue;
    }
  };

  // Set defaults if undefined
  checkDefault('keywordListEnabled', true);
  checkDefault('keywordListAlwaysShow', false);
  checkDefault('keywordListAutoHide', false);
  checkDefault('keywordListOpacity', 90);

  // Update HTML
  $enableKeywords.attr('checked', that.params.keywordListEnabled);
  $alwaysKeywords.attr('checked', that.params.keywordListAlwaysShow);
  $hideKeywords.attr('checked', that.params.keywordListAutoHide);
  $opacityKeywords.val(that.params.keywordListOpacity);
};

/**
 * Initiates the keyword menu
 */
H5PEditor.CoursePresentation.prototype.initKeywordMenu = function () {
  var that = this;
  // Keyword events
  var keywordClick = function (event) {
    // Convert keywords into text areas when clicking.
    if (that.editKeyword(H5PEditor.$(this)) !== false) {
      event.stopPropagation();
      H5PEditor.$(event.target).parent().addClass('h5p-editing');
    }
  };

  // Make existing keywords editable
  this.cp.$keywords.find('.h5p-keyword-title').click(keywordClick);
};


/**
 * Adds slide after current slide.
 *
 * @param {object} slideParams
 * @returns {undefined} Nothing
 */
H5PEditor.CoursePresentation.prototype.addSlide = function (slideParams) {
  var that = this;

  if (slideParams === undefined) {
    // Set new slide params
    slideParams = {
      elements: [],
      keywords: []
    };
  }

  var index = this.cp.$current.index() + 1;
  this.params.slides.splice(index, 0, slideParams);
  this.elements.splice(index, 0, []);
  this.cp.elementInstances.splice(index, 0, []);
  this.cp.elementsAttached.splice(index, 0, []);
  const slide = this.cp.addChild(slideParams, index);

  // Add slide with elements
  slide.getElement().insertAfter(this.cp.$current);
  that.trigger('addedSlide', index);
  slide.appendElements();

  this.cp.updateKeywordMenuFromSlides();
  this.initKeywordMenu();

  // Update progressbar
  this.updateNavigationLine(index);

  // Switch to the new slide.
  this.cp.nextSlide();
};

H5PEditor.CoursePresentation.prototype.updateNavigationLine = function (index) {
  var that = this;
  // Update slides with solutions.
  var hasSolutionArray = [];
  this.cp.slides.forEach(function (instanceArray, slideNumber) {
    var isTaskWithSolution = false;

    if (that.cp.elementInstances[slideNumber] !== undefined && that.cp.elementInstances[slideNumber].length) {
      that.cp.elementInstances[slideNumber].forEach(function (elementInstance) {
        if (that.cp.checkForSolutions(elementInstance)) {
          isTaskWithSolution = true;
        }
      });
    }

    if (isTaskWithSolution) {
      hasSolutionArray.push([[isTaskWithSolution]]);
    }
    else {
      hasSolutionArray.push([]);
    }
  });

  // Update progressbar and footer
  this.cp.navigationLine.initProgressbar(hasSolutionArray);
  this.cp.navigationLine.updateProgressBar(index);
  this.cp.navigationLine.updateFooter(index);
};

/**
 * Remove the current slide
 *
 * @returns {Boolean} Indicates success
 */
H5PEditor.CoursePresentation.prototype.removeSlide = function () {
  var index = this.cp.$current.index();
  var $remove = this.cp.$current.add(this.cp.$currentKeyword);
  var isRemovingDnbContainer = this.cp.$current.index() === this.$dnbContainer.index();

  const confirmationDialog = this.showConfirmationDialog({
    headerText: H5PEditor.t('H5PEditor.CoursePresentation', 'confirmDeleteSlide'),
    cancelText: H5PEditor.t('H5PEditor.CoursePresentation', 'cancel'),
    confirmText: H5PEditor.t('H5PEditor.CoursePresentation', 'ok')
  });

  confirmationDialog.on('canceled', () => {
    return;
  });

  confirmationDialog.on('confirmed', () => {
    // Remove elements from slide
    var slideKids = this.elements[index];
    if (slideKids !== undefined) {
      for (var i = 0; i < slideKids.length; i++) {
        this.removeElement(slideKids[i], slideKids[i].$wrapper, this.cp.elementInstances[index][i].libraryInfo && this.cp.elementInstances[index][i].libraryInfo.machineName === 'H5P.ContinuousText');
      }
    }
    this.elements.splice(index, 1);

    // Change slide
    var move = this.cp.previousSlide() ? -1 : (this.cp.nextSlide(true) ? 0 : undefined);

    // Replace existing DnB container used for calculating dimensions of elements
    if (isRemovingDnbContainer) {
      // Set new dnb container
      this.$dnbContainer = this.cp.$current;
      this.dnb.setContainer(this.$dnbContainer);
    }
    if (move === undefined) {
      return false; // No next or previous slide
    }

    // ExportableTextArea needs to know about the deletion:
    H5P.ExportableTextArea.CPInterface.onDeleteSlide(index);

    // Update presentation params.
    this.params.slides.splice(index, 1);

    // Update the list of element instances
    this.cp.elementInstances.splice(index, 1);
    this.cp.elementsAttached.splice(index, 1);

    this.cp.removeChild(index);

    this.cp.updateKeywordMenuFromSlides();
    this.initKeywordMenu();
    this.updateNavigationLine(index + move);

    // Remove visuals.
    $remove.remove();

    H5P.ContinuousText.Engine.run(this);

    this.trigger('removeSlide', index);
    this.updateSlidesSidebar();
  });
};

/**
 * Animate navigation line slide icons when the slides are sorted
 *
 * @param {number} direction 1 for next, -1 for prev.
 */
H5PEditor.CoursePresentation.prototype.animateNavigationLine = function (direction) {
  var that = this;

  var $selectedProgressPart = that.cp.$progressbar.find('.h5p-progressbar-part-selected');
  $selectedProgressPart.css('transform', 'translateX(' + (-100 * direction) + '%)');

  var $selectedNext = (direction == 1 ? $selectedProgressPart.prev() : $selectedProgressPart.next());
  $selectedNext.css('transform', 'translateX(' + (100 * direction) + '%)');

  setTimeout(function () { // Next tick triggers animation
    $selectedProgressPart.add($selectedNext).css('transform', '');
  }, 0);
};

/**
 * Update the slides sidebar
 */
H5PEditor.CoursePresentation.prototype.updateSlidesSidebar = function () {
  var self = this;
  var $keywords = this.cp.$keywords.children();

  // Update the sub titles
  $keywords.each(function (index) {

    var $keyword = H5PEditor.$(this);

    $keyword.find('.h5p-keyword-subtitle').html(self.cp.l10n.slide + ' ' + (index + 1));
    $keyword.find('.joubel-icon-edit').remove();

    var $editIcon = H5PEditor.$(
      '<a href="#" class="joubel-icon-edit h5p-hidden" title="' + H5PEditor.t('H5PEditor.CoursePresentation', 'edit') + '" tabindex="0">' +
        '<span class="h5p-icon-circle"></span>' +
        '<span class="h5p-icon-pencil"></span>' +
      '</a>'
    ).click(function () {
      // If clicked is not already active, do a double click
      if (!H5PEditor.$(this).parents('[role="menuitem"]').hasClass('h5p-current')) {
        H5PEditor.$(this).siblings('span').click().click();
      }
      else {
        H5PEditor.$(this).siblings('span').click();
      }
      $editIcon.siblings('textarea').select();
      return false;
    }).keydown(function (event) {
      if ([13,32].indexOf(event.which) !== -1) {
        H5PEditor.$(this).click();
        return false;
      }

      // Ignore arrow keys for now to avoid JS-error
      if (event.which >= 37 && event.which <= 40) {
        return false;
      }
    }).blur(function () {
      $editIcon.addClass('h5p-hidden');
    }).appendTo($keywords.eq(index));

    H5PEditor.$(this).focus(function () {
      $editIcon.removeClass('h5p-hidden');
    }).hover(function () {
      if (!H5PEditor.$(this).hasClass('h5p-editing')) {
        $editIcon.removeClass('h5p-hidden');
      }
    }).mouseleave(function () {
      $editIcon.addClass('h5p-hidden');
    }).blur(function (e) {
      if (e.relatedTarget && e.relatedTarget.className !== 'joubel-icon-edit' || !e.relatedTarget) {
        $editIcon.addClass('h5p-hidden');
      }
    });
  });
};

/**
 * Sort current slide in the given direction.
 *
 * @param {H5PEditor.$} $element The next/prev slide.
 * @param {int} direction 1 for next, -1 for prev.
 * @returns {Boolean} Indicates success.
 */
H5PEditor.CoursePresentation.prototype.sortSlide = function ($element, direction) {
  if (!$element.length) {
    return false;
  }

  var index = this.cp.$current.index();
  var keywordsEnabled = this.cp.$currentKeyword !== undefined;

  // Move slides and keywords.
  if (direction === -1) {
    this.cp.$current.insertBefore($element.removeClass('h5p-previous'));
    if (keywordsEnabled) {
      var $prev = this.cp.$currentKeyword.prev();
      this.cp.$currentKeyword.insertBefore($prev);
      this.swapIndexes(this.cp.$currentKeyword, $prev);
    }
  }
  else {
    this.cp.$current.insertAfter($element.addClass('h5p-previous'));
    if (keywordsEnabled) {
      var $next = this.cp.$currentKeyword.next();
      this.cp.$currentKeyword.insertAfter($next);
      this.swapIndexes(this.cp.$currentKeyword, $next);
    }
  }

  if (keywordsEnabled) {
    this.cp.keywordMenu.scrollToKeywords();
  }

  // Jump to sorted slide number
  var newIndex = index + direction;
  this.cp.jumpToSlide(newIndex);

  // Need to inform exportable text area about the change:
  H5P.ExportableTextArea.CPInterface.changeSlideIndex(direction > 0 ? index : index-1, direction > 0 ? index+1 : index);

  // Update params.
  this.swapCollectionIndex(this.params.slides, index, newIndex);
  this.swapCollectionIndex(this.elements, index, newIndex);
  this.swapCollectionIndex(this.cp.elementInstances, index, newIndex);
  this.swapCollectionIndex(this.cp.elementsAttached, index, newIndex);
  this.cp.moveChild(index, newIndex);

  this.updateNavigationLine(newIndex);
  H5P.ContinuousText.Engine.run(this);
  this.updateSlidesSidebar();

  this.animateNavigationLine(direction);
  this.trigger('sortSlide', direction);

  return true;
};

/**
 * Swap indexes in array, useful when sorting
 *
 * @param {Array} collection The collection we'll swap indexes in
 * @param {number} firstIndex First index that will be swapped
 * @param {number} secondIndex Second index that will be swapped
 */
H5PEditor.CoursePresentation.prototype.swapCollectionIndex = function (collection, firstIndex, secondIndex) {
  var temp = collection[firstIndex];
  collection[firstIndex] = collection[secondIndex];
  collection[secondIndex] = temp;
};

/**
 * Swaps the [data-index] values of two elements
 *
 * @param {jQuery} $current
 * @param {jQuery} $other
 */
H5PEditor.CoursePresentation.prototype.swapIndexes = function ($current, $other) {
  var currentIndex = $current.attr('data-index');
  var otherIndex = $other.attr('data-index');
  $current.attr('data-index', otherIndex);
  $other.attr('data-index', currentIndex);
};

/**
 * Edit keyword.
 *
 * @param {H5PEditor.$} $span Keyword wrapper.
 * @returns {unresolved} Nothing
 */
H5PEditor.CoursePresentation.prototype.editKeyword = function ($span) {
  var that = this;

  var $li = $span.parent();
  if (!$li.hasClass('h5p-current')) {
    return false; // Can only edit title for the current slide
  }

  var oldTitle = $span.text(); // Used for reset / cancel
  var slideIndex = that.cp.$current.index();
  if (!that.params.slides[slideIndex].keywords || !that.params.slides[slideIndex].keywords.length) {
    oldTitle = ''; // Prevent editing 'No title' string
  }

  var $delete = H5PEditor.$(
    '<a href="#" class="joubel-icon-cancel" title="' + H5PEditor.t('H5PEditor.CoursePresentation', 'cancel') + '">' +
      '<span class="h5p-icon-circle"></span>' +
      '<span class="h5p-icon-cross"></span>' +
    '</a>');

  var $textarea = H5PEditor.$('<textarea></textarea>')
    .val(oldTitle)
    .insertBefore($span.hide())
    .keydown(function (event) {
      if (event.keyCode === 13) {
        $textarea.blur();
        $li.focus();
        return false;
      }

      // don't propagate key events from textarea
      event.stopPropagation();
    }).keyup(function () {
      $textarea.css('height', $textarea[0].scrollHeight);
    }).blur(function (event) {
      if (event.relatedTarget && event.relatedTarget.className !== 'joubel-icon-cancel' || !event.relatedTarget) {
        var keyword = $textarea.val(); // Text not HTML

        that.updateKeyword(keyword, slideIndex, $span.html());

        // Remove textarea
        $li.removeClass('h5p-editing');
        $span.css({'display': 'inline-block'});
        $textarea.add($delete).remove();
      }
    }).focus();

  $textarea.keyup();

  $delete.insertAfter($textarea).click(function (e) {
    e.preventDefault();
    $textarea.val(oldTitle).blur();
    H5PEditor.$('[role="menuitem"].h5p-current').focus();
  }).keydown(function (e) {
    if ([32,13].indexOf(e.which) !== -1) {
      H5PEditor.$(this).click();
      return false;
    }
    // Ignore arrow keys for now to avoid JS-error
    if (e.which >= 37 && e.which <= 40) {
      return false;
    }
  }).blur(function (e) {
    if (e.relatedTarget && e.relatedTarget.tagName !== 'TEXTAREA' || !e.relatedTarget) {
      $textarea.blur();
    }
  });
};

/**
 * Updates the configs with the new keyword
 *
 * @param {string} keyword
 * @param {number} slideIndex
 * @param {string} oldTitle
 */
H5PEditor.CoursePresentation.prototype.updateKeyword = function (keyword, slideIndex, oldTitle) {
  var that = this;
  var hasTitle = true;

  if (H5P.trim(keyword) === '') {
    // Title is blank, use placeholder text
    keyword = that.cp.l10n.noTitle;
    hasTitle = false;
  }

  // Update navigation bar display?
  that.cp.progressbarParts[slideIndex].data('keyword', oldTitle);

  // Update keywords button
  H5PEditor.$('.current-slide-title').html(oldTitle);

  // Update params
  if (hasTitle) {
    that.params.slides[slideIndex].keywords = [{
      main: keyword
    }];
  }
  else {
    delete that.params.slides[slideIndex].keywords;
  }

  // Update keyword list item
  H5PEditor.$('[role="menuitem"].h5p-current .h5p-keyword-title').text(keyword);
};

/**
 * Generate element form.
 *
 * @param {Object} elementParams
 * @param {String} type
 * @returns {Object}
 */
H5PEditor.CoursePresentation.prototype.generateForm = function (elementParams, type) {
  var self = this;

  if (type === 'H5P.ContinuousText' && self.ct) {
    // Continuous Text shares a single form across all elements
    return {
      '$form': self.ct.element.$form,
      children: self.ct.element.children
    };
  }

  // Get semantics for the elements field
  var slides = H5PEditor.CoursePresentation.findField('slides', this.field.fields);
  var elementFields = H5PEditor.$.extend(true, [], H5PEditor.CoursePresentation.findField('elements', slides.field.fields).field.fields);

  // Manipulate semantics into only using a given set of fields
  if (type === 'goToSlide') {
    // Hide all others
    self.showFields(elementFields, ['title', 'goToSlide', 'goToSlideType', 'invisible']);
  }
  else {
    var hideFields = ['title', 'goToSlide', 'goToSlideType', 'invisible'];

    if (type === 'H5P.ContinuousText' || type === 'H5P.Audio') {
      // Continuous Text or Go To Slide cannot be displayed as a button
      hideFields.push('displayAsButton');
      hideFields.push('buttonSize');
    }
    else if (type === "H5P.Shape") {
      hideFields.push('solution');
      hideFields.push('alwaysDisplayComments');
      hideFields.push('backgroundOpacity');
      hideFields.push('displayAsButton');
      hideFields.push('buttonSize');
    }

    // Only display goToSlide field for goToSlide elements
    self.hideFields(elementFields, hideFields);
  }

  var element = {
    '$form': H5P.jQuery('<div/>')
  };

  // Render element fields
  H5PEditor.processSemanticsChunk(elementFields, elementParams, element.$form, self);
  element.children = self.children;

  // Remove library selector and copy button and paste button
  var pos = elementFields.map(function (field) {
    return field.type;
  }).indexOf('library');
  if (pos !== -1 && element.children[pos].hide) {
    element.children[pos].hide();
    element.$form.css('padding-top', '0');
  }

  // Show or hide button size dropdown depending on display as button checkbox
  element.$form.find('.field-name-displayAsButton').each(function () { // TODO: Use showWhen in semantics.json instead…
    var buttonSizeField = ns.$(this).parent().find('.field-name-buttonSize');

    if (!ns.$(this).find("input")[0].checked) {
      buttonSizeField.addClass("h5p-hidden2");
    }

    ns.$(this).find("input").change(function (e) {
      if (e.target.checked) {
        buttonSizeField.removeClass("h5p-hidden2");
      }
      else {
        buttonSizeField.addClass("h5p-hidden2");
      }
    });
  });

  // Set correct aspect ratio on new images.
  // TODO: Do not use/rely on magic numbers!
  var library = element.children[4];
  if (!(library instanceof H5PEditor.None)) {
    var libraryChange = function () {
      if (library.children[0].field.type === 'image') {
        library.children[0].changes.push(function (params) {
          self.setImageSize(element, elementParams, params);
        });
      } else if (library.children[0].field.type === 'video') {
        library.children[0].changes.push(function (params) {
          self.setVideoSize(elementParams, params);
        });
      }

      // Determine library options for this subcontent library
      var libraryOptions = H5PEditor.CoursePresentation.findField('action', elementFields).options;
      if (libraryOptions.length > 0 && typeof libraryOptions[0] === 'object') {
        libraryOptions = libraryOptions.filter(function (option) {
          return option.name.split(' ')[0] === type;
        });
        libraryOptions = (libraryOptions.length > 0) ? libraryOptions[0] : {};
      }
      else {
        libraryOptions = {};
      }
    };
    if (library.children === undefined) {
      library.changes.push(libraryChange);
    }
    else {
      libraryChange();
    }
  }

  return element;
};

/**
 * Help set size for new images and keep aspect ratio.
 *
 * @param {object} element
 * @param {object} elementParams
 * @param {object} fileParams
 */
H5PEditor.CoursePresentation.prototype.setImageSize = function (element, elementParams, fileParams) {
  if (fileParams === undefined || fileParams.width === undefined || fileParams.height === undefined) {
    return;
  }

  // Avoid to small images
  var minSize = parseInt(element.$wrapper.css('font-size')) +
                element.$wrapper.outerHeight() -
                element.$wrapper.innerHeight();

  // Use minSize
  if (fileParams.width < minSize) {
    fileParams.width = minSize;
  }
  if (fileParams.height < minSize) {
    fileParams.height = minSize;
  }

  // Reduce height for tiny images, stretched pixels looks horrible
  var suggestedHeight = fileParams.height / (this.cp.$current.innerHeight() / 100);
  if (suggestedHeight < elementParams.height) {
    elementParams.height = suggestedHeight;
  }

  // Calculate new width
  elementParams.width = (elementParams.height * (fileParams.width / fileParams.height)) / this.slideRatio;
};

/**
 * Help set size for new videos and keep aspect ratio.
 *
 * @param {object} element
 * @param {object} elementParams
 * @param {object} fileParams
 */
H5PEditor.CoursePresentation.prototype.setVideoSize = function (elementParams, fileParams) {
  if (!fileParams){
    return;
  }

  if (!fileParams.aspectRatio) {
    fileParams.aspectRatio = '16:9';
  }

  const ratioParts = String(fileParams.aspectRatio).split(':');
  elementParams.height = (elementParams.width * (ratioParts.length === 1 ? fileParams.aspectRatio : (ratioParts[1] / ratioParts[0]))) * this.slideRatio;
};

/**
 * Hide all fields in the given list. All others are shown.
 *
 * @param {Object[]} elementFields
 * @param {String[]} fields
 */
H5PEditor.CoursePresentation.prototype.hideFields = function (elementFields, fields) {
  // Find and hide fields in list
  for (var i = 0; i < fields.length; i++) {
    var field = H5PEditor.CoursePresentation.findField(fields[i], elementFields);
    if (field) {
      field.widget = 'none';
    }
  }
};

/**
 * Show all fields in the given list. All others are hidden.
 *
 * @param {Object[]} elementFields
 * @param {String[]} fields
 */
H5PEditor.CoursePresentation.prototype.showFields = function (elementFields, fields) {
  // Find and hide all fields not in list
  for (var i = 0; i < elementFields.length; i++) {
    var field = elementFields[i];
    var found = false;

    for (var j = 0; j < fields.length; j++) {
      if (field.name === fields[j]) {
        found = true;
        break;
      }
    }

    if (!found) {
      field.widget = 'none';
    }
  }
};

/**
* Find the title for the given library.
*
* @param {String} type Library name
* @param {Function} next Called when we've found the title
*/
H5PEditor.CoursePresentation.prototype.findLibraryTitle = function (library, next) {
  var self = this;

  /** @private */
  var find = function () {
    for (var i = 0; i < self.libraries.length; i++) {
      if (self.libraries[i].name === library) {
        next(self.libraries[i].title);
        return;
      }
    }
  };

  if (self.libraries === undefined) {
    // Must wait until library titles are loaded
    self.once('librariesReady', find);
  }
  else {
    find();
  }
};

/**
 * Callback used by CP when a new element is added.
 *
 * @param {Object} elementParams
 * @param {jQuery} $wrapper
 * @param {Number} slideIndex
 * @param {Object} elementInstance
 * @returns {undefined}
 */
H5PEditor.CoursePresentation.prototype.processElement = function (elementParams, $wrapper, slideIndex, elementInstance) {
  var that = this;

  // Detect type
  var type;
  if (elementParams.action !== undefined) {
    type = elementParams.action.library.split(' ')[0];
  }
  else {
    type = 'goToSlide';
  }

  // Find element identifier
  var elementIndex = $wrapper.index();

  // Generate element form
  if (this.elements[slideIndex] === undefined) {
    this.elements[slideIndex] = [];
  }
  if (this.elements[slideIndex][elementIndex] === undefined) {
    this.elements[slideIndex][elementIndex] = this.generateForm(elementParams, type);
  }

  // Get element
  var element = this.elements[slideIndex][elementIndex];
  element.$wrapper = $wrapper;

  H5P.jQuery('<div/>', {
    'class': 'h5p-element-overlay'
  }).appendTo($wrapper);

  if (that.dnb) {
    that.addToDragNBar(element, elementParams);
  }

  // Open form dialog when double clicking element
  $wrapper.dblclick(function () {
    that.showElementForm(element, $wrapper, elementParams);
  });

  if (type === 'H5P.ContinuousText' && that.ct === undefined) {
    // Keep track of first CT element!
    that.ct = {
      element: element,
      params: elementParams
    };
  }

  if (elementParams.pasted) {
    if (type === 'H5P.ContinuousText') {
      H5P.ContinuousText.Engine.run(this);
    }

    delete elementParams.pasted;
  }

  if (elementInstance.onAdd) {
    // Some sort of callback event thing
    elementInstance.onAdd(elementParams, slideIndex);
  }
};

/**
 * Make sure element can be moved and stop moving while resizing.
 *
 * @param {Object} element
 * @param {Object} elementParams
 * @returns {H5P.DragNBarElement}
 */
H5PEditor.CoursePresentation.prototype.addToDragNBar = function (element, elementParams) {
  var self = this;

  var type = (elementParams.action ? elementParams.action.library.split(' ')[0] : null);

  const options = {
    disableResize: elementParams.displayAsButton,
    lock: (type === 'H5P.Chart' && elementParams.action.params.graphMode === 'pieChart'),
    cornerLock: (type === 'H5P.Image' || type === 'H5P.Shape')
  };

  if (type === 'H5P.Shape') {
    options.minSize = 3;
    if (elementParams.action.params.type == 'vertical-line') {
      options.directionLock = "vertical";
    }
    else if (elementParams.action.params.type == 'horizontal-line') {
      options.directionLock = "horizontal";
    }
  }

  var clipboardData = H5P.DragNBar.clipboardify(H5PEditor.CoursePresentation.clipboardKey, elementParams, 'action');
  var dnbElement = self.dnb.add(element.$wrapper, clipboardData, options);
  dnbElement.contextMenu.on('contextMenuEdit', function () {
    self.showElementForm(element, element.$wrapper, elementParams);
  });
  element.$wrapper.find('*').attr('tabindex', '-1');

  dnbElement.contextMenu.on('contextMenuRemove', function () {
    const confirmationDialog = self.showConfirmationDialog({
      headerText: H5PEditor.t('H5PEditor.CoursePresentation', 'confirmRemoveElement'),
      cancelText: H5PEditor.t('H5PEditor.CoursePresentation', 'cancel'),
      confirmText: H5PEditor.t('H5PEditor.CoursePresentation', 'ok'),
    });

    confirmationDialog.on('canceled', () => {
      return;
    });
    confirmationDialog.on('confirmed', () => {
      if (H5PEditor.Html) {
        H5PEditor.Html.removeWysiwyg();
      }
      self.removeElement(element, element.$wrapper, (elementParams.action !== undefined && H5P.libraryFromString(elementParams.action.library).machineName === 'H5P.ContinuousText'));
      self.dnb.blurAll();
    });
  });

  dnbElement.contextMenu.on('contextMenuBringToFront', function () {
    // Old index
    var oldZ = element.$wrapper.index();

    // Current slide index
    var slideIndex = self.cp.$current.index();

    // Update visuals
    element.$wrapper.appendTo(element.$wrapper.parent());

    // Find slide params
    var slide = self.params.slides[slideIndex].elements;

    // Remove from old pos
    slide.splice(oldZ, 1);

    // Add to top
    slide.push(elementParams);

    // Re-order elements in the same fashion
    self.elements[slideIndex].splice(oldZ, 1);
    self.elements[slideIndex].push(element);

    self.cp.children[slideIndex].moveChild(oldZ, self.cp.children[slideIndex].children.length - 1);
  });

  dnbElement.contextMenu.on('contextMenuSendToBack', function () {
    // Old index
    var oldZ = element.$wrapper.index();

    // Current slide index
    var slideIndex = self.cp.$current.index();

    // Update visuals
    element.$wrapper.prependTo(element.$wrapper.parent());

    // Find slide params
    var slide = self.params.slides[slideIndex].elements;

    // Remove from old pos
    slide.splice(oldZ, 1);

    // Add to top
    slide.unshift(elementParams);

    // Re-order elements in the same fashion
    self.elements[slideIndex].splice(oldZ, 1);
    self.elements[slideIndex].unshift(element);

    self.cp.children[slideIndex].moveChild(oldZ, 0);
  });

  return dnbElement;
};

/**
 * Removes element from slide.
 *
 * @param {Object} element
 * @param {jQuery} $wrapper
 * @param {Boolean} isContinuousText
 * @returns {undefined}
 */
H5PEditor.CoursePresentation.prototype.removeElement = function (element, $wrapper, isContinuousText) {
  var slideIndex = this.cp.$current.index();
  var elementIndex = $wrapper.index();

  var elementInstance = this.cp.elementInstances[slideIndex][elementIndex];
  var removeForm = (element.children.length ? true : false);

  if (isContinuousText) {
    var CTs = this.getCTs(false, true);
    if (CTs.length === 2) {
      // Prevent removing form while there are still some CT elements left
      removeForm = false;

      if (element === CTs[0].element && CTs.length === 2) {
        CTs[1].params.action.params = CTs[0].params.action.params;
      }
    }
    else {
      delete this.params.ct;
      delete this.ct;
    }
  }

  if (removeForm) {
    H5PEditor.removeChildren(element.children);
  }

  // Completely remove element from CP
  if (elementInstance.onDelete) {
    elementInstance.onDelete(this.params, slideIndex, elementIndex);
  }
  this.elements[slideIndex].splice(elementIndex, 1);
  this.cp.elementInstances[slideIndex].splice(elementIndex, 1);
  this.params.slides[slideIndex].elements.splice(elementIndex, 1);
  this.cp.children[slideIndex].removeChild(elementIndex);

  $wrapper.remove();

  if (isContinuousText) {
    H5P.ContinuousText.Engine.run(this);
  }
};

/**
 * Displays the given form in a popup.
 *
 * @param {jQuery} $form
 * @param {jQuery} $wrapper
 * @param {object} element Params
 * @returns {undefined}
 */
H5PEditor.CoursePresentation.prototype.showElementForm = function (element, $wrapper, elementParams) {
  var that = this;

  // Determine element type
  var machineName;
  if (elementParams.action !== undefined) {
    machineName = H5P.libraryFromString(elementParams.action.library).machineName;
  }

  // Special case for Continuous Text
  var isContinuousText = (machineName === 'H5P.ContinuousText');
  if (isContinuousText && that.ct) {
    // Get CT text from storage
    that.ct.element.$form.find('.text .ckeditor').first().html(that.params.ct);
    that.ct.params.action.params.text = that.params.ct;
  }

  // Disable guided tour for IV
  if (machineName === 'H5P.InteractiveVideo') {
    // Recreate IV form, workaround for Youtube API not firing
    // onStateChange when IV is reopened.
    element = that.generateForm(elementParams, 'H5P.InteractiveVideo');
  }

  /**
   * The user has clicked delete, remove the element.
   * @private
   */
  const handleFormremove = function (e) {
    const confirmationDialog = this.showConfirmationDialog({
      headerText: H5PEditor.t('H5PEditor.CoursePresentation', 'confirmRemoveElement'),
      cancelText: H5PEditor.t('H5PEditor.CoursePresentation', 'cancel'),
      confirmText: H5PEditor.t('H5PEditor.CoursePresentation', 'ok'),
    });
    e.preventRemove = true;

    confirmationDialog.on('canceled', () => {
      return;
    });

    confirmationDialog.on('confirmed', () => {
      that.currentlyDeletingElement = true;
      that.getFormManager().closeFormUntil(0);
      that.removeElement(element, $wrapper, isContinuousText);
      that.dnb.blurAll();
      that.dnb.preventPaste = false;
      that.currentlyDeletingElement = false;
    });
  };

  that.on('formremove', handleFormremove);

  /**
   * The user is done editing, save and update the display.
   * @private
   */
  const handleFormdone = function () {
    // Validate / save children
    for (var i = 0; i < element.children.length; i++) {
      element.children[i].validate();
    }

    if (isContinuousText) {
      // Store complete CT on slide 0
      that.params.ct = that.ct.params.action.params.text;

      // Split up text and place into CT elements
      H5P.ContinuousText.Engine.run(that);

      setTimeout(function () {
        // Put focus back on ct element
        that.dnb.focus($wrapper);
      }, 1);
    }
    else if (!that.currentlyDeletingElement) {
      that.redrawElement($wrapper, element, elementParams);
    }

    that.dnb.preventPaste = false;
  }
  that.on('formdone', handleFormdone);

  /**
   * The form pane is fully displayed.
   * @private
   */
  const handleFormopened = function () {
    if (isLoaded) {
      focusFirstField();
    }
  }
  that.on('formopened', handleFormopened);

  /**
   * Remove event listeners on form close
   * @private
   */
  const handleFormclose = function () {
    that.dnb.toggleDrag(true);
    that.off('formremove', handleFormremove);
    that.off('formdone', handleFormdone);
    that.off('formclose', handleFormclose);
    that.off('formopened', handleFormopened);
  };
  that.on('formclose', handleFormclose);

  const libraryField = H5PEditor.findField('action', element);

  /**
   * Focus the first field of the form.
   * Should be triggered when library is loaded + form is opened.
   *
   * @private
   */
  var focusFirstField = function () {
    // Find the first ckeditor or texteditor field that is not hidden.
    // h5p-editor dialog is copyright dialog
    // h5p-dialog-box is IVs video choose dialog
    H5P.jQuery('.ckeditor, .h5peditor-text', libraryField.$myField)
      .not('.h5p-editor-dialog .ckeditor, ' +
      '.h5p-editor-dialog .h5peditor-text, ' +
      '.h5p-dialog-box .ckeditor, ' +
      '.h5p-dialog-box .h5peditor-text', libraryField.$myField)
      .eq(0)
      .focus();

    // GotoSlide is not library therefore require separate focus
    if (libraryField.$myField === undefined) {
      H5P.jQuery('.h5p-coursepresentation-editor .form-manager-slidein .h5peditor-text')
      .eq(0)
      .focus();
    }
  };

  // Determine if library is already loaded
  let isLoaded = false;
  if (libraryField.currentLibrary === undefined && libraryField.change !== undefined) {
    libraryField.change(function () {
      isLoaded = true;
      if (that.isFormOpen()) {
        focusFirstField();
      }
    });
  }
  else {
    isLoaded = true;
  }

  let customTitle, customIconId;
  if (elementParams.action === undefined) {
    customTitle = H5PEditor.t('H5PEditor.CoursePresentation', 'goToSlide');
    customIconId = 'gotoslide';
  }

  // Disable dragging in any new dnb elements
  that.dnb.toggleDrag(false);

  // Open a new form pane with the element form
  that.openForm(libraryField, element.$form[0], null, customTitle, customIconId);

  // Deselect any elements
  if (that.dnb !== undefined) {
    that.dnb.preventPaste = true;
    setTimeout(function () {
      that.dnb.blurAll();
    }, 0);
  }
};

/**
* Redraw element.
*
* @param {jQuery} $wrapper Element container to be redrawn.
* @param {object} element Element data.
* @param {object} elementParams Element parameters.
* @param {number} [repeat] Counter for redrawing if necessary.
*/
H5PEditor.CoursePresentation.prototype.redrawElement = function ($wrapper, element, elementParams, repeat) {
  var elementIndex = $wrapper.index();
  var slideIndex = this.cp.$current.index();
  var elementsParams = this.params.slides[slideIndex].elements;
  var elements = this.elements[slideIndex];
  var elementInstances = this.cp.elementInstances[slideIndex];

  // Determine how many elements still need redrawal after this one
  repeat = (typeof repeat === 'undefined') ? elements.length - 1 - elementIndex : repeat;

  if (elementParams.action && elementParams.action.library.split(' ')[0] === 'H5P.Chart' &&
      elementParams.action.params.graphMode === 'pieChart') {
    elementParams.width = elementParams.height / this.slideRatio;
  }

  // Remove Element instance from Slide
  this.cp.children[slideIndex].removeChild(elementIndex);

  // Remove instance of lib:
  elementInstances.splice(elementIndex, 1);

  // Update params
  elementsParams.splice(elementIndex, 1);
  elementsParams.push(elementParams);

  // Update elements
  elements.splice(elementIndex, 1);
  elements.push(element);

  // Update visuals
  $wrapper.remove();
  var instance = this.cp.children[slideIndex].addChild(elementParams).instance;
  var $element = this.cp.attachElement(elementParams, instance, this.cp.$current, slideIndex);

  // Make sure we're inside the container
  this.fitElement($element, elementParams);

  // Resize element.
  instance = elementInstances[elementInstances.length - 1];
  if ((instance.preventResize === undefined || instance.preventResize === false) && instance.$ !== undefined && !elementParams.displayAsButton) {
    H5P.trigger(instance, 'resize');
  }

  var that = this;
  if (repeat === elements.length - 1 - elementIndex) {
    setTimeout(function () {
      // Put focus back on element
      that.dnb.focus($element);
    }, 1);
  }

  /*
   * Reset to previous element order, otherwise the initially redrawn element
   * would be put on top instead of remaining at the original z position.
   */
  if (repeat > 0) {
    repeat--;
    this.redrawElement(elements[elementIndex].$wrapper, elements[elementIndex], elementsParams[elementIndex], repeat);
  }
};

/**
 * Applies the updated position and size properties to the given element.
 *
 * All properties are converted to percentage.
 *
 * @param {H5P.jQuery} $element
 * @param {Object} elementParams
 */
H5PEditor.CoursePresentation.prototype.fitElement = function ($element, elementParams) {
  var self = this;

  var sizeNPosition = self.dnb.getElementSizeNPosition($element);
  var updated = H5P.DragNBar.fitElementInside(sizeNPosition);

  var pW = (sizeNPosition.containerWidth / 100);
  var pH = (sizeNPosition.containerHeight / 100);

  // Set the updated properties
  var style = {};

  if (updated.width !== undefined) {
    elementParams.width = updated.width / pW;
    style.width = elementParams.width + '%';
  }
  if (updated.left !== undefined) {
    elementParams.x = updated.left / pW;
    style.left = elementParams.x + '%';
  }
  if (updated.height !== undefined) {
    elementParams.height = updated.height / pH;
    style.height = elementParams.height + '%';
  }
  if (updated.top !== undefined) {
    elementParams.y = updated.top / pH;
    style.top = elementParams.y + '%';
  }

  // Apply style
  $element.css(style);
};

/**
* Find ContinuousText elements.
*
* @param {Boolean} [firstOnly] Return first element only
* @param {Boolean} [maxTwo] Return after two elements have been found
* @returns {{Object[]|Object}}
*/
H5PEditor.CoursePresentation.prototype.getCTs = function (firstOnly, maxTwo) {
  var self = this;

  var CTs = [];

  for (var i = 0; i < self.elements.length; i++) {
    var slideElements = self.elements[i];
    if (!self.params.slides[i] || !self.params.slides[i].elements) {
      continue;
    }

    for (var j = 0; slideElements !== undefined && j < slideElements.length; j++) {
      var element = slideElements[j];
      var params = self.params.slides[i].elements[j];
      if (params.action !== undefined && params.action.library.split(' ')[0] === 'H5P.ContinuousText') {
        CTs.push({
          element: element,
          params: params
        });

        if (firstOnly) {
          return CTs[0];
        }
        if (maxTwo && CTs.length === 2) {
          return CTs;
        }
      }
    }
  }

  return firstOnly ? null : CTs;
};

/**
 * Collect functions to execute once the tree is complete.
 *
 * @param {function} ready
 * @returns {undefined}
 */
H5PEditor.CoursePresentation.prototype.ready = function (ready) {
  if (this.passReadies) {
    this.parent.ready(ready);
  }
  else {
    this.readies.push(ready);
  }
};

/**
 * Look for field with the given name in the given collection.
 *
 * @param {String} name of field
 * @param {Array} fields collection to look in
 * @returns {Object} field object
 */
H5PEditor.CoursePresentation.findField = function (name, fields) {
  for (var i = 0; i < fields.length; i++) {
    if (fields[i].name === name) {
      return fields[i];
    }
  }
};

/**
 * Add confirmation dialog
 * @param {object} dialogOptions Dialog options.
 * @returns {HTMLElement} confirmationDialog
 */
H5PEditor.CoursePresentation.prototype.showConfirmationDialog = function (dialogOptions) {
  const confirmationDialog = new H5P.ConfirmationDialog(dialogOptions)
    .appendTo(document.body);

  confirmationDialog.show(this.$item.offset().top);
  return confirmationDialog;
};

/** @constant {Number} */
H5PEditor.CoursePresentation.RATIO_SURFACE = 16 / 9;


// Tell the editor what widget we are.
H5PEditor.widgets.coursepresentation = H5PEditor.CoursePresentation;
