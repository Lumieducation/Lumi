/**
    @namespace H5P
*/
var H5P = H5P || {};



H5P.PersonalityQuiz = (function ($, EventDispatcher) {
  /**
    A personality quiz.

    @memberof PersonalityQuiz
    @param {Object} params
    @param {number} id
    @constructor
  */
  function PersonalityQuiz(params, id) {
    var self = this;

    self.classPrefix = 'h5p-personality-quiz-';
    self.resultAnimation = params.resultScreen.animation;
    self.resultTitle = params.resultScreen.displayTitle;
    self.resultDescription = params.resultScreen.displayDescription;
    self.resultImagePosition = params.resultScreen.imagePosition;
    self.progressText = params.progressText;
    self.personalities = params.personalities;
    self.numQuestions = params.questions.length;

    self.slidePercentage = 100 / self.numQuestions;

    var loadingImages = [];

    // NOTE (Emil): These constants are defined in pixels.
    var responsiveColumnThreshold = 450;
    var minimumHeight = 400;

    var canvas = {
      classname: classes('wheel'),
      width: 300,
      height: 300,
    };

    var $content = $('.h5p-content');

    var body = document.querySelector('body');
    var animation = ((body.style.animationName !== undefined) && params.animation);

    var resizeEventHandler = null;

    EventDispatcher.call(self);

    /**
      Wrapper around H5P.getPath so as not to need id everywhere.

      @param {string} path
      @return {string} Full path for the resource.
    */
    function _getPath(path) {
      return H5P.getPath(path, id);
    }

    /**
      Prefix a classname with self.classPrefix.

      @param {string} className
      @param {boolean} addDot If true adds '.' to the start of the start of the class name.
      @return {string}
    */
    function prefix(className, addDot) {
      var prefixed = self.classPrefix + className;

      if (addDot) {
        prefixed = '.' + prefixed;
      }

      return prefixed;
    }

    /**
      Prefixes all arguments with self.classPrefix.

      @return {string} A string with all prefixed class names passed to the function separated by spaces.
    */
    function classes() {
      var args = Array.prototype.slice.call(arguments);
      var classNames = 'h5p-personality-quiz';

      args.forEach(function (argument) {
        classNames += ' ' + prefix(argument);
      });

      return classNames;
    }

    /**
      Interpolates a string, looping over the properties of variables
      and replaces instances of '@' + property name with the value of the property.

      @param {string} str
      @param {Object} variables
      @return {string}
    */
    function interpolate(str, variables) {
      var keys = Object.keys(variables);

      keys.forEach(function (key) {
        str = str.replace('@' + key, variables[key]);
      });

      return str;
    }

    /**
      Creates an element of 'type' and adds the attributes in the object 'attributes'.
      In addition some general styles are added to the element.

      @param {string} type - name of an element type.
      @param {Object} attributes
      @returns {jQuery} - The new button element.
    */
    function createButton(type, attributes) {
      var $button = $('<' + type + '>', attributes);

      $button.css({
        'border-left': '5px solid #' + params.buttonColor,
        'background': 'linear-gradient(to right, #' + params.buttonColor + ' 50%, rgb(233, 239, 247) 50%)',
        'background-size': '200% 100%',
        'background-position': '100%'
      });

      return $button;
    }

    /**
      Takes a callback and creates a listener for on the button for
      the click event. The logic for calling the callback is determined
      by the avilability of animation.

      @param {jQuery} $element
      @param {listenerCallback}
    */
    function addButtonListener($element, callback) {
      if (animation) {
        $element.click(function () {
          $(this).addClass(prefix('button-animate'));
        });
        $element.on('animationend', function () {
          $(this).removeClass(prefix('button-animate'));
          callback();
        });
      }
      else {
        $element.click(function () {
          callback();
        });
      }
    }

    /**
      Creates a canvas element and returns a canvas element.

      @return {jQuery}
    */
    function createCanvas() {
      var $wrapper = $('<div>', {
        'class': classes('wheel-container slide')
      });

      var $canvas = $('<canvas>', {
        'class': canvas.classname,
      });

      self.$canvas = $canvas;

      $wrapper.append($canvas);

      return $wrapper;
    }

    /**
      Entry point for creating the entire personality quiz ui.

      @param {PersonalityQuiz} quiz A personality quiz instance
      @param {Object[]} data The params received from H5P
      @return {jQuery}
    */
    function createQuiz(quiz, data) {
      var $container, $slides, $bar, $title, $question, $canvas, $result;

      $container = $('<div>', { 'class': classes('container') });
      $slides    = $('<div>', { 'class': classes('slides') });
      $bar       = createProgressbar();

      if (!data.titleScreen.skip) {
        $title = createTitleCard(quiz, data.titleScreen, data.startText);
        $slides.append($title);
      }

      data.questions.forEach(function (question) {
        $question = createQuestion(quiz, question);

        $slides.append($question);
      });

      if (animation && self.resultAnimation === 'wheel') {
        $canvas = createCanvas();

        $slides.append($canvas);
      }

      $result = createResult(quiz, data.resultScreen, data.retakeText);

      $slides.append($result);
      $container.append($bar, $slides);

      quiz.$progressbar = $bar;

      if (data.titleScreen.skip) {
        quiz.$progressbar.show();
      }

      quiz.$progressText = $bar.children(prefix('progress-text', true));
      quiz.$wrapper = $container;
      quiz.$slides = $slides.children();
      quiz.$result = $result;

      return $container;
    }

    /**
      Create a progress bar for the quiz

      @return {jQuery}
    */
    function createProgressbar() {
      var $bar, $text, text;

      $bar = $('<div>', { 'class': classes('progressbar') });

      $bar.css({
        'background': 'linear-gradient(to right, #' + params.progressbarColor + ' 50%, rgb(60, 62, 64) 50%)',
        'background-size': '200% 100%',
        'background-position': '100%'
      });

      $bar.hide();

      $text = $('<p>', { 'class': classes('progress-text') });

      text = interpolate(self.progressText, {
        'question': self.answered + 1,
        'total': self.numQuestions
      });

      $text.html(text);

      if (animation) {
        $bar.css('transition', 'background-position 1s');
      }

      $bar.append($text);

      return $bar;
    }

    /**
      Create the title screen.

      @param {PersonalityQuiz} quiz A personality quiz instance
      @param {Object} data          The params received from H5P
      @param {string} startText     The UI text for the start button
      @return {jQuery}
    */
    function createTitleCard(quiz, data, startText) {
      var $card, $content, $title, $wrapper, $startButton, path, hasImage;

      hasImage = data.image.file ? true : false;

      $card = $('<div>', { 'class': classes('title-card', 'slide', 'background') });
      $content = $('<div>', { 'class': classes('title-card-wrapper') });
      $title = $('<h2>', {
        html: data.title.text,
        'class': classes('title')
      });

      if (hasImage) {
        path = _getPath(data.image.file.path);

        $card.css('background-image', 'url(' + path + ')');
      }

      $wrapper = $('<div>', { 'class': classes('start-button-wrapper') });
      $startButton = createButton('button', {
        'class': classes('start-button', 'button'),
        'html': startText,
        'type': 'button'
      });

      addButtonListener($startButton, function () {
        quiz.trigger('personality-quiz-start');
      });

      $wrapper.append($startButton);
      $content.append($title, $wrapper);
      $card.append($content);

      return $card;
    }

    /**
      Creates a question for the quiz.

      @param {PersonalityQuiz} quiz
      @param {Object} question A question instance from params
      @return {jQuery}
    */
    function createQuestion(quiz, question) {
      var $slide, $text, $image, $answer;
      var path, deferred, images, createAnswerButton;

      $slide = $('<div>', { 'class': classes('question', 'slide') });
      $text = $('<h2>', {
        'class': classes('question-text'),
        'html': question.text
      });

      if (question.image.file) {
        path = _getPath(question.image.file.path);

        $image = $('<img>', {
          'class': classes('question-image'),
          'src': path
        });

        deferred = $.Deferred();
        $image.on('load', function () {
          deferred.resolve();
        });
        loadingImages.push(deferred.promise());

        $slide.append($image);
      }

      $slide.append($text);

      // NOTE (Emil): We only make the answers show images if all the alternatives have images.
      images = true;
      question.answers.forEach(function (answer) { images = images && answer.image.file !== undefined; });

      createAnswerButton = images ? createImageAnswer : createAnswer;

      $answer = createAnswerButton(question.answers, quiz.answerListener);

      $slide.append($answer);

      return $slide;
    }

    /**
      Get the number of columns per row for image answers.

      @return {number} The number of columns based on $container width and the responseColumnThreshold.
    */
    function getNumColumns() {
      return (self.$container.width() < responsiveColumnThreshold) ? 2 : 3;
    }

    /**
      Add or remove rows if there are respectively too few or too many rows.

      @param {jQuery} $container
      @param {jQuery} $rows
      @param {number} rowCount
    */
    function checkRows($container, $rows, rowCount) {
      var $row, $extra;

      $extra = $rows.slice(rowCount);
      $extra.remove();

      while ($rows.length < rowCount) {
        $row = createRow();
        $container.append($row);

        $rows = $container.children();
      }
    }

    /**
      Attaches $elements to the $rows in the $container.

      @param {jQuery} $container
      @param {jQuery} $elements
      @param {number} columns decides how many elements go in each row.
      @param {number} [height] An optional height value for the row.
    */
    function attachRows($container, $elements, columns) {
      var $rows = $container.children(prefix('row', true));

      $rows.each(function (index) {
        var $row = $(this);
        var start = (index) * columns;
        var end = start + columns;

        $row.append($elements.slice(start, end));
      });
    }

    /**
      Creates a list element with the 'h5p-personality-quiz-row' class.

      @return {jQuery}
    */
    function createRow() {
      return $('<li>', { 'class': classes('row') });
    }

    /**
      Creates an answer with an image attached.

      @param {Object} answer
      @param {listenerCallback} listener
      @return {jQuery}
    */
    function createImageAnswer(answers, listener) {
      var $wrapper, $answers, $row, $elements;

      var columns = getNumColumns();
      var rowCount = answers.length / columns;
      var row = 0;

      $wrapper  = $('<div>', { 'class': classes('answers-wrapper') });
      $answers  = $('<ul>',  { 'class': classes('image-answers') });

      $elements = answers.map(function (answer) {
        var $answer, $button, $image;
        var path = _getPath(answer.image.file.path);

        $answer = $('<div>', {
          'class': classes('column', 'columns-' + String(columns)),
          'data-personality': answer.personality
        });

        $button = createButton('div', {
          'class': classes('button', 'image-answer-button'),
          'html': answer.text
        });

        $image = $('<div>', {
          'class': classes('image-answer-image')
        });
        $image.css('background-image', 'url(' + path + ')');

        $answer.append($image, $button);
        $answer.click(listener);

        return $answer;
      });

      for (row = 0; row < rowCount; row++) {
        $row = createRow();

        $answers.append($row);
      }

      attachRows($answers, $elements, columns);

      $wrapper.append($answers);

      return $wrapper;
    }

    /**
      Creates a button for the answer element.

      @param {Object} answer
      @param {listenerCallback} listener
      @return {jQuery}
    */
    function createAnswer(answers, listener) {
      var $wrapper  = $('<div>', { 'class': classes('answers-wrapper') });
      var $answers  = $('<ul>',  { 'class': classes('answers')         });

      $answers.click(listener);

      answers.forEach(function (answer) {
        var $answer = createButton('li', {
          'data-personality': answer.personality,
          'class': classes('button', 'answer'),
          'html': answer.text
        });

        $answers.append($answer);
      });

      $wrapper.append($answers);

      return $wrapper;
    }

    /**
      Creates the slide for showing the result at the end of the quiz.

      @param {PersonalityQuiz} quiz A PersonalityQuiz instance
      @param {Object} data The params received from H5P
      @param {string} retakeText The UI text for the button to retake the quiz
      @return {jQuery}
    */
    function createResult(quiz, data, retakeText) {
      var $result    = $('<div>', { 'class': classes('result', 'slide')       });
      var $wrapper   = $('<div>', { 'class': classes('personality-wrapper')   });
      var $container = $('<div>', { 'class': classes('retake-button-wrapper') });
      var $button    = createButton('button', {
        'html': retakeText,
        'class': classes('button', 'retake-button'),
        'type': 'button'
      });

      addButtonListener($button, function () {
        quiz.trigger('personality-quiz-restart');
      });

      $container.append($button);

      quiz.$resultWrapper = $wrapper;

      $result.append($wrapper);
      $result.append($container);

      return $result;
    }

    /**
      Sets the background image of the personality slide the the image
      associated with the personality.

      @param {jQuery} $result The result slide to set the background on
      @param {Object} personality
    */
    function setPersonalityBackgroundImage($result, $personality, personality) {
      var path = _getPath(personality.image.file.path);
      var classNames = [
        prefix('background'),
        prefix('center-personality-wrapper'),
      ];

      $result.css('background-image', 'url(' + path + ')');
      $result.addClass(classNames.join(' '));

      $personality.addClass(prefix('center-personality'));
    }

    /**
      Create an element only if the passed expression evaluates to 'true'.

      @param {boolean} expression
      @param {string} element The tag for the element to be created.
      @param {Object} attributes Attributes to set on the created element.
      @return {jQuery}
    */
    function createIf(expression, element, attributes) {
      var $element = null;

      if (expression) {
        $element = $(element, attributes);
      }

      return $element;
    }


    /**
      Sets the height of the inline personality image.

      @param {jQuery} $wrapper
      @param {jQuery} $personality
      @param {jQuery} $image
    */
    function setInlineImageHeight ($image, $personality, $resultWrapper) {
      var height;

      if (!$image) {
        return;
      }

      $image.hide();

      height = $resultWrapper.outerHeight() - $personality.outerHeight(true);

      $image.css({'height': 'calc(' + height + 'px - 4 * 1em)'});
      $image.show();
    }

    /**
      Appends the personality information to the result slide.

      @param {PeronalityQuiz} quiz
      @param {Object} personality
      @param {boolean} hasTitle
      @param {boolean} hasImage
      @param {boolean} hasDescription
    */
    function appendPersonality(quiz, personality, hasTitle, hasImage, hasDescription) {
      var $personality, $title, $description, $image;

      $title = createIf(hasTitle, '<h2>', { 'html': personality.name });

      if (personality.image.file) {
        $image = createIf(hasImage, '<img>', {
          'class': classes('result-image'),
          'src': _getPath(personality.image.file.path),
          'alt': personality.image.alt
        });
      }

      $description = createIf(hasDescription, '<p>', {
        'html': personality.description
      });

      // NOTE (Emil): We only create $personality element if it has at least
      // one child element.
      if (hasTitle || hasImage || hasDescription) {
        $personality = $('<div>', { 'class': classes('personality') });

        $personality.append($title);
        $personality.append($image);
        $personality.append($description);
      }

      quiz.$resultWrapper.append($personality);

      setInlineImageHeight($image, $personality, quiz.$resultWrapper);

      return $personality;
    }

    /**
      The click event listener if animations are enabled.

      @param {jQuery} $button
      @param {Object[]} personalities The list of personalities associated with the $button
    */
    function animatedButtonListener($button, personalities) {
      var animationClass = prefix('button-animate');

      $button.addClass(animationClass);
      $button.on('animationend', function () {
        $(this).removeClass(animationClass);
        $(this).off('animationend');
        self.trigger('personality-quiz-answer', personalities);
      });
    }

    /**
      Click event handler for disabled animation option.

      @param {jQuery}
      @param {Object[]} personalities The personalities associated with the $button
    */
    function nonAnimatedButtonListener($button, personalities) {
      self.trigger('personality-quiz-answer', personalities);
    }


    /**
      Resize the questions with image answers.
    */
    function resizeColumns($quiz) {
      var rowCount, columns;
      var $answers, $rows;

      columns = getNumColumns();

      $answers = $quiz.find(prefix('image-answers', true));
      $answers.each(function () {
        var $answer, $slide, $alternatives;

        $answer = $(this);
        $rows = $answer.children(prefix('row', true));
        $alternatives = $rows.children(prefix('column', true));

        // NOTE (Emil): Remove the answer-images from the DOM so we can
        // calculate the new column width.
        $alternatives = $alternatives.detach();

        rowCount = Math.ceil($alternatives.length / columns);

        checkRows($answer, $rows, rowCount);

        if (!$alternatives.hasClass(prefix('columns-' + columns))) {
          $alternatives.toggleClass(classes('columns-2', 'columns-3'));
        }

        attachRows($answer, $alternatives, columns);

        // NOTE (Emil): Update the selection after changes.
        $rows = $answer.children(prefix('row', true));
        $slide = $answer.parent().parent();
        var titleHeight = $slide.children(prefix('question-text', true)).outerHeight(true) || 0;
        var imageHeight = $slide.children(prefix('question-image', true)).outerHeight(true) || 0;

        var height = $slide.height() - (titleHeight + imageHeight);

        setAnswerImageHeight($rows, height / $rows.length);
      });
    }

    /**
      Resize the result screen.
    */
    function resizeResult($quiz) {
      var $wrapper, $personality, $image;

      $wrapper = self.$resultWrapper;
      $personality = $quiz.find(prefix('personality'));
      $image = $quiz.find(prefix('result-image'));

      setInlineImageHeight($image, $personality, self.$resultWrapper);
    }

    /**
      Resize event handler.

      @param {Object} event The resize event object.
    */
    function resize() {
      resizeColumns(self.$wrapper);
      resizeResult(self.$wrapper);
    }

    /**
      Calculate and set the height of the slides in the quiz.

      @param {Object} self The quiz object
      @param {jQuery} $quiz The container for the entire quiz
    */
    function setQuizHeight(self, $quiz) {
      var height = 0;

      self.$slides.each(function (index, element) {
        var $slide, $image;
        var h = 0;

        $slide = $(element);
        $image = $slide.children(prefix('question-image', true));

        $image.hide();

        if (this.clientHeight > height)
        {
          h = $(this).height();

          if ($image) { h = h * 1.3; }

          height = h;
        }

        $image.show();
      });

      height = Math.max(height, minimumHeight);

      $quiz.height(height);

      self.height = height;
    }

    /**
      Set the height of all images attached to answer alternatives.

      @param {jQuery} $quiz The root of the quiz
    */
    function setAnswerImageHeight($rows, maxRowHeight) {
      var ratio = 9.0 / 16.0;
      var numColumns = getNumColumns();

      $rows.each(function () {
        var imageHeight, heights, width;
        var $row, $columns, $buttons, $images;

        $row = $(this);
        $columns = $row.children();

        $buttons = $columns.children(prefix('image-answer-button', true));
        $images = $columns.children(prefix('image-answer-image', true));

        width = (self.$wrapper.width() / numColumns);
        imageHeight = Math.floor(width * ratio);

        heights = $buttons.map(function (i, e) {
          var $e = $(e);

          $e.css('height', ''); // NOTE (Emil): Unset previous height calculations.

          return $e.height();
        });

        $buttons.height(Math.max.apply(null, heights));
        $images.height(imageHeight);

        // If the size of the containing box is larger than the limit set by
        // maxRowHeight we subtract the difference from the height of the image.
        if (maxRowHeight && $columns.outerHeight() > maxRowHeight) {
          imageHeight -= ($columns.outerHeight() - maxRowHeight);

          $images.height(imageHeight);
        }
      });
    }

    /**
      Internal attach function. Creates the quiz, calculates the height
      the quiz needs to be and starts canvas rendering if the
      wheel of fortune animation is enabled.

      @param {jQuery} $container
    */
    function attach($container) {
      loadingImages = [];

      self.reset();

      var $quiz = createQuiz(self, params);

      $container.append($quiz);

      // NOTE (Emil): We only want to do the work for a resize event once.
      // Only the resize event call that survives 100 ms is called.
      $(window).resize(function () {
        clearTimeout(resizeEventHandler);
        resizeEventHandler = setTimeout(resize, 100);
      });

      // NOTE (Emil): Wait for images to load, if there are any.
      // If there aren't any images to wait for this function is called immediately.
      $.when.apply(null, loadingImages).done(function () {
        setAnswerImageHeight($quiz.find(prefix('row', true)));
        setQuizHeight(self, $quiz);

        if (animation && params.resultScreen.animation === 'wheel') {
          canvas.width = $container.width() * 0.8;
          canvas.height = $container.height();

          self.wheel = new PersonalityQuiz.WheelAnimation(
            self,
            self.personalities,
            canvas.width,
            canvas.height,
            _getPath
          );
        }

        self.trigger('resize');
      });
    }

    /**
      Required function for interacting with H5P.

      @param {jQuery} $container The parent element for the entire quiz.
    */
    self.attach = function ($container) {
      if (self.$container === undefined) {
        self.$container = $container;

        attach(self.$container);
      }
    };

    /**
      Sets the result of the personality quiz. Creates the missing
      elements for the result screen and sets the result on the wheel
      of fortune animation if it is enabled.

      @param {Object} personality
    */
    self.setResult = function (personality) {
      var $personality;
      var backgroundImage = (personality.image.file) && self.resultImagePosition === 'background';
      var inlineImage     = (personality.image.file) && self.resultImagePosition === 'inline';

      if (self.$canvas) {
        self.wheel.attach(self.$canvas[0]);
        self.wheel.setTarget(personality);
        self.wheel.animate();
      }

      $personality = appendPersonality(
        self,
        personality,
        self.resultTitle,
        inlineImage,
        self.resultDescription
      );

      if (backgroundImage) {
        setPersonalityBackgroundImage(self.$result, $personality, personality);
      }
    };

    /**
      Searches the personalities for the one with the highest 'count'
      property. In the case of a tie the first element with the shared
      highest 'count' is selected.

      @return {Object} The result personality of the quiz
    */
    self.calculatePersonality = function () {
      var max = self.personalities[0].count;
      var index = 0;

      self.personalities.forEach(function (personality, i) {
        if (max < personality.count) {
          max = personality.count;
          index = i;
        }
      });

      return self.personalities[index];
    };

    /**
      Updates the progressbar. Moves the background gradient based
      on the number of questions answered and updates the text
      with the current question number and the question total.
    */
    self.updateProgress = function () {
      var percentage = 100 - (self.answered) * self.slidePercentage;

      var text = interpolate(self.progressText, {
        'question': self.answered + 1,
        'total': self.numQuestions
      });

      self.$progressbar.css('background-position', String(percentage) + '%');
      self.$progressText.html(text);
    };


    /**
      Moves to the next slide. Toggles visiblity of slides and
      triggers 'personality-quiz-completed' event upon completion.
    */
    self.next = function () {
      var answeredAllQuestions = (self.answered === self.numQuestions);

      var $prev = self.$slides.eq(self.index);
      var $curr = self.$slides.eq(self.index + 1);

      $prev.hide();
      $curr.show();

      self.index = self.index + 1;

      if ($curr.hasClass(prefix('question'))) {
        self.updateProgress(self.index);
      }

      if (!self.completed && answeredAllQuestions) {
        self.trigger('personality-quiz-completed');
      }
    };

    /**
      The click event listener used for all buttons associated with an answer
      to a question in the personality quiz.

      @param {Object} event
    */
    self.answerListener = function (event) {
      var $target, $button;
      var isImage, isButton, buttonListener, personalities;

      $target = $(event.target);
      $button = $target;

      isImage = $target.hasClass(prefix('image-answer-image'));
      isButton = $target.hasClass(prefix('image-answer-button'));

      buttonListener = animatedButtonListener;

      $button = isImage ? $target.siblings().eq(0) : $button;
      $target = (isButton || isImage) ? $target.parent() : $target;

      personalities = $target.attr('data-personality');

      if (personalities) {
        buttonListener  = animation ? animatedButtonListener : nonAnimatedButtonListener;

        buttonListener($button, personalities);

        $target.parent(prefix('answers')).off('click');
      }
    };

    /**
      Zeros out all personality quiz state variables.
    */
    self.reset = function () {
      self.personalities.map(function (e) { e.count = 0; });
      self.index = 0;
      self.answered = 0;
      self.completed = false;
    };

    /**
      Event handler for the personality quiz start event. Makes the
      progressbar visible and goes to the next slide.
    */
    self.on('personality-quiz-start', function () {
      self.$progressbar.show();
      self.next();
    });

    /**
      Event handler for the personality quiz answer event. Counts
      up all personalities in the answer matching the given personalities.
    */
    self.on('personality-quiz-answer', function (event) {
      var answers;

      if (event !== undefined && event.data !== undefined) {
        answers = event.data.split(', ');

        answers.forEach(function (answer) {
          self.personalities.forEach(function (personality) {
            if (personality.name === answer) {
              personality.count++;
            }
          });
        });

        self.answered += 1;
      }

      self.next();
    });

    /**
      Event handler for the personality quiz completed event. Hides
      the progressbar, since it is no longer needed. Sets the quiz
      as completed, calculates the personality and sets the result.
    */
    self.on('personality-quiz-completed', function () {
      var personality = self.calculatePersonality();

      self.$progressbar.hide();
      self.completed = true;

      self.setResult(personality);

      if (animation && self.resultAnimation === 'fade-in') {
        self.$result.addClass(prefix('fade-in'));
      }
    });

    /**
      Event handler for the animation end event for the wheel of
      fortune animation. Sets a fade-out animation and moves
      the quiz on to the next slide.
    */
    self.on('wheel-animation-end', function () {
      setTimeout(function () {
        self.$canvas.addClass(prefix('fade-out'));
      }, 500);

      self.$canvas.on('animationend', self.next);
    });

    /**
      Event handler for the quiz restart event. Empties the root
      container for the quiz and rebuilds it.
    */
    self.on('personality-quiz-restart', function () {
      self.$container.empty();
      attach(self.$container);
    });
  }

  PersonalityQuiz.prototype = Object.create(EventDispatcher);
  PersonalityQuiz.prototype.constructor = PersonalityQuiz;

  return PersonalityQuiz;
})(H5P.jQuery, H5P.EventDispatcher);
