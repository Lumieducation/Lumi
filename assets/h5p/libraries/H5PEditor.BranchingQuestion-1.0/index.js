var H5PEditor = H5PEditor || {};

H5PEditor.BranchingQuestion = (function ($, EventDispatcher, Branch) {

  function BranchingQuestionEditor(parent, field, params, setValue) {
    const self = this;
    this.parent = parent;
    this.field = field;
    this.params = params || {};
    this.setValue = setValue;

    // Inherit event system
    EventDispatcher.call(this);

    this.passReadies = true;
    this.ready = function (ready) {
      this.parent.ready(ready);
    };


    this.appendTo = function ($wrapper) {
      this.$wrapper = $wrapper;
      this.$editor = $('<div>', {
        'class': 'h5p-editor-branching-question',
      });

      H5PEditor.processSemanticsChunk(
        this.field.fields,
        this.params,
        this.$editor,
        this,
        (parent.currentLibrary || '')
      );

      this.setValue(this.field, this.params);
      $wrapper.append(this.$editor);
    };

    /**
     * Update next content id field
     *
     * @param listIndex
     * @param nextContentId
     */
    this.setNextContentId = function (listIndex, nextContentId) {
      var nextContentIds = this.$editor[0].querySelectorAll('.field-name-nextContentId');
      var input = nextContentIds[listIndex].querySelector('.h5peditor-text');
      input.value = nextContentId;
      H5P.jQuery(input).trigger('change');
      this.setValue(this.field, this.params);

      var alternativeWrapper = H5P.jQuery(input).closest('.content')[0];
      if (parseInt(nextContentId) === -1) {
        alternativeWrapper.classList.remove('hide-score');
      }
      else {
        alternativeWrapper.classList.add('hide-score');
      }
    };

    /**
     * Set available alternatives that will replace the number field for
     * next content id.
     *
     * @param addHtmlCallback
     */
    this.setAlternatives = function (addHtmlCallback) {
      var listIndex;
      for (let i = 0; i < this.field.fields.length; i++) {
        if (this.field.fields[i].name === 'alternatives') {
          listIndex = i;
          break;
        }
      }

      var list = this.children[listIndex];
      list.on('addedItem', function () {
        this.replaceContentIdWithSelector(addHtmlCallback);
        this.addFeedbackGroupDescription();
      }.bind(this));

      this.replaceContentIdWithSelector(addHtmlCallback);
      this.addFeedbackGroupDescription();
    };

    /**
     * Add feedback group description for each alternative.
     */
    this.addFeedbackGroupDescription = function () {
      const feedbackGroups = this.$editor[0].querySelectorAll('.field-name-feedback');
      for (let i = 0; i < feedbackGroups.length; i++) {
        const feedbackGroup = feedbackGroups[i];

        // Skip descriptions that have already been added
        if (feedbackGroup.querySelector('.h5p-feedback-description')) {
          continue;
        }

        const feedbackDescriptionId = H5PEditor.getDescriptionId(H5PEditor.getNextFieldId({
          name: 'feedback'
        }));

        const description = document.createElement('div');
        description.setAttribute('id', feedbackDescriptionId);
        description.classList.add('h5p-feedback-description');
        description.classList.add('h5peditor-field-description');
        description.textContent = BranchingQuestionEditor.t('feedbackDescription');

        feedbackGroup.querySelector('.title').setAttribute('aria-describedby', feedbackDescriptionId);

        const groupWrapper = feedbackGroup.querySelector('.content');
        groupWrapper.insertBefore(description, groupWrapper.firstChild);
      }
    };

    /**
     * Replaces next content id number field with a selector of available alts
     *
     * @param addHtmlCallback
     */
    this.replaceContentIdWithSelector = function (addHtmlCallback) {
      var nextContentIds = this.$editor[0].querySelectorAll('.field-name-nextContentId');
      for (var i = 0; i < nextContentIds.length; i++) {

        var nextContentId = nextContentIds[i];

        var selectorWrapper;
        if (nextContentId.style.display === 'none') {
          // Already handled, update DOM
          selectorWrapper = nextContentId.parentNode.querySelector('.h5p-next-branch-wrapper');
        }
        else {
          // Hide next content id fields
          nextContentId.style.display = 'none';

          selectorWrapper = document.createElement('div');
          selectorWrapper.classList.add('h5p-next-branch-wrapper');
          nextContentId.parentNode.insertBefore(selectorWrapper, nextContentId);
        }

        findList('alternatives').forEachChild(function (child, index) {
          if (index === i) {
            addHtmlCallback(i, selectorWrapper, H5PEditor.findField('feedback', child));
          }
        });
      }
    };

    /**
     * A small helper for finding list widgets.
     *
     * @param {string} path
     * @return {Object}
     */
    const findList = function (path) {
      for (let i = 0; i < self.children.length; i++) {
        if (self.children[i].getName && self.children[i].getName() === path) {
          return self.children[i];
        }
      }
    };

    /**
     * Collapse all feedback groups
     */
    this.collapseListAlternatives = function () {
      // Note: Relies on the specific order of semantics, since List for some
      // reason doesn't have a field that can be used for lookup.
      // Be sure to update this when semantics are changed.
      const alternatives = this.children[1];
      alternatives.forEachChild(function (child) {
        child.collapse();
      });
    };

    /**
     * Remove widget from DOM
     */
    this.remove = function () {
      if (this.$editor) {
        this.$editor.remove();
      }
    };

    /**
     * Validate all children
     *
     * @returns {boolean}
     */
    this.validate = function () {
      var valid = true;
      for (var i = 0; i < this.children.length; i++) {
        valid = valid && this.children[i].validate();
      }
      return valid;
    };
  }

  BranchingQuestionEditor.t = function (key, placeholders) {
    return H5PEditor.t('H5PEditor.BranchingQuestion', key, placeholders);
  };

  return BranchingQuestionEditor;
})(H5P.jQuery, H5P.EventDispatcher);

H5PEditor.widgets.branchingQuestion = H5PEditor.BranchingQuestion;