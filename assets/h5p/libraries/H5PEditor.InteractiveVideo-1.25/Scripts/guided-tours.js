H5PEditor.InteractiveVideo.GuidedTours = (function () {

  // Shorthand for translate function:
  var t = H5PEditor.InteractiveVideo.t;

  var currentTourId;

  /**
   * @class H5PEditor.InteractiveVideo.GuidedTours
   */
  function GuidedTours() {}

  /**
   * Defines the different tours in IV
   * @return {Array}
   */
  GuidedTours.setup = function () {

    if (GuidedTours.tours === undefined) {
      GuidedTours.tours = [
        // Upload video tab
        {
          steps: [
            {
              text: t('tourStepUploadIntroText'),
              attachTo: {element: '.h5peditor-tabs', on: 'bottom'},
              noArrow: true
            },
            {
              title: t('tourStepUploadFileTitle'),
              text: t('tourStepUploadFileText'),
              attachTo: {element: '.field.video .h5p-add-file', on: 'right'},
              highlightElement: true
            },
            {
              title: t('tourStepUploadAddInteractionsTitle'),
              text: t('tourStepUploadAddInteractionsText'),
              attachTo: {element: '.h5peditor-tab-assets', on: 'bottom'},
              highlightElement: true
            }
          ],
          options: {
            id: 'h5p-editor-interactive-video-initial-v1'
          }
        },
        // Interactions tab
        {
          steps: [
            {
              title: t('tourStepCanvasToolbarTitle'),
              text: t('tourStepCanvasToolbarText'),
              attachTo: {element: '.h5peditor-dragnbar', on: 'bottom'},
              highlightElement: true
            },
            {
              title: t('tourStepCanvasEditingTitle'),
              text: t('tourStepCanvasEditingText'),
              attachTo: {element: '.h5p-video-wrapper', on: 'center'},
              noArrow: true,
              scrollTo: true
            },
            {
              title: t('tourStepCanvasBookmarksTitle'),
              text: t('tourStepCanvasBookmarksText'),
              attachTo: {element: '.h5p-control.h5p-bookmarks', on: 'right'},
              highlightElement: true,
              scrollTo: true
            },
            {
              title: t('tourStepCanvasPreviewTitle'),
              text: t('tourStepCanvasPreviewText'),
              attachTo: {element: '.h5p-control.h5p-play', on: 'right'},
              highlightElement: true,
              scrollTo: true
            },
            {
              title: t('tourStepCanvasSaveTitle'),
              text: t('tourStepCanvasSaveText'),
              attachTo: {element: '.h5p-video-wrapper', on: 'center'},
              noArrow: true,
              scrollTo: true
            }
          ],
          options: {
            id: 'h5p-editor-interactive-video-interactions-v1'
          }
        },
        // Summary tab
        {
          steps: [
            {
              text: t('tourStepSummaryText'),
              attachTo: {element: '.h5peditor-tabs', on: 'bottom'},
              noArrow: true
            }
          ],
          options: {
            id: 'h5p-editor-interactive-video-summary-v1'
          }
        }
      ];
    }

    return GuidedTours.tours;
  };

  /**
   * Starts a guided tour
   *
   * @method GuidedTours.start
   * @static
   * @param  {number} tourId The index of the guide (as defined in the tours array)
   * @param  {boolean} force Force displaying the guide (even if it has been displayed before)
   */
  GuidedTours.start = function (tourId, force, t) {
    force = force || false;

    var tours = GuidedTours.setup();

    if ((tourId < 0 || (tourId+1) > tours.length) ||
        (tourId === currentTourId && tours[currentTourId].instance.isOpen())) {
      return;
    }

    // Hide guide if another guide is allready present - only one guide at a time
    if (currentTourId !== undefined) {
      tours[currentTourId].instance.hide();
    }

    var tour = tours[tourId];

    // Add labels:
    tour.options.labels = {
      exit: t('tourButtonExit'),
      done: t('tourButtonDone'),
      back: t('tourButtonBack'),
      next: t('tourButtonNext')
    };

    if (tour !== undefined) {
      if (tour.instance === undefined) {
        tour.instance = new H5P.GuidedTour(tour.steps, tour.options);
      }
      tour.instance.start(force, function () {
        currentTourId = tourId;
      });
    }
  };

  /**
   * Checks if any guided tour is open
   *
   * @method GuidedTours.isOpen
   * @static
   */
  GuidedTours.isOpen = function () {
    if (GuidedTours.tours) {
      for (var i = 0; i < GuidedTours.tours.length; i++) {
        if (GuidedTours.tours[i].instance && GuidedTours.tours[i].instance.isOpen()) {
          return true;
        }
      }
    }
    return false;
  };

  /**
   * Removes all guided tours
   *
   * @method GuidedTours.remove
   * @static
   */
  GuidedTours.remove = function () {
    if (!GuidedTours.tours) {
      return;
    }

    for (var i = 0; i < GuidedTours.tours.length; i++) {
      var tour = GuidedTours.tours[i].instance;
      tour && tour.destroy();
    }

    // Clear the tours array and currentTourId
    GuidedTours.tours = undefined;
    currentTourId = undefined;
  };

  return GuidedTours;
})();
