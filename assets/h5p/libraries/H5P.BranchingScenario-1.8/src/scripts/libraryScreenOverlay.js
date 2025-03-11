import '@styles/libraryScreenOverlay.scss';

export default class LibraryScreenOverlay {

  /**
   * @class
   * @param {LibraryScreeb} parent.
   */
  constructor(parent) {
    this.hidden = true;
    this.parent = parent;
    this.overlay = document.createElement('div');
    this.overlay.classList.add('h5p-content-overlay');
    this.overlay.classList.add('h5p-hidden');

    this.buttonsContainer = document.createElement('div');
    this.buttonsContainer.classList.add('h5p-content-overlay-buttons-container');
    this.overlay.appendChild(this.buttonsContainer);
    this.buttons = {};
  }

  /**
   * Get DOM element of overlay.
   * @return {HTMLElement} DOM element of overlay.
   */
  getDOM() {
    return this.overlay;
  }

  /**
   * Show overlay.
   */
  show() {
    this.overlay.classList.remove('h5p-hidden');
    window.requestAnimationFrame(() => {
      this.buttonsContainer.classList.remove('h5p-hidden');
      this.hidden = false;

      // Focus last button (assuming proceed)
      Object.values(this.buttons)[Object.keys(this.buttons).length - 1].focus();
    });
  }

  /**
   * Hide overlay.
   */
  hide() {
    this.hidden = true;
    this.overlay.classList.add('h5p-hidden');
    this.buttonsContainer.classList.add('h5p-hidden');
  }

  /**
   * Determine whether overlay is visible.
   * @return {boolean} True, if overlay is visible, else false;
   */
  isVisible() {
    return !this.hidden;
  }

  /**
   * Add button to overlay.
   * @param {string|number} id Id of button.
   * @param {string} label Label for button.
   * @param {function} callback Callback for button click.
   * @return {HTMLElement} Button.
   */
  addButton(id, label, callback) {
    if (
      !id && id !== 0 ||
      !label ||
      typeof callback !== 'function' ||
      this.buttons[id]
    ) {
      return null;
    }

    const button = document.createElement('button');
    button.classList.add('transition');
    button.classList.add('h5p-nav-button');
    button.classList.add(`h5p-nav-button-${id}`);
    button.innerText = label;

    button.addEventListener('click', () => {
      callback(id);
    });

    this.buttons[id] = button;
    this.buttonsContainer.appendChild(button);

    return button;
  }

  /**
   * Remove button.
   * @param {string|number} id Id of button.
   */
  removeButton(id) {
    if (!id && id !== 0 || !this.buttons[id]) {
      return;
    }

    this.buttonsContainer.removeChild(this.buttons[id]);
    delete this.buttons[id];
  }
}
