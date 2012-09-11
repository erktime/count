define([
    "jquery",
    "underscore",
    "backbone",
    "text!src/templates/counter.html",
    "text!src/templates/counterEdit.html"
    ], function ($, _, Backbone, counterTemplate, counterEditTemplate) {
  var template = Handlebars.compile(counterTemplate);
  var editTemplate = Handlebars.compile(counterEditTemplate);

  var view = Backbone.View.extend({
    events: {
      "click .icon-edit": "renderEditMode",
      "click .done": "updateCounter",
      "keydown input[name='keyCode']": "onKeyCodeDown",
      "keyup input[name='keyCode']": "onKeyCodeUp"
    },

    initialize: function () {
      this.model.bind("change", this.render, this);
    },

    render: function () {
      var data = this.model.toJSON();
      this.$el.html(template(data)).removeClass("edit");
      return this;
    },

    renderEditMode: function (event) {
      var data = this.model.toJSON();
      data.ascii = this.getAscii(data.keyCode);
      this.$el.html(editTemplate(data)).addClass("edit");
      this.$("input[name='name']").focus().select();
    },

    updateCounter: function (event) {
      var obj = {
        name: this.$("input[name='name']").val(),
        maxCount: parseInt(this.$("input[name='maxCount']").val(), 10),
        interval: parseInt(this.$("input[name='interval']").val(), 10)
      };

      var keyCode = this.$("input[name='keyCode']").data("keyCode");
      if (keyCode) {
        obj.keyCode = keyCode;
      }

      // Silent the event, which allows us to trigger render, regarldess
      // of change in model state.
      this.model.set(obj, {silent: true});
      this.render();
    },

    onKeyCodeDown: function (event) {
      // TODO need to handle non ascii chars (arrow keys)
      var keyCode = event.which;

      // Ignore tab, and any modifier keys
      if (keyCode === 9 || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      $(event.currentTarget).data("keyCode", keyCode).val(
          this.getAscii(event.which));
      event.stopPropagation();
      event.preventDefault();
    },

    onKeyCodeUp: function (event) {
      // Simply cancel this event so it doesn't mess with counts.
      event.stopPropagation();
      event.preventDefault();
    },

    getAscii: function (keyCode) {
      if (keyCode) {
        return String.fromCharCode(keyCode);
      } else {
        return "";
      }
    }
  });

  return view;
});
