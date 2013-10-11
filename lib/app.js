var fastdom = require('fastdom');
var _ = require('lodash');
var $ = require('jquery-browserify');
var Backbone = require('backbone');
var Q = require('q');
Backbone.$ = $;

var now = require('performance-now');

var timeCall = function (name, funct) {
    return function () {
        var start = now();
        funct.apply(null, arguments);
        var stop = now();
        var total = stop - start;
        console.log('['+name+'] Total time:', total);
    };
};

fastdom.frame = timeCall('Frame', fastdom.frame.bind(fastdom));

var FastView = Backbone.View.extend({
    initialize: function () {

    },
    readFromDom: function (context) {
        context.width = this.$el.width();
        // select random element and compute something
        // based on its position
        //context.randomElement = 
        return context;
    },
    writeToDom: function (context) {
        this.$el.width(100);
        this.$el.height(100);
        this.$el.css({'background': 'black'})
    },
    render: function () {
        var renderDone = Q.defer();
        var _this = this;

        fastdom.read(function () {
            var context = {};
            context = _this.readFromDom(context);

            fastdom.write(function () {
                _this.writeToDom(context);
                // Notify about finished rendering on next tick only to prevent blocking
                process.nextTick(_.partial(renderDone.resolve, _this));
            });
        });

        return renderDone.promise;
    },
    renderSync: function () {
        var context = this.readFromDom({});
        this.writeToDom(context);
        return this;
    }
});

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
