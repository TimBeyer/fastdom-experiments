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
    queryDom: function (context) {
        context.width = this.$el.width();
        // select random element and compute something
        // based on its position
        //context.randomElement = 
        return context;
    },
    mutateDom: function (context) {
        this.$el.width(100);
        this.$el.height(100);
        this.$el.css({'background': 'black'})
    },
    render: function () {
        var renderDone = Q.defer();
        var _this = this;

        fastdom.read(function () {
            var context = {};
            context = _this.queryDom(context);

            fastdom.write(function () {
                _this.mutateDom(context);
                // Notify about finished rendering on next tick only to prevent blocking
                process.nextTick(_.partial(renderDone.resolve, _this));
            });
        });

        return renderDone.promise;
    },
    renderSync: function () {
        var context = this.queryDom({});
        this.mutateDom(context);
        return this;
    }
});

module.exports = FastView;
