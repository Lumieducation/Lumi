var H5PPresave = H5PPresave || {};

/**
 * Resolve the presave logic for the content type Image Hotspot
 *
 * @param {object} content
 * @param finished
 * @constructor
 */
H5PPresave['H5P.ImageHotspotQuestion'] = function(content, finished) {
  finished({maxScore: 1});
};
