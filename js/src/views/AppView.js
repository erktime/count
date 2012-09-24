define([
    "jquery",
    "underscore",
    "backbone",
    "src/models/Counter",
    "src/views/CounterView",
    "src/views/TimerView"
    ], function ($, _, Backbone, Counter, CounterView, TimerView) {
  var view = Backbone.View.extend({
    events: {
      "click .addCounter": "addCounter",
      "click .undo": "undo"
    },

    initialize: function () {
      this.collection = new Backbone.Collection({
        model: Counter
      });

      this.collection.on("change:maxReached", this.onCounterMaxReached, this);
      this.counterViews = {};
      this.undoList = [];
    },

    render: function () {
      var self = this;
      $("body").on("keyup", function (event) {
        if (self.isCounting) {
          self.keyPress(event.which);
        }
      });

      this.globalCounterView = this.addCounter();
      this.globalCounterView.$el.addClass("global");
      this.globalCounterView.model.set({
        name: "Global"
      });

      this.timerView = new TimerView({
        el: this.$(".timer")
      });
      this.timerView.render();
      this.timerView.on("start", function () {
        self.isCounting = true;
      });
      this.timerView.on("stop", function () {
        self.isCounting = false;
      });
      this.timerView.on("timeout", function () {
        self.isCounting = false;
        self.playAlert();
      });

      return this;
    },

    addCounter: function () {
      var counter = new Counter();
      this.collection.add(counter);
      var counterView = new CounterView({
        model: counter,
        className: "counter"
      });

      this.counterViews[counter.cid] = counterView;
      this.$(".counters").append(counterView.renderEditMode().el);
      return counterView;
    },

    onCounterMaxReached: function (model, isMaxReached) {
      if (isMaxReached) {
        this.playAlert();
        this.timerView.stop();
      }
    },

    keyPress: function (keyCode) {
      var match = false;
      this.collection.each(function (counter) {
        if (counter.get("keyCode") === keyCode) {
          match = true;
          counter.increment();
        }
      });

      if (match) {
        this.globalCounterView.model.increment();
      }

      this.undoList.push(keyCode);
      this.$(".undo").removeAttr("disabled");
    },

    keyUnPress: function (keyCode) {
      var match = false;
      this.collection.each(function (counter) {
        if (counter.get("keyCode") === keyCode) {
          match = true;
          counter.decrement();
        }
      });

      if (match) {
        this.globalCounterView.model.decrement();
      }
    },

    undo: function () {
      var keyCode = this.undoList.pop();
      if (keyCode) {
        this.keyUnPress(keyCode);
      }

      if (!this.undoList.length) {
        this.$(".undo").attr("disabled", "disabled");
      }
    },

    playAlert: function () {
      $("#sound")[0].play();
    }
  });

  return view;
});
