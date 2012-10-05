define([
    "jquery",
    "underscore",
    "backbone",
    "src/models/Counter",
    "src/views/CounterView",
    "src/views/TimerView"
    ], function ($, _, Backbone, Counter, CounterView, TimerView) {
  var view = Backbone.View.extend({
    MONTHS: "Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"),

    events: {
      "click .addCounter": "addCounter",
      "click .undo": "undo",
      "click .resetCounters": "resetAll",
      "click .deleteCounters": "deleteAll"
    },

    initialize: function () {
      this.collection = new Backbone.Collection();
      this.collection.model = Counter;

      this.collection.on("reset", this.collectionReset, this);
      this.collection.on("change:maxReached", this.onCounterMaxReached, this);
      this.counterViews = {};
      this.undoList = [];
      this.globalCounterView = null;
    },

    render: function () {
      var self = this;
      this.collection.fetch();

      $("body").on("keyup", function (event) {
        if (self.isCounting) {
          self.keyPress(event.which);
        }
      });

      this.timerView = new TimerView({
        el: this.$(".timer")
      });
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

      // Setup date for print view
      var d = new Date();
      $(".date").text(this.MONTHS[d.getMonth()] + " " + d.getDate()
          + ", " + d.getFullYear());

      return this;
    },

    collectionReset: function () {
      if (this.collection.length === 0) {
        var globalCounter = this.collection.create({
          name: "Total Count",
          global: true
        });
      }

      this.collection.each(function (counter) {
        this.createCounterView(counter, false);
      }, this);
    },

    addCounter: function () {
      var counter = this.collection.create({});
      return this.createCounterView(counter, true);
    },

    createCounterView: function (counter, editMode) {
      counter.on("destroy", this.onCounterDelete, this);
      var counterView = new CounterView({
        model: counter,
        className: "counter"
      });
      this.counterViews[counter.cid] = counterView;

      if (editMode) {
        this.$(".counters").append(counterView.renderEditMode().el);
      } else {
        this.$(".counters").append(counterView.render().el);
      }

      if (counter.get("global")) {
        this.globalCounterView = counterView;
      }

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
        if (counter.get("keyCode") === keyCode && !counter.isMaxReached()) {
          match = counter.get("addToGlobal");
          counter.increment();
        }
      });

      if (match) {
        this.globalCounterView.model.increment();
        this.undoList.push(keyCode);
        this.$(".undo").removeAttr("disabled");
      }
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
    },

    /**
     * Callback for counter being destroyed.
     * @param {Counter} counter The deleted counter.
     */
    onCounterDelete: function (counter) {
      this.collection.remove(counter);
      this.counterViews[counter.cid].destroy();
    },

    resetAll: function () {
      if (confirm("Are you sure you want to reset all counters to zero?")) {
        this.collection.each(function (counter) {
          counter.save("count", 0);
        });
      }
    }, 

    deleteAll: function () {
      if (confirm("Are you sure you want to delete all created counters?")) {
        _.each(this.counterViews, function (view) {
          view.destroy();
          view.model.off();
        });

        // Failsafe way to cleanup persisted counters.
        Backbone.sync("deleteAll");
        this.collection.reset([]);
      }
    }
  });

  return view;
});
