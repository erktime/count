define(["jquery", "underscore", "backbone"], function($, _, Backbone) {
  return Backbone.Model.extend({
    defaults: {
      name: "",
      count: 0,
      maxCount: null,
      interval: 1,
      keyCode: null,
      addToGlobal: true
    },

    initialize: function(attrs, option) {
      this.on("change:count", this.onChangeCount);
    },

    increment: function () {
      var maxCount = this.get("maxCount");
      if (_.isNull(maxCount) || this.get("count") < maxCount) {
        var newCount = this.get("count") + this.get("interval");
        this.save("count", newCount);
      }
    },

    decrement: function () {
      var count = this.get("count");
      var interval = this.get("interval");
      this.save("count", Math.max(0, count - interval));
    },

    isMaxReached: function () {
      return (this.get("maxReached") === true);
    },

    onChangeCount: function (model, count) {
      var maxCount = model.get("maxCount");
      if (!_.isNull(maxCount) && count >= maxCount) {
        this.save("maxReached", true);
      } else {
        this.save("maxReached", false);
      }
    }
  });
});
