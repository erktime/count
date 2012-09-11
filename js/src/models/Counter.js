define(["jquery", "underscore", "backbone"], function($, _, Backbone) {
  return Backbone.Model.extend({
    defaults: {
      name: "",
      count: 0,
      maxCount: -1,
      interval: 1,
      keyMapping: null
    },

    increment: function () {
      var newCount = this.get("count") + this.get("interval");
      // console.info(newCount);
      this.set("count", newCount);
    }
  });
});
