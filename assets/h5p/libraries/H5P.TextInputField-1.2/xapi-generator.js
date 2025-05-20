var H5P = H5P || {};
H5P.TextInputField = H5P.TextInputField || {};

/**
 * Generate xAPI statements
 */
H5P.TextInputField.XAPIGenerator = (function ($) {

  function XAPIGenerator(question) {
    // Set up default response object
    this.event = {
      description: {
        'en-US': question // We don't actually know the language of the question
      },
      type: 'http://adlnet.gov/expapi/activities/cmi.interaction',
      interactionType: 'fill-in',
    };
  }

  XAPIGenerator.prototype.constructor = XAPIGenerator;

  /**
   * Extend xAPI template
   * @param {H5P.XAPIEvent} xApiTemplate xAPI event template
   * @param {string} answer Text input given
   * @return {H5P.XAPIEvent} Extended xAPI event
   */
  XAPIGenerator.prototype.generateXApi = function (xApiTemplate, answer) {
    let statement = xApiTemplate.data.statement;

    statement = $.extend(true, statement, {
      result: {
        response: answer
      }
    });

    if (statement.object) {
      statement.object.definition = $.extend(true, statement.object.definition, this.event);
    }

    return xApiTemplate;
  };

  return XAPIGenerator;
})(H5P.jQuery);
