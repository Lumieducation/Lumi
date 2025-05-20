/**
 * Extend an array just like JQuery's extend.
 * @param {...object} args - Objects to be merged.
 * @returns {object} Merged objects.
 */
export const extend = (...args) => {
  for (let i = 1; i < args.length; i++) {
    for (let key in args[i]) {
      if (Object.prototype.hasOwnProperty.call(args[i], key)) {
        if (
          typeof args[0][key] === 'object' &&
          typeof args[i][key] === 'object'
        ) {
          extend(args[0][key], args[i][key]);
        }
        else {
          args[0][key] = args[i][key];
        }
      }
    }
  }
  return args[0];
};
