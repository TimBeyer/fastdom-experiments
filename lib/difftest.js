var Q = require('q');
var _ = require('lodash');
var Handlebars = require('handlebars');
var htmlparser = require('htmlparser2');
var diff = require('deep-diff').diff;
var applyDiff = require('deep-diff').applyDiff;

var template1 = Handlebars.compile('<div class="foobar" checked="checked"><h1>{{text}}</h1></div>');
var template2 = Handlebars.compile('<div class="foobar" ><div class="innerfoo"><h1>{{text}}</h1></div></div>');

var t1 = template1({text: 'foo'});
var t2 = template2({text: 'bar'});

var getDom = function (html) {
    var dom = Q.defer();
    var handler = new htmlparser.DomHandler(function (error, parsedDom) {
        if (error) {
            console.log("ERROR", error);
        }

        else {
            dom.resolve(parsedDom)
        }
    });
    var parser = new htmlparser.Parser(handler);
    parser.write(html);
    parser.done();
    return dom.promise;
};

var dom1 = getDom(t1);
var dom2 = getDom(t2);

Q.allSettled([dom1,dom2]).then(function (results) {
    var doms = _.pluck(results, 'value');
    var d1 = doms[0][0];
    var d2 = doms[1][0];
    console.log(t1);
    console.log(t2);
    console.log(d1,d2)
    var diffs = diff(d1, d2);
    console.log(diffs);
});

module.exports = {};
