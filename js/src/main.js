define([
    "jquery",
    "underscore",
    "backbone",
    "src/views/AppView",
    "src/LocalStorage"
    ],
    function($, _, Backbone, AppView, LocalStorage) {
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
