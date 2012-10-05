define([ "underscore", "backbone"], function(_, Backbone) {
  Backbone.ajaxSync = Backbone.sync;
  var store = window.localStorage;
  var key = "counters";
  var localStorageFacade = {
    "create": function (model, options) {
      var collection = model.collection;
      // Give the model the next ID available.
      var id = 0;
      while (collection.get(id) != null) {
        id++;
      }

      model.set({id: id});
      store.setItem(key, JSON.stringify(model.collection.toJSON()));
    },

    "read": function (model, options) {
      var data = store.getItem(key);
      if (data) {
        return JSON.parse(data);
      }
    },

    "update": function (model, options) {
      store.setItem(key, JSON.stringify(model.collection.toJSON()));
    },

    "delete": function (model, options) {
      var data = model.collection.toJSON();
      data.splice(model.collection.indexOf(model), 1);
      store.setItem(key, JSON.stringify(data));
    },

    "deleteAll": function () {
      store.removeItem(key);
    }
  };

  Backbone.sync = function (method, model, options) {
    options = options || {};

    var response = localStorageFacade[method](model, options);
    if (options.success) {
      if (response) {
        options.success(response);
      } else {
        options.success([]);
      }
    }

    var deferred = $.Deferred();
    deferred.resolve();
    return deferred;
  };

  return Backbone;
});

