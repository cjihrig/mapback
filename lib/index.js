'use strict';

const addDefaults = { once: true };


class MapBack extends Map {
  constructor (options) {
    super();
    this._defaults = options;
  }

  set (key, callback, options) {
    if (typeof callback !== 'function') {
      throw new TypeError('callback must be a function');
    }

    const settings = Object.assign({}, addDefaults, this._defaults, options);
    const cb = settings.once === true ? onceWrap(callback, this, key) : callback;

    super.set(key, cb);
  }

  call (key, that, ...args) {
    return Reflect.apply(super.get(key), that, args);
  }

  callIfExists (key, that, ...args) {
    const fn = super.get(key);

    if (typeof fn === 'function') {
      return Reflect.apply(super.get(key), that, args);
    }
  }
}


function onceWrap (fn, map, key) {
  function _wrapper (...args) {
    map.delete(key);
    return Reflect.apply(fn, this, args);
  }

  return _wrapper;
}


module.exports = MapBack;
