var H5PPresave = H5PPresave || {};

/**
 * Resolve the presave logic for the content type Speak the Words
 *
 * @param {object} content
 * @param finished
 * @constructor
 */
H5PPresave['H5P.SpeakTheWords'] = function (content, finished) {
  var presave = H5PEditor.Presave;
  var score = 1;

  if (isContentInvalid()) {
    throw new presave.exceptions.InvalidContentSemanticsException('Invalid Speak The Words Error');
  }

  presave.validateScore(score);

  finished({maxScore: score});

  /**
   * Check if required parameters is present
   * @return {boolean}
   */
  function isContentInvalid() {
    return !presave.checkNestedRequirements(content, 'content.acceptedAnswers') || !Array.isArray(content.acceptedAnswers);
  }
};
