H5P.ImageHotspotQuestion = (function ($, Question) {

  /**
   * Initialize module.
   * @class H5P.ImageHotspotQuestion
   * @extends H5P.Question
   * @param {object} params Behavior settings
   * @param {number} id Content identification
   * @param {object} contentData Task specific content data
   */
  function ImageHotspotQuestion(params, id, contentData) {
    const defaults = {
      imageHotspotQuestion: {
        backgroundImageSettings: {
          backgroundImage: {
            path: ''
          }
        },
        hotspotSettings: {
          hotspot: [],
          showFeedbackAsPopup: true,
          l10n: {
            retryText: 'Retry',
            closeText: 'Close'
          }
        }
      },
      behaviour: {
        enableRetry: true
      },
      scoreBarLabel: 'You got :num out of :total points',
      a11yRetry:
        'Retry the task. Reset all responses and start the task over again.',
    };

    // Inheritance
    Question.call(this, 'image-hotspot-question');

    /**
     * Keeps track of content id.
     * @type {number}
     */
    this.contentId = id;

    /**
     * Keeps track of max score.
     * @type {number}
     */
    this.maxScore = 1;

    /**
     * Keeps track of parameters.
     */
    this.params = $.extend(true, {}, defaults, params);

    /**
     * Easier access to image settings.
     * H5P semantics doesn't treat Arrays with one element as arrays with one element
     */
    this.imageSettings =
      this.params.imageHotspotQuestion.backgroundImageSettings;

    /**
     * Easier access to hotspot settings.
     */
    this.hotspotSettings = this.params.imageHotspotQuestion.hotspotSettings;

    /**
     * Keeps track of all hotspots in an array.
     * @type {HTMLElement[]}
     */
    this.hotspots = [];

    /**
     * Keeps track of the content data. Specifically the previous state.
     * @type {object}
     */
    this.contentData = contentData;
    this.previousState = contentData?.previousState;

    this.dom = this.createContent();

    this.lastHotspot = this.previousState?.hotspotIndex ??
      ImageHotspotQuestion.NOT_CLICKED;
    this.lastPosition = this.previousState?.position;
    this.isPopopOpen = this.previousState?.popupOpen ?? false;

    /**
     * Hotspot feedback object. Contains hotspot feedback specific parameters.
     * @type {object}
     */
    this.hotspotFeedback = {
      hotspotChosen: this.lastPosition !== undefined
    };

    this.callOnceAttached(() => {
      if (typeof this.lastHotspot === 'number' && this.lastPosition) {
        const hotspotParams = this.lastHotspot >= 0 ?
          this.hotspotSettings.hotspot[this.lastHotspot] :
          undefined;

          this.createHotspotFeedback({
            position: this.lastPosition,
            hotspotParams: hotspotParams,
            options: {
              skipFeedback: !this.isPopopOpen,
              skipXAPI: true
            }
          });
      }
    });

    // Start activity timer
    if (this.isRoot()) {
      this.setActivityStarted();
    }

    // Register resize listener with h5p
    this.on('resize', () => {
      this.resize();
    });
  }

  // Inheritance
  ImageHotspotQuestion.prototype = Object.create(Question.prototype);
  ImageHotspotQuestion.prototype.constructor = ImageHotspotQuestion;

  /**
   * Registers this question types DOM elements before they are attached.
   * Called from H5P.Question.
   */
  ImageHotspotQuestion.prototype.registerDomElements = function () {
    // Register task introduction text
    if (this.hotspotSettings.taskDescription) {
      this.setIntroduction(this.hotspotSettings.taskDescription);
    }

    // Register task content area
    this.setContent(H5P.jQuery(this.dom));

    // Register retry button
    this.createRetryButton();
  };

  /**
   * Create main dom.
   * @returns {HTMLElement} Main dom element.
   */
  ImageHotspotQuestion.prototype.createContent = function () {
    const dom = document.createElement('div');
    dom.classList.add('h5p-image-hotspot-question');

    if (this.imageSettings?.path) {
      this.imageWrapper = document.createElement('div');
      this.imageWrapper.classList.add('image-wrapper');
      this.imageWrapper.addEventListener('click', (mouseEvent) => {
        if (this.hotspotFeedback.element?.isConnected) {
          return;
        }

        this.lastHotspot = ImageHotspotQuestion.NO_PARTICULAR_HOTSPOT;
        this.lastPosition =
          this.getFeedbackPosition(this.imageWrapper, mouseEvent);

        this.createHotspotFeedback({ position: this.lastPosition });
      });
      dom.append(this.imageWrapper);

      // Image loader screen
      const loader = document.createElement('div');
      loader.classList.add('image-loader', 'loading');
      this.imageWrapper.append(loader);

      this.backgroundImage = new Image();
      this.backgroundImage.classList.add('hotspot-image');
      this.backgroundImage.addEventListener('load', () => {
        loader.parentNode.replaceChild(this.backgroundImage, loader);
        this.trigger('resize');
      });
      this.backgroundImage.src =
        H5P.getPath(this.imageSettings.path, this.contentId);

      this.attachHotspots();
    }
    else {
      const message = document.createElement('div');
      message.innerText = 'No background image was added!';
      dom.append(message);
    }

    return dom;
  };

  /**
   * Attach all hotspots.
   */
  ImageHotspotQuestion.prototype.attachHotspots = function () {
    this.hotspotSettings.hotspot.forEach((params, index) => {
      this.attachHotspot(params, index);
    });
  };

  /**
   * Attach single hotspot.
   * @param {object} params Hotspot parameters.
   * @param {number} index Index of the hotspot.
   */
  ImageHotspotQuestion.prototype.attachHotspot = function (params, index) {
    const hotspot = document.createElement('div');
    hotspot.classList.add('image-hotspot', params.computedSettings.figure);
    hotspot.style.left = `${params.computedSettings.x}%`;
    hotspot.style.top = `${params.computedSettings.y}%`;
    hotspot.style.width = `${params.computedSettings.width}%`;
    hotspot.style.height = `${params.computedSettings.height}%`;
    hotspot.addEventListener('click', (mouseEvent) => {
      if (this.hotspotFeedback.element?.isConnected) {
        return;
      }

      mouseEvent.stopPropagation();
      // Create new hotspot feedback
      this.lastHotspot = index;
      this.lastPosition = this.getFeedbackPosition(hotspot, mouseEvent);
      this.createHotspotFeedback({
        position: this.lastPosition,
        hotspotParams: params
      });

      // Do not propagate
      return false;
    });
    this.imageWrapper.append(hotspot);

    this.hotspots.push(hotspot);
  };

  /**
   * Get feedback position based on mouse event and clicked element.
   * @param {HTMLElement} clickedElement Element clicked on.
   * @param {MouseEvent} mouseEvent Mouse event.
   * @returns
   */
  ImageHotspotQuestion.prototype.getFeedbackPosition = function (
    clickedElement, mouseEvent
  ) {
    let x = mouseEvent.offsetX;
    let y = mouseEvent.offsetY;

    // Apply clicked element offset if click was not in wrapper
    if (!clickedElement.classList.contains('image-wrapper')) {
      x += clickedElement.offsetLeft;
      y += clickedElement.offsetTop;
    }

    x = x / (this.imageWrapper.offsetWidth / 100);
    y = y / (this.imageWrapper.offsetHeight / 100);

    return { x: x, y: y };
  };

  /**
   * Create a feedback element for a click.
   * @param {object} [params] Parameters for the feedback.
   * @param {object} params.position Position of the click.
   * @param {number} params.position.x X position of the click.
   * @param {number} params.position.y Y position of the click.
   * @param {object} [params.hotspotParams] Hotspot parameters.
   * @param {object} [params.options] Options for the feedback.
   * @param {boolean} [params.options.skipXAPI] True to skip xAPI event.
   * @param {boolean} [params.options.skipFeedback] True to skip feedback.
   */
  ImageHotspotQuestion.prototype.createHotspotFeedback = function (params = {}) {
    if (!params.position) {
      return;
    }

    // Do not create new hotspot if one exists
    if (this.hotspotFeedback.element?.isConnected) {
      return;
    }

    this.hotspotFeedback.element = document.createElement('div');
    this.hotspotFeedback.element.classList.add('hotspot-feedback');
    this.imageWrapper.append(this.hotspotFeedback.element);

    this.hotspotFeedback.hotspotChosen = true;

    // Keep position and pixel offsets for resizing
    this.hotspotFeedback.percentagePosX = params.position.x;
    this.hotspotFeedback.percentagePosY = params.position.y;
    this.hotspotFeedback.pixelOffsetX =
      this.hotspotFeedback.element.offsetWidth / 2;
    this.hotspotFeedback.pixelOffsetY =
      this.hotspotFeedback.element.offsetHeight / 2;

    // Position feedback
    this.resizeHotspotFeedback();

    // Style correct answers
    if (params.hotspotParams?.userSettings.correct) {
      this.hotspotFeedback.element.classList.add('correct');
      // this.hideButton('retry-button');
    }
    else if (this.params.behaviour.enableRetry) {
      // Wrong answer, show retry button
      this.showButton('retry-button');
    }

    const feedbackText = params.hotspotParams?.userSettings.feedbackText ||
      this.params.imageHotspotQuestion.hotspotSettings.noneSelectedFeedback ||
      '&nbsp;';

    // Send these settings into setFeedback to turn feedback into a popup.
    const popupSettings = {
      showAsPopup:
        this.params.imageHotspotQuestion.hotspotSettings.showFeedbackAsPopup,
      closeText:
        this.params.imageHotspotQuestion.hotspotSettings.l10n.closeText,
      click:
        {...this.hotspotFeedback, $element: $(this.hotspotFeedback.element)}
    };

    // Too bad the popup doesn't use a callback
    window.requestAnimationFrame(() => {
      const questionFeedback = this.dom?.parentNode.querySelector(
        '.h5p-question-feedback.h5p-question-visible.h5p-question-popup'
      );
      if (!questionFeedback) {
        return;
      }

      const popupCloseButton = questionFeedback.querySelector(
        '.h5p-question-feedback-close'
      );
      popupCloseButton?.addEventListener('click', () => {
        this.isPopopOpen = false;
      });

      // Workaroung for H5P.Question when using popups
      const buttons = questionFeedback.querySelector('.h5p-question-buttons');
      if (buttons) {
        buttons.style.display = 'inline-block';
      }
    });

    this.isPopopOpen = true;

    if (!params.options?.skipFeedback) {
      this.setFeedback(
        feedbackText,
        this.getScore(),
        this.getMaxScore(),
        this.params.scoreBarLabel,
        undefined,
        popupSettings
      );
    }

    // Finally add fade in animation to hotspot feedback
    this.hotspotFeedback.element.classList.add('fade-in');

    if (!params.options?.skipXAPI) {
      // Trigger xAPI completed event
      this.triggerAnswered();
    }
  };

  /**
   * Create retry button and add it to button bar.
   */
  ImageHotspotQuestion.prototype.createRetryButton = function () {
    this.addButton(
      'retry-button',
      this.params.imageHotspotQuestion.hotspotSettings.l10n.retryText,
      () => {
        this.resetTask();
      },
      false,
      { 'aria-label': this.params.a11yRetry }
    );
  };

  /**
   * Determine whether the task was answered already.
   * @returns {boolean} True if answer was given by user, else false.
   * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-1}
   */
  ImageHotspotQuestion.prototype.getAnswerGiven = function () {
    return this.hotspotFeedback.hotspotChosen;
  };

  /**
   * Get current score.
   * @returns {number} Current score.
   * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-2}
   */
  ImageHotspotQuestion.prototype.getScore = function () {
    if (this.lastHotspot < 0) {
      return 0;
    }

    return (
      this.hotspotSettings.hotspot[this.lastHotspot].userSettings?.correct ?
        1 :
        0
    );
  };

  /**
   * Get maximum possible score.
   * @returns {number} Maximum possible score.
   * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-3}
   */
  ImageHotspotQuestion.prototype.getMaxScore = function () {
    return this.maxScore;
  };

  /**
   * Show solutions.
   * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-4}
   */
  ImageHotspotQuestion.prototype.showSolutions = function () {
    let foundSolution = false;

    this.hotspotSettings.hotspot.forEach((hotspotParams, index) => {
      if (hotspotParams.userSettings.correct && !foundSolution) {
        const correctHotspot = this.hotspots[index];
        const position = this.getFeedbackPosition(
          correctHotspot,
          {
            offsetX: (correctHotspot.offsetWidth / 2),
            offsetY: (correctHotspot.offsetHeight / 2)
          }
        );
        this.createHotspotFeedback({
          position: position,
          hotspotParams: hotspotParams,
          options: { skipFeedback: true, skipXAPI: true }
        });

        foundSolution = true;
      }
    });
  };

  /**
   * Reset task.
   * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-5}
   */
  ImageHotspotQuestion.prototype.resetTask = function () {
    this.wasReset = true;

    // Remove hotspot feedback
    this.hotspotFeedback.element?.remove();
    this.hotspotFeedback.hotspotChosen = false;

    // Hide retry button
    this.hideButton('retry-button');

    this.lastHotspot = ImageHotspotQuestion.NOT_CLICKED;
    this.isPopopOpen = false;
    delete this.lastPosition;

    // Clear feedback
    this.removeFeedback();
  };

  /**
   * Get xAPI data.
   * @returns {object} XAPI statement.
   * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-6}
   */
  ImageHotspotQuestion.prototype.getXAPIData = function () {
    const xAPIEvent = this.createXAPIEventTemplate('answered');
    xAPIEvent.setScoredResult(
      this.getScore(), this.getMaxScore(), this, true, true
    );
    this.addQuestionToXAPI(xAPIEvent);

    return {
      statement: xAPIEvent.data.statement
    };
  };

  /**
   * Get current state.
   * @returns {object} Current state to be retrieved later.
   * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-7}
   */
  ImageHotspotQuestion.prototype.getCurrentState = function () {
    if (!this.getAnswerGiven()) {
      return this.wasReset? {} : undefined;
    }

    return {
      hotspotIndex: this.lastHotspot,
      position: this.lastPosition,
      popupOpen: this.isPopopOpen
    }
  }

  /**
   * Get title of content.
   * @returns {string} Title.
   */
  ImageHotspotQuestion.prototype.getTitle = function () {
    return H5P.createTitle(this.contentData?.metadata?.title ?? 'Fill In');
  };

  /**
   * Trigger xAPI answered event
   */
  ImageHotspotQuestion.prototype.triggerAnswered = function () {
    const xAPIEvent = this.createXAPIEventTemplate('answered');

    // Add score to xAPIEvent
    const score = this.getScore();
    const maxScore = this.getMaxScore();
    xAPIEvent.setScoredResult(score, maxScore, this, true, score === maxScore);

    this.addQuestionToXAPI(xAPIEvent);
    this.trigger(xAPIEvent);
  };

  /**
   * Add the question itself to the definition part of an xAPIEvent.
   */
  ImageHotspotQuestion.prototype.addQuestionToXAPI = function (xAPIEvent) {
    const definition =
      xAPIEvent.getVerifiedStatementValue(['object', 'definition']);
    $.extend(true, definition, this.getxAPIDefinition());
  };

  /**
   * Generate xAPI object definition used in xAPI statements.
   * @return {object|undefined} XAPI definition object or undefined if not supported.
   */
  ImageHotspotQuestion.prototype.getxAPIDefinition = function () {
    if (this.isRoot()) {
      return; // Individual report not supported
    }

    const definition = {};
    definition.description = {
      'en-US': this.getTitle()
    };
    definition.type = 'http://adlnet.gov/expapi/activities/cmi.interaction';
    definition.interactionType = 'other';
    return definition;
  };

  /**
   * Resize image and wrapper.
   */
  ImageHotspotQuestion.prototype.resize = function () {
    this.resizeImage();
    this.resizeHotspotFeedback();
  };

  /**
   * Resize image to fit parent width.
   */
  ImageHotspotQuestion.prototype.resizeImage = function () {
    // Check that question has been attached
    if (!this.dom || !this.backgroundImage) {
      return;
    }

    // Resize image to fit new container width.
    const parentWidth = this.dom.offsetWidth;
    this.backgroundImage.style.width = `${parentWidth}px`;

    // Find required height for new width.
    const naturalWidth = this.backgroundImage.naturalWidth;
    const naturalHeight = this.backgroundImage.naturalHeight;
    const imageRatio = naturalHeight / naturalWidth;
    let neededHeight = -1;
    if (parentWidth < naturalWidth) {
      // Scale image down
      neededHeight = parentWidth * imageRatio;
    }
    else {
      // Scale image to natural size
      this.backgroundImage.style.width = `${naturalWidth}px`;
      neededHeight = naturalHeight;
    }

    if (neededHeight !== -1) {
      this.backgroundImage.style.height = `${neededHeight}px`;

      // Resize wrapper to match image.
      this.dom.style.height = `${neededHeight}px`;
    }
  };

  /**
   * Re-position hotspot feedback.
   */
  ImageHotspotQuestion.prototype.resizeHotspotFeedback = function () {
    // Check that hotspot is chosen
    if (!this.hotspotFeedback.element) {
      return;
    }

    // Calculate positions
    const posX =
      this.hotspotFeedback.percentagePosX *
        this.imageWrapper.offsetWidth / 100 -
        this.hotspotFeedback.pixelOffsetX;
    const posY =
      this.hotspotFeedback.percentagePosY *
        this.imageWrapper.offsetHeight / 100 -
        this.hotspotFeedback.pixelOffsetY;

    this.hotspotFeedback.element.style.left = `${posX}px`;
    this.hotspotFeedback.element.style.top = `${posY}px`;
  };

  /**
   * Call callback function once H5P.Question has attached to DOM.
   * @param {function} callback Function to call once DOM is available.
   */
  ImageHotspotQuestion.prototype.callOnceAttached = function(callback) {
    if (typeof callback !== 'function') {
      return; // Invalid arguments
    }

    const observer = new MutationObserver(() => {
      if (this.dom?.isConnected) {
        observer.disconnect();
        callback();
      }
    });

    observer.observe(document, {
      childList: true,
      subtree: true
    });
  };

  /** @constant {number} NO_PARTICULAR_HOTSPOT Clicked on no particular hotspot. */
  ImageHotspotQuestion.NO_PARTICULAR_HOTSPOT = -1;

  /** @constant {number} NOT_CLICKED Not clicked anywhere. */
  ImageHotspotQuestion.NOT_CLICKED = -2;

  return ImageHotspotQuestion;
}(H5P.jQuery, H5P.Question));
