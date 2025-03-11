var H5P = H5P || {};

(function (Essay) {
  'use strict';

  // CSS Classes
  var MAIN_CONTAINER = 'h5p-essay-input-field';
  var INPUT_LABEL = 'h5p-essay-input-field-label';
  var INPUT_FIELD = 'h5p-essay-input-field-textfield';
  var WRAPPER_MESSAGE = 'h5p-essay-input-field-message-wrapper';
  var CHAR_MESSAGE = 'h5p-essay-input-field-message-char';
  var CHAR_MESSAGE_IMPORTANT = 'h5p-essay-input-field-message-char-important';
  var SAVE_MESSAGE = 'h5p-essay-input-field-message-save';
  var ANIMATION_MESSAGE = 'h5p-essay-input-field-message-save-animation';
  var EMPTY_MESSAGE = '&nbsp;';

  /**
   * @constructor
   * @param {object} params - Parameters.
   * @param {number} [params.inputFieldSize] - Number of rows for inputfield.
   * @param {number} [params.maximumLength] - Maximum text length.
   * @param {string} [params.placeholderText] - Placeholder text for input field.
   * @param {string} [params.remainingChars] - Label for remaining chars information.
   * @param {string} [params.taskDescription] - Task description (HTML).
   * @param {object} [params.previousState] - Content state of previous attempt.
   * @param {object} [callbacks] - Callbacks.
   * @param {function} [callbacks.onInteracted] - Interacted callback.
   */
  Essay.InputField = function (params, callbacks) {
    var that = this;

    this.params = params;
    this.previousState = params.previousState || '';

    // Callbacks
    this.callbacks = callbacks || {};
    this.callbacks.onInteracted = this.callbacks.onInteracted || (function () {});

    // Sanitization
    this.params.taskDescription = this.params.taskDescription || '';
    this.params.placeholderText = this.params.placeholderText || '';

    // Task description
    this.taskDescription = document.createElement('div');
    this.taskDescription.classList.add(INPUT_LABEL);
    this.taskDescription.innerHTML = this.params.taskDescription;

    // InputField
    this.inputField = document.createElement('textarea');
    this.inputField.classList.add(INPUT_FIELD);
    this.inputField.setAttribute('rows', this.params.inputFieldSize);
    if (this.params.maximumLength) {
      this.inputField.setAttribute('maxlength', this.params.maximumLength);
    }
    if (this.params.placeholderText) {
      this.inputField.setAttribute('placeholder', this.params.placeholderText);
    }
    this.setText(this.previousState);
    this.oldValue = this.previousState;

    this.containsText = this.oldValue.length > 0;

    // Interacted listener
    this.inputField.addEventListener('blur', function () {
      if (that.oldValue !== that.getText()) {
        that.callbacks.onInteracted({ updateScore: true });
      }

      that.oldValue = that.getText();
    });

    /*
     * Extra listener required to be used in QuestionSet properly
     */
    this.inputField.addEventListener('input', function () {
      if (
        that.containsText && that.getText().length === 0 ||
        !that.containsText && that.getText().length > 0
      ) {
        that.callbacks.onInteracted();
      }

      that.containsText = that.getText().length > 0;
    });

    this.content = document.createElement('div');
    this.content.appendChild(this.inputField);

    // Container
    this.container = document.createElement('div');
    this.container.classList.add(MAIN_CONTAINER);
    this.container.appendChild(this.taskDescription);
    this.container.appendChild(this.content);

    if (params.statusBar) {
      var statusWrapper = document.createElement('div');
      statusWrapper.classList.add(WRAPPER_MESSAGE);

      this.statusChars = document.createElement('div');
      this.statusChars.classList.add(CHAR_MESSAGE);

      statusWrapper.appendChild(this.statusChars);

      ['change', 'keyup', 'paste'].forEach(function (event) {
        that.inputField.addEventListener(event, function () {
          that.updateMessageSaved('');
          that.updateMessageChars();
        });
      });

      this.statusSaved = document.createElement('div');
      this.statusSaved.classList.add(SAVE_MESSAGE);
      statusWrapper.appendChild(this.statusSaved);

      this.content.appendChild(statusWrapper);

      this.updateMessageChars();
    }
  };

  /**
   * Get introduction for H5P.Question.
   * @return {Object} DOM elements for introduction.
   */
  Essay.InputField.prototype.getIntroduction = function () {
    return this.taskDescription;
  };

  /**
   * Get content for H5P.Question.
   * @return {Object} DOM elements for content.
   */
  Essay.InputField.prototype.getContent = function () {
    return this.content;
  };

  /**
   * Get current text in InputField.
   * @return {string} Current text.
   */
  Essay.InputField.prototype.getText = function () {
    return this.inputField.value;
  };

  /**
   * Disable the inputField.
   */
  Essay.InputField.prototype.disable = function () {
    this.inputField.disabled = true;
  };

  /**
   * Enable the inputField.
   */
  Essay.InputField.prototype.enable = function () {
    this.inputField.disabled = false;
  };

  /**
   * Enable the inputField.
   */
  Essay.InputField.prototype.focus = function () {
    this.inputField.focus();
  };

  /**
   * Set the text for the InputField.
   * @param {string|Object} value - Previous state that was saved.
   */
  Essay.InputField.prototype.setText = function (value) {
    const type = (typeof value);

    if (type === 'undefined') {
      return;
    }

    if (type === 'string') {
      this.inputField.value = value;
    }
    else if (type === 'object' && !Array.isArray(value)) {
      this.inputField.value = value.inputField || '';
    }
  };

  /**
   * Compute the remaining number of characters.
   * @return {number} Number of characters left.
   */
  Essay.InputField.prototype.computeRemainingChars = function () {
    return this.params.maximumLength - this.inputField.value.length;
  };

  /**
   * Update character message field.
   */
  Essay.InputField.prototype.updateMessageChars = function () {
    if (!this.params.statusBar) {
      return;
    }

    if (typeof this.params.maximumLength !== 'undefined') {
      this.setMessageChars(this.params.remainingChars.replace(/@chars/g, this.computeRemainingChars()), false);
    }
    else {
      // Use EMPTY_MESSAGE to keep height
      this.setMessageChars(EMPTY_MESSAGE, false);
    }
  };

  /**
   * Update the indicator message for saved text.
   * @param {string} saved - Message to indicate the text was saved.
   */
  Essay.InputField.prototype.updateMessageSaved = function (saved) {
    if (!this.params.statusBar) {
      return;
    }

    // Add/remove blending effect
    if (typeof saved === 'undefined' || saved === '') {
      this.statusSaved.classList.remove(ANIMATION_MESSAGE);
      //this.statusSaved.removeAttribute('tabindex');
    }
    else {
      this.statusSaved.classList.add(ANIMATION_MESSAGE);
      //this.statusSaved.setAttribute('tabindex', 0);
    }
    this.statusSaved.innerHTML = saved;
  };

  /**
   * Set the text for the character message.
   * @param {string} message - Message text.
   * @param {boolean} important - If true, message will added a particular CSS class.
   */
  Essay.InputField.prototype.setMessageChars = function (message, important) {
    if (!this.params.statusBar) {
      return;
    }

    if (typeof message !== 'string') {
      return;
    }

    if (message === EMPTY_MESSAGE || important) {
      /*
       * Important messages should be read for a readspeaker by caller and need
       * not be accessible when tabbing back again.
       */
      this.statusChars.removeAttribute('tabindex');
    }
    else {
      this.statusChars.setAttribute('tabindex', 0);
    }

    this.statusChars.innerHTML = message;
    if (important) {
      this.statusChars.classList.add(CHAR_MESSAGE_IMPORTANT);
    }
    else {
      this.statusChars.classList.remove(CHAR_MESSAGE_IMPORTANT);
    }
  };

})(H5P.Essay);
