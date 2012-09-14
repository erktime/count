define(["jquery", "underscore", "backbone"], function($, _, Backbone) {
  return Backbone.Model.extend({
    defaults: {
      name: "",
      count: 0,
      maxCount: -1,
      interval: 1,
      keyCode: null
    },

    increment: function () {
      var maxCount = this.get("maxCount");

      if (maxCount === -1 || this.get("count") < maxCount) {
        var newCount = this.get("count") + this.get("interval");
        this.set("count", newCount);
        if (this.maxCount !== -1 && newCount >= maxCount) {
          this.set("maxReached", true);
        }
      }
    },

    isMaxReached: function () {
      // return (this.get("maxCount") >= this.get("count"));
      return (this.get("maxReached") === true);
    }
  });
});
