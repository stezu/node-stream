/**
 * Get an array of arguments out of a function whose signature is {...Arg|Arg[]}.
 *
 * @private
 * @static
 * @since    1.3.1
 * @category Utilities
  *
 * @param   {Arguments} args - Arguments from the caller function.
 * @returns {Array}          - A flat array of arguments.
 */
function getArgs(args) {
  var arr;

  if (args.length === 1 && Array.isArray(args[0])) {
    arr = args[0];
  } else {
    arr = Array.prototype.slice.call(args);
  }

  return arr;
}

module.exports = getArgs;
