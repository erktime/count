define([
    "jquery",
    "underscore",
    "backbone",
    "text!src/templates/timer.html",
    "text!src/templates/timerEdit.html"
    ], function ($, _, Backbone, templateHtml, editTemplateHtml) {
  var template = Handlebars.compile(templateHtml);
  var editTemplate = Handlebars.compile(editTemplateHtml);

  var view = Backbone.View.extend({
    events: {
      "click .edit": "renderEditMode",
      "click .toggle": "toggle",
      "click .reset": "reset",
      "click .done": "saveOptions"
    },

    initialize: function () {
      this.timer = null;
      this.startTime = null;
      this.seconds = 0;
      this.endSeconds = null;

      this.endTimerConfig = {
        hours: null,
        minutes: null,
        seconds: null
      };
    },

    render: function () {
      var data = {
        total: this.formatTime(this.seconds),
        remaining: this.formatTime(this.endSeconds)
      };

      this.$el.html(template(data));
      return this;
    },

    renderEditMode: function () {
      this.$(".remaining").addClass("editing").html(
          editTemplate(this.endTimerConfig));
      this.$(".edit").removeClass("edit").addClass("done").text("Done");
      this.$(".toggle").attr("disabled", "disabled");
      this.$(".reset").attr("disabled", "disabled");
    },

    toggle: function () {
      if (this.timer) {
        this.stop();
      } else {
        this.start();
      }
    },

    reset: function () {
      clearInterval(this.timer);
      this.startTime = null;
      this.timer = null;
      this.seconds = 0;

      // Configure countdown timer.
      var endCount = 0;
      if (!_.isNaN(this.endTimerConfig.hours)) {
        endCount += 60 * 60 * this.endTimerConfig.hours;
      }

      if (!_.isNaN(this.endTimerConfig.minutes)) {
        endCount += 60 * this.endTimerConfig.minutes;
      }

      if (!_.isNaN(this.endTimerConfig.seconds)) {
        endCount += this.endTimerConfig.seconds;
      }

      this.endSeconds = (endCount > 0) ? endCount : null;

      this.render();
    },

    update: function () {
      var now = new Date();
      var diff = Math.round((now.getTime() - this.startTime.getTime()) / 1000);

      if (!_.isNull(this.endSeconds)) {
        var remaining = this.endSeconds - diff;
        if (remaining >= 0) {
          this.$(".remaining").html(this.formatTime(remaining));
        } else {
          this.trigger("timeout");
          this.stop();
          return;
        }
      }

      var sec = this.seconds + diff;
      this.$(".total").html(this.formatTime(sec));
    },

    saveOptions: function () {
      var hours = parseInt(this.$("input[name='hours']").val(), 10);
      if (!_.isNaN(hours)) {
        this.endTimerConfig.hours = hours;
      } else {
        this.endTimerConfig.hours = null;
      }

      var minutes = parseInt(this.$("input[name='minutes']").val(), 10);
      if (!_.isNaN(minutes)) {
        this.endTimerConfig.minutes = minutes;
      } else {
        this.endTimerConfig.minutes = null;
      }

      var seconds = parseInt(this.$("input[name='seconds']").val(), 10);
      if (!_.isNaN(seconds)) {
        this.endTimerConfig.seconds = seconds;
      } else {
        this.endTimerConfig.seconds = null;
      }

      this.reset();
    },

    formatTime: function (seconds) {
      if (_.isUndefined(seconds) || _.isNull(seconds)) {
        return "";
      }

      var min = Math.floor(seconds / 60);
      var hour = Math.floor(min / 60);
      var sec = seconds % 60;
      return this.zeroFill(hour, 2) + "<span class='divider'>:</span>"
          + this.zeroFill(min, 2) + "<span class='divider'>:</span>"
          + this.zeroFill(sec, 2);
    },

    start: function () {
      this.startTime = new Date();
      this.timer = setInterval($.proxy(this.update, this), 1000);
      this.$el.addClass("counting");
      this.$(".edit").attr("disabled", "disabled");
      this.$(".toggle").removeClass("btn-primary").addClass("btn-danger")
          .text("Pause");
      this.trigger("start");
    },

    stop: function () {
      if (!this.timer) {
        return;
      }

      clearInterval(this.timer);
      this.timer = null;
      this.$el.removeClass("counting");
      this.$(".toggle").removeClass("btn-danger").addClass("btn-primary")
          .text("Start");
      this.$(".edit").removeAttr("disabled");

      var now = new Date();
      var diff = now.getTime() - this.startTime.getTime();
      // Floor instead of round so we repeat the current count and don't
      // skip a number on resume.
      this.seconds += Math.floor(diff / 1000)

      if (!_.isNull(this.endSeconds)) {
        this.endSeconds =
            Math.max(0, this.endSeconds - Math.floor(diff / 1000));
      }

      this.trigger("stop");
    },

    zeroFill: function (number, width) {
      width -= number.toString().length;
      if (width > 0) {
        return new Array(width + (/\./.test(number) ? 2 : 1)).join('0') + number;
      }
      return number + ""; // always return a string
    }
  });

  return view;
});
