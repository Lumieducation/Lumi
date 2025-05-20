var H5PPresave = H5PPresave || {};
var H5PEditor = H5PEditor || {};


/**
 * Function to go thr all elements of a Course Presentation and perform the separate calculations before returning a aggregated result
 *
 * @param content
 * @param finished
 * @constructor
 */
H5PPresave['H5P.CoursePresentation'] = function (content, finished) {
  var presave = H5PEditor.Presave;

  if (isContentInvalid()) {
    throw new presave.exceptions.InvalidContentSemanticsException('Invalid Course Presentation Error');
  }

  var score = content.presentation.slides
    .map(function (value, index) {
      var slide = content.presentation.slides[index];
      if (!slide.hasOwnProperty('elements')) {
        return [];
      }
      return slide.elements;
    })
    .filter(function (elements) {
      return elements.length > 0;
    })
    .reduce(function (previous, current) {
      return previous.concat(current);
    }, [])
    .map(function (element) {
      if (element.hasOwnProperty('action')) {
        return element.action;
      }
      return {};
    })
    .filter(function (action) {
      return action.hasOwnProperty('library') && action.hasOwnProperty('params');
    })
    .map(function (action) {
      return (new presave).process(action.library, action.params).maxScore;
    })
    .reduce(function (currentScore, scoreToAdd) {
      if (presave.isInt(scoreToAdd)) {
        currentScore += scoreToAdd;
      }
      return currentScore;
    }, 0);

  presave.validateScore(score);

  finished({maxScore: score});

  /**
   * Check if required parameters is present
   * @return {boolean}
   */
  function isContentInvalid() {
    return !presave.checkNestedRequirements(content, 'content.presentation.slides') || !Array.isArray(content.presentation.slides);
  }
};
