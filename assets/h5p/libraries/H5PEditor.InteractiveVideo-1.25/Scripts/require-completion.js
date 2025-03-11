/**
 * @class H5PEditor.InteractiveVideo.RequireCompletion
 */
H5PEditor.InteractiveVideo.RequireCompletion = (function () {

  /**
   * Handles the require completion option and the way it affects the interaction
   * and other interactions.
   *
   * @param {H5PEditor.InteractiveVideo} IVEditor
   * @param {Object} interaction
   * @constructor
   */
  function RequireCompletion(IVEditor, interaction) {

    // Shorthand for translating texts
    var t = H5PEditor.InteractiveVideo.t;

    // Determines if retry is enabled for this interaction
    var enableRetry;

    /**
     * Interaction fields gathers all fields of the interaction
     *
     * @type {Object} interactionFields
     * @param {Object} interactionFields.adaptivity
     */
    var interactionFields = IVEditor.getInteractionFields(interaction);

    /**
     * A group with adaptivity settings of the interaction
     *
     * @type {Object} adaptivityFields
     * @param {Object} adaptivityFields.requireCompletion
     */
    var adaptivityFields = IVEditor.getInteractionFields(interactionFields.adaptivity);

    // Message to show that triggering retry has been disabled
    var enableRetryDisabledMsg = document.createElement('div');
    enableRetryDisabledMsg.textContent = t('fullScoreRequiredRetry');
    enableRetryDisabledMsg.className = [
      'h5peditor-field-description',
      'h5peditor-enable-retry-disabled-msg',
      'h5p-hide'
    ].join(' ');

    // Message to show that triggering pause option has been disabled
    var pauseDisabledMsg = document.createElement('div');
    pauseDisabledMsg.textContent = t('fullScoreRequiredPause');
    pauseDisabledMsg.className = [
      'h5peditor-field-description',
      'h5peditor-pause-disabled-msg',
      'h5p-hide'
    ].join(' ');
    interactionFields.pause.$item.get(0).appendChild(pauseDisabledMsg);

    // Message showing that two interactions have a time conflict
    var conflictingTimeMsg = document.createElement('div');
    conflictingTimeMsg.innerHTML = t('fullScoreRequiredTimeFrame');
    conflictingTimeMsg.className = [
      'h5peditor-field-description',
      'h5peditor-conflicting-time-msg',
      'h5p-hide'
    ].join(' ');

    interactionFields.pause.$item.get(0).parentNode
      .insertBefore(conflictingTimeMsg, interactionFields.pause.$item.get(0).nextSibling);

    // Handle behavioural changes of $form when require completion input is changed
    adaptivityFields.requireCompletion.$input.change(function () {
      handleRequireCompletionToggled();
    });

    // Check if conflict message should be shown when duration is changed
    interactionFields.duration.$inputs.change(function () {
      toggleDuration(adaptivityFields.requireCompletion.$input[0].checked);
    });

    // Check if conflicting message should be shown when dialog is opened
    interaction.on('openEditDialog', function () {
      pollForLoadedSemantics(interactionFields);
    });

    /**
     * Poll for when semantics of the interaction library has loaded
     */
    function pollForLoadedSemantics(fields) {
      var hasLoaded = fields.action.children;

      if (hasLoaded) {
        insertRetryButtonMessage(fields.action);
        handleRequireCompletionToggled();
      }
      else {
        setTimeout(function () {
          pollForLoadedSemantics(fields);
        }, 20);
      }
    }

    /**
     * Insert retry button message into the library specific semantics.
     *
     * @param {Object} library Library fields
     */
    function insertRetryButtonMessage(library) {
      var libraryFields = IVEditor.getInteractionFields(library);
      if (!libraryFields.behaviour) {
        return;
      }

      var behaviour = IVEditor.getInteractionFields(libraryFields.behaviour);
      enableRetry = behaviour.enableRetry;

      if (enableRetry && !enableRetryDisabledMsg.parentNode) {
        enableRetry.$item.get(0).parentNode
          .insertBefore(enableRetryDisabledMsg, enableRetry.$item.get(0).nextSibling);
      }
    }

    /**
     * If interaction has the require completion option enabled it will
     * search through all other interactions to determine if any of them
     * has a conflicting duration with this interaction, in which case a conflict
     * message will be displayed
     *
     * @param {Object} interaction Interaction that we are interested in checking
     * @param {Array} otherInteractions List of interactions that will be checked
     *  for conflicting duration time with given interaction
     */
    function handleConflictingInteractions(interaction, otherInteractions) {
      if (!interaction.getRequiresCompletion()) {
        return;
      }

      var conflictingInteractions = getConflictingInteractions(interaction, otherInteractions);
      conflictingTimeMsg.classList.toggle('h5p-hide', !conflictingInteractions.length);
    }

    /**
     * Checks if an interaction is at a given time interval
     *
     * @param {Object} time Time we are comparing against
     * @param {number} time.from Showing from
     * @param {number} time.to End of the interval we are checking
     * @param {Object} interaction Interaction time interval
     *
     * @return {boolean} Returns true if the interaction starts or ends within
     *  the given interval
     */
    function hasDurationWithin(time, interaction) {
      var duration = interaction.getDuration();
      return time.from >= duration.from  &&  time.from <= duration.to
        || time.to >= duration.from && time.to <= duration.to;
    }

    /**
     * Checks if an interaction requires completion
     *
     * @param {Object} interaction Interaction that we are checking the settings of
     * @return {boolean} Returns true if the interaction requires completion
     */
    function hasRequireCompletion(interaction) {
      return interaction.getRequiresCompletion();
    }

    /**
     * Checks if an interaction has conflicting interval time with other interactions
     *
     * @param {Object} interaction Interaction we are checking
     * @param {Array} allInteractions Interactions that we are checking for conflicts
     * @return {Array} List of conflicting interactions
     */
    function getConflictingInteractions(interaction, allInteractions) {
      return allInteractions
        .filter(hasDurationWithin.bind(this, interaction.getDuration()))
        .filter(hasRequireCompletion)
        .filter(function (ia) {
          return ia !== interaction;
        });
    }

    /**
     * Checks the state of require completion checkbox and toggles messages
     * and disabled states of buttons accordingly
     */
    function handleRequireCompletionToggled() {
      var isChecked = adaptivityFields.requireCompletion.$input[0].checked;
      togglePause(isChecked);
      toggleRetry(isChecked);
      toggleDuration(isChecked);
    }

    /**
     * Toggles message for conflicting interval times of interactions
     *
     * @param {boolean} isChecked Require completion option checked state
     */
    function toggleDuration(isChecked) {
      if (!isChecked) {
        conflictingTimeMsg.classList.add('h5p-hide');
        return;
      }

      handleConflictingInteractions(interaction, IVEditor.IV.interactions);
    }

    /**
     * Toggles message and button state for pause option of interaction
     *
     * @param {boolean} isChecked Require completion option checked state
     */
    function togglePause(isChecked) {
      toggleBoolean(interactionFields.pause, isChecked);
      interactionFields.pause.$item.toggleClass('h5p-has-disabled-msg', isChecked);
      pauseDisabledMsg.classList.toggle('h5p-hide', !isChecked);
    }

    /**
     * Toggles message and button state for enable retry option of interaction
     *
     * @param {boolean} isChecked Require completion option checked state
     */
    function toggleRetry(isChecked) {
      if (enableRetry) {
        toggleBoolean(enableRetry, isChecked);
        enableRetryDisabledMsg.classList.toggle('h5p-hide', !isChecked);
      }
    }

    /**
     * Toggles a boolean semantics field and its disabled state
     *
     * @param {Object} boolean A boolean semantics field
     * @param {boolean} enable Require completion option checked state
     */
    function toggleBoolean(boolean, enable) {
      if (enable) {
        boolean.$input[0].checked = true;
        boolean.$input.trigger('change');
      }
      boolean.$input.attr('disabled', enable);
    }
  }

  return RequireCompletion;
})();
