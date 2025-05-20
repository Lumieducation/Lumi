var H5P = H5P || {};

H5P.FreeTextQuestion = (function (EventDispatcher, $, CKEditor) {
  var counter = 0;

  /**
   * @param       {Object}  params    The parameters
   * @param       {number}  contentId Content ID
   * @param       {Object}  extras    Extra parameters
   * @constructor
   */
  function FreeTextQuestion(params, contentId, extras) {
    EventDispatcher.call(this);

    var self = this;
    var textAreaID = 'h5p-text-area-' + counter;
    counter++;
    var isEditing = (window.H5PEditor !== undefined);
    var attached;
    var textarea;
    var useCK = false;
    params = $.extend({
      question: 'Question or description',
      placeholder: 'Enter your response here',
      maxScore: 1,
      isRequired: false,
      i10n: {
        requiredText: 'required',
        requiredMessage: 'This question requires an answer',
        skipButtonLabel: 'Skip Question',
        submitButtonLabel: 'Answer and proceed',
        language: 'en'
      }
    }, params);

    self.isTask = true;


    var getPreviousAnswer = function () {
      return (extras !== undefined && extras.previousState !== undefined) ? extras.previousState : '';
    };

    var ckEditor = new CKEditor(textAreaID, params.i10n.language, extras.parent.$container, getPreviousAnswer());

    /**
     * Create the open ended question element
     * @returns {HTMLElement} Wrapper for open ended question
     */
    var createOpenEndedQuestion = function () {
      self.wrapper = document.createElement('div');
      self.wrapper.classList.add('h5p-free-text-question');

      self.wrapper.appendChild(createTextWrapper());
      self.wrapper.appendChild(createInputWrapper());
      self.wrapper.appendChild(createRequiredMessageWrapper());
      self.wrapper.appendChild(createFooter());
      return self.wrapper;
    };

    /**
     * Create the wrapping element for the question text
     * @returns {HTMLElement} Question
     */
    var createTextWrapper = function () {
      self.textWrapper = document.createElement('div');
      self.textWrapper.classList.add('h5p-free-text-question-text-wrapper');

      var text = document.createElement('div');
      text.classList.add('h5p-free-text-question-text');
      text.setAttribute('tabindex', 0);
      text.setAttribute('aria-label', params.question);
      text.innerHTML = params.question;

      if (params.isRequired == true) {
        var requiredText = document.createElement('div');
        requiredText.classList.add('h5p-free-text-question-required-text');
        requiredText.innerHTML = '*' + params.i10n.requiredText;
        self.textWrapper.appendChild(requiredText);
      }

      self.textWrapper.appendChild(text);

      return self.textWrapper;
    };

    /**
     * Create the wrapping element for the input
     * @returns {HTMLElement} Input
     */
    var createInputWrapper = function () {
      self.$inputWrapper = $('<div/>', {
        'class': 'h5p-free-text-question-input-wrapper'
      });

      textarea = document.createElement('div');
      textarea.classList.add('h5p-free-text-question-input');
      textarea.setAttribute('tabindex', 0);
      textarea.addEventListener('focus', function (event) {
        event.target.click();
      });
      textarea.addEventListener('keydown', function (event) {
        // Avoid playing/pausing IV using shortcuts
        event.stopPropagation();
      });
      textarea.id = textAreaID;

      var content;
      // Don't load CKEditor if in editor
      // (will break the ckeditor provided by the H5P editor)
      if (!isEditing) {
        textarea.addEventListener('click', function () {
          createXAPIEvent('interacted', true);

          useCK = (textarea.offsetHeight > 135);

          // Don't use CK if it is no room for it
          if (useCK) {
            ckEditor.create();
          }
          else {
            textarea.contentEditable = true;
            textarea.focus();
          }
        });

        content = getResponse();
      }

      textarea.innerHTML = content ? content : getPreviousAnswer();
      textarea.setAttribute('placeholder', params.placeholder);

      self.$inputWrapper.append(textarea);

      return self.$inputWrapper.get(0);
    };


    /**
     * Create the wrapping element for the warning message
     * @returns {HTMLElement} Warning message
     */
    var createRequiredMessageWrapper = function () {
      self.requiredMessageWrapper = document.createElement('div');
      self.requiredMessageWrapper.classList.add('h5p-free-text-question-required-wrapper');

      var requiredMessage = document.createElement('div');
      requiredMessage.classList.add('h5p-free-text-question-required-message');
      requiredMessage.innerHTML = params.i10n.requiredMessage;

      var requiredButton = document.createElement('button');
      requiredButton.classList.add('h5p-free-text-question-required-exit');
      if (!isEditing) {
        requiredButton.addEventListener('click', function () {
          hideRequiredMessage();
        });
      }

      self.requiredMessageWrapper.appendChild(requiredMessage);
      self.requiredMessageWrapper.appendChild(requiredButton);

      // Hide on creation
      hideRequiredMessage();

      return self.requiredMessageWrapper;
    };

    var getResponse = function () {
      if (useCK) {
        return ckEditor.getData();
      }

      return textarea.innerHTML;
    };

    /**
     * Create the footer and associated buttons
     * @returns {HTMLElement} Footer
     */
    var createFooter = function () {
      self.footer = document.createElement('div');
      self.footer.classList.add('h5p-free-text-question-footer');

      self.submitButton = document.createElement('button');
      self.submitButton.classList.add('h5p-free-text-question-button-submit');
      self.submitButton.type = 'button';
      self.submitButton.innerHTML = params.i10n.submitButtonLabel;

      if (!isEditing) {
        self.submitButton.addEventListener('click', function () {
          if (params.isRequired && getResponse().length === 0) {
            showRequiredMessage();
          }
          else {
            createXAPIEvent('answered', true);
            self.trigger('continue');
          }
        });
      }

      // Create a 'skip button' if we are allowed to
      if (params.isRequired == false) {
        self.skipButton = document.createElement('button');
        self.skipButton.classList.add('h5p-free-text-question-button-skip');
        self.skipButton.type = 'button';
        self.skipButton.innerHTML = params.i10n.skipButtonLabel;

        if (!isEditing) {
          self.skipButton.addEventListener('click', function () {
            self.trigger('continue');
          });
        }

        self.footer.appendChild(self.skipButton);
      }

      self.footer.appendChild(self.submitButton);

      return self.footer;
    };

    var showRequiredMessage = function () {
      self.requiredMessageWrapper.classList.remove('h5p-free-text-question-hidden');
    };

    var hideRequiredMessage = function () {
      self.requiredMessageWrapper.classList.add('h5p-free-text-question-hidden');
    };

    /**
     * xAPI event template builder
     *
     * @param  {String} type    Type of event
     * @param  {boolean} trigger Whether the event should be triggered
     * @return {Object}         xAPI event object
     */
    var createXAPIEvent= function (type, trigger) {
      var xAPIEvent = self.createXAPIEventTemplate(type);

      // Add question to the definition of the xAPI statement
      var definition = xAPIEvent.getVerifiedStatementValue(['object', 'definition']);
      $.extend(definition, getXAPIDefinition(params.question));

      if (type === 'answered') {
        xAPIEvent.setScoredResult(null, params.maxScore, self);

        // Set the raw score to undefined, since null is not allowed, and we can't
        // return undefined in getScore because then core won't add the result
        xAPIEvent.data.statement.result.score.raw = undefined;

        // Add the response to the xAPI statement
        // Return a stored user response if it exists
        xAPIEvent.data.statement.result.response = getResponse();
      }

      if (trigger) {
        self.trigger(xAPIEvent);
      }

      return xAPIEvent;
    };

    /**
     * Create a definition template
     * @param {String} question Question
     * @returns {Object} xAPI definition template
     */
    var getXAPIDefinition = function (question) {
      var definition = {};

      definition.interactionType = 'fill-in';
      definition.type = 'http://adlnet.gov/expapi/activities/cmi.interaction';
      definition.description = {
        'en-US': question // We don't know the language at runtime
      };
      definition.extensions = {
        'https://h5p.org/x-api/h5p-machine-name': 'H5P.FreeTextQuestion'
      };

      return definition;
    };

    /**
     * Get xAPI data.
     * Contract used by report rendering engine.
     *
     * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-6}
     * @returns {Object} xAPI data statement
     */
    self.getXAPIData = function () {
      var XAPIEvent = createXAPIEvent('answered', false);

      return {
        statement: XAPIEvent.data.statement
      };
    };

    /**
     * Used for contracts.
     * The current score will always be null until it has been graded in a report.
     * We use null instead of 0 to keep track of which open ended questions have
     * not been graded yet.
     *
     * @method getScore
     * @public
     * @returns {Number} The current score.
     */
    self.getScore = function () {
      return null;
    };

    /**
     * Used for contracts.
     * Checks the maximum score for this task.
     *
     * @method getMaxScore
     * @public
     * @returns {Number} The maximum score.
     */
    self.getMaxScore = function () {
      return params.maxScore;
    };

    /**
     * Listen to resize events in order to use smaller buttons
     * @returns {undefined}
     */
    var resize = function () {
      if (!attached) {
        return;
      }

      // Make it big, and then check if it has room for it
      self.submitButton.classList.remove('truncated');
      self.submitButton.innerHTML = params.i10n.submitButtonLabel;

      if (self.skipButton) {
        self.skipButton.classList.remove('truncated');
        self.skipButton.innerHTML = params.i10n.skipButtonLabel;
      }

      var $footer = $(self.footer);
      var footerPadding = parseInt($footer.css("padding-right"));
      // Magic number "4" is needed because of pixel rounding
      var footerWidth = $footer.innerWidth() - (footerPadding * 2) - 4;
      var skipWidth = self.skipButton ? $(self.skipButton).outerWidth() : 0;
      var submitWidth = $(self.submitButton).outerWidth();

      // Remove text for submit button
      if (skipWidth + submitWidth > footerWidth) {
        self.submitButton.classList.add('truncated');
        self.submitButton.innerHTML = '';
      }

      if (self.skipButton) {
        submitWidth = $(self.submitButton).outerWidth();
        if (skipWidth + submitWidth > footerWidth) {
          self.skipButton.classList.add('truncated');
          self.skipButton.innerHTML = '';
        }
      }

      // resize CkEditor
      resizeCKEditor();
    };

    /**
     * Resize the CK Editor
     * @returns {undefined}
     */
    var resizeCKEditor = function () {
      // Do nothing if I am not visible
      if (self.$container.is(':visible')) {
        ckEditor.resize(undefined, self.$inputWrapper.height()-4);
      }
    };

    /**
     * Attach function called by H5P framework to insert H5P content into
     * page
     *
     * @param {jQuery} $container H5P Container the open ended question will be attached to
     * @returns {null} null
     */
    self.attach = function ($container) {
      self.$container = $container;

      $container.get(0).classList.add('h5p-free-text-question-wrapper');
      $container.append(self.wrapper);

      attached = true;
    };

    /**
     * Returns the current state
     * @returns {string} Current state
     */
    self.getCurrentState = function () {
      return getResponse();
    };

    // Create the HTML:
    createOpenEndedQuestion();

    // Setup events
    ckEditor.on('created', resize);
    self.on('resize', ckEditor.trigger.bind(ckEditor, 'resize'));
    self.on('resize', resize);
    self.on('hide', ckEditor.destroy.bind(ckEditor));
  }

  // Extends the event dispatcher
  FreeTextQuestion.prototype = Object.create(EventDispatcher.prototype);
  FreeTextQuestion.prototype.constructor = FreeTextQuestion;

  return FreeTextQuestion;
})(H5P.EventDispatcher, H5P.jQuery, H5P.CKEditor);
