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
        el: $(".container")
      });
      view.render();

      $(".email").attr("href",
          "mailto: " + "aaron" + "erk@g" + "mail." + "com");
    }
  };
});
