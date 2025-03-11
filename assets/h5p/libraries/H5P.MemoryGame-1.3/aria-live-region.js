(function (MemoryGame) {

  /**
   * Aria live region for reading to screen reader.
   *
   * @class H5P.MemoryGame.Popup
   */
  MemoryGame.AriaLiveRegion = function () {

    let readText, timeout = null;

    // Build dom with defaults
    const dom = document.createElement('div');
    dom.classList.add('h5p-memory-aria-live-region');
    dom.setAttribute('aria-live', 'polite');
    dom.style.height = '1px';
    dom.style.overflow = 'hidden';
    dom.style.position = 'absolute';
    dom.style.textIndent = '1px';
    dom.style.top = '-1px';
    dom.style.width = '1px';

    /**
     * Get DOM of aria live region.
     *
     * @returns {HTMLElement} DOM of aria live region.
     */
    this.getDOM = function () {
      return dom;
    }

    /**
     * Set class if default CSS values do not suffice.
     *
     * @param {string} className Class name to set. Add CSS elsewhere.
     */
    this.setClass = function(className) {
      if (typeof className !== 'string') {
        return;
      }

      // Remove default values
      dom.style.height = '';
      dom.style.overflow = '';
      dom.style.position = '';
      dom.style.textIndent = '';
      dom.style.top = '';
      dom.style.width = '';

      dom.classList = className;
    }

    /**
     * Read text via aria live region.
     *
     * @param {string} text Text to read.
     */
    this.read = function (text) {
      if (readText) {
        const lastChar = readText
          .substring(readText.length - 1);

        readText =
          [`${readText}${lastChar === '.' ? '' : '.'}`, text]
          .join(' ');
      }
      else {
        readText = text;
      }

      dom.innerText = readText;

      window.clearTimeout(timeout);
      timeout = window.setTimeout(function () {
        readText = null;
        dom.innerText = '';
      }, 100);
    }
  }

})(H5P.MemoryGame);
