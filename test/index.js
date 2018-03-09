'use strict';
const Code = require('code');
const Lab = require('lab');
const MapBack = require('../lib');

// Test shortcuts
const lab = exports.lab = Lab.script();
const { describe, it } = lab;
const { expect } = Code;


describe('MapBack', () => {
  describe('constructor', () => {
    it('creates a new instance', () => {
      const options = {};
      const map = new MapBack(options);

      expect(map).to.be.an.instanceOf(Map);
      expect(map).to.be.an.instanceOf(MapBack);
      expect(map._defaults).to.shallow.equal(options);
    });
  });

  describe('MapBack.prototype.set()', () => {
    it('throws if callback is not a function', () => {
      const map = new MapBack();

      expect(() => {
        map.set('foo', 'bar');
      }).to.throw(TypeError, 'callback must be a function');
    });

    it('adds a function to the map that is wrapped by default', () => {
      const map = new MapBack();
      const fn = function (arg1, arg2) {
        return this + arg1 + arg2;
      };

      map.set('foo', fn);
      // The function is wrapped by default, so check the behavior.
      const func = map.get('foo');
      const ret = func.call(2, 3, 4);
      expect(ret).to.equal(9);
      expect(map.get('foo')).to.equal(undefined);
    });

    it('adds a function to the map that is not wrapped', () => {
      const map = new MapBack();
      const fn = () => {};

      map.set('foo', fn, { once: false });
      const func = map.get('foo');
      expect(func).to.shallow.equal(fn);
      func();
      expect(map.get('foo')).to.shallow.equal(fn);
    });
  });

  describe('MapBack.prototype.call()', () => {
    it('calls the entry stored in the map', (flags) => {
      const map = new MapBack();
      const fn = flags.mustCall(function (...args) {
        expect(this).to.equal(5);
        expect(args).to.equal([4, 3, 2, 1]);
        return -3;
      });

      map.set('foo', fn);
      expect(map.call('foo', 5, 4, 3, 2, 1)).to.equal(-3);

      expect(() => {
        map.call('foo', 5, 4, 3, 2, 1);
      }).to.throw(TypeError, /not a function/);
    });
  });

  describe('MapBack.prototype.callIfExists()', () => {
    it('calls the entry stored in the map if it exists', (flags) => {
      const map = new MapBack();
      const fn = flags.mustCall(function (...args) {
        expect(this).to.equal(5);
        expect(args).to.equal([4, 3, 2, 1]);
        return -3;
      });

      map.set('foo', fn);
      expect(map.callIfExists('foo', 5, 4, 3, 2, 1)).to.equal(-3);
      expect(map.callIfExists('foo', 5, 4, 3, 2, 1)).to.equal(undefined);
    });
  });
});
