/**
 * Create a function that will allow end users to ignore callbacks.
 *
 * @private
 * @static
 * @since    1.4.0
 * @category Utilities
  *
 * @param   {Function} fn         - The end-user supplied function.
 * @param   {Integer}  asyncArity - The number of arguments the async method
 *                                  accepts.
 * @returns {Function}            - An async function.
 */
function makeAsync(fn, asyncArity) {

  // If the function has a length that is less than the async arity,
  // this is a sync function. We will create a new async function
  // and call the passed-in sync function behind the scenes.
  if (fn.length < asyncArity) {

    return function () {
      var args = Array.prototype.slice.call(arguments);
      var callback = args.pop();
      var val = fn.apply(fn, args);

      setImmediate(function () {
        callback(null, val);
      });
    };
  }

  return fn;
}

module.exports = makeAsync;
