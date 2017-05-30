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

  if (args.length === 0) {
    return [];
  }

  if (Array.isArray(args[0])) {
    return args[0];
  }

  return Array.prototype.slice.call(args);
}

module.exports = getArgs;
