/**
 * @author Nathaniel Higgins
 */
exports.wait = function(condition, callback, when) {

	if (typeof when === 'undefined') {
		when = false;
	}

	var _arguments = arguments;
	var _this = this;
	var _callee = arguments.callee;

	var done = function(res) {
		if (res) {
			callback();

			if (!when) {
				return res;
			}
		}

		return process.nextTick(function() {
			_callee.apply(_this, _arguments);
		}, 0);
	};

	var res = condition(done);

	if (typeof res !== 'undefined') {
		done(res);
	}
}

exports.when = function(condition, callback) {
	return exports.wait.call(this, condition, callback, true);
}