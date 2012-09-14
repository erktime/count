define([
    "jquery",
    "underscore",
    "backbone",
    "src/models/Counter",
    "src/views/CounterView",
    "text!src/templates/app.html"
    ], function ($, _, Backbone, Counter, CounterView, template) {
  var view = Backbone.View.extend({
    events: {
      "click .addCounter": "onAddCounter"
    },

    initialize: function () {
      this.collection = new Backbone.Collection({
        model: Counter
      });

      this.collection.bind("change:maxReached", this.onCounterMaxReached);
      this.counterViews = {};
    },

    render: function () {
      var handlebarTemplate = Handlebars.compile(template);
      this.$el.html(handlebarTemplate());

      var self = this;
      $("body").on("keyup", function (event) {
        var editing = _.any(self.counterViews, function (view) {
          return view.isEditing();
        });

        // Ignore all key inputs when a counter is being edited.
        if (!editing) {
          self.collection.each(function (counter) {
            if (counter.get("keyCode") === event.which) {
              counter.increment();
            }
          });
        }
      });

      return this;
    },

    onAddCounter: function (event) {
      var counter = new Counter();
      this.collection.add(counter);
      var counterView = new CounterView({
        model: counter,
        className: "counter"
      });

      this.counterViews[counter.cid] = counterView;
      this.$(".counters").append(counterView.renderEditMode().el);
    },

    onCounterMaxReached: function (model, isMaxReached) {
      if (isMaxReached) {
        $("#sound")[0].play();
      }
    }
  });

  return view;
});
