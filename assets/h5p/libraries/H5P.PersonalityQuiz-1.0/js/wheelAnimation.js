var H5P = H5P || {};

(function ($, PersonalityQuiz) {
  /**
    A wheel of fortune animation.

    @param {Object} quiz
    @param {Object} personalities
    @param {number} width
    @param {number} height
    @param {PathFunction} _getPath
    @constructor
  */
  PersonalityQuiz.WheelAnimation = function (quiz, personalities, width, height, _getPath) {
    var self = this;

    // TODO (Emil): Some of these variables should probably be private.
    // NOTE (Emil): Choose the smallest if the dimensions vary, for simplicity.
    var side = Math.min(width, height);
    var min = 320;
    var max = 800;
    var hasImages = true;

    self.width = clamp(side, min, max);
    self.height = clamp(side, min, max);

    self.offscreen = document.createElement('canvas');

    self.offscreen.width = Math.max(self.width - 25, 500);
    self.offscreen.height = Math.max(self.height - 25, 500);
    self.offscreen.context = self.offscreen.getContext('2d');

    self.nubArrowSize = self.width * 0.1;
    self.nubRadius = self.width * 0.06;

    self.segmentAngle = (Math.PI * 2) / (personalities.length * 2);
    self.targetRotation = 6 * (Math.PI * 2) + ((3 * Math.PI) / 2) - (self.segmentAngle / 2);
    self.rotation = 0;
    self.rotationSpeed = Math.PI / 32;

    self.center = { x: self.width / 2, y: self.height / 2 };

    self.personalities = personalities;

    self.colors = {
      even: 'rgb(77, 93, 170)',
      odd:  'rgb(56, 183, 85)',
      text: 'rgb(233, 239, 247)',
      nub:  'rgb(233, 239, 247)',
      overlay: 'rgba(60, 62, 64, 0.5)',
      frame: 'rgb(60, 62, 64)'
    };

    self.images = [];

    self.personalities.forEach(function (personality) {
      hasImages = (hasImages && personality.image.file);
    });

    // NOTE (Emil): Prerender the wheel.
    if (hasImages) {
      load();
    }
    else {
      // NOTE (Emil): If there aren't any images we use a slightly different colors.
      self.colors = {
        even: 'rgb(233, 239, 247)',
        odd:  'rgb(203, 209, 217)',
        text: 'rgb(60, 62, 64)',
        nub:  'rgb(77, 93, 170)',
        overlay: 'rgba(60, 62, 64, 0.4)',
        frame: 'rgb(255, 255, 255)'
      };

      drawOffscreen(self.offscreen.context, self.personalities);
    }

    /**
      Clamp a value between low and high

      @param {number} value
      @param {number} low
      @param {number} high
      @return {number}
    */
    function clamp(value, low, high) {
      return Math.min(Math.max(low, value), high);
    }

    /**
      Zero out the current rotation and set the initial targetRotation.
    */
    function reset() {
      self.rotation = 0;
      self.targetRotation = 6 * (Math.PI * 2) + ((3 * Math.PI) / 2) - (self.segmentAngle / 2);
    }

    /**
      Returns the image pattern associated with the personality, if there is one,
      or it returns the background color for the segment.

      @param {Object} personality
      @param {number} index
      @return {Object|string}
    */
    function getPattern(personality, index) {
      if (personality.image.pattern) {
        return personality.image.pattern;
      }

      if (index % 2 === 0) {
        return self.colors.even;
      }
      else {
        return self.colors.odd;
      }
    }

    /**
      Load personality images and when all images are loaded draw the wheel.
    */
    function load() {
      self.loadingImages = [];

      self.personalities.forEach(function (personality) {
        var image = new Image();
        var deferred = $.Deferred();

        image.addEventListener('load', function () {
          personality.image.pattern = self.offscreen.context.createPattern(this, 'no-repeat');
          deferred.resolve();
        });

        image.src = _getPath(personality.image.file.path);
        self.images.push({ name: personality.name, data: image });
        self.loadingImages.push(deferred);
      });

      // NOTE(Emil): When all the images are loaded we can prerender the offscreen buffer.
      $.when.apply(null, self.loadingImages).done(function () {
        drawOffscreen(self.offscreen.context, self.personalities);
      });
    }

    /**
      Draw a single segment of the wheel. There are two segments per personality.

      @param {CanvasRenderingContext2D} context
      @param {Object} center
      @param {number} radius
      @param {number} fromAngle
      @param {number} toAngle
      @param {string|CanvasGradient|CanvasPattern} fillStyle
    */
    function drawSegment(context, center, radius, fromAngle, toAngle, fillStyle) {
      context.beginPath();

      context.fillStyle = fillStyle;

      context.moveTo(center.x, center.y);
      context.arc(center.x, center.y, radius, fromAngle, toAngle, false);
      context.lineTo(center.x, center.y);

      context.fill(); // Fill the segment with the background image.
      context.stroke(); // Draw the outline of the segment.

      context.closePath();
    }

    /**
      Draw the personality name if there is not image associated with the personality.

      @param {CanvasRenderingContext2D} context
      @param {string} text
      @param {number} x
      @param {number} y
      @param {number} maxWidth
    */
    function drawText(context, text, x, y, maxWidth) {
      context.fillStyle = self.colors.text;
      context.font = '24px Arial';

      context.fillText(text, x, y, maxWidth);
    }

    /**
      Draw the prerendered wheel, which is stored in the offscreen canvas.

      @param {CanvasRenderingContext2D} context
      @param {number} rotation
      @param {HTMLElement} canvas
    */
    function drawWheel(context, rotation, canvas) {
      var scale = 1;

      context.save();

      scale = {
        x: self.width / self.offscreen.width,
        y: self.width / self.offscreen.height
      };

      context.translate(self.center.x, self.center.y);
      context.rotate(rotation);
      context.scale(scale.x, scale.y);
      context.translate(-self.offscreen.width / 2, -self.offscreen.height / 2);

      context.drawImage(canvas, 0, 0);

      context.restore();
    }

    /**
      Draw the center arrow which will point to the result personality.

      @param {CanvasRenderingContext2D} context
      @param {Object} center
      @param {number} radius
      @param {string} color
    */
    function drawNub(context, center, radius, color) {
      context.fillStyle = color;

      context.beginPath();

      context.moveTo(self.center.x - radius, self.center.y);
      context.lineTo(self.center.x, self.center.y - self.nubArrowSize);
      context.lineTo(self.center.x + radius, self.center.y);
      context.arc(self.center.x, self.center.y, radius, 0, Math.PI * 2, false);

      context.fill();

      context.closePath();
    }

    /**
      Draw the wheel in the offscreen canvas and save it for later.

      @param {CanvasRenderingContext2D} context
      @param {Object[]} personalities - a list of personalities from H5P.PersonalityQuiz
    */
    function drawOffscreen(context, personalities) {
      var center = { x: self.offscreen.width / 2, y: self.offscreen.height / 2 };
      var radius = self.offscreen.width / 2 - 2;

      // NOTE (Emil): We draw two segments for each personality,
      // this way the number of segments is always even.
      var length = personalities.length * 2;
      var angle = (Math.PI * 2) / length;
      var halfAngle = angle / 2;

      var i, personality, pattern, open, offset;

      context.textBaseline = 'middle';
      context.strokeStyle = self.colors.frame;

      for (i = 0; i < length; i++) {
        personality = personalities[i % personalities.length];
        pattern = getPattern(personality, i);

        open = i * angle;
        offset = { x: 0, y: 0 };

        if (personality.image.file) {
          offset.x = personality.image.file.width / 2;
          offset.y = (personality.image.file.height - radius) / 2;
        }

        // NOTE (Emil): Assumes that the center of the image is the most interesting.
        context.save();

        // NOTE (Emil): Center the circle segment over the center of the background image.
        context.translate(center.x, center.y);
        context.rotate(open + halfAngle - (Math.PI / 2));
        context.translate(-offset.x, -offset.y);

        drawSegment(
          context,
          {x: offset.x, y: offset.y},
          radius,
          (Math.PI / 2) - halfAngle,
          (Math.PI / 2) + halfAngle,
          pattern
        );

        context.restore();

        // NOTE (Emil): Draw the personality name if there are no images.
        if (self.images.length < self.personalities.length) {
          context.save();

          context.translate(center.x, center.y);
          context.rotate(open + halfAngle);
          context.translate(-center.x, -center.y);

          drawText(
            context,
            personality.name,
            center.x + (self.nubRadius * 2),
            center.y,
            radius - (self.nubRadius * 2.5)
          );

          context.restore();
        }
      }
    }

    /**
        Attach the wheel animation to the provided canvas element.

        @param {HTMLElement} canvasElement
    */
    self.attach = function (canvasElement) {
      self.onscreen = canvasElement;
      self.onscreen.width = self.width;
      self.onscreen.height = self.height;
      self.onscreen.context = self.onscreen.getContext('2d');
    };

    /**
        Set the target personality and calculates the target rotation.

        @param {Object} targetPersonality
    */
    self.setTarget = function (targetPersonality) {
      var deviation, round;

      reset();

      deviation = self.segmentAngle * 0.4;

      // NOTE (Emil): Randomly choose one of the two segments associated
      // with the personality.
      round = Math.floor(Math.random() + 0.5);

      self.personalities.forEach(function (personality, index) {
        if (targetPersonality.name === personality.name) {
          var angle = index * self.segmentAngle + (round * Math.PI);
          var min = angle + deviation;
          var max = angle - deviation;
          var deviated = Math.random() * (max - min) + min;

          self.targetRotation = self.targetRotation - deviated;

          return;
        }
      });
    };

    /**
      Draw the wheel of fortune

      @param {CanvasRenderingContext2D} context
      @param {number} rotation
      @param {HTMLElement} canvas
    */
    self.draw = function (context, rotation, canvas) {
      context.clearRect(0, 0, self.onscreen.width, self.onscreen.height);

      drawWheel(context, rotation, canvas);
      drawNub(context, self.center, self.nubRadius, self.colors.nub);
    };

    /**
      The main animation loop. Starts the callback loop to requestAnimationFrame.
      A call to 'setTarget' is required before calling this function.
    */
    self.animate = function () {
      var end, start;
      self.rotation = 0;

      function _animate (timestamp) {
        var dt, scale, rotation;

        end = end ? end : timestamp;
        start = timestamp;

        dt = (start - end) / 1000;
        scale = 1 - (self.rotation / self.targetRotation);
        rotation = Math.max(scale * dt * self.rotationSpeed, 0.01);

        if (self.rotation < self.targetRotation) {
          // NOTE (Emil): Always move atleast a little until the targetRotation is achieved.
          self.rotation += Math.min(rotation, self.targetRotation - self.rotation);

          self.draw(self.onscreen.context, self.rotation, self.offscreen);

          window.requestAnimationFrame(_animate);
        }
        else {
          quiz.trigger('wheel-animation-end');
        }
      }

      window.requestAnimationFrame(_animate);
    };
  };
})(H5P.jQuery, H5P.PersonalityQuiz);
