/**
 * Return a "masked" copy of the given object.
 *
 * The returned object includes only the properties present in the mask. The
 * mask is an object that mirrors the structure of the given object, except
 * the only values are `true` or a sub-mask. `true` implies the property
 * should be included, and a sub-mask implies the property should be further
 * masked according to that sub-mask.
 *
 * @param {object} object - The object to mask
 * @param {Object<object | boolean>} mask - The mask to apply to the object
 */
export function maskObject(object, mask) {
  return Object.keys(object).reduce((state, key) => {
    if (mask[key] === true) {
      state[key] = object[key];
    } else if (mask[key]) {
      state[key] = maskObject(object[key], mask[key]);
    }
    return state;
  }, {});
}

/**
 * Recursively clones a value of different types
 *
 * @param {*} value
 * @returns {*}
 */
export function cloneDeep(value) {
  if (value instanceof Date) {
    return new Date(value.getTime());
  }

  if (value instanceof Array) {
    return value.reduce((arr, item, i) => {
      arr[i] = cloneDeep(item);
      return arr;
    }, []);
  }

  if (value instanceof Object) {
    return Object.keys(value).reduce((clonedValue, key) => {
      clonedValue[key] = cloneDeep(value[key]);
      return clonedValue;
    }, {});
  }

  if (Buffer.isBuffer(value)) {
    return value.slice();
  }

  return value;
}

/**
 * Creates a new object composed of all properties of `object`
 * that are not included in `keys`
 *
 * @param {object} object - The origin object
 * @param {string[]} keys - Array of object keys to omit
 * @returns {object}
 */
export function omit(object, keys) {
  if (typeof object !== 'object' || object === null) {
    return object;
  }

  return Object.keys(object).reduce((destinationObj, key) => {
    if (!keys.includes(key)) {
      destinationObj[key] = cloneDeep(object[key]);
    }
    return destinationObj;
  }, {});
}

/**
 * Creates a new object composed of all properties of `object`
 * that are included in `keys`
 *
 * @param {object} object - The origin object
 * @param {string[]} keys - Array of object keys to pick
 * @returns {object}
 */
export function pick(object, keys) {
  if (typeof object !== 'object' || object === null) {
    return object;
  }

  return Object.keys(object).reduce((destinationObj, key) => {
    if (keys.includes(key)) {
      destinationObj[key] = cloneDeep(object[key]);
    }
    return destinationObj;
  }, {});
}

/**
 * Creates a new object composed of all properties of `object`
 * that are truthy for `predicate`
 *
 * @param {object | Array} object - The origin object
 * @param {Function?} predicate - Function that returns true or false
 * @returns {object | Array}
 */
export function pickBy(object, predicate) {
  if (
    (typeof object !== 'object' && !(object instanceof Array)) ||
    object === null
  ) {
    return {};
  }

  return Object.keys(object).reduce(
    (destinationObj, key) => {
      if (!predicate || predicate(object[key], key)) {
        destinationObj[key] = cloneDeep(object[key]);
      }
      return destinationObj;
    },
    object instanceof Array ? [] : {},
  );
}
