H5PEditor.KewArCode = (function () {
  // Main widget class constructor
  function KewArCode(parent, field, params, setValue) {
    const that = this;

    that.field = field;
    that.value = params;

    that.changes = [];

    /**
     * Set value forwarded from original select field.
     * @param {object} field Field to set.
     * @param {string} value Value.
     */
    that.setValue = function (field, value) {
      that.value = value;
      setValue(field, value); // Forward callback
    };

    /*
     * H5P option could have been removed before when compound content type
     * using KewAr Code had been loaded and then user switched to standalone
     */
    const noH5POption = field.options.every(function (option) {
      return option.value !== 'h5p';
    });

    if (noH5POption) {
      // Some other content type was already loaded in editor and removed option
      let translatedLabel = 'H5P'; // Fallback

      // Retrieve translation for H5P option
      for (let library in H5PEditor.libraryCache) {
        const currentLibrary = H5PEditor.libraryCache[library];

        if (currentLibrary.name !== 'H5P.KewArCode' || !currentLibrary.translation || !currentLibrary.semantics) {
          continue; // Skip, not H5P.KewArCode
        }

        const codeTypeIndex = currentLibrary.semantics.reduce(function (result, field, index) {
          return (!result && field.name === 'codeType') ? index : result;
        }, null);

        if (codeTypeIndex === null) {
          break; // Select field not found
        }

        const h5pLabelIndex = currentLibrary.translation['en'][codeTypeIndex].options
          .reduce(function (result, option, index) {
            return (!result && option.value === 'h5p') ? index : result;
          }, null);

        if (h5pLabelIndex === null) {
          break; // No entry for H5P option
        }

        // Try to use current language translation if possible
        const language = (currentLibrary.translation[H5PEditor.contentLanguage]) ?
          H5PEditor.contentLanguage :
          'en';

        const translation = currentLibrary.translation[language][codeTypeIndex].options[h5pLabelIndex];
        translatedLabel = translation.label || translatedLabel;
      }

      // Reset H5P option
      const position = Math.min(3, that.field.options.length);
      that.field.options.splice(position, 0, {
        value: 'h5p',
        label: translatedLabel
      });
    }

    if (parent.parent) {
      // Used as subcontent, remove H5P option
      field.options = field.options.filter(function (option) {
        return option.value !== 'h5p';
      });
    }

    // No particular DOM for widget, just used to override library options
    that.libraryKewArCode = new H5PEditor.widgets[field.type](parent, field, params, that.setValue);

    // Forward triggers from original select field
    that.libraryKewArCode.changes.push(function (value) {
      for (var i = 0; i < that.changes.length; i++) {
        that.changes[i](value);
      }
    });

    /**
     * Add to DOM.
     * @public
     * @param {H5P.jQuery} $container Editor container.
     */
    that.appendTo = function ($container) {
      that.libraryKewArCode.appendTo($container);
    };

    /**
     * Validate.
     * @public
     * @return {boolean} True, because select field is not optional.
     */
    that.validate = function () {
      return !!that.libraryKewArCode.validate();
    };

    /**
     * Remove item.
     * @public
     */
    that.remove = function () {
      that.libraryKewArCode.$item.remove();
    };
  }

  return KewArCode;
})();

// Register widget
H5PEditor.widgets.editorKewArCode = H5PEditor.KewArCode;
