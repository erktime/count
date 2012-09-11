define([
    "jquery",
    "underscore",
    "backbone",
    "src/models/Counter",
    "src/views/CounterView"
    ],
    function($, _, Backbone, Counter, CounterView) {
  return {
    boot: function () {
      var counter = new Counter();
      var view = new CounterView({
        model: counter,
        className: "counter"
      });

      $("#counters").append(view.render().el);

      $("body").on("keyup", function (event) {
        if (counter.get("keyCode") === event.which) {
          counter.increment();
        }
      });
    }
  };
});
