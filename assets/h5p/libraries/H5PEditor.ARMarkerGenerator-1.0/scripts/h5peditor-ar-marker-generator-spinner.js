H5PEditor.widgets.arMarkerGeneratorSpinner = H5PEditor.arMarkerGeneratorSpinner = (function () {
  /**
   * Constructor.
   * @param {string} classNameBase Class name base to define spinner visuals.
   */
  function Spinner(classNameBase) {
    this.classNameBase = classNameBase;
    this.container = document.createElement('div');
    this.container.classList.add(this.classNameBase + "-container");
    this.spinnerElement = document.createElement('div');
    this.spinnerElement.classList.add(classNameBase); // Circle parts with different delays for the grow/shrink animation

    var circleHead = document.createElement('div');
    circleHead.classList.add(this.classNameBase + "-circle-head");
    this.spinnerElement.appendChild(circleHead);
    var circleNeckUpper = document.createElement('div');
    circleNeckUpper.classList.add(this.classNameBase + "-circle-neck-upper");
    this.spinnerElement.appendChild(circleNeckUpper);
    var circleNeckLower = document.createElement('div');
    circleNeckLower.classList.add(this.classNameBase + "-circle-neck-lower");
    this.spinnerElement.appendChild(circleNeckLower);
    var circleBody = document.createElement('div');
    circleBody.classList.add(this.classNameBase + "-circle-body");
    this.spinnerElement.appendChild(circleBody);
    this.container.appendChild(this.spinnerElement);
  }

  /**
   * Get the DOM.
   * @return {HTMLElement} Spinner container.
   */
  Spinner.prototype.getDOM = function getDOM() {
    return this.container;
  };

  /**
   * Show spinner.
   */
  Spinner.prototype.show = function show() {
    this.container.classList.remove(this.classNameBase + "-none");
  };

  /**
   * Hide spinner.
   */
  Spinner.prototype.hide = function hide() {
    this.container.classList.add(this.classNameBase + "-none");
  };

  return Spinner;
})();
