var _ = require('lodash');
var Q = require('q');
var now = require('performance-now');
var FastView = require('./fast-view');

var makeView = function () {
    return new FastView();
}

var makeViews = function (number) {
    var views = _.times(number, makeView);
    return views;
};

var insertViews = function (views, container) {
    _.each(views, function (view) {
        container.appendChild(view.$el[0]);
    });
};


var renderViews = function () {
    var allRendering = _.map(views, function (view) {
        return view.render();
    });
    var allRendered = Q.allSettled(allRendering);
    return allRendered;
}

var renderViewsSync = function () {
    _.invoke(views, 'renderSync');
}

var container = document.createElement('div');
document.body.appendChild(container);

var views = makeViews(1000);
insertViews(views, container);
var beforeRender;
beforeRender = now();
renderViewsSync();
var afterRender = now();
var renderTime = afterRender - beforeRender;
console.log('[RENDER sync] Total time:', renderTime);

document.body.removeChild(container);


container = document.createElement('div');
document.body.appendChild(container);

views = makeViews(1000);
insertViews(views, container);
beforeRender = now();
renderViews().then(function () {
    var afterRender = now();
    var renderTime = afterRender - beforeRender;
    console.log('[RENDER async] Total time:', renderTime);
});
