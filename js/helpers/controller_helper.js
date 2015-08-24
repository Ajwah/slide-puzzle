/**
 * Namespace for IIFE that represents helper functions for Controller C
 *
 * @type {Object}
 * @namespace CHelper
 */
var CHelper = {};

//IIFE acting as a closure to house herlper functions for Controller C
(function() {
  /**
   * Fisher-Yates implementation of a shuffle function that given an
   * array randomly distributes its elements over it.
   * <p>Documentation:
   * <ul>
   *     <li>{@link https://en.wikipedia.org/wiki/Fisher–Yates_shuffle Wikipedia}
   *     <li>{@link http://stackoverflow.com/questions/962802/is-it-correct-to-use-javascript-array-sort-method-for-shuffling Stackoverflow}
   *</ul>
   *
   * @param  {Array} arr
   * @return {Array}     Input arr with its elements shuffled.
   * @alias CHelper.shuffle
   */
  var shuffle = function(arr) {
    var tmp;
    var i;
    var last = arr.length;
    if (last) {
      while (--last) {
        i = Math.floor(Math.random() * (last + 1));
        tmp = arr[i];
        arr[i] = arr[last];
        arr[last] = tmp;
      }
    }
    return arr;
  };

  /**
   * compares if two given css-coordinates match
   *
   * @param  {cssCoord} e1
   * @param  {cssCoord} e2
   * @return {Boolean}   confirm if e1 and e2 match
   * @alias CHelper.compare
   */
  var compare = function(e1, e2) {
    return (e1.left === e2.left && e1.top === e2.top);
  };

  /**
   * determine if a slide has moved from original place.
   *
   * @param  {cssCoord}  originalPos
   * @param  {cssCoord}  currentPos
   * @return {Boolean}             evaluate if originalPos is different from currentPos
   * @alias CHelper.isSlided
   */
  var isSlided = function(originalPos, currentPos) {
    return !compare(originalPos, currentPos);
  };

  /**
   * creates an area of given size prefilled with a provided for object
   *
   * @param  {Number} s size of Array to be returned
   * @param  {Object} o object to prefill array with
   * @return {Array.<Object>}   prefilled array with object o of size s
   * @alias CHelper.prefillArrayWithObject
   */
  var prefillArrayWithObject = function(s, o) {
    return Array.apply(null, new Array(s))
                .map(Object.prototype.valueOf, o);
  };

  window.CHelper = {
    shuffle: shuffle,
    compare: compare,
    isSlided: isSlided,
    prefillArrayWithObject: prefillArrayWithObject
  };
})();
