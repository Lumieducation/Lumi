(function ($, EventDispatcher, CollageEditor, Collage) {

  /**
   * A small widget that makes it easy to switch between collage layouts.
   *
   * @class H5PEditor.Collage.LayoutSelector
   * @extends H5P.EventDispatcher
   * @param {H5P.jQuery} $container
   * @param {Array} layouts
   * @param {string} selectedDefault
   */
  CollageEditor.LayoutSelector = function ($container, layouts, selectedDefault, clips) {
    var self = this;

    // Initialize event inheritance
    EventDispatcher.call(self);

    // In case editor is loaded before collage
    Collage = H5P.Collage;

    // Create wrapper
    var $wrapper = $('<div/>', {
      'class': 'h5p-collage-editor-layout-selector'
    });

    // Keep track of selected layout
    var $selected;

    /**
     * Adds a preview of the given layout.
     *
     * @private
     * @param {string} layout
     */
    var addLayout = function (layout) {
      var $layout = $('<div/>', {
        'class': 'h5p-collage-editor-layout-preview' + (layout.value === selectedDefault ? ' h5p-collage-selected-layout' : ''),
        tabIndex: '0',
        role: 'button',
        title: layout.label,
        on: {
          click: function () {
            selectLayout($layout, layout.value);
          },
          keydown: function (event) {
            if (event.which === 32) {
              event.preventDefault();
            }
          },
          keyup: function (event) {
            if (event.which === 32) {
              selectLayout($layout, layout.value);
            }
          }
        },
        appendTo: $wrapper
      });
      (new Collage.Template(0.25, layout.value)).appendTo($layout);

      if (layout.value === selectedDefault) {
        $selected = $layout;
      }
    };

    /**
     * Selects the given layout.
     *
     * @private
     * @param {H5P.jQuery} $preview
     * @param {string} layout
     */
    var selectLayout = function ($preview, layout) {
      const applyChanges = () => {
        $selected.removeClass('h5p-collage-selected-layout');
        $selected = $preview.addClass('h5p-collage-selected-layout');
        self.warn = false;

        self.trigger('layoutChanged', layout);
      }
      if ($preview === $selected) {
        return;
      }

      if (self.warn) {
        const confirmationDialog = CollageEditor.showConfirmationDialog($wrapper, {
          headerText: CollageEditor.t('pleaseConfirm'),
          dialogText: CollageEditor.t('confirmReset'),
          cancelText: H5PEditor.t('core', 'cancel'),
          confirmText: H5PEditor.t('core', 'ok'),
        });

        confirmationDialog.on('canceled', () => {
          return;
        });
        confirmationDialog.on('confirmed', () => {
         applyChanges();
        });

      }
      else {
        applyChanges();
      }
    };

    // Add options
    for (var i = 0; i < layouts.length; i++) {
      addLayout(layouts[i]);
    }
    $wrapper.appendTo($container);
  };

  // Extends the event dispatcher
  CollageEditor.LayoutSelector.prototype = Object.create(EventDispatcher.prototype);
  CollageEditor.LayoutSelector.prototype.constructor = CollageEditor.LayoutSelector;

})(H5P.jQuery, H5P.EventDispatcher, H5PEditor.Collage);
