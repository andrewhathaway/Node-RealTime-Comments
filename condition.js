(function() {

    var tick = (typeof setImmediate !== 'undefined' && function(callback) {
        return setImmediate(callback);
    }) || function(callback) {
        return setTimeout(callback, 0);
    };



    var has = function(obj, prop) {
        if (typeof window !== 'undefined' && window.hasOwnProperty) {
            return window.hasOwnProperty(obj, prop);
        }

        return obj.hasOwnProperty(prop);
    };

    var args = function(func) {
        var string = func.toString();
        var string_args = string.replace(/\s/g, '').split('function')[1].split(')')[0].split('(').slice(1)[0];

        var args = string_args.split(',');

        if (args.length === 1 && args[0] === '') args = [];

        return args;
    };

    var condition = function(config, condition, callback) {
        var _arguments = arguments;
        var _this = this;
        var _callee = arguments.callee;

        var done = function(result) {

            var done = function() {
                return _callee.apply(_this, _arguments);
            };

            if (result) {

                callback(done);

                if (config.type === 'wait') {
                    return;
                }
            }

            if (!config.async || args(callback).length === 0) {
                tick(done);
            }
        };

        var result = condition(config.async && done);

        if (!config.async || args(condition).length === 0) {
            done(result);
        }
    };

    var Condition = {};

    var generate_condition = function(type) {
        return function() {
            Array.prototype.unshift.call(arguments, {
                type: type,
                async: true
            });

            return condition.apply(this, arguments);
        };
    };

    var types = ['wait', 'when'];

    for (var k in types) {
        if (has(types, k)) {
            Condition[types[k]] = generate_condition(types[k]);
        }
    }

    Condition.condition = condition;
    Condition.tick = tick;
    Condition.has = has;
    Condition.args = args;

    if (typeof module !== 'undefined' && 'exports' in module) {
        module.exports = Condition;
    } else if (typeof define !== 'undefined') {
        define(function(require, exports, module) {
            module.exports = Condition;
        });
    } else if (typeof window !== 'undefined') {
        window.condition = Condition;
    }
})();