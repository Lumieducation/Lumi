import GenericScreen from './genericScreen.js';
import LibraryScreen from './libraryScreen.js';
import Scoring from './scoring.js';
import { extend } from '@services/util.js';
import '@styles/h5p-branching-scenario.scss';

export default class BranchingScenario extends H5P.EventDispatcher {
  /**
   * @class
   * @param {object} params Parameters passed by the editor.
   * @param {number} contentId Content's id.
   * @param {object} [extras] Saved state, metadata, etc.
   */
  constructor(params, contentId, extras = {}) {
    super('');

    this.contentId = contentId;
    this.extras = extras;

    this.startScreen = {};
    this.libraryScreen = {};
    this.endScreens = {};
    this.navigating;
    this.currentHeight;
    this.currentId = -1;
    this.userPath = [];
    this.xAPIData = [];
    this.backwardsAllowedFlags = [];
    this.proceedButtonInProgress = false;
    this.isReverseTransition = false;

    this.params = extend({
      content: [],
      startScreen: {
        startScreenTitle: '',
        startScreenSubtitle: ''
      },
      endScreens: [
        {
          endScreenTitle: '',
          endScreenSubtitle: '',
          contentId: -1
        }
      ],
      scoringOptionGroup: {
        scoringOption: 'no-score'
      },
      l10n: {
        startScreenButtonText: 'Start the course',
        endScreenButtonText: 'Restart the course',
        proceedButtonText: 'Proceed',
        scoreText: 'Your score:',
        backButtonText: 'Back',
        fullscreenAria: 'Fullscreen',
        replayButtonText: 'Replay the video',
        disableProceedButtonText: 'Require to complete the current module'
      },
      behaviour: 'individual'
    }, params.branchingScenario); // Account for the wrapper!

    this.params.content.forEach((item, index) => {
      // Sanitize the (next)ContentIds that the editor didn't set
      item.contentId = index;
      if (item.nextContentId === undefined) {
        item.nextContentId = -1;
      }

      // Pass `randomize` parameter to branching question
      if (
        this.params.behaviour.randomizeBranchingQuestions &&
        item.type.library.indexOf('H5P.BranchingQuestion') !== -1
      ) {
        item.type.params.branchingQuestion.randomize = true;
      }

      // Set Proceedbutton to default text if not added
      item.proceedButtonText =
        item.proceedButtonText || this.params.l10n.proceedButtonText;
    });

    // Compute pattern for enabling/disabling back button
    this.backwardsAllowedFlags = this.params.content.map((content) => {
      if (content.contentBehaviour === 'useBehavioural') {
        return this.params.behaviour.enableBackwardsNavigation;
      }
      else if (content.contentBehaviour === 'enabled') {
        return true;
      }
      else {
        return false;
      }
    });

    this.scoring = new Scoring(this.params);

    this.restoreState(this.extras.previousState);

    /**
     * Handle exitfullscreen event and resize the BS screen
     */
    this.on('exitFullScreen', () => {
      window.setTimeout(() => {
        this.trigger('resize');
      }, 100);
    });

    /**
     * Handle the start of the branching scenario
     */
    this.on('started', () => {
      const startNode = this.params.content[0];

      // Disable back button if not allowed
      if (this.canEnableBackButton(0) === false) {
        this.disableBackButton();
      }
      else {
        this.enableBackButton();
      }

      if (startNode?.type?.library?.split(' ')[0] === 'H5P.BranchingQuestion') {
        // First node is Branching Question, no sliding, just trigger BQ overlay
        this.trigger('navigated', {
          nextContentId: 0
        });
      }
      else {
        // First node is info content
        this.startScreen.hide();
        this.libraryScreen.show();
        this.triggerXAPI('progressed');

        if (this.userPath.length === 0) {
          this.userPath.push(0);
        }
      }
      this.currentId = 0;
    });

    /**
     * Handle progression
     */
    this.on('navigated', (event) => {
      // Trace back user steps
      if (event.data.reverse) {
        // Reset library screen wrapper if it was set to fit large BQ
        if (this.libraryScreen?.wrapper) {
          this.libraryScreen.wrapper.style.height = '';
        }

        this.userPath.pop();
        event.data.nextContentId = this.userPath.pop() || 0;
      }

      const id = parseInt(event.data.nextContentId);

      const backButton =
        this.container.querySelector('.h5p-back-button[isBQ="true"]');

      // Remove Back button from BQ overlay
      if (
        this.currentId > -1 &&
        LibraryScreen.isBranching(this.getLibrary(this.currentId)) &&
        backButton
      ) {
        backButton.remove();
      }

      const nextLibrary = this.getLibrary(id);
      let resizeScreen = true;

      // Try to stop any playback
      this.libraryScreen.stopPlayback(this.currentId);

      // Try to collect xAPIData for last screen
      if (!this.params.preventXAPI) {
        const xAPIData = this.libraryScreen.getXAPIData(this.currentId);

        /*
          * We do not include branching questions that hasn't been answered in
          * the report (going back from a BQ)
          */
        const isBranching = LibraryScreen.isBranching(
          this.getLibrary(this.currentId)
        );

        const isBranchingQuestionAndAnswered = isBranching
          && typeof xAPIData.statement?.result?.response !== 'undefined';

        if (xAPIData && (!isBranching || isBranchingQuestionAndAnswered)) {
          this.xAPIData.push(xAPIData);
        }
      }

      if (!event.data.isResuming) {
        /*
         * When resuming and navigation to the node, the state should be kept,
         * but once navigated away, it's deleted. Branching Questions need to be
         * reset.
         */
        if (LibraryScreen.isBranching(this.getLibrary(this.currentId))) {
          this.libraryScreen.resetInstance();
        }
      }

      /*
       * Prevent screenreader to read previous screen's content when user is
       * navigating from BQ.
       */
      if (LibraryScreen.isBranching(this.getLibrary(this.currentId))) {
        document.querySelector('.h5p-current-screen')
          .setAttribute('aria-hidden', true);
      }

      // Re-display library screen if it has been hidden by an ending screen
      if (this.currentEndScreen?.isShowing) {
        if (nextLibrary) {
          if (!LibraryScreen.isBranching(nextLibrary)) {
            this.currentEndScreen.hide();
            this.currentEndScreen = null;
            this.libraryScreen.show(
              { skipAnimation: event.data.isResuming }
            );
          }
        }
        else {
          // Showing two end screens after each other
          this.libraryScreen.hideFeedbackDialogs();
          this.currentEndScreen.hide(
            { skipAnimation: event.data.isResuming }
          );
          this.currentEndScreen = null;
        }
      }
      else if (this.startScreen?.isShowing && nextLibrary) {
        if (!LibraryScreen.isBranching(nextLibrary)) {
          this.startScreen.hide({ skipAnimation: event.data.isResuming });
          this.libraryScreen.show({
            skipAnimation: event.data.isResuming,
            skipFocus: event.data.isResuming // Should not focus on resuming to avoid jumping on page
          });
          resizeScreen = false;
        }
      }
      else {
        // Remove any feedback dialogs
        this.libraryScreen.hideFeedbackDialogs();
      }

      if (resizeScreen) {
        this.trigger('resize');
      }
      if (this.currentId !== -1) {
        this.triggerXAPI('progressed');
        let contentScores = {};

        if (this.libraryScreen.currentLibraryInstance?.getScore) {
          contentScores = {
            'score': this.libraryScreen.currentLibraryInstance.getScore(),
            'maxScore': this.libraryScreen.currentLibraryInstance.getMaxScore()
          };
        }

        this.scoring.addLibraryScore(
          this.currentId,
          this.libraryScreen.currentLibraryId,
          event.data.chosenAlternative,
          contentScores
        );
      }

      if (nextLibrary === false) {
        //  Show the relevant end screen if there is no next library
        this.currentEndScreen = this.endScreens[id];
        // Custom end screen
        if (event.data.feedback) {
          const endScreen = this.createEndScreen({
            endScreenTitle: event.data.feedback.title || '',
            endScreenSubtitle: event.data.feedback.subtitle || '',
            endScreenImage: event.data.feedback.image,
            endScreenScore: event.data.feedback.endScreenScore
          });
          this.container.append(endScreen.getElement());
          this.currentEndScreen = endScreen;
        }
        else if (this.scoring.isDynamicScoring()) {
          this.currentEndScreen.setScore(this.getScore());
          this.currentEndScreen.setMaxScore(this.getMaxScore());
        }

        this.startScreen.hide();
        this.libraryScreen.hide(true);
        this.currentEndScreen.show();
        this.triggerXAPICompleted(
          this.scoring.getScore(this.currentEndScreen.getScore()),
          this.scoring.getMaxScore()
        );
      }
      else {
        this.libraryScreen.showNextLibrary(
          nextLibrary,
          event.data.reverse,
          event.data.isResuming, // skip animation
          event.data.isResuming // skip focus
        );

        // Disable back button if not allowed in new library screen
        if (this.canEnableBackButton(id) === false) {
          this.disableBackButton();
        }
        else {
          this.enableBackButton();
        }

        this.currentId = id;
      }

      /*
       * First node was BQ, so sliding from start screen to library screen is
       * needed now.
       */
      if (
        event.data.nextContentId !== 0 &&
        document.querySelector('.h5p-start-screen')
          .classList.contains('h5p-current-screen')
      ) {
        /*
         * Remove translation of info content which would tamper with timing of
         * sliding.
         */
        const wrapper = this.libraryScreen.wrapper
          .querySelector('.h5p-slide-in');

        if (wrapper) {
          wrapper.classList.remove('h5p-next');
          this.startScreen.hide();
          this.libraryScreen.show();
        }
      }

      // Keep track of user steps if not resuming because we have all we need
      if (!event.data.isResuming) {
        this.userPath.push(id);
      }
    });

    /**
     * Handle restarting
     */
    this.on('restarted', (event) => {
      this.resetTask({
        keepStates: event.data?.keepStates ?? false
      });
    });

    /**
     * Handle resizing, resizes child library
     */
    this.on('resize', (event) => {
      if (this.bubblingUpwards) {
        return; // Prevent sending the event back down
      }
      this.changeLayoutToFitWidth();

      this.libraryScreen?.resize?.(event);

      // Add classname for phone size adjustments
      const rect = this.container.getBoundingClientRect();
      if (rect.width <= 480) {
        this.container.classList.add('h5p-phone-size');
      }
      else {
        this.container.classList.remove('h5p-phone-size');
      }
      if (rect.width < 768) {
        this.container.classList.add('h5p-medium-tablet-size');
      }
      else {
        this.container.classList.remove('h5p-medium-tablet-size');
      }
    });
  }

  /**
   * Restore state.
   * @param {object} [previousState] Previous state.
   * @param {object} [previousState.scoring] Scoring state.
   * @param {object} [previousState.userPath] User path.
   * @param {object} [previousState.xAPIData] xAPI data.
   */
  restoreState(previousState = {}) {
    if (previousState.scoring) {
      this.scoring.setState(previousState.scoring);
    }
    this.userPath = previousState.userPath || [];
    this.xAPIData = previousState.xAPIData || [];
  }

  /**
   * Restore view.
   * @param {object} [previousState] Previous state.
   * @param {object} [previousState.endScreen] End screen state.
   * @param {object} [previousState.childStates] Child states.
   */
  restoreView(previousState = {}) {
    if (this.userPath.length === 0) {
      // Start screen
    }
    else if (previousState.endScreen) {
      const endScreen = this.createEndScreen(
        {
          ...previousState.endScreen,
          isCurrentScreen: true
        }
      );
      this.container.append(endScreen.getElement());
      this.currentEndScreen = endScreen;

      this.startScreen.hide({ skipAnimation: true });
      this.libraryScreen.hide(true);
      this.currentEndScreen.show({
        skipAnimation: true,
        skipFocus: true
      });
    }
    else {
      const id = this.userPath[this.userPath.length - 1];
      /*
       * Handle previous node is a Branching Question. Requires to also to
       * display the previous node first, so that the previous screen is set
       * correctly when user can go backwards.
       */
      if (LibraryScreen.isBranching(this.getLibrary(id))) {
        // Branching Question might be first node with no screen before
        if (this.userPath.length > 1) {
          /*
           * Strictly, this is not 100% correct, because the user's last move
           * may have been going back from a node to the BQ and we're showing
           * the node before the BQ. Don't think it's worth to store in state.
           */
          const backgroundId = this.userPath[this.userPath.length - 2];

          this.trigger('navigated', {
            nextContentId: backgroundId,
            isResuming: true
          });
        }
      }

      this.trigger('navigated', {
        nextContentId: id,
        isResuming: true
      });
    }
  }

  /**
   * Create a start screen object.
   * @param  {object} startscreendata Object containing data needed to build a start screen.
   * @param  {string} startscreendata.startScreenTitle Title.
   * @param  {string} startscreendata.startScreenSubtitle Subtitle.
   * @param  {object} startscreendata.startScreenImage Object containing image metadata.
   * @param  {string} startscreendata.startScreenAltText Alt text for image.
   * @param  {boolean} isCurrentScreen When Branching Scenario is first initialized.
   * @return {GenericScreen} Generic Screen object.
   */
  createStartScreen(
    {
      startScreenTitle,
      startScreenSubtitle,
      startScreenImage,
      startScreenAltText
    },
    isCurrentScreen
  ) {
    const startScreen = new GenericScreen(this, {
      isStartScreen: true,
      titleText: startScreenTitle,
      subtitleText: startScreenSubtitle,
      image: startScreenImage,
      altText: startScreenAltText,
      fullscreenAria: this.params.l10n.fullscreenAria,
      buttonText: this.params.l10n.startScreenButtonText,
      isCurrentScreen
    });

    startScreen.on('toggleFullScreen', () => {
      this.toggleFullScreen();
    });

    return startScreen;
  }

  /**
   * Create an end screen object
   *
   * @param  {object} endScreenData Object containing data needed to build an end screen
   * @param  {string} endScreenData.endScreenTitle Title
   * @param  {string} endScreenData.endScreenSubtitle Subtitle
   * @param  {object} endScreenData.endScreenImage Object containing image metadata
   * @param  {object} endScreenData.endScreenScore Score
   * @param  {object} endScreenData.showScore Determines if score is shown
   * @return {GenericScreen} Generic Screen object
   */
  createEndScreen(endScreenData) {
    const endScreen = new GenericScreen(this, {
      isStartScreen: false,
      titleText: endScreenData.endScreenTitle,
      subtitleText: endScreenData.endScreenSubtitle,
      image: endScreenData.endScreenImage,
      buttonText: this.params.l10n.endScreenButtonText,
      fullscreenAria: this.params.l10n.fullscreenAria,
      isCurrentScreen: false,
      scoreText: this.params.l10n.scoreText,
      score: this.scoring.getScore(endScreenData.endScreenScore),
      maxScore: this.scoring.getMaxScore(),
      showScore: this.scoring.shouldShowScore(),
    });

    endScreen.on('toggleFullScreen', () => {
      this.toggleFullScreen();
    });

    return endScreen;
  }

  /**
   * Get library data by id from branching scenario parameters.
   * @param  {number} id Id of the content type.
   * @return {object | boolean} Data required to create a library.
   */
  getLibrary(id) {
    return (this.params.content[id] !== undefined ?
      this.params.content[id] :
      false
    );
  }

  /**
   * Toggle full screen
   */
  toggleFullScreen() {
    if (this.isFullScreen()) {
      H5P.exitFullScreen?.();
    }
    else {
      H5P.fullScreen(H5P.jQuery(this.container), this);
    }
  }

  /**
   * Determine full screen state.
   * @returns {boolean} True, if in full screen or semi full screen.
   */
  isFullScreen() {
    return H5P.isFullscreen ||
      (this.container?.classList.contains('h5p-fullscreen')) ||
      (this.container?.classList.contains('h5p-semi-fullscreen'));
  }

  /**
   * Disable proceed button.
   */
  disableNavButton() {
    if (!this.libraryScreen.navButton) {
      return;
    }

    this.libraryScreen.navButton.classList.add('h5p-disabled');
    this.libraryScreen.navButton.setAttribute('disabled', true);
    this.libraryScreen.navButton.setAttribute(
      'title', this.params.l10n.disableProceedButtonText
    );
  }

  /**
   * Enable proceed button.
   * @param {boolean} [animated=false] If true, will be animated.
   */
  enableNavButton(animated = false) {
    if (!this.libraryScreen.navButton) {
      return;
    }
    this.libraryScreen.navButton.classList.remove('h5p-disabled');
    this.libraryScreen.navButton.removeAttribute('disabled');
    this.libraryScreen.navButton.removeAttribute('title');

    //Animate button if require
    if (animated) {
      this.animateNavButton();
    }
  }

  /**
   * Hide proceed button.
   */
  hideNavButton() {
    if (!this.libraryScreen.navButton) {
      return;
    }

    this.libraryScreen.navButton.classList.add('h5p-hidden');
  }

  /**
   * Show proceed button.
   * @param {boolean} [animated=false] If true, will be animated.
   */
  showNavButton(animated = false) {
    if (!this.libraryScreen.navButton) {
      return;
    }

    this.libraryScreen.navButton.classList.remove('h5p-hidden');
    document.activeElement.blur();

    let focusTime = 100;

    if (animated) {
      this.animateNavButton();
    }

    setTimeout(() => {
      this.libraryScreen.navButton.focus();
    }, focusTime);
  }

  /**
   * Animate proceed button.
   */
  animateNavButton() {
    // Prevent multiple animation calls
    if (!this.libraryScreen.navButton.classList.contains('h5p-animate')) {
      this.libraryScreen.navButton.classList.add('h5p-animate');
    }
  }

  /**
   * Stop animation of proceed button.
   */
  unanimateNavButton() {
    this.libraryScreen.navButton.classList.remove('h5p-animate');
  }

  /**
   * Get accumulative score for all attempted scenarios.
   * @returns {number} Current score for Branching Scenario.
   */
  getScore() {
    return this.scoring.getScore();
  }

  /**
   * Get max score.
   * @returns {number} Max score for branching scenario.
   */
  getMaxScore() {
    return this.scoring.getMaxScore();
  }

  /**
   * Reset task.
   * @param {object} [options] Options.
   * @param {boolean} [options.keepStates] True to keep states.
   * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-5}
   */
  resetTask(options = {}) {
    if (this.currentEndScreen) {
      this.currentEndScreen.hide();
      this.currentEndScreen = null;
    }
    this.scoring.restart();
    this.startScreen.screenWrapper.style.height = '';
    this.startScreen.screenWrapper.classList.remove('h5p-slide-out');

    this.startScreen.show({ slideBack: this.isReverseTransition });
    this.isReverseTransition = false;
    this.currentId = -1;
    this.userPath = [];
    this.xAPIData = [];

    if (!options.keepStates) {
      delete this.extras.previousState;
    }

    // Reset the library screen
    if (this.libraryScreen) {
      this.libraryScreen.remove();
    }

    // Note: the first library must always have an id of 0
    this.libraryScreen = new LibraryScreen(
      this,
      this.params.startScreen.startScreenTitle,
      this.getLibrary(0),
      this.extras.previousState?.child
    );

    this.libraryScreen.on('toggleFullScreen', () => {
      this.toggleFullScreen();
    });

    this.container.append(this.libraryScreen.getElement());
  }

  /**
   * Change width of branching question depending on the container changeLayoutToFitWidth.
   */
  changeLayoutToFitWidth() {
    const style = window.getComputedStyle(
      document.getElementsByTagName('body')[0]
    );
    const fontSize = parseInt(style.fontSize, 10);

    // Wide screen
    if (this.container.offsetWidth / fontSize > 43) {
      this.container.classList.add('h5p-wide-screen');
    }
    else {
      this.container.classList.add('h5p-mobile-screen');
    }
  }

  /**
   * Disable back button.
   */
  disableBackButton() {
    if (!this.libraryScreen?.backButton) {
      return;
    }

    this.libraryScreen.backButton.classList.add('h5p-disabled');
    this.libraryScreen.backButton.setAttribute('disabled', true);
  }

  /**
   * Enable back button.
   */
  enableBackButton() {
    if (!this.libraryScreen?.backButton) {
      return;
    }

    this.libraryScreen.backButton.classList.remove('h5p-disabled');
    this.libraryScreen.backButton.removeAttribute('disabled');
  }

  /**
   * Check if a node is allowed to have the back button enabled.
   * @param {number} id Id of node to check.
   * @return {boolean} True if node is allowed to have the back button enabled, else false.
   */
  canEnableBackButton(id) {
    if (typeof id !== 'number') {
      return false;
    }

    if (id < 0 || id > this.backwardsAllowedFlags.length - 1) {
      return false;
    }

    return this.backwardsAllowedFlags[id];
  }

  /**
   * Attach Branching Scenario to the H5P container
   * @param {H5P.jQuery} $container Container for the content type
   */
  attach($container) {
    if (this.isRoot !== undefined && this.isRoot()) {
      this.setActivityStarted();
    }

    this.container = $container.get(0);
    this.container.classList.add('h5p-branching-scenario');
    this.container.innerHTML = '';

    if (!this.params.content?.length) {
      const contentMessage = document.createElement('div');
      contentMessage.innerHTML = 'No content';
      this.container.append(contentMessage);
      return;
    }

    this.startScreen = this.createStartScreen(this.params.startScreen, true);
    this.container.append(this.startScreen.getElement());
    this.currentId = -1;

    // Note: the first library must always have an id of 0
    this.libraryScreen = new LibraryScreen(
      this,
      this.params.startScreen.startScreenTitle,
      this.getLibrary(0),
      this.extras.previousState?.child,
      this.extras.previousState?.userPath?.slice(-1)[0] // last node id
    );

    this.libraryScreen.on('toggleFullScreen', () => {
      this.toggleFullScreen();
    });

    this.container.append(this.libraryScreen.getElement());

    this.params.endScreens.forEach((endScreen) => {
      this.endScreens[endScreen.contentId] = this.createEndScreen(endScreen);
      this.container.append(this.endScreens[endScreen.contentId].getElement());
    });

    this.restoreView(this.extras.previousState);
  }

  /**
   * Get xAPI data.
   * Contract used by report rendering engine.
   * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-6}
   */
  getXAPIData() {
    if (!this.currentEndScreen) {
      console.error('Called getXAPIData before finished.');
      return;
    }

    const xAPIEvent = this.createXAPIEventTemplate('answered');

    // Extend definition
    let definition = xAPIEvent.getVerifiedStatementValue(
      ['object', 'definition']
    );

    extend(
      definition,
      {
        interactionType: 'compound',
        type: 'http://adlnet.gov/expapi/activities/cmi.interaction'
      }
    );

    extend(
      definition.extensions,
      { 'https://h5p.org/x-api/no-question-score': 1 }
    );

    const score = this.scoring.getScore(this.currentEndScreen.getScore());
    const maxScore = this.scoring.getMaxScore();
    xAPIEvent.setScoredResult(score, maxScore, this, true, score === maxScore);

    return {
      statement: xAPIEvent.data.statement,
      children: this.xAPIData
    };
  }

  /**
   * Get current state.
   * @returns {object} Current state to be retrieved later.
   * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-7}
   */
  getCurrentState() {
    if (!this.libraryScreen.getCurrentState) {
      return null; // Does not have content
    }

    if (this.userPath.length === 0) {
      return null; // Only when on start screen there is nothing to restore
    }

    const state = {
      userPath: this.userPath,
      scoring: this.scoring.getCurrentState(),
      child: this.libraryScreen.getCurrentState(),
      xAPIData: this.xAPIData
    };

    if (this.currentEndScreen) {
      state.endScreen = this.currentEndScreen.getRecreationData();
    }

    return state;
  }
}
