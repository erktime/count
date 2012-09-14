define([
    "jquery",
    "underscore",
    "backbone",
    "src/views/AppView"
    ],
    function($, _, Backbone, AppView) {
  return {
    boot: function () {
      var view = new AppView({
        el: $("#app")
      });
      view.render();
    }
  };
});
