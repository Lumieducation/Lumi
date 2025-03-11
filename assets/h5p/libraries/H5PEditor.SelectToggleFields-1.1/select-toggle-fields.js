H5PEditor.SelectToggleFields = (function ($) {

  if (Function.prototype.clone === undefined) {
    Function.prototype.clone = function () {
      var that = this;
      var temp = function temporary() {
        return that.apply(this, arguments);
      };
      for (var key in this) {
        temp[key] = this[key];
      }
      return temp;
    };
  }

  function SelectToggleFields(parent, field, params, setValue) {
    var self = this;

    // Set default value:
    params = params || '';

    self.field = field;
    // Outsource readies
    self.passReadies = true;
    self.value = params;

    var fieldsToHide = [];
    var nameToFieldMap = {};

    parent.ready(function () {
      for (var i = 0; i < field.options.length; i++) {
        var option = field.options[i];
        if (option.hideFields) {
          option.hideFields.forEach(function (path) {
            var f = H5PEditor.findField(path, parent);
            if (f.getDomElement !== undefined) {

              var $element = f.getDomElement();
              fieldsToHide.push($element);
              if (nameToFieldMap[option.value] === undefined) {
                nameToFieldMap[option.value] = [];
              }
              var originalValidate = f.validate.clone();
              nameToFieldMap[option.value].push($element);
              // Override validate function, so that we do not validate hidden
              // elements
              f.validate = function () {
                // if not hidden - let's validate
                return ($element.hasClass('h5peditor-select-toggle-field-hide') ? true : originalValidate());
              };
            }
            else {
              //throw
              console.error('Wrong usage - field need to implement getDomElement()');
            }
          });
        }
      }

      $selectWrapper.find('select').val(params);
      setValue(self.field, params);
      updateUI(params);
    });

    var $selectWrapper = $('<div>', {});

    var semantics = [
      {
        name: field.name,
        type: field.type,
        label: field.label,
        options: field.options,
        optional: field.optional,
        default: field.default
      }
    ];

    H5PEditor.processSemanticsChunk(semantics, params, $selectWrapper, self);

    var updateUI = function (value) {
      var fields = nameToFieldMap[value];

      if (fields) {
        // Unhide all fields:
        for (var i = 0; i < fieldsToHide.length; i++) {
          fieldsToHide[i].removeClass('h5peditor-select-toggle-field-hide');
        }

        fields.forEach(function (f) {
          f.addClass('h5peditor-select-toggle-field-hide');
        });
      }
      else {
        // Hide all fields:
        for (var i = 0; i < fieldsToHide.length; i++) {
          fieldsToHide[i].addClass('h5peditor-select-toggle-field-hide');
        }
      }
    };

    $selectWrapper.find('select').on('change', function () {
      self.value = $(this).val();
      setValue(self.field, self.value);
      updateUI(self.value);
    });

    /**
     *
     */
    self.appendTo = function ($wrapper) {
      $wrapper.append($selectWrapper);
    };

    /**
     * Always validate
     * @return {boolean}
     */
    self.validate = function () {
      return true;
    };

    self.remove = function () {};
  }

  return SelectToggleFields;
})(H5PEditor.$);

// Register widget
H5PEditor.widgets.selectToggleFields = H5PEditor.SelectToggleFields;
