'use strict';

(function () {
  const Collection = {
    class: { },
    instance: {
      isEmpty() { return this.dimension() === 0; },
      notEmpty() { return !this.isEmpty(); },
      any(predicate) {
        let found = false;
        this.forEach(elem => {
          if (predicate(elem)) return found = true;
        });
        return found;
      },
      all(predicate) { return !this.any(elem => !predicate(elem)); },
      includesAllOf(collection) { return collection.all(elem => this.includes(elem)); },
      count(predicate) { return this.filter(predicate).dimension(); },
    },
  };
  
  const SequenceableCollection = {
    class: { },
    instance: {
      dimension() { return this.length; },
      first() { return this[0]; },
      second() { return this[1]; },
      third() { return this[2]; },
      last() { return this[this.dimension()-1]; },
      take(n) { return this.slice(0, n); },
      drop(n) { return this.slice(n, this.dimension()); },
      asSet() { return new Set(this); },
      occurrencesOf(object) { return this.count(elem => elem === object); },
    },
  };
  
  const HeterogeneusCollection = {
    class: { },
    instance: {
      compact() {
        return this.filter(elem => elem !== null && elem !== undefined);
      },
      sum(func, startValue) {
        let result = startValue || 0;
        this.forEach(elem => result += (func && func(elem)) || elem);
        return result;
      },
    },
  };
  
  const ArrayExtensions = {
    class: {
      with(...objects) { return objects; }
    },
    instance: {
      equals(array) {
        if (!array) return false;
        let differentLength = this.dimension() !== array.dimension();
        if (differentLength) return false;
        
        for (let i = 0, l = this.dimension(); i < l; i++) {
          let elemsAreArrays = (this[i] instanceof Array) && (array[i] instanceof Array);
          if (elemsAreArrays && !this[i].equals(array[i])) return false;
          if (this[i] !== array[i]) return false
        }
        return true
      },
    }
  };
  
  const StringExtensions = {
    class: { },
    instance: {
      filter(predicate) {
        return this.split('').filter(predicate).join('');
      },
      forEach(func) {
        for (let index in this) func(this[index]);
      },
      equals(string) { return this === string; },
    },
  };
  
  const SetExtensions = {
    class: {
      with(...objects) { return new Set(objects); }
    },
    instance: {
      dimension() { return this.size; },
      includes(element) { return this.has(element); },
      equals(set) {
        return this.includesAllOf(set) && set.includesAllOf(this);
      },
      filter(predicate) {
        let result = new Set();
        this.forEach(elem => { if (predicate(elem)) result.add(elem) });
        return result;
      },
      asSet() { return this; }
    },
  };
  
  let eachExtensionOf = (extension, block) =>
    Object.keys(extension).forEach(block);
  
  let extend = (proto, extension, methodName) =>
    Object.defineProperty(proto, methodName, { value: extension[methodName] });
  
  let applyExtension = (extension, ...targetTypes) => {
    eachExtensionOf(extension.instance, methodName =>
      targetTypes.forEach(type => extend(type.prototype, extension.instance, methodName))
    );
    eachExtensionOf(extension.class, methodName =>
      targetTypes.forEach(type => extend(type, extension.class, methodName))
    );
  };
  
  applyExtension(Collection, Array, String, Set);
  applyExtension(SequenceableCollection, Array, String);
  applyExtension(HeterogeneusCollection, Array, Set);
  applyExtension(ArrayExtensions, Array);
  applyExtension(StringExtensions, String);
  applyExtension(SetExtensions, Set);
})();
