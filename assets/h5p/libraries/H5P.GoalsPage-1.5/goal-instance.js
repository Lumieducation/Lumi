var H5P = H5P || {};
H5P.GoalsPage = H5P.GoalsPage || {};

/**
 * Goal Instance module
 */
H5P.GoalsPage.GoalInstance = (function () {

  /**
   * Initialize module.
   * @param {String} defineGoalPlaceholder Placeholder for Goal Instance
   * @param {Number} uniqueId Unique identifier for Goal Instance.

   * @param {String} goalTypeDescription String describing the goal type, that will be displayed in its' footer
   * @returns {Object} GoalInstance GoalInstance instance
   */
  function GoalInstance(defineGoalPlaceholder, uniqueId, goalTypeDescription, goalText) {
    this.uniqueId = uniqueId;
    this.answer = -1;
    this.textualAnswer = '';
    this.text = goalText;
    this.placeholder = defineGoalPlaceholder;
    this.goalTypeDescription = goalTypeDescription;
  }

  /**
   * Get goal type description
   * @returns {String} String representation of the goal type
   */
  GoalInstance.prototype.getGoalTypeDescription = function () {
    return this.goalTypeDescription;
  };

  /**
   * Get goal id
   * @returns {Number} uniqueId A unique identifier for the goal
   */
  GoalInstance.prototype.getUniqueId = function () {
    return this.uniqueId;
  };

  /**
   * Set or get goal answer/assessment depending on provided parameter
   * @param {Number} answer If defined the goal will be set to this value.
   * @returns {*} Returns answer with no parameters, and return this when setting parameter for chaining
   */
  GoalInstance.prototype.goalAnswer = function (answer) {
    // Get answer value if no arguments
    if (answer === undefined) {
      return this.answer;
    }

    // Set answer value
    this.answer = answer;
    return this;
  };

  /**
   * Get or set goal text depending on provided parameter
   * @param {String} text If defined this will be the new goal text for the goal
   * @returns {*} Returns text with no parameters, and return this when setting parameter for chaining
   */
  GoalInstance.prototype.goalText = function (text) {
    // Get text value if no arguments
    if (text === undefined) {
      return this.text;
    }

    // Set text value
    this.text = text;
    return this;
  };

  /**
   * Get goal placeholder
   * @returns {*} Returns placeholder
   */
  GoalInstance.prototype.getGoalPlaceholder = function () {
    return this.placeholder;
  };

  /**
   * Set textual answer in goal instance
   * @param {String} textualAnswer Textual answer
   */
  GoalInstance.prototype.setTextualAnswer = function (textualAnswer) {
    this.textualAnswer = textualAnswer;
  };

  /**
   * Get textual answer from goal instance
   * @returns {string} textualAnswer Textual answer
   */
  GoalInstance.prototype.getTextualAnswer = function () {
    return this.textualAnswer;
  };

  /**
   * Answer call to return the current state.
   *
   * @return {object} Current state.
   */
  GoalInstance.prototype.getCurrentState = function () {
    return {
      answer: this.answer,
      textualAnswer: this.getTextualAnswer(),
      text: this.text,
      placeholder: this.placeholder,
      goalTypeDescription: this.goalTypeDescription
    };
  };

  return GoalInstance;
}());
