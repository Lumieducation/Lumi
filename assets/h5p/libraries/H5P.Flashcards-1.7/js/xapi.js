var H5P = H5P || {};
H5P.Flashcards = H5P.Flashcards || {};

/**
 * Flashcards xAPI generator
 *
 * @type {Object}
 */
H5P.Flashcards.xapiGenerator = (function ($) {
  const placeHolder = '__________';

  // Alternative Reporting
  const XAPI_ALTERNATIVE_EXTENSION = 'https://h5p.org/x-api/alternatives';
  const XAPI_CASE_SENSITIVITY = 'https://h5p.org/x-api/case-sensitivity';
  const XAPI_REPORTING_VERSION_EXTENSION = 'https://h5p.org/x-api/h5p-reporting-version';
  const XAPI_REPORTING_VERSION = '1.1.0';

  const getXapiEvent = function (instance) {
    const xAPIEvent = instance.createXAPIEventTemplate('answered');

    const definition = xAPIEvent.getVerifiedStatementValue(['object', 'definition']);
    $.extend(true, definition, getxAPIDefinition(instance));

    if (definition.extensions && definition.extensions[XAPI_ALTERNATIVE_EXTENSION]) {
      const context = xAPIEvent.getVerifiedStatementValue(['context']);
      context.extensions = context.extensions || {};
      context.extensions[XAPI_REPORTING_VERSION_EXTENSION] = XAPI_REPORTING_VERSION;
    }

    xAPIEvent.setScoredResult(
      instance.getScore(),
      instance.getMaxScore(),
      instance
    );

    xAPIEvent.data.statement.result.response = instance.answers.join('[,]');
    return xAPIEvent;
  };

  const getxAPIDefinition = function (instance) {
    const definition = {};
    definition.description = {
      'en-US': '<p>' + instance.options.description + '</p>'
    };
    definition.type = 'http://adlnet.gov/expapi/activities/cmi.interaction';
    definition.interactionType = 'fill-in';

    const solutionsAll = instance.options.cards.map(function (card) {
      return H5P.Flashcards.splitAlternatives(card.answer);
    });

    // Fallback CRP, could cause computational hazard if computed fully
    const crpAnswers = solutionsAll.map(function (solutions) {
      return solutions[0];
    }).join('[,]');

    definition.correctResponsesPattern = [
      '{case_matters=' + instance.options.caseSensitive + '}' + crpAnswers
    ];

    const cardDescriptions = instance.options.cards.map(function (card) {
      return '<p>' + card.text + ' ' + placeHolder + '</p>';
    }).join('');

    definition.description['en-US'] += cardDescriptions;

    /*
     * Add H5P Alternative extension which provides all combinations of
     * different answers. Reporting software will need to support this extension
     * for alternatives to work.
     */
    definition.extensions = definition.extensions || {};
    definition.extensions[XAPI_CASE_SENSITIVITY] = instance.options.caseSensitive;
    definition.extensions[XAPI_ALTERNATIVE_EXTENSION] = solutionsAll;

    return definition;
  };

  return {
    getXapiEvent: getXapiEvent,
  };
})(H5P.jQuery);
