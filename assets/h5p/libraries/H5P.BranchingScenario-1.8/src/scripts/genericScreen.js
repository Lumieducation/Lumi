import '@styles/genericScreen.scss';

export default class GenericScreen extends H5P.EventDispatcher {
  /**
   * GenericScreen constructor
   * @class
   * @param {BranchingScenario} parent BranchingScenario Object
   * @param {object} screenData Object containing data required to construct the screen
   * @param {boolean} screenData.isStartScreen Determines if it is a starting screen
   * @param {string}  screenData.titleText Title
   * @param {string}  screenData.subtitleText Subtitle
   * @param {string}  screenData.scoreText Score text
   * @param {object}  screenData.image Image object
   * @param {string}  screenData.altText Alternative text for image
   * @param {string}  screenData.buttonText Text for the button
   * @param {boolean} screenData.isCurrentScreen Determines if the screen is shown immediately
   * @param {number} screenData.score Score that should be displayed
   * @param {number} screenData.maxScore Max achievable score
   * @param {number} screenData.showScore Determines if score should be displayed
   *
   * @return {GenericScreen} A screen object
   */
  constructor(parent, screenData = {}) {
    super();

    this.parent = parent;
    this.screenData = screenData;

    this.isShowing = this.screenData.isStartScreen;
    this.isFeedbackAvailable = false;
    this.screenWrapper = document.createElement('div');
    this.screenWrapper.classList.add(
      this.screenData.isStartScreen ? 'h5p-start-screen' : 'h5p-end-screen'
    );
    this.screenWrapper.classList.add(
      this.screenData.isCurrentScreen ? 'h5p-current-screen' : 'h5p-next-screen'
    );
    if (!this.screenData.isCurrentScreen) {
      this.screenWrapper.classList.add('h5p-branching-hidden');
    }
    else {
      this.parent.currentHeight = '45em';
    }

    const contentDiv = document.createElement('div');
    contentDiv.classList.add('h5p-branching-scenario-screen-content');

    this.feedbackText = document.createElement('div');
    this.feedbackText.classList.add('h5p-feedback-content-content');
    contentDiv.appendChild(this.feedbackText);

    const title = document.createElement('h1');
    title.className = 'h5p-branching-scenario-title-text';
    title.innerHTML = this.screenData.titleText;

    const subtitle = document.createElement('div');
    subtitle.className = 'h5p-branching-scenario-subtitle-text';
    subtitle.innerHTML = this.screenData.subtitleText;

    const navButton = document.createElement('button');
    navButton.classList.add(this.screenData.isStartScreen ? 'h5p-start-button' : 'h5p-end-button');
    navButton.classList.add('transition');

    navButton.addEventListener('click', () => {
      this.screenData.isStartScreen ?
        this.parent.trigger('started') :
        this.parent.trigger('restarted');

      let startScreen = document.getElementsByClassName('h5p-start-screen')[0];
      // Resize start screen when user restart the course
      if (!this.screenData.isStartScreen) {
        startScreen.style.height = '';
      }
      this.parent.navigating = true;
    });

    this.navButton = navButton;

    const buttonTextNode = document.createTextNode(this.screenData.buttonText);
    navButton.appendChild(buttonTextNode);

    this.feedbackText.appendChild(title);
    this.feedbackText.appendChild(subtitle);
    contentDiv.appendChild(navButton);

    if (this.screenData.showScore && this.screenData.score !== undefined) {
      this.scoreWrapper = this.createResultContainer(
        this.screenData.scoreText,
        this.screenData.score,
        this.screenData.maxScore
      );
      contentDiv.insertBefore(this.scoreWrapper, contentDiv.firstChild);
    }

    if (H5P.fullscreenSupported) {
      const fullScreenButton = document.createElement('button');
      fullScreenButton.className = 'h5p-branching-full-screen';
      fullScreenButton.setAttribute(
        'aria-label', this.parent.params.l10n.fullscreenAria
      );
      fullScreenButton.addEventListener('click', () => {
        this.trigger('toggleFullScreen');
      });
      this.screenWrapper.appendChild(fullScreenButton);
    }

    this.screenWrapper.appendChild(
      this.createScreenBackground(
        this.screenData.isStartScreen,
        this.screenData.image,
        this.screenData.altText
      )
    );
    this.screenWrapper.appendChild(contentDiv);

    // Validate any of the contents are present, make screen reader to read
    if (
      (this.screenData.showScore && this.screenData.score !== undefined) ||
      this.screenData.titleText !== '' || this.screenData.subtitleText !== ''
    ) {
      this.feedbackText.tabIndex = -1;
      this.isFeedbackAvailable = true;
    }
  }

  /**
   * Get score for screen
   *
   * @return score
   */
  getScore() {
    return this.screenData.score;
  }

  getMaxScore() {
    return this.screenData.maxScore;
  }

  /**
   * Get data required to recreate the screen later.
   * @returns {object} Data required to recreate the screen.
   */
  getRecreationData() {
    return {
      endScreenTitle: this.screenData.titleText,
      endScreenSubtitle: this.screenData.subtitleText,
      endScreenImage: this.screenData.image,
      endScreenScore: this.screenData.score
    };
  }

  /**
   * Used to check if on the final screen to prepare the course to restart
   */
  checkIntroReset() {
    let startScreen = document.getElementsByClassName('h5p-start-screen')[0];
    const finalScreenReachedClasses = ['h5p-end-screen', 'h5p-current-screen'];

    if (finalScreenReachedClasses.every(
      (i) => this.screenWrapper.classList.contains(i))
    ) {
      startScreen.classList.add('h5p-reset-start');
    }
    else if (startScreen.classList.contains('h5p-reset-start')) {
      startScreen.classList.remove('h5p-reset-start');
    }
  }

  /**
   * Returns the wrapping div.
   * @returns {HTMLElement} Wrapper.
   */
  getElement() {
    return this.screenWrapper;
  }

  /**
   * Set score for screen.
   * @param {number} score Score for screen.
   */
  setScore(score) {
    if (!this.scoreValue || typeof score !== 'number') {
      return;
    }

    this.scoreValue.textContent = score.toString();
  }

  /**
   * Set max score for screen.
   * @param {number) maxScore Max score for screen.
   */
  setMaxScore(maxScore) {
    if (!this.maxScoreValue || typeof maxScore !== 'number') {
      return;
    }

    this.maxScoreValue.textContent = maxScore.toString();
  }

  /**
   * Create wrapper containing score.
   * @param  {string} scoreLabel Score label
   * @param  {number} score Score to be shown
   * @param  {number} [maxScore] Max achievable score
   * @return {HTMLElement} Result container
   */
  createResultContainer(scoreLabel, score, maxScore) {
    const wrapper = document.createElement('div');
    wrapper.classList.add('h5p-result-wrapper');

    const resultContainer = document.createElement('div');
    resultContainer.classList.add('h5p-result-container');

    const scoreText = document.createElement('div');
    scoreText.classList.add('h5p-score-text');
    scoreText.appendChild(document.createTextNode(scoreLabel));

    const scoreCircle = document.createElement('div');
    scoreCircle.classList.add('h5p-score-circle');

    const achievedScore = document.createElement('span');
    achievedScore.className = 'h5p-score-value';
    this.scoreValue = document.createTextNode(score.toString());
    achievedScore.appendChild(this.scoreValue);

    scoreCircle.appendChild(achievedScore);

    const scoreDelimiter = document.createElement('span');
    scoreDelimiter.className = 'h5p-score-delimiter';
    scoreDelimiter.textContent = '/';
    scoreCircle.appendChild(scoreDelimiter);

    const maxAchievableScore = document.createElement('span');
    maxAchievableScore.className = 'h5p-max-score';

    this.maxScoreValue = document.createTextNode(maxScore.toString());
    maxAchievableScore.appendChild(this.maxScoreValue);
    scoreCircle.appendChild(maxAchievableScore);

    resultContainer.appendChild(scoreText);
    resultContainer.appendChild(scoreCircle);
    wrapper.appendChild(resultContainer);
    return wrapper;
  }

  /**
   * Create background for screen.
   * @param  {boolean} isStartScreen Determines if screen is starting screen.
   * @param  {object} image Image object.
   * @param  {string} altText Alternative text for image.
   * @return {HTMLElement} Wrapping div for the background.
   */
  createScreenBackground(isStartScreen, image, altText) {
    const backgroundWrapper = document.createElement('div');
    backgroundWrapper.classList.add('h5p-screen-background');

    const backgroundBanner = document.createElement('div');
    backgroundBanner.classList.add('h5p-screen-banner');

    const backgroundImage = document.createElement('img');
    backgroundImage.classList.add('h5p-background-image');

    if (image?.path) {
      backgroundImage.src = H5P.getPath(image.path, this.parent.contentId);
    }
    else {
      backgroundImage.src = isStartScreen ?
        this.parent.getLibraryFilePath('dist/assets/start-screen-default.jpg') :
        this.parent.getLibraryFilePath('dist/assets/end-screen-default.jpg');
    }

    if (altText?.length) {
      backgroundImage.setAttribute('aria-label', altText);
    }

    backgroundImage.addEventListener('load', () => {
      this.parent.trigger('resize');
    });

    backgroundWrapper.appendChild(backgroundBanner);
    backgroundWrapper.appendChild(backgroundImage);

    return backgroundWrapper;
  }

  /**
   * Slide screen in and style it as the current screen.
   * @param {object} [options] Options.
   * @param {boolean} [options.slideBack] True to slide backwards.
   * @param {boolean} [options.skipAnimation] True to skip animation.
   * @param {boolean} [options.skipFocus] True to skip focus.
   */
  show(options = {}) {
    this.isShowing = true;

    // Skip animation takes precedence over slideBack
    options.slideBack = options.slideBack && !options.skipAnimation;

    if (options.slideBack) {
      this.screenWrapper.classList.remove('h5p-next-screen');
      this.screenWrapper.classList.add('h5p-previous');
    }

    const done = () => {
      if (options.slideBack) {
        this.screenWrapper.classList.remove('h5p-previous');
      }
      this.screenWrapper.classList.remove('h5p-next-screen');
      this.screenWrapper.classList.remove('h5p-slide-in');
      this.screenWrapper.classList.add('h5p-current-screen');
      this.screenWrapper.setAttribute('aria-hidden', false);
      this.parent.trigger('resize');

      if (!options.skipFocus) {
        if (!this.isFeedbackAvailable) {
          this.navButton.focus();
        }
        else {
          this.feedbackText.focus();
        }
      }

      this.checkIntroReset();
    };

    // Close all open overlays
    this.parent.libraryScreen.contentOverlays?.forEach((overlay) => {
      overlay.hide();
    });
    this.parent.libraryScreen.branchingQuestions?.forEach((questionDOM) => {
      questionDOM.remove();
    });
    this.parent.libraryScreen.overlay?.remove();

    if (options.skipAnimation) {
      this.screenWrapper.classList.remove('h5p-branching-hidden');
      done();
    }
    else {
      this.screenWrapper.classList.add('h5p-slide-in');
      this.screenWrapper.classList.remove('h5p-branching-hidden');

      // Style as the current screen
      this.screenWrapper.addEventListener('animationend', (event) => {
        if (event.animationName === 'slide-in') {
          done();
        }
      });
    }
  }

  /**
   * Hide generic screen.
   * @param {object} options Options.
   * @param {boolean} options.skipAnimation True to skip animation.
   */
  hide(options = {}) {
    this.isShowing = false;

    const done = () => {
      this.screenWrapper.classList.add('h5p-branching-hidden');
      this.screenWrapper.classList.remove('h5p-current-screen');
      this.screenWrapper.classList.add('h5p-next-screen');
      this.screenWrapper.classList.remove('h5p-slide-out');
    };

    if (options.skipAnimation) {
      done();
    }
    else {
      this.screenWrapper.classList.add('h5p-slide-out');

      // Style as hidden
      this.screenWrapper.addEventListener('animationend', (event) => {
        if (event.animationName === 'slide-out') {
          done();
        }
      });
    }
  }
}
