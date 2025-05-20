/**
 * AR Marker Generator widget module
 *
 * @param {H5P.jQuery} $
 */
H5PEditor.widgets.arMarkerGenerator = H5PEditor.ARMarkerGenerator = (function ($) {
  /**
   * Creates widget for AR marker generation
   * @class H5PEditor.ARMarkerGenerator
   *
   * @param {object} parent Parent object in semantics hierarchy.
   * @param {object} field Fields in semantics where widget is used.
   * @param {object} params Parameters of form.
   * @param {function} setValue Callback to update the form value.
   *
   * @throws {Error} No image found.
   */
  function ARMarkerGenerator(parent, field, params, setValue) {
    const that = this;

    // Initialize inheritance
    H5PEditor.FileUploader.call(that, field);

    this.parent = parent;
    this.field = field;
    this.params = params;
    this.setValue = setValue;

    this.originalImage = new Image();

    this.field.arMarkerGenerator = this.field.arMarkerGenerator || {};
    this.field.arMarkerGenerator.referencePath = this.field.arMarkerGenerator.referencePath || '';

    // Downloadable marker image size in pixels
    this.field.arMarkerGenerator.markerImageSize = this.field.arMarkerGenerator.markerImageSize || 1000;

    // Find image reference
    this.imageField = H5PEditor.findField(this.field.arMarkerGenerator.referencePath, this.parent);
    if (!this.imageField) {
      throw new Error(H5PEditor.t('H5PEditor.ARMarkerGenerator', 'NoImageFound'));
    }

    // Create DOM
    this.$container = $(H5PEditor.createFieldMarkup(this.field,
      '<div class="h5peditor-ar-marker-generator-container"></div>'
    ));
    const container = this.$container.get(0).querySelector('.h5peditor-ar-marker-generator-container');

    // Spinner
    this.spinner = new H5PEditor.arMarkerGeneratorSpinner('arMarkerGenerator-spinner');
    this.spinner.hide();

    // Marker Image
    this.markerImageDOM = this.buildMarkerImageDOM();

    // Marker Image Wrapper with Spinner/MarkerImage
    const markerImageWrapper = this.buildImageWrapper();
    markerImageWrapper.appendChild(this.spinner.getDOM());
    markerImageWrapper.appendChild(this.markerImageDOM);
    container.appendChild(markerImageWrapper);

    // Buttons wrapper
    const buttonsWrapper = this.buildButtonsWrapper();
    this.markerImageDownloadButton = this.buildButton({
      action: this.downloadMarkerImage.bind(this),
      class: 'h5peditor-ar-marker-generator-button-download',
      label: H5PEditor.t('H5PEditor.ARMarkerGenerator', 'Download')
    });
    buttonsWrapper.appendChild(this.markerImageDownloadButton);
    container.appendChild(buttonsWrapper);

    // Errors
    this.$errors = this.$container.find('.h5p-errors');

    // Follow original image
    H5PEditor.followField(this.parent, this.field.arMarkerGenerator.referencePath, function (event) {
      that.hide();

      if (!event) {
        delete that.params;
        that.setValue(that.field);

        that.trigger('removedMarkerPattern');

        return;
      }

      // Show spinner while processing image for marker pattern
      that.spinner.show();

      // Process original image
      H5P.setSource(that.originalImage, event, H5PEditor.contentId);
      that.originalImage.onload = function () {
        that.markerPattern = that.encodeImage(that.originalImage);
        that.markerImage = that.buildMarkerImage(that.originalImage);

        that.markerImageDOM.src = that.markerImage;

        // Upload marker pattern file to server
        that.on('uploadComplete', that.handleUploadComplete.bind(that));

        if (
          !that.params ||
          typeof that.params.path === 'string' && that.params.path.substr(-4) === '#tmp'
        ) {
          // New image
          that.upload(new Blob([that.markerPattern], {type: 'text/plain'}), 'placeholder.txt');
        }
        else {
          // Image was already uploaded, skip uploading
          that.handleUploadComplete({ data: { data: that.params } });
        }

        that.originalImage.onload = null;
      };
    });

    this.setValue(this.field, this.params);
  }

  // Inheritance from H5PEditor.FileUploader
  ARMarkerGenerator.prototype = Object.create(H5PEditor.FileUploader.prototype);
  ARMarkerGenerator.constructor = H5PEditor.arMarkerGenerator;

  /**
   * Append field to wrapper. Invoked by H5P core.
   * @param {H5P.jQuery} $wrapper Wrapper.
   */
  ARMarkerGenerator.prototype.appendTo = function ($wrapper) {
    this.$container.appendTo($wrapper);
  };

  /**
   * Validate current values. Invoked by H5P core.
   * @return {boolean} True, if current value is valid, else false.
   */
  ARMarkerGenerator.prototype.validate = function () {
    return true;
  };

  /**
   * Remove self. Invoked by H5P core.
   */
  ARMarkerGenerator.prototype.remove = function () {
    this.$container.remove();
  };

  /**
   * Build image wrapper DOM.
   * @return {HTMLElement} Image wrapper DOM.
   */
  ARMarkerGenerator.prototype.buildImageWrapper = function () {
    const wrapper = document.createElement('div');
    wrapper.classList.add('h5peditor-ar-marker-generator-marker-image-wrapper');

    return wrapper;
  };

  /**
   * Build marker image DOM.
   * @return {HTMLElement} Marker image DOM.
   */
  ARMarkerGenerator.prototype.buildMarkerImageDOM = function () {
    const markerImage = document.createElement('img');

    markerImage.classList.add('h5peditor-ar-marker-generator-marker-image');
    markerImage.classList.add('thumbnail');
    markerImage.classList.add('h5peditor-ar-marker-generator-display-none');

    markerImage.setAttribute('src', '');
    markerImage.setAttribute('alt', '');

    markerImage.addEventListener('click', this.downloadMarkerImage.bind(this));

    return markerImage;
  };

  /**
   * Build buttons wrapper DOM.
   * @return {HTMLElement} Buttons wrapper DOM.
   */
  ARMarkerGenerator.prototype.buildButtonsWrapper = function () {
    const wrapper = document.createElement('div');
    wrapper.classList.add('h5peditor-ar-marker-generator-buttons');

    return wrapper;
  };

  /**
   * Build button DOM.
   * @param {object} params Parameters.
   * @param {function} [params.action] Callback to trigger on click.
   * @param {string} [params.class=''] Button stylesheet class.
   * @param {string} [params.label=''] Button label.
   * @return {HTMLElement} Button DOM.
   */
  ARMarkerGenerator.prototype.buildButton = function (params) {
    params.action = params.action || function () {};
    params.class = params.class || '';
    params.label = params.label || '';

    const button = document.createElement('button');

    button.classList.add(params.class);
    button.classList.add('h5peditor-ar-marker-generator-display-none');
    button.classList.add('h5peditor-button-textual');

    button.innerText = params.label;

    button.addEventListener('click', params.action);

    return button;
  };

  /**
   * Handle upload of pattern file complete.
   * @param {Event} event Event result.
   */
  ARMarkerGenerator.prototype.handleUploadComplete = function (event) {
    const result = event.data;

    try {
      if (result.error) {
        throw result.error;
      }

      this.params = this.params || {};
      this.params.path = result.data.path;
      this.params.mime = result.data.mime;

      // Make it possible for other widgets to process the result
      this.trigger('fileUploaded', result.data);

      this.trigger('addedMarkerPattern', this.markerImage);

      this.setValue(this.field, this.params);

      this.show();
    }
    catch (error) {
      this.$errors.append(H5PEditor.createError(error));
    }

    this.spinner.hide();
  };

  /**
   * Download marker image.
   */
  ARMarkerGenerator.prototype.downloadMarkerImage = function () {
    if (!this.markerImage) {
      return;
    }

    // Try to get speaking file name
    let name;

    if (this.imageField && this.imageField.copyright && this.imageField.copyright.title) {
      name = this.imageField.copyright.title
        .trim()
        .replace(/[/\\[\]?%*:|"<>]/g, '')
        .replace(/[ ]/g, '-');
      name += '.png';
    }

    if (!name && this.imageField.params && this.imageField.params.path) {
      name = this.imageField.params.path.split('/');
      name = name[name.length - 1].split('.').splice(0, name.length - 1).join('.');
      name = 'pattern-' + name + '.png';
    }

    if (!name) {
      name = 'pattern.png';
    }

    const dummy = window.document.createElement('a');
    dummy.href = this.markerImage;
    dummy.download = name;
    document.body.appendChild(dummy);

    // Special treatment for IE11 required
    if (window.navigator.userAgent.indexOf('Trident/') !== -1) {
      const canvas = document.createElement('canvas');
      canvas.height = this.field.arMarkerGenerator.markerImageSize;
      canvas.width = this.field.arMarkerGenerator.markerImageSize;
      const context = canvas.getContext('2d');
      const image = new Image();
      image.onload = function () {
        context.drawImage(image, 0, 0);
        const blob = canvas.msToBlob();
        navigator.msSaveBlob(blob, name);
      };
      image.src = this.markerImage;
    }
    else {
      dummy.click();
    }

    document.body.removeChild(dummy);
  };

  /**
   * Show marker image (for pattern) and download button.
   */
  ARMarkerGenerator.prototype.show = function () {
    this.markerImageDOM.classList.remove('h5peditor-ar-marker-generator-display-none');
    this.markerImageDownloadButton.classList.remove('h5peditor-ar-marker-generator-display-none');
    this.$errors.get(0).classList.remove('h5peditor-ar-marker-generator-display-none');
  };

  /**
   * Hide marker image (for pattern) and download button.
   */
  ARMarkerGenerator.prototype.hide = function () {
    this.markerImageDOM.classList.add('h5peditor-ar-marker-generator-display-none');
    this.markerImageDownloadButton.classList.add('h5peditor-ar-marker-generator-display-none');
    this.$errors.get(0).classList.add('h5peditor-ar-marker-generator-display-none');
  };


  /**
   * Encode image to ARToolkit marker pattern.
   *
   * Adopted from AR.js Studio Backend
   * https://github.com/AR-js-org/studio-backend
   * The MIT License
   * Copyright (c) 2019 Nicolò Carpignoli, nicolocarpignoli@gmail.com
   *
   * @param {Image} image Image to convert.
   * @return {string} ARToolkit marker pattern.
   */
  ARMarkerGenerator.prototype.encodeImage = function (image) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 16;
    canvas.height = 16;

    let patternFileString = '';
    for (let orientation = 0; orientation > -2*Math.PI; orientation -= Math.PI/2) {
      // draw on canvas - honor orientation
      context.save();
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.translate(canvas.width / 2, canvas.height / 2);
      context.rotate(orientation);
      context.drawImage(image, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
      context.restore();

      // get imageData
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

      // generate the patternFileString for this orientation
      if (orientation !== 0) {
        patternFileString += '\n';
      }

      // bgr order and not rgb!!! so from 2 to 0
      for (let channelOffset = 2; channelOffset >= 0; channelOffset--) {
        for (let y = 0; y < imageData.height; y++) {
          for (let x = 0; x < imageData.width; x++) {
            if (x !== 0) {
              patternFileString += ' ';
            }

            const offset = (y * imageData.width * 4) + (x * 4) + channelOffset;
            const value = imageData.data[offset];

            patternFileString += ('   ' + String(value)).slice(-3);
          }
          patternFileString += '\n';
        }
      }
    }

    return patternFileString;
  };

  /**
   * Build marker image.
   *
   * Adopted from AR.js Studio Backend
   * https://github.com/AR-js-org/studio-backend
   * The MIT License
   * Copyright (c) 2019 Nicolò Carpignoli, nicolocarpignoli@gmail.com
   *
   * @param {Image} Original image.
   * @return {Image} Marker image as dataURI.
   */
  ARMarkerGenerator.prototype.buildMarkerImage = function (image) {
    const patternRatio = 0.5;

    const whiteMargin = 0.1;
    const blackMargin = (1 - 2 * whiteMargin) * ((1 - patternRatio) / 2);

    const innerMargin = whiteMargin + blackMargin;

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = this.field.arMarkerGenerator.markerImageSize;
    canvas.width = this.field.arMarkerGenerator.markerImageSize;

    // White background
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Black border
    context.fillStyle = '#000000';
    context.fillRect(
      whiteMargin * canvas.width,
      whiteMargin * canvas.height,
      canvas.width * (1 - 2 * whiteMargin),
      canvas.height * (1 - 2 * whiteMargin)
    );

    // Clear area for original (transparent) image
    context.fillStyle = '#ffffff';
    context.fillRect(
      innerMargin * canvas.width,
      innerMargin * canvas.height,
      canvas.width * (1 - 2 * innerMargin),
      canvas.height * (1 - 2 * innerMargin)
    );

    // Cropped original image for center square
    context.drawImage(image,
      (image.width > image.height) ? (image.width - image.height) / 2 : 0,
      (image.width > image.height) ? 0 : (image.width - image.height) / 2,
      Math.min(image.height, image.width),
      Math.min(image.height, image.width),
      innerMargin * canvas.width,
      innerMargin * canvas.height,
      canvas.width * (1 - 2 * innerMargin),
      canvas.height * (1 - 2 * innerMargin)
    );

    return canvas.toDataURL();
  };

  return ARMarkerGenerator;
})(H5P.jQuery);
