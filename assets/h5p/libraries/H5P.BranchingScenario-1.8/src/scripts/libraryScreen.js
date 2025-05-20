import LibraryScreenOverlay from './libraryScreenOverlay.js';
import { addResizeListener } from 'detect-resize';
import '@styles/libraryScreen.scss';
import '@styles/branchingQuestion.scss';

export default class LibraryScreen extends H5P.EventDispatcher {
  /**
   * LibraryScreen.
   * @class
   * @param  {BranchingScenario} parent BranchingScenario object.
   * @param  {string} courseTitle Title.
   * @param  {object} library H5P Library Data.
   * @param  {object} [previousState] Previous states of library.
   * @param  {number} [lastNodeId] Id of last node from previous state.
   */
  constructor(parent, courseTitle, library, previousState, lastNodeId = 0) {
    super();
    this.parent = parent;
    this.previousState = previousState ?? {};
    this.lastNodeId = lastNodeId;

    this.currentLibraryElement;
    this.currentLibraryInstance;
    this.currentLibraryId = 0;
    this.nextLibraryId = library.nextContentId;
    this.libraryFeedback = library.feedback;
    this.nextLibraries = {};
    this.libraryInstances = {};
    this.libraryFinishingRequirements = [];
    this.libraryTitle;
    this.branchingQuestions = [];
    this.navButton;
    this.header;
    this.isShowing = false;
    this.contentOverlays = [];

    const contentTitle = (library.type && library.type.metadata && library.type.metadata.title ? library.type.metadata.title : '');
    this.wrapper = this.createWrapper(courseTitle, (contentTitle ? contentTitle : 'Untitled Content'), library.showContentTitle && contentTitle);
    this.wrapper.classList.add('h5p-next-screen');
    this.wrapper.classList.add('h5p-branching-hidden');

    const libraryWrapper = this.createLibraryElement(library, false);
    this.currentLibraryWrapper = libraryWrapper;
    this.currentLibraryElement = libraryWrapper.getElementsByClassName('h5p-branching-scenario-content')[0];
    this.currentLibraryInstance = this.libraryInstances[0]; // TODO: Decide whether the start screen id should be hardcoded as 0

    this.createNextLibraries(library);

    this.wrapper.appendChild(libraryWrapper);

    this.createNavButtons();

    /**
     * Handle enterfullscreen event and resize the library instance
     */
    this.parent.on('enterFullScreen', () => {
      setTimeout(() => {
        if (this.currentLibraryInstance) {
          this.currentLibraryInstance.trigger('resize');
        }
      }, 500);
    });
  }

  /**
   * Resize wrapper to fit library
   */
  handleLibraryResize() {
    // Fullscreen always use the full height available to it
    if (this.parent.isFullScreen()) {
      this.currentLibraryWrapper.style.height = '';
      this.wrapper.style.minHeight = '';
      return;
    }

    this.currentLibraryWrapper.style.height = `${this.currentLibraryElement.clientHeight + 40}px`;
    // NOTE: This is a brittle hardcoding of the header height
    this.wrapper.style.minHeight = `${this.currentLibraryElement.clientHeight + 40 + 70.17}px`;
    if (
      this.currentLibraryWrapper.offsetHeight <
      this.currentLibraryElement.scrollHeight
    ) {
      this.currentLibraryElement.tabIndex = 0;
    }
  }

  /**
   * Create wrapping div for library screen.
   * @param {string} courseTitle Main title.
   * @param {string} libraryTitle Library specific title.
   * @returns {HTMLElement} Wrapping div.
   */
  createWrapper(courseTitle, libraryTitle, showLibraryTitle) {
    const wrapper = document.createElement('div');

    const titleDiv = document.createElement('div');
    titleDiv.classList.add('h5p-title-wrapper');

    if (H5P.fullscreenSupported) {
      const fullScreenButton = document.createElement('button');
      fullScreenButton.className = 'h5p-branching-full-screen';
      fullScreenButton.setAttribute(
        'aria-label', this.parent.params.l10n.fullscreenAria
      );
      fullScreenButton.addEventListener('click', () => {
        this.trigger('toggleFullScreen');
      });

      titleDiv.appendChild(fullScreenButton);
    }

    const headers = document.createElement('div');
    headers.className = 'h5p-branching-header';

    const headerTitle = document.createElement('h1');
    headerTitle.innerHTML = courseTitle;
    headers.appendChild(headerTitle);

    const headerSubtitle = document.createElement('h2');
    headerSubtitle.classList.add('library-subtitle');
    headerSubtitle.innerHTML = showLibraryTitle ? libraryTitle : '&nbsp;';
    headerSubtitle.setAttribute('tabindex', '-1');
    headerSubtitle.setAttribute('aria-label', libraryTitle);
    headers.appendChild(headerSubtitle);

    titleDiv.appendChild(headers);

    this.libraryTitle = headerSubtitle;

    const header = document.createElement('div');
    header.classList.add('h5p-screen-header');

    this.header = header;

    header.appendChild(titleDiv);
    wrapper.appendChild(header);

    const handleWrapperResize = () => {
      if (this.wrapper.clientHeight > 500) {
        this.wrapper.style.minHeight = `${this.wrapper.clientHeight}px`;
      }
    };

    addResizeListener(wrapper, handleWrapperResize);

    // Resize container on animation end
    wrapper.addEventListener('animationend', (event) => {
      if (event.animationName === 'slide-in' && this.currentLibraryElement) {
        this.parent.trigger('resize');

        window.setTimeout(() => {
          // Make the library resize then make the wrapper resize to the new library height
          addResizeListener(this.currentLibraryElement, () => {
            this.handleLibraryResize();
            this.parent.trigger('resize');
          });
        }, 100);
      }
    });

    return wrapper;
  }

  /**
   * Append back button.
   * @param {string} label Button label.
   * @return {HTMLElement} Back button.
   */
  createBackButton(label) {
    const backButton = document.createElement('button');
    backButton.classList.add('transition');
    backButton.classList.add('h5p-back-button');

    // Navigation
    backButton.addEventListener('click', (event) => {
      // Hide overlay popup when user is at Branching Question
      if (event.currentTarget.hasAttribute('isBQ')) {
        if (this.overlay) {
          if (this.overlay.parentNode !== null) {
            this.overlay.parentNode.removeChild(this.overlay);
          }
          this.overlay = undefined;
          this.branchingQuestions.forEach((bq) => {
            if (bq.parentNode !== null) {
              bq.parentNode.removeChild(bq);
            }
          });
          this.showBackgroundToReadspeaker();
        }
        // If the BQ is at first position, we need to restart the screen when user want to go back from the 2nd screen (next screen after BQ)
        if (this.parent.params.content[0].type.library.split(' ')[0] === 'H5P.BranchingQuestion' && this.parent.currentId === 0) {
          this.parent.trigger('restarted', { keepStates: true });
          return backButton;
        }
        this.parent.trigger('navigated', {
          reverse: true
        });
        return;
      }

      // Stop impatient users from breaking the view
      if (this.parent.navigating === true) {
        return;
      }

      if (this.currentLibraryId === 0 && this.parent.params.content[this.parent.currentId].type.library.split(' ')[0] !== 'H5P.BranchingQuestion') {
        this.parent.isReverseTransition = true;
        this.parent.trigger('restarted', { keepStates: true });
        return backButton;
      }

      this.parent.trigger('navigated', {
        reverse: true
      });
      this.parent.navigating = true;
    });

    backButton.appendChild(document.createTextNode(label));

    return backButton;
  }

  //  Hande proceed to next slide.
  handleProceed() {
    let returnValue = true;
    // Stop impatient users from breaking the view
    if (this.parent.navigating === false) {
      const hasFeedbackTitle = this.libraryFeedback.title &&
        this.libraryFeedback.title.trim();
      const hasFeedbackSubtitle = this.libraryFeedback.subtitle &&
        this.libraryFeedback.subtitle.trim();

      const hasFeedback = !!(hasFeedbackTitle ||
        hasFeedbackSubtitle ||
        this.libraryFeedback.image
      );

      if (hasFeedback && this.nextLibraryId !== -1) {
        // Add an overlay if it doesn't exist yet
        if (this.overlay === undefined) {
          this.overlay = document.createElement('div');
          this.overlay.className = 'h5p-branching-scenario-overlay';
          this.wrapper.appendChild(this.overlay);
          this.hideBackgroundFromReadspeaker();
        }

        const branchingQuestion = document.createElement('div');
        branchingQuestion.classList.add('h5p-branching-question-wrapper');
        branchingQuestion.classList.add('h5p-branching-scenario-feedback-dialog');

        const questionContainer = document.createElement('div');
        questionContainer.classList.add('h5p-branching-question-container');

        branchingQuestion.appendChild(questionContainer);

        const feedbackScreen = this.createFeedbackScreen(this.libraryFeedback, this.nextLibraryId);
        questionContainer.appendChild(feedbackScreen);

        questionContainer.classList.add('h5p-start-outside');
        questionContainer.classList.add('h5p-fly-in');
        this.currentLibraryWrapper.style.zIndex = 0;
        setTimeout(() => {
          // Small wait for safari browsers
          this.wrapper.appendChild(branchingQuestion);

          // After adding feedback, check whether the resize is needed or not
          if (parseInt(this.currentLibraryWrapper.style.height) < questionContainer.offsetHeight) {
            this.currentLibraryElement.style.height = questionContainer.offsetHeight + 'px';
            this.wrapper.style.height = questionContainer.offsetHeight + 'px';
            this.parent.trigger('resize');
          }
        }, 100);
        feedbackScreen.focus();
        this.parent.navigating = true;
      }
      else {
        const nextScreen = {
          nextContentId: this.nextLibraryId
        };

        if (!!(hasFeedback || (this.libraryFeedback.endScreenScore !== undefined))) {
          nextScreen.feedback = this.libraryFeedback;
        }

        // Allow user to naviate to next slide/library if the execution completes
        returnValue = false;

        new Promise((resolve) => {
          resolve(this.parent.trigger('navigated', nextScreen));
        }).then(() => {
          this.parent.proceedButtonInProgress = false;
          this.parent.navigating = true;
        });
      }
    }

    // Return to Proceed button listener with response
    if (returnValue) {
      return returnValue;
    }
  }

  createFeedbackScreen(feedback, nextContentId) {
    const labelId = 'h5p-branching-feedback-title-' + LibraryScreen.idCounter++;
    const wrapper = document.createElement('div');
    wrapper.classList.add('h5p-branching-question');
    wrapper.classList.add(feedback.image !== undefined ? 'h5p-feedback-has-image' : 'h5p-feedback-default');
    wrapper.setAttribute('role', 'dialog');
    wrapper.setAttribute('tabindex', '-1');
    wrapper.setAttribute('aria-labelledby', labelId);

    if (feedback.image !== undefined && feedback.image.path !== undefined) {
      const imageContainer = document.createElement('div');
      imageContainer.classList.add('h5p-branching-question');
      imageContainer.classList.add('h5p-feedback-image');
      const image = document.createElement('img');
      image.src = H5P.getPath(feedback.image.path, this.parent.contentId);
      imageContainer.appendChild(image);
      wrapper.appendChild(imageContainer);
    }

    const feedbackContent = document.createElement('div');
    feedbackContent.classList.add('h5p-branching-question');
    feedbackContent.classList.add('h5p-feedback-content');

    const feedbackText = document.createElement('div');
    feedbackText.classList.add('h5p-feedback-content-content');
    feedbackContent.appendChild(feedbackText);

    const title = document.createElement('h1');
    title.id = labelId;
    title.innerHTML = feedback.title || '';
    feedbackText.appendChild(title);

    if (feedback.subtitle) {
      const subtitle = document.createElement('div');
      subtitle.innerHTML = feedback.subtitle || '';
      feedbackText.appendChild(subtitle);
    }

    const navButton = document.createElement('button');
    navButton.addEventListener('click', () => {
      this.parent.trigger('navigated', { nextContentId });
    });

    const proceedButtonText = this.parent.getLibrary(this.currentLibraryId).proceedButtonText;
    const text = document.createTextNode(proceedButtonText);
    navButton.appendChild(text);

    feedbackContent.appendChild(navButton);

    wrapper.appendChild(feedbackContent);

    return wrapper;
  }

  /**
   * Create library element and hide it if necessary.
   * @param {object} library Library object.
   * @param {boolean} isNextLibrary Determines if the lirbary should be hidden for now.
   * @returns {HTMLElement} Wrapping div for the library element.
   */
  createLibraryElement(library, isNextLibrary) {
    const wrapper = document.createElement('div');
    wrapper.classList.add('h5p-library-wrapper');

    const libraryElement = document.createElement('div');
    libraryElement.classList.add('h5p-branching-scenario-content');
    this.appendRunnable(libraryElement, library.type, library.contentId);

    const libraryMachineName = library.type?.library.split(' ')[0];

    // Content overlay required for some instances
    this.contentOverlays[library.contentId] = new LibraryScreenOverlay(this);
    wrapper.appendChild(this.contentOverlays[library.contentId].getDOM());
    if (libraryMachineName === 'H5P.InteractiveVideo' || libraryMachineName === 'H5P.Video') {
      this.contentOverlays[library.contentId].addButton(
        'replay',
        this.parent.params.l10n.replayButtonText,
        () => {
          this.handleReplayVideo(libraryMachineName, library);
        }
      );
      this.contentOverlays[library.contentId].addButton(
        'proceed',
        library.proceedButtonText,
        () => {
          this.handleProceedAfterVideo();
        }
      );
    }

    wrapper.appendChild(libraryElement);

    if (isNextLibrary) {
      wrapper.classList.add('h5p-next');
      libraryElement.classList.add('h5p-branching-hidden');
    }

    // Special case when first node is BQ and library screen tries to display it
    if (libraryMachineName === 'H5P.BranchingQuestion') {
      libraryElement.classList.add('h5p-branching-hidden');
    }

    return wrapper;
  }

  handleReplayVideo(libraryMachineName, library) {
    this.contentOverlays[this.currentLibraryId].hide();

    // Hide procced button
    if (
      this.libraryFinishingRequirements[library.contentId] === true &&
      this.hasValidVideo(library)
    ) {
      this.parent.disableNavButton();
    }

    // sets buffering state for video
    this.currentLibraryInstance.currentState = 3;

    this.currentLibraryInstance.seek(0);
    this.currentLibraryInstance.play();

    if (libraryMachineName === 'H5P.InteractiveVideo') {
      this.resetIVProgress();
    }
  }

  /**
   *  Used to reset an IV after you replay it.
   */
  resetIVProgress() {
    let interactions = this.currentLibraryInstance.interactions;
    interactions.forEach((interaction) => {
      interaction.resetTask();
    });

    let interactiveVideo = this.currentLibraryInstance;
    interactiveVideo.addSliderInteractions();

    if (!interactiveVideo.endscreen) {
      return;
    }

    interactiveVideo.endscreen.update();
    interactiveVideo.endscreen.$closeButton[0].click();

    let ivSubmitScreenStar = this.wrapper.getElementsByClassName('h5p-star-foreground')[0];
    ivSubmitScreenStar.classList.remove('h5p-star-active');
  }

  /**
   * Handle proceed after video.
   */
  handleProceedAfterVideo() {
    this.contentOverlays[this.currentLibraryId].hide();
    this.handleProceed();
  }

  /**
   * Create new content instance from given content parameters and
   * attach it to wrapper. Set up event listeners.
   * @param {object} container Container the library should be appended to
   * @param {object} content Data for the library
   * @param {number} id Id of the library
   */
  appendRunnable(container, content, id) {
    const library = content.library.split(' ')[0];
    if (library === 'H5P.Video') {
      // Prevent video from growing endlessly since height is unlimited.
      content.params.visuals.fit = false;
    }
    else if (library === 'H5P.BranchingQuestion') {
      const proceedButtonText = this.parent.getLibrary(id).proceedButtonText;
      content.params.proceedButtonText = proceedButtonText;
    }

    /*
     * Deep clone paramters to prevent modification (since they're reused each
     * time the course is reset).
     * `structuredClone(content)` can be used to replace the jQuery dependency,
     * when jQuery is removed from H5P core, but currently it's not supported by
     * Safari 15.4 which would mean to still violate the latest 3 browsers rule.
     */
    const contentClone = window.structuredClone ?
      structuredClone(content) :
      H5P.jQuery.extend(true, {}, content);

    /*
     * The logic of how instances and their wrappers are handled seems to have
     * grown over time. It's not obvious why new instances get created over and
     * over again by different callers instead of instantiating them once by a
     * manager and let them be served as needed. This would probably mean major
     * refactoring (together with the intertwined class code).
     * As a workaround, the previous state of the last library instance that was
     * shown is passed back when instantiating the LibraryScreen in order to be
     * sure it's available no matter by what path newRunnable is called.
     */
    const extras = { parent: this.parent };
    const previousStateIsForCurrentId =
      typeof(this.lastNodeId) === 'number' && this.lastNodeId === id;
    if (this.previousState && previousStateIsForCurrentId) {
      extras.previousState = this.previousState;
    }

    // Create content instance
    const instance = H5P.newRunnable(
      contentClone,
      this.parent.contentId,
      H5P.jQuery(container),
      true,
      extras
    );

    if (
      this.parent.params.content[id].forceContentFinished === 'enabled' ||
      this.parent.params.content[id].forceContentFinished === 'useBehavioural' &&
      this.parent.params.behaviour.forceContentFinished === true
    ) {
      this.libraryFinishingRequirements[id] =
        this.forceContentFinished(instance, library);

      this.addFinishedListeners(instance, library);
    }

    instance.setActivityStarted();

    // Proceed to Branching Question automatically after video has ended
    if (library === 'H5P.Video' && this.nextIsBranching(id)) {
      instance.on('stateChange', (event) => {
        if (event.data === H5P.Video.ENDED && this.navButton) {
          this.handleProceed();
        }
      });
    }
    else if (library === 'H5P.Image') {
      // Ensure that iframe is resized when image is loaded.
      instance.on('loaded', () => {
        this.handleLibraryResize();
        this.parent.trigger('resize');
      });
    }

    if (library === 'H5P.Video' || library === 'H5P.InteractiveVideo') {
      const videoInstance = (library === 'H5P.Video') ?
        instance :
        instance.video;

      videoInstance.on('loaded', () => {
        this.handleLibraryResize();
      });

      videoInstance.on('error', () => {
        this.parent.enableNavButton();
      });
    }

    instance.on('navigated', (event) => {
      this.parent.trigger('navigated', event.data);
    });

    this.libraryInstances[id] = instance;

    // Bubble resize events
    this.bubbleUp(instance, 'resize', this.parent);

    // Remove any fullscreen buttons
    this.disableFullscreen(instance);
  }

  /**
   * Get current instance state.
   * @returns {object} Current state.
   */
  getCurrentState() {
    return this.currentLibraryInstance?.getCurrentState?.();
  }

  /**
   * Try to stop any playback on instance.
   * @param {number} id Id of instance node.
   */
  stopPlayback(id) {
    const instance = this.libraryInstances[id];
    if (instance) {
      try {
        if (typeof instance.pause === 'function') {
          instance.pause();
        }
        else if (typeof instance.video?.pause === 'function') {
          instance.video.pause();
        }
        else if (typeof instance.stop === 'function') {
          instance.stop();
        }
        else if (
          typeof instance.pauseMedia === 'function' &&
          instance.elementInstances[instance.currentSlideIndex]
        ) {
          instance.elementInstances[instance.currentSlideIndex]
            .forEach((element) => {
              instance.pauseMedia(element);
            });
        }
      }
      catch (err) {
        // Prevent crashing, but tell developers there's something wrong.
        H5P.error(err);
      }
    }
  }

  /**
   * Check whether instance needs to be finished by user.
   * @param {object} instance Instance of the content type.
   * @param {string} library Library that's active on screen (H5P.Foo).
   */
  forceContentFinished(instance, library) {
    let forceContentFinished = false;

    if (instance) {
      forceContentFinished = forceContentFinished ||
        typeof instance?.getScore === 'function';
    }

    /*
     * Some libraries need to tuned explicitly because there's no way to
     * detect whether they are a "finishable" content type
     */
    if (library) {
      forceContentFinished = forceContentFinished ||
        (library === 'H5P.Audio' || library === 'H5P.Video');
    }

    // Exceptions
    if (
      library === 'H5P.CoursePresentation' &&
      (instance?.children.length + (instance.isTask ? 1 : 0) === 1) ||
      instance?.activeSurface === true
    ) {
      forceContentFinished = false;
    }

    return forceContentFinished;
  }

  /**
   * Add listeners for screen finished.
   * Will require to handle some content types explicitly.
   * @param {object} instance Instance of the content type.
   * @param {string} library Library that's active on screen (H5P.Foo).
   */
  addFinishedListeners(instance, library) {
    if (typeof library !== 'string' || !instance) {
      return;
    }
    switch (library) {
      case 'H5P.CoursePresentation':
        // Permit progression when final slide has been reached
        instance.on('xAPI', (event) => {
          if (event.data.statement.verb.display['en-US'] === 'progressed') {
            const slideProgressedTo = parseInt(event.data.statement.object.definition.extensions['http://id.tincanapi.com/extension/ending-point']);
            if (slideProgressedTo === instance.children.length + (instance.isTask ? 1 : 0)) {
              if (this.navButton.classList.contains('h5p-disabled')) {
                this.parent.enableNavButton(true);
              }
            }
          }
        });
        break;

      case 'H5P.InteractiveVideo':
        // Permit progression when results have been submitted or video ended if no tasks
        instance.on('xAPI', (event) => {
          if (event.data.statement.verb.display['en-US'] === 'completed') {
            this.handleVideoOver();
          }
        });
        instance.video.on('stateChange', (event) => {
          if (
            event.data === H5P.Video.ENDED ||
            (
              event.data === H5P.Video.PLAYING &&
              this.contentOverlays[this.currentLibraryId].hidden === false
            )
          ) {
            const answered = instance.interactions
              .filter((interaction) => interaction.getProgress() !== undefined);

            // Giving opportunity to submit the answers
            if (instance.hasStar && answered.length > 0) {
              this.parent.enableNavButton();
            }
            else {
              this.handleVideoOver();
            }
            this.pause();
          }
        });
        break;

      // Permit progression when video ended
      case 'H5P.Video':
        instance.on('stateChange', (event) => {
          if (event.data === H5P.Video.ENDED) {
            if (!this.nextIsBranching(this.currentLibraryId)) {
              this.handleVideoOver();
            }
            // else already handled by general video listener
          }
        });
        break;

      // Permit progression when audio ended
      case 'H5P.Audio':
        instance.audio.on('ended', () => {
          this.parent.enableNavButton();
        });
        break;

      // Permit progression when xAPI sends "answered" or "completed"
      default:
        if (typeof instance.getAnswerGiven === 'function') {
          instance.on('xAPI', (event) => {
            if (
              event.data.statement.verb.display['en-US'] === 'answered' ||
              event.data.statement.verb.display['en-US'] === 'completed'
            ) {
              this.parent.enableNavButton();
            }
          });
        }
    }
  }

  /**
   * Handle video completed.
   * Will proceed right away if next node is BQ, otherwise show intermediary overlay.
   */
  handleVideoOver() {
    if (this.nextIsBranching(this.currentLibraryId)) {
      this.handleProceed();
    }
    else {
      this.showContentOverlay();
    }

    this.parent.enableNavButton();
  }

  /**
   * Show content overlay.
   */
  showContentOverlay() {
    this.contentOverlays[this.currentLibraryId].show();
  }

  /**
   * Hide content overlay.
   */
  hideContentOverlay() {
    this.contentOverlays[this.currentLibraryId].hide();
  }

  /**
   * Get XAPI data for "previous" library.
   * @param {number} id Id of the instance node.
   * @return {object} XAPI Data.
   */
  getXAPIData(id) {
    if (this.libraryInstances[id] && this.libraryInstances[id].getXAPIData) {
      return this.libraryInstances[id].getXAPIData();
    }
  }

  /**
   * Check if next node is a Branching Question.
   * @param {number} id Id of node to check for.
   * @return {boolean} True, if next node is BQ, else false.
   */
  nextIsBranching(id) {
    const nextContentId = (id !== undefined) ?
      this.parent.params.content[id].nextContentId :
      undefined;

    return (nextContentId !== undefined && nextContentId > 0) ?
      LibraryScreen.isBranching(this.parent.params.content[nextContentId]) :
      false;
  }

  /**
   * Pre-render next libraries for smooth transitions for specific library.
   * @param {object} library Library Data.
   */
  createNextLibraries(library) {
    this.removeNextLibraries();
    this.nextLibraries = {};
    this.loadLibrary(library);
  }

  /**
   * Create next library.
   * @param {object} library.
   */
  createNextLibrary(library) {
    this.removeNextLibraries();
    this.nextLibraries = {};
    this.loadLibrary(library, library.contentId);
  }

  /**
   * Load library.
   * @param {object} library Library.
   * @param {number} [contentId] Id of loaded library.
   */
  loadLibrary(library, contentId = null) {
    const loadedContentId = contentId !== null ?
      contentId :
      library.nextContentId;

    // If not a branching question, just load the next library
    if (library.type.library.split(' ')[0] !== 'H5P.BranchingQuestion') {
      const nextLibrary = this.parent.getLibrary(loadedContentId);

      // Do nothing if the next screen is an end screen
      if (nextLibrary === false) {
        return;
      }

      // Pre-render the next library if it is not a branching question
      if (
        nextLibrary?.type.library.split(' ')[0] !== 'H5P.BranchingQuestion'
      ) {
        this.nextLibraries[loadedContentId] =
          this.createLibraryElement(nextLibrary, true);

        this.wrapper.appendChild(this.nextLibraries[loadedContentId]);
      }
    }
    // If it is a branching question, load all the possible libraries
    else {
      const alternatives = library.type.params.branchingQuestion.alternatives ||
        [];

      alternatives
        .map((alternative) => alternative.nextContentId)
        .forEach((nextContentId) => {
          const nextLibrary = this.parent.getLibrary(nextContentId);

          // Do nothing if the next screen is an end screen
          if (nextLibrary === false) {
            return;
          }

          // Pre-render all the next libraries as long as they are not branching questions
          if (
            nextLibrary?.type.library.split(' ')[0] !== 'H5P.BranchingQuestion'
          ) {
            this.nextLibraries[nextContentId] =
              this.createLibraryElement(nextLibrary, true);

            this.wrapper.appendChild(this.nextLibraries[nextContentId]);
          }
        });
    }
  }

  /**
   * Remove next libraries
   */
  removeNextLibraries() {
    // Remove outdated 'next' libraries
    const nextLibraryElements =
      [...this.wrapper.getElementsByClassName('h5p-next')];

    nextLibraryElements.forEach((nextLibraryElement) => {
      nextLibraryElement.parentNode.removeChild(nextLibraryElement);
    });
  }

  /**
   * Remove custom fullscreen buttons from sub content.
   * (A bit of a hack, there should have been some sort of override…)
   * @param {object} instance Library instance
   */
  disableFullscreen(instance) {
    switch (instance.libraryInfo.machineName) {
      case 'H5P.CoursePresentation':
        if (instance.$fullScreenButton) {
          instance.$fullScreenButton.remove();
        }
        break;

      case 'H5P.InteractiveVideo':
        instance.on('controls', () => {
          if (instance.controls.$fullscreen) {
            instance.controls.$fullscreen.remove();
          }
        });
        break;
    }
  }

  /**
   * Make it easy to bubble events from child to parent
   * @param {object} origin Origin of the Event
   * @param {string} eventName Name of the Event
   * @param {object} target Target to trigger event on
   */
  bubbleUp(origin, eventName, target) {
    origin.on(eventName, (event) => {
      // Prevent target from sending event back down
      target.bubblingUpwards = true;
      target.trigger(eventName, event);

      // Reset
      target.bubblingUpwards = false;
    });
  }

  /**
   * Checks to see if the library has a valid video (source file or external link).
   * video/unknown check is to verify that external Youtube links work correctly.
   */
  hasValidVideo(currentLibraryParams) {
    const type = currentLibraryParams.type;
    const videoLibrary = type.metadata.contentType;

    let videoSource = videoLibrary === 'Interactive Video'
      ? type.params.interactiveVideo.video.files
      : type.params.sources;

    if (type
      && (videoLibrary === 'Interactive Video' || videoLibrary === 'Video')
      && videoSource
      && videoSource[0].mime
      && videoSource[0].mime !== 'video/unknown'
      && (
        (
          videoSource[0].mime !== 'video/webm' &&
          videoSource[0].mime !== 'video/mp4'
        ) ||
        H5P.VideoHtml5.canPlay(videoSource)
      )
    ) {
      return true;
    }

    return false;
  }

  /**
   * Slide screen in and style it as the current screen.
   * @param {object} [options] Options.
   * @param {boolean} [options.skipAnimation] True to skip animation.
   * @param {boolean} [options.skipFocus] True to skip focus.
   */
  show(options = {}) {
    const library = this.parent.params.content[this.currentLibraryId];

    if (
      this.libraryFinishingRequirements[this.currentLibraryId] === true &&
      (
        this.hasValidVideo(library) ||
        library.type.library.split(' ')[0] === 'H5P.CoursePresentation'
      )
    ) {
      this.contentOverlays[this.currentLibraryId].hide();
      this.parent.disableNavButton();
    }

    this.isShowing = true;

    this.wrapper.classList.remove('h5p-branching-hidden');

    const done = () => {
      this.wrapper.classList.remove('h5p-next-screen');
      this.wrapper.classList.remove('h5p-slide-in');
      this.wrapper.classList.add('h5p-current-screen');
      this.parent.navigating = false;
      this.wrapper.style.minHeight = this.parent.currentHeight;
      if (!options.skipFocus) {
        this.libraryTitle.focus();
      }
    };

    if (options.skipAnimation) {
      done();
    }
    else {
      this.wrapper.classList.add('h5p-slide-in');

      // Style as the current screen
      this.wrapper.addEventListener('animationend', (event) => {
        if (event.target.className === 'h5p-next-screen h5p-slide-in') {
          done();
        }
      });
    }
  }

  /**
   * Slide screen out and style it to be hidden.
   * @param {boolean} skipAnimationListener Skips waiting for animation before removing elements. Useful when animation would not have time to run anyway.
   */
  hide(skipAnimationListener) {
    this.isShowing = false;

    // Remove possible alternative libaries
    for (let i = 0; i < this.nextLibraries.length; i++) {
      // Ensures it is hidden if remove() doesn't execute quickly enough
      this.nextLibraries[i].style.display = 'none';
      if (this.nextLibraries[i].parentNode !== null) {
        this.nextLibraries[i].parentNode.removeChild(this.nextLibraries[i]);
      }
    }


    // Hide overlay and branching questions
    if (this.overlay) {
      if (this.overlay.parentNode !== null) {
        this.overlay.parentNode.removeChild(this.overlay);
      }
      // TODO: Does not appear to ever run...
      this.overlay = undefined;
      this.branchingQuestions.forEach((bq) => {
        if (bq.parentNode !== null) {
          bq.parentNode.removeChild(bq);
        }
      });
    }

    this.wrapper.classList.add('h5p-slide-out');

    const removeElements = () => {
      this.wrapper.classList.remove('h5p-current-screen');
      this.wrapper.classList.add('h5p-next-screen');
      this.wrapper.classList.remove('h5p-slide-out');
      this.wrapper.classList.remove('h5p-slide-out-reverse');
      this.wrapper.classList.remove('h5p-slide-pseudo');
      setTimeout(() => {
        if (this.wrapper.parentNode !== null) {
          this.wrapper.parentNode.removeChild(this.wrapper);
          this.remove();
          this.parent.trigger('resize');
        }
      }, 100);
    };

    if (skipAnimationListener) {
      window.setTimeout(() => {
        removeElements();
      }, 800);
    }
    else {
      this.wrapper.addEventListener('animationend', () => {
        removeElements();
      });
    }
  }

  /**
   * Hide feedback dialogs.
   */
  hideFeedbackDialogs() {
    if (this.overlay) {
      if (this.overlay.parentNode !== null) {
        this.overlay.parentNode.removeChild(this.overlay);
      }
      this.overlay = undefined;
      this.showBackgroundToReadspeaker();
    }

    const wrapper = document.querySelector('.h5p-current-screen');
    if (!wrapper) {
      return;
    }
    const questionWrapper =
      wrapper.querySelector('.h5p-branching-question-wrapper');
    if (questionWrapper) {
      questionWrapper.parentNode.removeChild(questionWrapper);
    }
  }

  /**
   * Ensure that start screen can contain branching questions.
   * @param {boolean} isStartScreen True if resizing start screen.
   */
  resizeScreen(isStartScreen = false) {
    // Ensure start screen expands to encompass large branching questions
    if (!this.questionContainer) {
      return;
    }

    let screenWrapper = isStartScreen ?
      this.parent.startScreen.screenWrapper :
      this.wrapper;

    const style = window.getComputedStyle(this.questionContainer, null);

    const paddingTop = parseInt(style.getPropertyValue('padding-top'));
    screenWrapper.style.height = `${this.questionContainer.offsetHeight + paddingTop}px`;
  }

  /**
   * Slide in next library which may be either a 'normal content type' or a
   * branching question
   * @param {object} library Library data.
   * @param {boolean} [reverse] True to slide in from the left.
   * @param {boolean} [skipAnimation] True to skip animation.
   * @param {boolean} [skipFocus] True to skip focus.
   */
  showNextLibrary(
    library, reverse = false, skipAnimation = false, skipFocus = false
  ) {
    this.nextLibraryId = library.nextContentId;
    this.libraryFeedback = library.feedback;

    // Show normal h5p library
    if (!LibraryScreen.isBranching(library)) {
      let showProceedButtonflag = true;
      // First priority - Hide navigation button first to prevent user to make unecessary clicks
      if (this.libraryFinishingRequirements[library.contentId] === true
        && (this.hasValidVideo(library) || library.type.library.split(' ')[0] === 'H5P.CoursePresentation')) {
        this.contentOverlays[this.currentLibraryId]?.hide();
        this.parent.disableNavButton();
        showProceedButtonflag = false;
      }

      // Update proceed button text
      const proceedButton = document.querySelector('.h5p-proceed-button');
      proceedButton.innerHTML = library.proceedButtonText;

      // Update the title
      const contentTitle = (library.type && library.type.metadata && library.type.metadata.title ? library.type.metadata.title : '');
      this.libraryTitle.setAttribute('aria-label', contentTitle ? contentTitle : 'Untitled Content');
      this.libraryTitle.innerHTML = (library.showContentTitle && contentTitle ? contentTitle : '&nbsp;');

      if (!skipAnimation) {
        if (this.currentLibraryId === library.contentId) {
          // Target slide is already being displayed
          this.currentLibraryWrapper.classList.add('h5p-slide-pseudo');
        }
        else if (reverse) {
          // Slide out the current library in reverse direction
          this.currentLibraryWrapper.classList.add('h5p-slide-out-reverse');
        }
        else {
          // Slide out the current library
          this.currentLibraryWrapper.classList.add('h5p-slide-out');
        }
      }

      // Remove the branching questions if they exist
      if (this.overlay) {
        if (this.overlay.parentNode !== null) {
          this.overlay.parentNode.removeChild(this.overlay);
        }
        this.overlay = undefined;
        this.branchingQuestions.forEach((bq) => {
          if (bq.parentNode !== null) {
            bq.parentNode.removeChild(bq);
          }
        });
        this.showBackgroundToReadspeaker();
      }

      // Initialize library if necessary
      if (!this.nextLibraries[library.contentId]) {
        this.createNextLibrary(library);
      }

      // Slide in selected library
      const libraryWrapper = this.nextLibraries[library.contentId];
      if (!libraryWrapper.offsetParent) {
        const footerWrapper = document.querySelector('.h5p-screen-footer');
        this.wrapper.insertBefore(libraryWrapper, footerWrapper);
      }

      // Move next library left of current library if sliding backwards
      if (reverse) {
        libraryWrapper.classList.remove('h5p-next');
        libraryWrapper.classList.add('h5p-previous');
      }

      const done = () => {
        if (this.currentLibraryWrapper.parentNode !== null) {
          this.currentLibraryWrapper.parentNode.removeChild(this.currentLibraryWrapper);
        }
        this.currentLibraryWrapper = libraryWrapper;
        this.wrapper.setAttribute('aria-hidden', false);
        this.currentLibraryWrapper.classList.remove('h5p-previous');
        this.currentLibraryWrapper.classList.remove('h5p-next');
        this.currentLibraryWrapper.classList.remove('h5p-slide-in');

        this.currentLibraryElement = libraryWrapper.getElementsByClassName('h5p-branching-scenario-content')[0]; // TODO: Why no use 'libraryElement' ?

        this.createNextLibraries(library);
        this.parent.navigating = false;
        if (!skipFocus) {
          this.libraryTitle.focus();
        }

        // New position to show Proceed button because sometimes user can play with the button while animation is in progress
        if (showProceedButtonflag) {
          this.parent.enableNavButton();
        }

        // Require to call resize the frame after animation completes
        this.resize(new H5P.Event('resize', {
          element: libraryElement
        }));
      };

      if (!skipAnimation) {
        libraryWrapper.classList.add('h5p-slide-in');
      }

      const libraryElement = libraryWrapper
        .getElementsByClassName('h5p-branching-scenario-content')[0];
      libraryElement.classList.remove('h5p-branching-hidden');

      this.currentLibraryId = library.contentId;
      this.currentLibraryInstance = this.libraryInstances[library.contentId];

      if (this.currentLibraryInstance.resize) {
        this.currentLibraryInstance.resize();
      }

      if (skipAnimation) {
        done();
      }
      else {
        this.currentLibraryWrapper.addEventListener('animationend', () => {
          done();
        });
      }
    }
    else { // Show a branching question
      if (this.parent.params.behaviour === true) {
        this.parent.disableNavButton();
      }

      // Remove existing branching questions
      this.branchingQuestions.forEach((bq) => {
        if (bq.parentNode !== null) {
          bq.parentNode.removeChild(bq);
        }
      });

      // BS could be showing start screen or library screen
      const wrapper = document.querySelector('.h5p-current-screen');

      // Add an overlay if it doesn't exist yet
      if (this.overlay === undefined) {
        this.overlay = document.createElement('div');
        this.overlay.className = 'h5p-branching-scenario-overlay';
        wrapper.appendChild(this.overlay);
        this.hideBackgroundFromReadspeaker();
      }

      const buttonWrapper = document.createElement('div');
      buttonWrapper.classList.add('h5p-nav-button-wrapper');

      // Append back button if at least one node has it enabled
      if (this.parent.backwardsAllowedFlags.indexOf(true) !== -1) {
        this.bqBackButton = this.createBackButton(this.parent.params.l10n.backButtonText);
        this.bqBackButton.setAttribute('isBQ', true);

        // Check the back button is enable or not
        if (this.parent.canEnableBackButton(library.contentId) === false) {
          this.bqBackButton.classList.add('h5p-disabled');
          this.bqBackButton.setAttribute('disabled', true);
        }
        buttonWrapper.appendChild(this.bqBackButton);
      }

      const branchingQuestion = document.createElement('div');
      branchingQuestion.className = 'h5p-branching-question-wrapper';

      this.appendRunnable(branchingQuestion, library.type, library.contentId);
      wrapper.appendChild(branchingQuestion);
      this.branchingQuestions.push(branchingQuestion);

      this.currentLibraryId = library.contentId;
      this.currentLibraryInstance = this.libraryInstances[library.contentId];

      const labelId = 'h5p-branching-question-title-' + LibraryScreen.idCounter++;
      const questionContainer = branchingQuestion.querySelector('.h5p-branching-question-container');
      this.questionContainer = questionContainer;
      questionContainer.setAttribute('role', 'dialog');
      questionContainer.setAttribute('tabindex', '-1');
      questionContainer.setAttribute('aria-labelledby', labelId);
      if (!skipAnimation) {
        questionContainer.classList.add('h5p-start-outside');
      }
      questionContainer.classList.add('h5p-fly-in');
      branchingQuestion.querySelector('.h5p-branching-question-title').id = labelId;
      const multiChoiceWrapper = branchingQuestion.querySelector('.h5p-multichoice-wrapper');
      multiChoiceWrapper.setAttribute('role', 'group');
      multiChoiceWrapper.setAttribute('aria-labelledby', labelId);

      document.querySelector('.h5p-branching-question').appendChild(buttonWrapper);
      this.currentLibraryWrapper.style.zIndex = 0;

      /**
       * Resizes the wrapper to the height of the container. If the current BQ is at the very start of the content type then resize parent wrapper
       * Make exception for starting screen, so it does not cut from the top, as well as fullscreen.
       */
      const isFullscreen = this.parent.isFullScreen();
      const isSmallerDevice = this.parent.container.classList.contains('h5p-mobile-screen');

      if (this.currentLibraryWrapper.style.height === '' && !this.parent.startScreen.isShowing && !isFullscreen && !isSmallerDevice) {
        this.resizeScreen();
      }
      else if (this.parent.startScreen.isShowing && !isFullscreen) {
        // Ensure start screen expands to encompass large branching questions
        this.resizeScreen(true);
      }
      else if (parseInt(this.currentLibraryWrapper.style.height) < questionContainer.offsetHeight) {
        this.currentLibraryWrapper.style.height = questionContainer.offsetHeight + 'px';
      }

      this.createNextLibraries(library);
      this.parent.navigating = false;

      branchingQuestion.addEventListener('animationend', () => {
        const firstAlternative = branchingQuestion
          .querySelectorAll('.h5p-branching-question-alternative')[0];
        if (!skipFocus && typeof firstAlternative !== 'undefined') {
          questionContainer.focus();
        }
      });
    }
  }

  /**
   * Hide background from Readspeaker.
   */
  hideBackgroundFromReadspeaker() {
    this.header.setAttribute('aria-hidden', 'true');
    this.currentLibraryWrapper.setAttribute('aria-hidden', 'true');

    // The section below tries to make all elements untabbable
    // (to avoid tabbing to background elements)
    let h5pContainer = document.querySelector('.h5p-container');

    if (!h5pContainer) {
      // Probably in preview (where .h5p-container does not exist)
      h5pContainer = document.querySelector('.preview-wrapper');
      if (!h5pContainer) {
        return;
      }
    }

    const selector = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button, iframe, object, embed, *[tabindex], *[contenteditable], video, audio';
    this.tabbables = [];
    h5pContainer.querySelectorAll(selector).forEach((element) => {
      if (element instanceof HTMLMediaElement) {
        // For native Media elements (audio & video) we can't set the tab index.
        // Instead, we'll just remove the controls, which makes it non-tabbable
        if (element.controls) {
          element.controls = false;
          this.tabbables.push({ element: element });
        }
        // If no controls - no need to do anything when showBackgroundToReadspeaker is invoked
      }
      else {
        // Store current tabindex, so we can set it back when dialog closes
        // Specifically handle jquery ui slider, since it overwrites data in an inconsistent way
        const currentTabindex = element.classList.contains('ui-slider-handle') ? 0 : element.getAttribute('tabindex');

        // Make it untabbable
        element.setAttribute('tabindex', '-1');

        this.tabbables.push({
          element: element,
          tabindex: currentTabindex
        });
      }
    });
  }

  /**
   * Show background to Readspeaker.
   */
  showBackgroundToReadspeaker() {
    this.header.setAttribute('aria-hidden', 'false');
    this.currentLibraryWrapper.setAttribute('aria-hidden', 'false');

    // Resets tabindex to the original state
    if (this.tabbables) {
      this.tabbables.forEach((tabbable) => {
        const element = tabbable.element;

        if (element instanceof HTMLMediaElement) {
          element.controls = true;
        }
        else if (tabbable.tabindex !== undefined && tabbable.tabindex !== null) {
          element.setAttribute('tabindex', tabbable.tabindex);
        }
        else {
          element.removeAttribute('tabindex');
        }
      });

      this.tabbables = null;
    }
  }

  getElement() {
    return this.wrapper;
  }

  remove() {
    if (this.wrapper.parentNode !== null) {
      this.wrapper.parentNode.removeChild(this.wrapper);
    }
  }

  resize(event) {
    const instance = this.currentLibraryInstance;
    const element = event?.data?.element ?? this.currentLibraryElement;

    const isImage = (instance?.libraryInfo.machineName === 'H5P.Image');
    const isCP = (instance?.libraryInfo.machineName === 'H5P.CoursePresentation');
    const isHotspots = (instance?.libraryInfo.machineName === 'H5P.ImageHotspots');
    const isVideo = (instance?.libraryInfo.machineName === 'H5P.Video');
    const isIV = (instance?.libraryInfo.machineName === 'H5P.InteractiveVideo');
    const hasSize = (instance?.width && instance.height);
    const isYoutube = element.classList.contains('h5p-youtube');

    const canScaleImage = (
      (hasSize && (isImage || isCP)) || isHotspots || isVideo
    );
    if (canScaleImage) {
      // Always reset scaling
      element.style.width = '';
      element.style.height = '';

      if (isHotspots) {
        element.style.maxWidth = '';
      }
    }

    // Toggle full screen class for content (required for IV to resize properly)
    if (this.parent.isFullScreen()) {
      element.classList.add('h5p-fullscreen');

      if (isIV && instance.$videoWrapper[0].firstChild.style) {
        instance.videoHeight = instance.$videoWrapper[0].firstChild.style.height;
      }

      // Preserve aspect ratio for Image in fullscreen (since height is limited) instead of scrolling or streching
      if (canScaleImage) {
        const videoRect = isVideo && this.parent.params.content[this.currentLibraryId].type.params.sources !== undefined ?
          element.getBoundingClientRect() :
          null;

        // Video with no source should appear on top
        if (
          isVideo &&
            this.parent.params.content[this.currentLibraryId].type.params.sources === undefined
        ) {
          element.classList.add('h5p-video-no-source');
        }
        else {
          element.classList.remove('h5p-video-no-source');
        }

        if (videoRect || isHotspots || isCP || isImage) {
          const height = isHotspots ?
            instance.options.image.height :
            (isVideo ? videoRect.height : instance.height);

          const width = isHotspots ?
            instance.options.image.width :
            (isCP ? instance.ratio * height : (isVideo ? videoRect.width : instance.width));

          const aspectRatio = (height / width);
          const targetElement = isIV ? element.lastChild : element;
          const availableSpace = targetElement.getBoundingClientRect();

          const availableAspectRatio =
            (availableSpace.height / availableSpace.width);

          if (aspectRatio > availableAspectRatio) {
            const size = `${availableSpace.height * (width / height)}px`;
            if (isHotspots) {
              targetElement.style.maxWidth = size;
            }
            else {
              targetElement.style.width = size;
            }
          }
          else {
            const size = `${availableSpace.width * aspectRatio}px`;
            targetElement.style.height = size;
            if (isYoutube && element.querySelector('iframe') !== null) {
              element.querySelector('iframe').style.height = size;
            }
          }
        }
      }
    }
    else {
      // Fullscreen with branching question must set wrapper size
      if (this.parent.startScreen.isShowing) {
        this.resizeScreen(true);
      }
      else if (this.overlay) {
        this.resizeScreen();
      }
      else {
        // reset wrapper height
        this.wrapper.style.height = '';
      }

      const videoWrapperInstance =
        element.getElementsByClassName('h5p-video-wrapper');

      if (isIV && videoWrapperInstance.length > 0) {
        let videoWrapper = videoWrapperInstance[0].firstChild;
        if (videoWrapper.style) {
          videoWrapper.style.height = instance.videoHeight;
        }
      }
      else if (isYoutube && element.querySelector('iframe') !== null) {
        element.querySelector('iframe').style.height = '';
      }
      element.classList.remove('h5p-fullscreen');
    }

    if (instance) {
      instance.trigger('resize', event);
      // Must resize library screen after resizing content
      this.handleLibraryResize();
    }
  }

  /**
   * Check if library is a Branching Question.
   * @param {object} library
   * @returns {boolean} True if library is a Branching Question.
   */
  static isBranching(library) {
    if (!library?.type?.library) {
      return false;
    }

    return library.type.library.indexOf('H5P.BranchingQuestion ') === 0;
  }

  /**
   * Create navigation buttons
   */
  createNavButtons() {
    const buttonWrapper = document.createElement('div');
    buttonWrapper.classList.add('h5p-nav-button-wrapper');

    // Append back button if at least one node has it enabled
    if (this.parent.backwardsAllowedFlags.indexOf(true) !== -1) {
      this.backButton =
        this.createBackButton(this.parent.params.l10n.backButtonText);
      buttonWrapper.appendChild(this.backButton);
    }

    // Proceed button
    this.navButton = document.createElement('button');
    this.navButton.classList.add('transition');
    this.navButton.addEventListener('animationend', () => {
      this.parent.unanimateNavButton();
    });

    this.navButton.addEventListener('click', () => {
      if (this.parent.proceedButtonInProgress) {
        return;
      }

      this.parent.proceedButtonInProgress = true;
      new Promise((resolve) => {
        const response = this.handleProceed();

        // Wait until receive positive response
        if (response) {
          resolve(true);
        }
      }).then(() => {
        this.parent.proceedButtonInProgress = false;
      });
    });

    this.navButton.classList.add('h5p-nav-button', 'h5p-proceed-button');
    const proceedButtonText = this.parent.getLibrary(this.currentLibraryId).proceedButtonText;
    this.navButton.appendChild(document.createTextNode(proceedButtonText));
    buttonWrapper.appendChild(this.navButton);

    const footer = document.createElement('div');
    footer.classList.add('h5p-screen-footer');
    footer.appendChild(buttonWrapper);
    this.wrapper.appendChild(footer);
  }

  /**
   * Reset instance.
   * @param {number} id Id of instance to reset.
   */
  resetInstance(id) {
    const instance = id ?
      this.libraryInstances[id] :
      this.currentLibraryInstance;

    if (instance) {
      instance.resetTask?.();
    }
    delete this.previousState;
    delete this.lastNodeId;
  }
}

LibraryScreen.idCounter = 0;
