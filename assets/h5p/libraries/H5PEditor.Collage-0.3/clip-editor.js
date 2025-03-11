(function ($, CollageEditor) {

  /** @constant {number} */
  var ZOOM_MIN = 1;
  /** @constant {number} */
  var ZOOM_MAX = 3;

  var nextInstanceIndex = 0;

  /**
   * Adds editor functionality to the collage clips.
   *
   * @class H5PEditor.Collage.Clip
   * @extends H5P.Collage.Clip
   * @param {H5PEditor.Collage.LayoutSelector} layoutSelector
   */
  CollageEditor.Clip = function (layoutSelector) {
    var self = this;

    // creates a unique index for this clip
    this.instanceIndex = nextInstanceIndex++;

    // Use references
    var $img;

    // Makes it possible to pan / move the image around
    var zooming, startPos, currentOffset, maxOffset, lastOffset;

    // Binds all the event listeners when the clip changes
    self.on('change', function (event) {
      self.$wrapper.removeClass('h5p-collage-loading');

      $img = event.data
        .on('dragstart', disableDrag)
        .on('mousedown', mousedown)
        .on('mousewheel DOMMouseScroll', scroll);
      self.$wrapper
        .attr('tabindex', '0');

      if (zooming === undefined) {
        // Mousewheel zoom enabled while holding the Z key
        zooming = false;
        H5P.$body.on('keydown', function (event) {
          var keyCode = event.keyCode;
          if (keyCode === 90) {
            zooming = true;
          }
          else if ((keyCode === 107 || keyCode === 171 || keyCode === 187) && self.$wrapper.is(':focus')) {
            zoom(0.1);
          }
          else if ((keyCode === 109 || keyCode === 173 || keyCode === 189) && self.$wrapper.is(':focus')) {
            zoom(-0.1);
          }
        });
        H5P.$body.on('keyup', function (event) {
          if (event.keyCode === 90) {
            zooming = false;
          }
        });
      }

      toggleZoomButtonsState();
    });

    if (!self.empty()) {
      // Make sure we display a warning before changing templates.
      layoutSelector.warn = true;
    }

    // Create a new file uploader
    var uploader = new H5PEditor.FileUploader({
      name: 'collageClip',
      type: 'image'
    });
    uploader.on('upload', function () {
      // Display loading screen
      self.loading();
      self.$wrapper.addClass('h5p-collage-loading');
      $changeButton.attr('aria-label', H5PEditor.t('H5PEditor.Collage', 'changeImage'));
    });
    uploader.on('uploadComplete', function (event) {
      var result = event.data;

      // Update clip
      update(result.data);

      if (!result.error) {
        // Make sure we display a warning before changing templates.
        layoutSelector.warn = true;
      }
      else {
        self.$wrapper.removeClass('h5p-collage-loading').addClass('h5p-collage-empty');
        $changeButton.attr('aria-label', H5PEditor.t('H5PEditor.Collage', 'addImage'));

        CollageEditor.showConfirmationDialog(self.$wrapper, {
          headerText: H5PEditor.t('core', 'uploadError'),
          dialogText: CollageEditor.t('uploadError'),
          confirmText: H5PEditor.t('core', 'ok'),
        });
      }
      if (self.content.image === null) {
        delete self.content.image; // Prevent validation issues when saving
      }
    });

    /**
     * Prevent dragging/copying the image instead of panning. (Firefox)
     */
    var disableDrag = function () {
      return false;
    };

    /**
     * Makes it easy to create buttons
     *
     * @private
     * @param {string} name
     * @param {string} label
     * @param {function} callback
     * @returns {H5P.jQuery}
     */
    var createButton = function (name, label, callback) {
      return $('<div/>', {
        'class': 'h5p-collage-' + name,
        tabIndex: 0,
        role: 'button',
        'aria-label': label,
        on: {
          click: function () {
            callback();
            return false;
          },
          keydown: function (event) {
            if (event.which === 32 && event.target.nodeName !== 'INPUT') {
              event.preventDefault();
            }
          },
          keyup: function (event) {
            if (event.which === 32 && event.target.nodeName !== 'INPUT') {
              callback();
            }
          }
        },
        appendTo: self.$wrapper
      });
    };

    var createDialog = function() {
      var imageAltFieldId = 'image-alt-field-' + self.instanceIndex;
      var imageNameFieldId = 'image-name-field-' + self.instanceIndex;

      var $dialog = $('<div role="dialog" class="h5p-editor-dialog">' +
        '<a href="#" class="h5p-close" title="' + ns.t('H5PEditor.Collage', 'close') + '"></a>' +
        '<div class="content">' +
          '<div class="field field-name-alt text">' +
            '<label class="h5peditor-label-wrapper" id="' + imageAltFieldId + '">' +
              '<span class="h5peditor-label h5peditor-required">' + ns.t('H5PEditor.Collage', 'imageAltLabel') + '</span>' +
            '</label>' +
            '<input class="h5peditor-text" type="text" maxlength="255" aria-labelledby="' + imageAltFieldId + '">' +
          '</div>' +

          '<div class="field field-name-title text">' +
            '<label class="h5peditor-label-wrapper" id="' + imageNameFieldId + '">' +
              '<span class="h5peditor-label">' + ns.t('H5PEditor.Collage', 'imageTitleLabel') + '</span>' +
            '</label>' +
            '<input class="h5peditor-text" type="text" maxlength="255" aria-labelledby="' + imageNameFieldId + '">' +
          '</div>' +
        '</div>' +
      '</div>');

      $dialog.find('.h5p-close').click(function () {
        $dialog.toggleClass('h5p-open');
        return false;
      });

      $dialog.find('.field-name-alt input')
        .val(self.content.alt || '')
        .change(function() {
          self.content.alt = $(this).val();
        });

      $dialog.find('.field-name-title input')
        .val(self.content.title || '')
        .change(function() {
          self.content.title = $(this).val();
        });

      return $dialog;
    };

    /**
     * Create metadata dialog.
     */
    const createMetadataDialog = () => {
      const imageAltFieldId = 'image-alt-field-' + this.instanceIndex;
      const imageNameFieldId = 'image-name-field-' + this.instanceIndex;

      const $metadataDialog = $('<div role="dialog" class="h5p-editor-dialog">' +
        '<a href="#" class="h5p-close" title="' + ns.t('H5PEditor.Collage', 'close') + '"></a>' +
      '</div>');

      $metadataDialog.find('.h5p-close').click(() => {
        $metadataDialog.toggleClass('h5p-open');
        return false;
      });

      if (this.content.image) {
        // Could be old content without copyright field
        this.content.image.copyright = this.content.image.copyright ?? {};

        // Using H5PEditor.File.addCopyright to create fields for params.
        H5PEditor.File.addCopyright(this.content.image, $metadataDialog, () => {});
        delete this.content.image.children;
      }

      return $metadataDialog;
    };

    /**
     * Add metadata dialog. Image needs to be set.
     * @private
     */
    const addMetadataDialog = () => {
      const $metadataDialog = createMetadataDialog();
      createButton(
        'metadata-settings',
        H5PEditor.t('H5PEditor.Collage', 'metadata'),
        () => {
          const $collageWrapper = $dialogWrapper;
          const $collageEditorWrapper = $collageWrapper.closest('.h5p-collage-editor-wrapper');

          // align dialog with $change button
          $metadataDialog.css({
            left: $changeButton.offset().left - $dialogWrapper.offset().left,
            top: $changeButton.offset().top - $dialogWrapper.offset().top
          });

          // attach dialog to dom and show to be able to get height
          this.trigger('show-metadata-dialog', $metadataDialog);
          $metadataDialog.toggleClass('h5p-open');

          // Ensure that dialog doesn't overflow. This should be fixed in general
          const wrapperHeight = $collageWrapper.height() + parseFloat($collageWrapper.css('border-top'));
          const dialogBottom = parseFloat($metadataDialog.css('top')) + $metadataDialog.height();
          const min = -parseFloat($collageWrapper.css('border-top')) + $collageEditorWrapper.offset().top - $collageWrapper.offset().top;
          if (dialogBottom > wrapperHeight) {
            const newTop = Math.max(min, parseFloat($metadataDialog.css('top')) + wrapperHeight - dialogBottom);
            $metadataDialog.css('top', newTop);
          }
        }
      );
    };

    /**
     * Help display the correct button state.
     * @private
     */
    var toggleZoomButtonsState = function () {
      if (self.content.scale === ZOOM_MIN) {
        // Disable zoom out button
        $zoomOut.attr('aria-disabled', true).attr('aria-label', H5PEditor.t('H5PEditor.Collage', 'noMoreZoom'));
      }
      else if ($zoomOut.attr('aria-disabled')) {
        // Enable zoom out button
        $zoomOut.attr('aria-disabled', false).attr('aria-label', H5PEditor.t('H5PEditor.Collage', 'zoomOut'));
      }

      if (self.content.scale === ZOOM_MAX) {
        // Disable zoom in button
        $zoomIn.attr('aria-disabled', true).attr('aria-label', H5PEditor.t('H5PEditor.Collage', 'noMoreZoom'));
      }
      else if ($zoomIn.attr('aria-disabled')) {
        // Enable zoom out button
        $zoomIn.attr('aria-disabled', false).attr('aria-label', H5PEditor.t('H5PEditor.Collage', 'zoomIn'));
      }
    };

    // Add button for changing image
    var $changeButton = createButton('change-image', H5PEditor.t('H5PEditor.Collage', self.empty() ? 'addImage' : 'changeImage'), function () {
      uploader.openFileSelector();
    });

    var $zoomOut = createButton('zoom-out', H5PEditor.t('H5PEditor.Collage', 'zoomOut'), function () {
      zoom(-0.1);
    });

    var $zoomIn = createButton('zoom-in', H5PEditor.t('H5PEditor.Collage', 'zoomIn'), function () {
      zoom(0.1);
    });

    const $dialogWrapper = self.$wrapper.closest('.h5p-collage-wrapper');

    var $imageSettings = createButton('image-settings', H5PEditor.t('H5PEditor.Collage', 'imageSettings'), function () {

      // align dialog with $change button
      $dialog.css({
        left: $changeButton.offset().left - $dialogWrapper.offset().left,
        top: $changeButton.offset().top - $dialogWrapper.offset().top
      });

      // attach dialog to dom
      self.trigger('show-dialog', $dialog);

      // show
      $dialog.toggleClass('h5p-open');
    }).toggleClass('warning', self.content.alt && self.content.alt.length === 0);

    // If no image parameters, metadata dialog will be added when image set
    if (self.content.image) {
      addMetadataDialog();
    }

    var $dialog = createDialog();

    // toggle warning on image settings button, if no alt-value
    $dialog.find('.field-name-alt input')
      .val(self.content.alt || '')
      .keyup(function() {
        $imageSettings.toggleClass('warning', $(this).val().length === 0);
      });

    /**
     * Allows styling for the whole container when the clip is focused.
     *
     * @private
     */
    var focus = function () {
      self.$wrapper.addClass('h5p-collage-focus');
    };

    /**
     * Remove focus styles.
     *
     * @private
     */
    var blur = function () {
      self.$wrapper.removeClass('h5p-collage-focus');
    };

    /**
     * Handle mouse grabbing.
     *
     * @private
     * @param {Event} event
     */
    var mousedown = function (event) {
      if (event.button !== 0) {
        return; // Only left click
      }

      // Grab numbers
      var viewPort = getViewPort();
      currentOffset = new Size(pxToNum($img.css('marginLeft')), pxToNum($img.css('marginTop')));
      var imgSize = $img[0].getBoundingClientRect();
      maxOffset = new Size(imgSize.width - viewPort.x, imgSize.height - viewPort.y);
      startPos = new Size(event.pageX, event.pageY);

      // Listen for further mouse events
      H5P.$window
        .bind('mousemove', move)
        .bind('mouseup', release);

      H5P.$body
        .addClass('h5p-no-select');

      $img.addClass('h5p-collage-grabbed');
    };

    /**
     * Move image
     *
     * @private
     * @param {Event} event
     */
    var move = function (event) {
      lastOffset = new Offset(
        currentOffset,
        new Size(startPos.x - event.pageX, startPos.y - event.pageY),
        maxOffset
      );
      $img.css(lastOffset.getPx());
    };

    /**
     * Image released, stop moving
     *
     * @private
     */
    var release = function () {
      H5P.$window
        .unbind('mousemove', move)
        .unbind('mouseup', release);

      H5P.$body
        .removeClass('h5p-no-select');

      $img.removeClass('h5p-collage-grabbed');

      if (lastOffset) {
        self.content.offset = lastOffset.getPs();
        $img.css('margin', self.content.offset.top + '% 0 0 ' + self.content.offset.left + '%');
        lastOffset = null;
      }

      self.$wrapper.focus();
    };

    /**
     * Keep track of container size
     *
     * @private
     * @returns {Size}
     */
    var getViewPort = function () {
      var size = self.$wrapper[0].getBoundingClientRect();
      return new Size(size.width, size.height);
    };

    /**
     * Handle scroll events
     * @param {Event} event
     */
    var scroll = function (event) {
      if (zooming) {
        // Set focus when hovering image and scrolling
        self.$wrapper.focus();
        if (event.originalEvent.wheelDelta) {
          zoom(event.originalEvent.wheelDelta > 0 ? 0.1 : -0.1);
          return false;
        }
        else if (event.originalEvent.detail) {
          zoom(event.originalEvent.detail > 0 ? -0.1 : 0.1);
          return false;
        }
      }
    };

    /**
     * Change and load new image.
     * @param {object} newImage
     */
    var update = function (newImage) {
      self.content.image = newImage;
      self.content.image.copyright = {}; // Sanitize for H5PEditor.File.addCopyright
      self.content.scale = 1;
      self.content.offset = {
        top: 0,
        left: 0
      };

      addMetadataDialog();

      self.load();
    };

    /**
     * A helpers that makes it easier to keep track of size.
     *
     * @private
     * @class
     * @param {Number} x
     * @param {Number} y
     */
    function Size(x, y) {
      this.x = x;
      this.y = y;

      /**
       * Letter than
       *
       * @param {Size} size
       * @returns {boolean}
       */
      this.lt = function (size) {
        return this.x < size.x || this.y < size.y;
      };
    }

    /**
     * Helps calculate a new offset for the image.
     *
     * @private
     * @class
     * @param {Size} current
     * @param {Size} delta change
     * @param {Size} max value
     */
    function Offset(current, delta, max) {
      var x = current.x - delta.x;
      var y = current.y - delta.y;

      if (x > 0) {
        x = 0;
      }
      else if (x < -max.x) {
        x = -max.x;
      }

      if (y > 0) {
        y = 0;
      }
      else if (y < -max.y) {
        y = -max.y;
      }

      /**
       * Get pixel values
       * @returns {object}
       */
      this.getPx = function () {
        return {
          marginLeft: x + 'px',
          marginTop: y + 'px'
        };
      };

      /**
       * Get percentage values
       * @returns {object}
       */
      this.getPs = function () {
        var viewPort = getViewPort();
        var p = viewPort.x / 100;
        return {
          left: x / p,
          top: y / p
        };
      };
    }

    /**
     * Converts css pixel values to number
     *
     * @private
     * @returns {Number}
     */
    function pxToNum(px) {
      return Number(px.replace('px', ''));
    }

    /**
     * Zoom in / out on the clip.
     *
     * @private
     * @param {number} delta
     */
    var zoom = function (delta) {
      // Increase / decrease scale
      self.content.scale += delta;

      // Keep withing boundries
      if (self.content.scale < ZOOM_MIN) {
        self.content.scale = ZOOM_MIN;
      }
      if (self.content.scale > ZOOM_MAX) {
        self.content.scale = ZOOM_MAX;
      }
      toggleZoomButtonsState();

      // Keep track of size before scaling
      var imgSize = $img[0].getBoundingClientRect();
      var before = new Size(imgSize.width, imgSize.height);

      // Scale
      $img.css(self.prop, (self.content.scale * 100) + '%');

      // ... and after scaling
      imgSize = $img[0].getBoundingClientRect();
      var after = new Size(imgSize.width, imgSize.height);

      var viewPort = getViewPort();
      var offset = new Offset(
        new Size(pxToNum($img.css('marginLeft')), pxToNum($img.css('marginTop'))),
        new Size(((after.x - before.x) / 2), ((after.y - before.y) / 2)),
        new Size(after.x - viewPort.x, after.y - viewPort.y)
      );
      $img.css(offset.getPx());
      self.content.offset = offset.getPs();

      // Set zoom label
      var scale = (Math.round(self.content.scale * 10) / 10).toString();
      if (scale.indexOf('.') === -1) {
        scale += '.0';
      }
      $zoomLevel.text(scale + 'x').addClass('h5p-collage-visible');
      if (zoomLevelTimer) {
        clearTimeout(zoomLevelTimer);
      }
      zoomLevelTimer = setTimeout(function () {
        $zoomLevel.removeClass('h5p-collage-visible');
      }, 1500);
    };

    // Add label for displaying zoom level
    var zoomLevelTimer;
    var $zoomLevel = $('<div/>', {
      'class': 'h5p-collage-zoom-level',
      appendTo: self.$wrapper
    });

    /**
     * Remove image and display throbber.
     */
    self.loading = function () {
      if ($img) {
        $img.remove();
      }
      self.$wrapper.addClass('h5p-collage-loading');
    };

    /**
     * Makes sure the image covers the whole container.
     * Useful when changing the aspect ratio of the container.
     */
    self.fit = function () {
      var imageSize = {
        width: 'auto',
        height: 'auto'
      };

      // Reset size
      $img.css(imageSize);

      var wrapperSize = self.$wrapper[0].getBoundingClientRect();
      var containerSize = new Size(wrapperSize.width, wrapperSize.height);

      // Find ratios
      var imgSize = $img[0].getBoundingClientRect();
      var imageRatio = (imgSize.width / imgSize.height);
      var containerRatio = (containerSize.x / containerSize.y);

      // Set new size
      imageSize[imageRatio > containerRatio ? 'height' : 'width'] = (self.content.scale * 100) + '%';
      $img.css(imageSize);

      // Make sure image covers container
      imgSize = $img[0].getBoundingClientRect();
      var offset = new Offset(
        new Size(pxToNum($img.css('marginLeft')), pxToNum($img.css('marginTop'))),
        new Size(0, 0),
        new Size(imgSize.width - containerSize.x, imgSize.height - containerSize.y)
      );
      $img.css(offset.getPx());
      self.content.offset = offset.getPs();
    };
  };

})(H5P.jQuery, H5PEditor.Collage);
