export default class Scoring {

  constructor(params) {
    this.params = params;
    this.scores = [];
    this.visitedIndex = 0;
  }

  /**
   * Check if library has end score.
   * @param {object} library Library object.
   * @returns {boolean} True if library has end score.
   */
  hasEndScreenScore(library) {
    return library?.feedback?.endScreenScore !== undefined;
  }

  /**
   * Find all branching paths with an ending from the given content
   *
   * @param {object|string} content Content to find branching paths from.
   * @param {number[]} visitedNodes Currently visited nodes, loops are ignored.
   * @returns {number[]} List of possible paths leading to an ending.
   */
  findBranchingPaths(content, visitedNodes) {
    if (!this.isBranchingQuestion(content)) {
      return this.findBranchingEndings(content, visitedNodes);
    }

    // Check all alternatives for branching question
    let foundPaths = [];
    const alternatives = content.type.params.branchingQuestion.alternatives;
    alternatives.forEach((alt, index) => {
      const accumulatedNodes = visitedNodes.concat({
        type: 'alternative',
        index: index,
        alternativeParent: visitedNodes[visitedNodes.length - 1].index,
      });

      const paths = this.findBranchingEndings(alt, accumulatedNodes);
      foundPaths = foundPaths.concat(paths);
    });
    return foundPaths;
  }

  /**
   * Find paths with endings from a content or alternative
   *
   * @param {object} content Content or alternative
   * @param {Array} visitedNodes List of visited nodes
   * @returns {Array} List of found paths with an end from the given content
   */
  findBranchingEndings(content, visitedNodes) {
    // Ending screen
    if (content.nextContentId === -1) {
      return [visitedNodes];
    }

    const isLoop = visitedNodes.some((node) => {
      // Only check 'content' type, not alternatives, as we can't loop
      // to alternatives
      return node.type === 'content' && node.index === content.nextContentId;
    });

    // Skip loops as they are already explored
    if (!isLoop) {
      const nextContent = this.params.content[content.nextContentId];
      const accumulatedNodes = visitedNodes.concat({
        type: 'content',
        index: content.nextContentId,
        alternativeParent: null,
      });
      return this.findBranchingPaths(nextContent, accumulatedNodes);
    }

    return [];
  }

  /**
   * Calculate max score.
   * @returns {number} Max score.
   */
  calculateMaxScore() {
    if (
      this.params.scoringOptionGroup.scoringOption === SCORE_TYPES.STATIC_SCORE
    ) {
      return this.calculateStaticMaxScore();
    }
    else if (
      this.params.scoringOptionGroup.scoringOption === SCORE_TYPES.DYNAMIC_SCORE
    ) {
      return this.calculateDynamicMaxScore();
    }
    else {
      return 0; // No scoring
    }
  }

  /**
   * Calculate static max score.
   * @returns {number} Max score.
   */
  calculateStaticMaxScore() {
    const defaultEndScore = this.params.endScreens[0].endScreenScore;
    const defaultMaxScore = defaultEndScore !== undefined
      ? defaultEndScore : 0;

    // Find max score by checking which ending scenario has the highest score
    return this.params.content
      .reduce((acc, content) => {
        // Flatten alternatives
        let choices = [content];
        if (this.isBranchingQuestion(content)) {
          choices = content.type.params.branchingQuestion.alternatives;
        }
        return acc.concat(choices);
      }, [])
      .filter((content) => content.nextContentId === -1)
      .reduce((prev, content) => {
        let score = this.hasEndScreenScore(content)
          ? content.feedback.endScreenScore
          : defaultMaxScore;

        return prev >= score ? prev : score;
      }, 0);
  }

  /**
   * Calculate dynamic max score.
   * @returns {number} Max score.
   */
  calculateDynamicMaxScore() {
    return this.scores.reduce((sum, score) => {
      return sum + score.maxScore;
    }, 0);
  }

  /**
   * Get score for a Branching Question alternative.
   * @param {@object} libraryParams Library parameters.
   * @param {number} chosenAlternative Chosen alternative for branching questions.
   * @returns {number} Score for a Branching Question alternative.
   */
  getAlternativeScore(libraryParams, chosenAlternative) {
    if (!(chosenAlternative >= 0)) {
      return 0;
    }

    const hasAlternative = libraryParams
      && libraryParams.type
      && libraryParams.type.params
      && libraryParams.type.params.branchingQuestion
      && libraryParams.type.params.branchingQuestion.alternatives
      && libraryParams.type.params.branchingQuestion.alternatives[chosenAlternative];

    if (!hasAlternative) {
      return 0;
    }
    const alt = libraryParams.type.params.branchingQuestion.alternatives[chosenAlternative];

    if (
      !this.hasEndScreenScore(alt) ||
      alt.nextContentId === undefined ||
      alt.nextContentId < 0
    ) {
      return 0;
    }

    return alt.feedback.endScreenScore;
  }

  /**
   * Get max score for a Branching Question.
   * @param {object} libraryParams Library parameters.
   * @param {number} chosenAlternative Chosen alternative for branching questions.
   * @returns {number} Max score for a Branching Question.
   */
  getQuestionMaxScore(libraryParams, chosenAlternative) {
    if (!(chosenAlternative >= 0)) {
      return 0;
    }
    const alt = libraryParams.type.params.branchingQuestion.alternatives;
    let maxScore = 0;
    alt.forEach((score, index) => {
      // If you change from static to dynamic scoring an end screen can have score
      // This should not be used for dynamic scroing since the field isn't shown
      if (
        alt[index].feedback.endScreenScore > maxScore &&
        alt[index].nextContentId !== -1
      ) {
        maxScore = alt[index].feedback.endScreenScore;
      }
    });

    return maxScore;
  }

  /**
   * Get current score. Uses screen score if configured to use static score.
   *
   * @param {number} screenScore Used when static score is configured
   * @returns {number} Current score
   */
  getScore(screenScore) {
    if (
      this.params.scoringOptionGroup.scoringOption === SCORE_TYPES.DYNAMIC_SCORE
    ) {
      return this.scores.reduce((previousValue, score) => {
        return previousValue + score.score;
      }, 0);
    }
    else if (
      this.params.scoringOptionGroup.scoringOption === SCORE_TYPES.STATIC_SCORE
    ) {
      return screenScore;
    }
    else {
      return 0;
    }
  }

  /**
   * Get max score for the whole branching scenario depending on scoring options
   *
   * @returns {number} Max score for branching scenario
   */
  getMaxScore() {
    return this.calculateMaxScore();
  }

  /**
   * Get current state of scoring.
   * @returns {object} Current state of scoring.
   */
  getCurrentState() {
    return {
      scores: this.scores,
      visitedIndex: this.visitedIndex
    };
  }

  /**
   * Set state of scoring.
   * @param {object} [state] State to set.
   * @param {object[]} [state.scores] Scores to set.
   * @param {number} [state.visitedIndex] Visited index to set.
   */
  setState(state = {}) {
    if (state.scores) {
      this.scores = state.scores;
    }

    if (state.visitedIndex) {
      this.visitedIndex = state.visitedIndex;
    }
  }

  /**
   * Restart scoring
   */
  restart() {
    this.scores = [];
    this.visitedIndex = 0;
  }

  /**
   * Retrieve current library's score.
   * @param {number} currentId Id of current question.
   * @param {number} libraryId Id of current library.
   * @param {number} [chosenAlternative] Chosen alternative for branching questions.
   */
  addLibraryScore(currentId, libraryId, chosenAlternative, contentScores) {
    this.visitedIndex++;
    const libraryParams = this.params.content[currentId];
    let currentLibraryScore = 0;
    let currentLibraryMaxScore = 0;

    // For Branching Questions find score for chosen alternative
    if (this.isBranchingQuestion(libraryParams)) {
      currentLibraryScore = this.getAlternativeScore(libraryParams, chosenAlternative);
      currentLibraryMaxScore = this.getQuestionMaxScore(libraryParams, chosenAlternative);
    }
    else {
      // Add score from field
      if (
        this.hasEndScreenScore(libraryParams) &&
        libraryParams.nextContentId &&
        libraryParams.nextContentId > -1
      ) {
        currentLibraryScore = libraryParams.feedback.endScreenScore;
        currentLibraryMaxScore = libraryParams.feedback.endScreenScore;
      }
      // Add score from content
      if (
        this.params.scoringOptionGroup.includeInteractionsScores &&
        Object.entries(contentScores).length !== 0
      ) {
        currentLibraryScore += contentScores.score;
        currentLibraryMaxScore += contentScores.maxScore;
      }
    }

    // Update existing score and detect loops
    let isLoop = false;

    // In preview mode it is possible to produce a reverse loop, e.g. start
    // in the order 3->2->3. In this case we only remove the old score
    let duplicateIndex = null;
    let loopBackIndex = -1;
    this.scores.forEach((score, index) => {
      if (score.id === currentId) {
        score.score = currentLibraryScore;
        score.visitedIndex = this.visitedIndex;
        loopBackIndex = score.visitedIndex;

        // If our current id params is not pointing to the next item
        // in our scores array, there has been a jump, and thus there is a
        // reverse loop
        const isPointingToNextScore = this.scores.length > index + 1 &&
          this.params.content[score.id].nextContentId === this.scores[index + 1].id;
        if (!isPointingToNextScore) {
          duplicateIndex = index;
        }
        else {
          isLoop = true;
        }
      }
    });

    if (isLoop) {
      // Remove all scores visited after loop
      this.scores = this.scores
        .filter((score) => score.visitedIndex <= loopBackIndex);

      this.visitedIndex = loopBackIndex;
    }
    else {
      // For reverse loops we remove the old item first, so the scores
      // will be in the proper order
      if (duplicateIndex !== null) {
        this.scores.splice(duplicateIndex, 1);
      }

      this.scores.push({
        visitedIndex: this.visitedIndex,
        id: currentId,
        score: currentLibraryScore,
        maxScore: currentLibraryMaxScore
      });
    }
  }

  /**
   * Check if library is a Branching Question.
   * @param {object|string} library Library object or library string.
   * @returns {boolean} True if library is a Branching Question.
   */
  isBranchingQuestion(library) {
    const libraryString = library?.type?.library ?? library;
    return libraryString.split(' ')[0] === 'H5P.BranchingQuestion';
  }

  /**
   * Check if scoring is dynamic.
   * @returns {boolean} True if dynamic scoring.
   */
  isDynamicScoring() {
    return this.params.scoringOptionGroup.scoringOption === SCORE_TYPES.DYNAMIC_SCORE;
  }

  /**
   * Determine if score types are configured to show scores.
   * @returns {boolean} True if score should show.
   */
  shouldShowScore() {
    return this.params.scoringOptionGroup.scoringOption ===
      SCORE_TYPES.STATIC_SCORE || this.isDynamicScoring();
  }
}

export const SCORE_TYPES = {
  STATIC_SCORE: 'static-end-score',
  DYNAMIC_SCORE: 'dynamic-score',
  NO_SCORE: 'no-score',
};
