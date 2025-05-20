H5P.IVHotspot = (function ($, EventDispatcher) {

  /**
   * Create a new IV Hotspot!
   *
   * @class H5P.IVHotspot
   * @extends H5P.EventDispatcher
   * @param {Object} parameters
   */
  function IVHotspot(parameters) {
    var self = this;
    self.instanceIndex = getAndIncrementGlobalCounter();

    if (typeof parameters.texts === 'string') {
      parameters.texts = {};
    }

    parameters = $.extend(true, {
      destination: {
        type: 'timecode',
        time: '0'
      },
      visuals: {
        shape: 'rectangular',
        backgroundColor: 'rgba(255, 255, 255, 0)'
      },
      texts: {}
    }, parameters);

    EventDispatcher.call(self);

    /**
     * Attach the hotspot to the given container.
     *
     * @param {H5P.jQuery} $container
     */
    self.attach = function ($container) {
      $container.addClass('h5p-ivhotspot').css({
        backgroundColor: parameters.visuals.backgroundColor
      }).addClass(parameters.visuals.shape);

      var $a;
      if (parameters.destination.type === 'url') {
        var link = new H5P.Link({
          title: '',
          linkWidget: parameters.destination.url
        });

        link.attach($container);
        $a = $container.find('a');
        $a.keypress(function (event) {
            if (event.which === 32) {
              this.click();
            }
        });
      }
      else {
        $a = $('<a>', {
          href: '#',
          'aria-labelledby': 'ivhotspot-' + self.instanceIndex + '-description'
        }).on('click', function (event) {
          self.trigger('goto', parameters.destination.time);
          event.preventDefault();
        }).keypress(function (event) {
          if (event.which === 32) {
            self.trigger('goto', parameters.destination.time);
          }
        });
        $container.html($a);
      }

      $a.css({cursor: parameters.visuals.pointerCursor ? 'pointer' : 'default'});

      if (parameters.visuals.animation) {
        $container.append($('<div>', {
          'class': 'blinking-hotspot'
        }));
      }
      var alternativeTextContent = [parameters.texts.alternativeText, parameters.texts.label]
        .filter(function (text) {
          return text !== undefined;
        }).join('. ');

      $('<p>', {
        id: 'ivhotspot-' + self.instanceIndex + '-description',
        class: 'h5p-ivhotspot-invisible',
        text: alternativeTextContent
      }).appendTo($container);

      if (parameters.texts.label !== undefined) {
        var $label = $('<p>', {
          class: 'h5p-ivhotspot-interaction-title',
          text: parameters.texts.label
        }).appendTo($a);

        if (!parameters.texts.showLabel) {
          $label.addClass('h5p-ivhotspot-invisible');
        }

        else if (parameters.texts.labelColor) {
          $a.css('color', parameters.texts.labelColor);
        }
      }
    };
  }

  /**
   * Use a global counter to separate instances of iv-hotspots,
   * to maintain unique ids.
   *
   * Note that ids does not have to be unique across iframes.
   *
   * @return {number}
   */
  function getAndIncrementGlobalCounter() {
    if (window.interactiveVideoCounter === undefined) {
      window.interactiveVideoCounter = 0;
    }

    return window.interactiveVideoCounter++;
  }

  IVHotspot.prototype = Object.create(EventDispatcher.prototype);
  IVHotspot.prototype.constructor = IVHotspot;


  return IVHotspot;

})(H5P.jQuery, H5P.EventDispatcher);
