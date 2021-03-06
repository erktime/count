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

    SPECIAL_KEYS: {
      "37": "0x2190", // Left arrow
      "38": "0x2191", // Up arrow
      "39": "0x2192", // Right arrow
      "40": "0x2193"  // Down arrow
    },

    events: {
      "click .icon-edit": "renderEditMode",
      "click .done": "updateCounter",
      "click .delete": "removeCounter",
      "click .reset": "onReset",
      "focus input": "onInputFocus",
      "keydown input[name='keyCode']": "onKeyCodeDown",
      "keyup input": "onKeyCodeUp"
    },

    initialize: function () {
      this.model.on("change", this.render, this);
    },

    render: function () {
      if (this.model.get("global")) {
        this.$el.addClass("global");
      }

      var data = this.model.toJSON();
      data.keyCodeLabel =
          this.getAscii(this.model.get("keyCode")) || "[no key]";
      this.$el.html(template(data)).removeClass("edit");
      if (this.model.get("maxReached")) {
        this.$el.addClass("maxReached");
      } else {
        this.$el.removeClass("maxReached");
      }

      return this;
    },

    renderEditMode: function (event) {
      if (this.model.get("global")) {
        this.$el.addClass("global");
      }

      var data = this.model.toJSON();
      data.ascii = this.getAscii(data.keyCode);
      this.$el.html(editTemplate(data)).addClass("edit");
      this.$("input[name='name']").focus().select();

      this.$("label").tooltip();
      return this;
    },

    updateCounter: function (event) {
      var obj = {
        name: this.$("input[name='name']").val(),
        maxCount: parseInt(this.$("input[name='maxCount']").val(), 10) || null,
        interval: parseInt(this.$("input[name='interval']").val(), 10),
        count: parseInt(this.$("input[name='count']").val(), 10)
      };

      if (_.isNaN(obj.maxCount)) {
        delete obj.maxCount;
      }

      if (_.isNaN(obj.interval)) {
        delete obj.interval;
      }

      if (_.isNaN(obj.count)) {
        delete obj.count;
      }

      if (!this.model.get("global")) {
        obj.addToGlobal = this.$("input[name='addToGlobal']")[0].checked;
        obj.keyCode = this.$("input[name='keyCode']").data("code");
      }

      // Silent the event, which allows us to trigger render, regarldess
      // of change in model state.
      this.model.save(obj, {silent: true});
      this.render();
    },

    onKeyCodeDown: function (event) {
      var keyCode = event.which;

      // Ignore tab, and any modifier keys
      if (keyCode === 9 || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      // Delete key || backspace key.
      if (keyCode === 8 || keyCode === 46) {
        keyCode = null;
      }

      $(event.currentTarget).data("code", keyCode).val(
          this.getAscii(keyCode));
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
        var specialKey = this.SPECIAL_KEYS[keyCode + ""];
        if (specialKey) {
          return String.fromCharCode(specialKey);
        } else {
          return String.fromCharCode(keyCode);
        }
      } else {
        return "";
      }
    },

    onInputFocus: function (event) {
      $(event.currentTarget).select();
    },

    isEditing: function () {
      return this.$el.hasClass("edit");
    },

    onReset: function (event) {
      this.model.save({count: 0, maxReached: false});
      this.render();
    },

    destroy: function () {
      this.off();
      this.remove();
    },

    removeCounter: function (event) {
      if (confirm("Are you sure you want to delete this counter?")) {
        this.model.destroy();
      }
    }
  });

  return view;
});
