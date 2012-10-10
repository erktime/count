({
  appDir: "../",
  baseUrl: "src",
  dir: "../build",
  paths: {
    "jquery": "empty:",
    "underscore": "../js/lib/underscore",
    "backbone": "../js/lib/backbone",
    "handlebars": "../js/lib/handlebars",
    "bootstrap": "../js/lib/bootstrap",
    "markdown": "js/lib/markdown",
    "text": "../js/lib/text",
    "src": "../js/src"
  },
  shims: {
    "handlebars": {
      exports: "Handlebars"
    },
    "bootstrap": {
      deps: ['jquery']
    }
  },
  modules: [{
    name: "src/main"
  }]
})

// From js folder:
// node r.js -o app.build.js
