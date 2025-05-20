H5P.CKEditor = (function (EventDispatcher, $) {

  const DefaultCKEditorConfig = {
    removePlugins: ['MathType'],
    updateSourceElementOnDestroy: true,
    startupFocus: true,
    toolbar: [
      'heading', '|', 'bold', 'italic', 'underline', 'strikeThrough', '|', 'link', '|', 'insertTable'
    ],
    link: {
      // Automatically add target="_blank" and rel="noopener noreferrer" to all external links.
      addTargetToExternalLinks: true,
      // Automatically add protocol if not present
      defaultProtocol: 'http://',
    },
    heading: {
      options: [
        { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
        { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
        { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
        { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
        { model: 'heading4', view: 'h4', title: 'Heading 4', class: 'ck-heading_heading4' },
        { model: 'heading5', view: 'h5', title: 'Heading 5', class: 'ck-heading_heading5' },
        { model: 'heading6', view: 'h6', title: 'Heading 6', class: 'ck-heading_heading6' },
        { model: 'formatted', view: 'pre', title: 'Formatted' },
        { model: 'address', view: 'address', title: 'Address' },
        { model: 'normal', view: 'div', title: 'Normal (DIV)' }
      ]
    },
    table: {
      contentToolbar: [
        'toggleTableCaption',
        'tableColumn',
        'tableRow',
        'mergeTableCells',
        'tableProperties',
        'tableCellProperties'
      ],
      tableProperties: {
        defaultProperties: {
          borderStyle: 'underline',
          borderWidth: '0.083em',
          borderColor: '#494949',
          padding: '0',
          alignment: 'left'
        }
      },
      tableCellProperties: {
        defaultProperties: {
          borderStyle: 'underline',
          borderWidth: '0.083em',
          borderColor: '#494949',
          padding: '1px'
        }
      }
    }
  };

  const DESTROYED = 0;
  const CREATED = 1;
  const DESTROYING = 2;

  /**
   * Constructor
   * @param {string} targetId The id of the DOM lement beeing replaced by CK
   * @param {string} languageCode The two letter language code
   * @param {H5P.jQuery} dialogContainer The DOM element the CK editor
   *                                     dialogs should be attached to
   * @param {string} [initialContent] The inital content of CK
   * @param {Object} [config] Configuration options for CK. If not set, the
   *                          DefaultCKEditorConfig will be used
   * @constructor
   */
  function CKEditor(targetId, languageCode, $dialogContainer, initialContent, config) {
    EventDispatcher.call(this);

    let self = this;
    let ckInstance;
    let data = initialContent;

    let state = DESTROYED;

    config = config || DefaultCKEditorConfig;
    config.defaultLanguage = config.language = languageCode;

    const setState = function (newState) {
      state = newState;
    };

    const initCKEditor = function (resolve) {
      let $target = $('#' + targetId);

      // Abort if target is gone
      if (!$target.is(':visible')) {
        return;
      }

      // Create the CKEditor instance
      window.ClassicEditor.create($target.get(0), config)
        .then(editor => {
          editor.ui.element.classList.add("h5p-ckeditor");
          editor.ui.element.style.height = '100%';
          editor.ui.element.style.width = '100%';

          editor.editing.view.focus();

          ckInstance = editor;
          ckInstance.setData(data);

          resolve && resolve(ckInstance);
        })
        .catch(e => {
          throw new Error('Error loading CKEditor of target ' + targetId + ': ' + e);
        });
    };

    self.create = function () {
      if (!window.ClassicEditor && !H5P.CKEditor.load) {
        H5P.CKEditor.load = new Promise((resolve, reject) => {
          // Load the CKEditor script if it hasn't been loaded yet
          const script = document.createElement('script');
          script.src = H5P.getLibraryPath('H5P.CKEditor-1.0') + '/build/ckeditor.js';
          script.onload = () => {
            initCKEditor(resolve);
          };
          script.onerror = reject;
          document.body.appendChild(script);
        })
        .then(() => {
          setState(CREATED)
        });
      }
      else {
        if (state !== CREATED) {
          H5P.CKEditor.load.then(() => initCKEditor());
        }
        else {
          initCKEditor();
        }
      }
    };

    self.destroy = function () {
      // Need to check if destroy() is not already in process
      // since multiple simultaneous calls can happen
      if (state !== DESTROYING && ckInstance) {
        data = self.getData();
        setState(DESTROYING);

        ckInstance.destroy()
          .then(() => {
            setState(DESTROYED);
            ckInstance = undefined;
          })
          .catch( error => {
            console.log( error );
          });
      }
    };

    // Get the current CK data
    self.getData = function () {
      return ckInstance ? ckInstance.getData().trim() : (data ? data : '');
    };

    self.resize = function (width, height) {
      // This method must exist, but we don't have to do anything
    };
  }

  // Extends the event dispatcher
  CKEditor.prototype = Object.create(EventDispatcher.prototype);
  CKEditor.prototype.constructor = CKEditor;

  return CKEditor;
})(H5P.EventDispatcher, H5P.jQuery);
