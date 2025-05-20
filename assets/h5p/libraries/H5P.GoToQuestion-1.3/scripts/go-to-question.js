H5P.GoToQuestion = (function ($, EventDispatcher, UI) {
  var KEY_CODE_ENTER = 13;
  var KEY_CODE_SPACE = 32;
  var KEY_CODE_LEFT = 37;
  var KEY_CODE_UP = 38;
  var KEY_CODE_RIGHT = 39;
  var KEY_CODE_DOWN = 40;

  /**
   * Create a new Go To Question!
   *
   * @class H5P.GoToQuestion
   * @extends H5P.EventDispatcher
   * @param {Object} parameters
   */
  function GoToQuestion(parameters) {
    var self = this;

    // Initialize event inheritance
    EventDispatcher.call(self);

    // Clone parameters so that the parameters doesn't get the default values
    parameters = $.extend(true, {}, parameters);

    // Content defaults
    setDefaults(parameters, {
      text: 'Choose your side',
      choices: [
        {
          text: "Dark side",
          goTo: 1
        },
        {
          text: "Light side",
          goTo: 0
        }
      ],
      continueButtonLabel: 'Continue'
    });

    // Private class variables
    var $wrapper;
    var $text;
    var $choices;
    var $chosenText;
    var $continueMsg;
    var $continueButton;

    /**
     * Creates the basic HTML elements that are needed to begin with.
     *
     * @private
     */
    var createHtml = function () {
      // Create question wrapper
      $wrapper = $('<div/>', {
        'class': GoToQuestion.htmlClass + '-wrapper'
      });

      // Create and append question text
      var labelId = getNextId();
      $text = $('<div/>', {
        'class': GoToQuestion.htmlClass + '-text',
        id: labelId,
        html: parameters.text,
        appendTo: $wrapper
      });

      // Create and append choices wrapper
      $choices = $('<ul/>', {
        'class': GoToQuestion.htmlClass + '-choices',
        role: 'group',
        'aria-labelledby': labelId,
        appendTo: $wrapper
      });

      // Append choices to wrapper
      for (var i = 0; i < parameters.choices.length; i++) {
        createChoice(parameters.choices[i], i === 0);
      }

      // Add chosen option text
      $chosenText = $('<div/>', {
        'class': GoToQuestion.htmlClass + '-chosentext'
      });

      // Create continune message
      $continueMsg = $('<div/>', {
        'class': GoToQuestion.htmlClass + '-continuemsg',
        'aria-live': 'polite',
        appendTo: $wrapper
      });

      // Create continue button
      $continueButton = UI.createButton({
        'class': GoToQuestion.htmlClass + '-continue',
        html: parameters.continueButtonLabel,
        title: parameters.continueButtonLabel
      });
    };

    /**
     * Create HTML for choice.
     *
     * @private
     * @param {object} choiceParams
     * @param {string} choiceParams.text
     * @param {int} choiceParams.goTo
     * @param {string} choiceParams.ifChosenText
     * @param {number} isFirst
     */
    var createChoice = function (choiceParams, isFirst) {
      // Wrapper and list element
      var $li = $('<li/>', {
        'class': GoToQuestion.htmlClass + '-choice',
        appendTo: $choices
      });

      // The button for choosing
      var $button = $('<div/>', {
        'class': GoToQuestion.htmlClass + '-button',
        role: 'button',
        'aria-disabled': false,
        html: choiceParams.text,
        on: {
          click: function () {
            choose.call(this, choiceParams);
          },
          keypress: function (event) {
            if (event.which === KEY_CODE_ENTER || event.which === KEY_CODE_SPACE) {
              // Space bar pressed
              choose.call(this, choiceParams);
              event.preventDefault();
            }
          },
          keydown: function (event) {
            var direction;
            switch (event.which) {
              case KEY_CODE_LEFT:
              case KEY_CODE_UP:
                // Prev
                direction = 'previousElementSibling';
                break;

              case KEY_CODE_RIGHT:
              case KEY_CODE_DOWN:
                // Next
                direction = 'nextElementSibling';
                break;
            }

            if (direction && this.parentElement[direction]) {
              // Move focus to prev/next button
              var button = this.parentElement[direction].firstElementChild;
              button.setAttribute('tabindex', '0');
              button.focus();
              this.removeAttribute('tabindex');
              event.preventDefault();
            }
          }
        },
        appendTo: $li
      });
      if (isFirst) {
        $button.attr('tabindex', '0');
      }
    };

    /**
     * Choice chosen.
     *
     * @private
     * @param {object} choiceParams
     * @param {string} choiceParams.text
     * @param {int} choiceParams.goTo
     * @param {string} choiceParams.ifChosenText
     */
    var choose = function (choiceParams) {
      var $button = $(this);
      if ($button.attr('aria-disabled') === 'true') {
        return; // Prevent choosing another option while animation is running
      }

      // Disable all buttons
      var $buttons = $choices.find('.' + GoToQuestion.htmlClass + '-button')
        .attr('aria-disabled', true);

      // Use parent LI as placeholder
      var $li = $button.parent();
      $li.css('height', $li[0].getBoundingClientRect().height);

      // Mark button as chosen and animate
      var buttonStyle = window.getComputedStyle($button[0]);
      var borderWidth = parseFloat(buttonStyle.borderTopWidth);
      $button.addClass(GoToQuestion.htmlClass + '-chosen').css('top', $button[0].offsetTop + borderWidth);

      /**
       * Resets the choices UI
       * @private
       */
      var resetChoices = function () {
        $li.css('height', '');
        $button.removeClass(GoToQuestion.htmlClass + '-chosen').css('top', '');
        $buttons.attr('aria-disabled', false);
      };

      // Animate the choice if we're going to have continue screen
      if (choiceParams.ifChosenText) {
        setTimeout(function () {
          // Start animation
          buttonStyle = window.getComputedStyle($button[0]);
          $button.css('top', $text[0].getBoundingClientRect().height - parseFloat(buttonStyle.paddingTop));
        }, 0);

        // Give some time for the animation to play before we continue
        setTimeout(function () {
          // Show message and continue button before proceeding
          continueScreen(choiceParams.text, choiceParams.ifChosenText, choiceParams.goTo);
          setTimeout(resetChoices, 0);
        }, 250);
      }
      else {
        // No animation, but let the choices stay for a while
        setTimeout(function () {
          // Done
          self.trigger('chosen', choiceParams.goTo);
          setTimeout(resetChoices, 0);
        }, 500);
      }
    };

    /**
     * Displays the continue message and button.
     *
     * @private
     * @param {string} chosenText Text from the chosen option
     * @param {string} continueMsg Message to display before continue
     * @param {number} goTo Where to continue
     */
    var continueScreen = function (chosenText, continueMsg, goTo) {

      // Remove choices
      $choices.detach();

      // Update elements
      $chosenText.html(chosenText).insertBefore($continueMsg);
      $continueMsg.html(continueMsg);
      $continueButton.appendTo($wrapper).on('click', createContinueHandler(goTo)).focus();

      // Makes it easy to re-style the task in this state
      $wrapper.addClass(GoToQuestion.htmlClass + '-continuestate');
    };

    /**
     * Factory function for generating continue button handlers
     *
     * @private
     * @param {number} goTo
     */
    var createContinueHandler = function (goTo) {
      return function () {
        self.trigger('chosen', goTo);
        // Use timeout to avoid flickering
        setTimeout(function () {
          $continueButton.off('click').add($chosenText).detach();
          $continueMsg.html('');

          $choices.insertBefore($continueMsg);
          $wrapper.removeClass(GoToQuestion.htmlClass + '-continuestate');
        }, 1);
      };
    };

    /**
     * Attach the question to the given container.
     *
     * @param {H5P.jQuery} $container
     */
    self.attach = function ($container) {
      if ($wrapper === undefined) {
        // Only create the HTML on the first attach
        createHtml();
      }

      // Add to DOM
      $container.addClass(GoToQuestion.htmlClass).html('').append($wrapper);
    };
  }

  // Extends the event dispatcher
  GoToQuestion.prototype = Object.create(EventDispatcher.prototype);
  GoToQuestion.prototype.constructor = GoToQuestion;

  // Set static html class base
  GoToQuestion.htmlClass = 'h5p-gotoquestion';

  // Counter for creating unique IDs
  var id = 0;

  /**
   * Generate unique page IDs
   */
  var getNextId = function () {
    return GoToQuestion.htmlClass + '-' + (id++);
  };

  /**
   * Simple recusive function the helps set default values without
   * destroying object references.
   *
   * @param {object} params values
   * @param {object} values default values
   */
  var setDefaults = function (params, values) {
    for (var prop in values) {
      if (values.hasOwnProperty(prop)) {
        if (params[prop] === undefined) {
          // Not set, use default
          params[prop] = values[prop];
        }
        else if (params[prop] instanceof Object) {
          if (params[prop] instanceof Array) {
            // Check if array has valid objects
            if (!arrayHasObjects(params[prop], Object.keys(values[prop][0]))) {
              // Empty array, use default options
              params[prop] = values[prop];
            }
          }
          else {
            // Handle object
            setDefaults(params[prop], values[prop]);
          }
        }
      }
    }
  };

  /**
   * Check to see if the array has objects with the required properties.
   * Will strip away empty objects inserted by the editor.
   *
   * @param Array arr
   * @param Array objProps
   * @returns boolean
   */
  var arrayHasObjects = function (arr, objProps) {
    // Reverse traverse to make removal of objects easier
    var i = arr.length;
    while (i--) {
      if (arr[i] instanceof Object && !objectHasProps(arr[i], objProps)) {
        // Missing required object properties, remove from array
        arr.splice(i, 1);
      }
    }
    return !!arr.length;
  };

  /**
   * Checks to see if object has all the specified props.
   *
   * @param Object obj
   * @param Array props
   * @returns boolean
   */
  var objectHasProps = function (obj, props) {
    for (var i = 0; i < props.length; i++) {
      if (obj[props[i]] === undefined) {
        return false;
      }
    }

    // Object had all props
    return true;
  };

  return GoToQuestion;
})(H5P.jQuery, H5P.EventDispatcher, H5P.JoubelUI);
