TimelineJS = (function ($) {
  function Timeline (options, major, minor) {
    // This non-runnable library does not know it's own major+minor, therefore
    // we have tp provide it from runnable library using me
    var libraryPath = 'TimelineJS-' + major + '.' + minor;

    // Set this global variable to inform TimelineJS where all CSS/JS is placed
    window.embed_path = H5P.getLibraryPath(libraryPath) + '/';

    createStoryJS(options);
  };

  return Timeline;
})(H5P.jQuery);
