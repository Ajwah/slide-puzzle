'use strict';
/**
 * famously known framework jQuery
 *
 * @typedef Jquery
 * @type {Object}
 */

/**
 * namespace for IIFE that represents Model
 * @type {Object}
 * @namespace M
 */
var M = {};

/**
 * namespace for IIFE that represents View
 * @type {Object}
 * @namespace V
 */
var V = {};

/**
 * namespace for IIFE that represents Controller
 * @type {Object}
 * @namespace C
 */
var C = {};

//onload will only process once all images have been loaded.
//This prevents futile access to a non-existent DOM element by code below.
window.onload = function(img) {
  /**
   * IIFE representing a closure for Model. Functions public under namespace M.
   *
   */
  (function() {
    /**
     * DOM location of image
     *
     * @type {Jquery}
     * @memberOf M
     * @private
     */
    var _img = $('img');

    /**
     * stores dimensions of image
     *
     * @typedef dimImage
     * @type {Object}
     * @memberOf M
     * @property {Number} w actual width of image
     * @property {Number} h actual height of image
     */
    var _dim = {};

    /**
     * stores ratio of blocks dividing image.
     *
     * @typedef ratio
     * @type {Object}
     * @memberOf M
     * @property {Number} w amount blocks width-wise
     * @property {Number} h amount blocks height-wise
     */
    var _ratio = {};

    /**
     * obtains size dimensions of img
     *
     * @alias M.getDim
     * @return {dimImage}
     * @public
     */
    var getDim = function() {
      var h;
      var w;
      if (Object.keys(_dim).length === 0) {
        w = _img.prop('naturalWidth'); //get actual width regardless of css selector
        h = _img.prop('naturalHeight');
        _dim.w = w;
        _dim.h = h;
      }
      return _dim;
    };

    /**
     * obtains ratio specifications from corresponding html tag in img
     *
     * @return {ratio}
     * @alias M.getRatio
     * @public
     */
    var getRatio = function() {
      var h;
      var w;
      if (Object.keys(_ratio).length === 0) {
        w = +_img.attr('ratio').split(':')[0];
        h = +_img.attr('ratio').split(':')[1];
        _ratio.h = h;
        _ratio.w = w;
      }
      return _ratio;
    };

    /**
     * obtains url from img
     *
     * @return {String} path of image file
     * @alias M.getUrl
     * @public
     */
    var getUrl = function() {
      return _img.attr('src');
    };

    window.M = {
      getDim: getDim,
      getRatio: getRatio,
      getUrl: getUrl
    };
  })();

  /**
   * IIFE representing a closure for Controller. Functions publicly available through namespace C
   */
  (function() {
    /**
     * storage for css coordinates of all the slides
     *
     * @type {Array}
     * @private
     */
    var positions = [];

    /**
     * storage for the moving empty square over board
     *
     * @type {cssCoord}
     * @private
     */
    var emptySquare = {};

    /**
     * reference to interaction board on screen
     *
     * @type {Jquery}
     * @private
     */
    var container = $('#puzzle');

    /**
     * reference to the sliding board on screen
     *
     * @type {Jquery}
     * @private
     */
/*@TODO: Move to V*/
    var slidingBoard = container.find('figure');

    /**
     * returns reference to the sliding board on screen
     *
     * @return {Jquery}
     * @alias C.getSlidingBoard
     * @public
     */
    var getSlidingBoard = function() {
/*@TODO: Move to V*/
      return slidingBoard;
    };

    /**
     * obtains url from img file
     *
     * @return {String} path to img file
     * @alias C.getUrl
     * @public
     */
    var getUrl = function() {
      return M.getUrl();
    };

    /**
     * describes quantity and size of unit block required to reassemble image
     *
     * @typedef unitBlockInfo
     * @type {Object}
     * @property {Number} w width of unit block
     * @property {Number} h height of unit block
     * @property {Number} aw amount unit blocks required to cover image width-wise
     * @property {Number} ah amount unit blocks required to cover image height-wise
     * @property {Number} t total amount unit blocks required to fill entire img area
     * @memberOf C
     */

    /**
     * obtains information required regarding unit block to reassemble img-area accordingly.
     *
     * @return {unitBlockInfo}
     * @alias C.getUnitBlockInfo
     * @public
     */
    var getUnitBlockInfo = function() {
      var d = M.getDim();
      var r = M.getRatio();
      return {w: Math.floor(d.w / r.w),
              h: Math.floor(d.h / r.h),
              aw: r.w,
              ah: r.h,
              t: r.w * r.h
             };
    };

    /**
     * represents placement coordinates of slides according to css specifications
     *
     * @typedef cssCoord
     * @type {Object}
     * @property {Number} top coordinate of top side of image
     * @property {Number} left coordinate of left side of image
     * @memberOf C
     */

    /**
     * removes initial square from board and return css coordinates thereof
     *
     * @return {cssCoord}
     * @private
     */
    var _popInitialSquare = function() {
      var _initialSquare;
/*@TODO: container doesnt make sense*/
      V.removeInitialSlide(container);
      _initialSquare = positions.shift();
      return _initialSquare;
    };

    /**
     * saves position of slide according to css coordinates
     *
     * @param  {Number} l left-side of slide
     * @param  {Number} t top-side of slide
     * @alias C.savePos
     * @public
     */
    var savePos = function(l, t) {
      positions.push({top: t, left: l});
    };

    /**
     * randomly distributes slides over sliding board
     * helper function
     *
     * @private
     */
    var _scrambleSlides = function() {
      var slides = slidingBoard.children();
      /**
       * Fisher-Yates implementation of a shuffle function that given an
       * array randomly distributes its elements over it.
       * Documentation:
       * <ul>
       *     <li>{@link https://en.wikipedia.org/wiki/Fisher–Yates_shuffle Wikipedia}
       *     <li>{@link http://stackoverflow.com/questions/962802/is-it-correct-to-use-javascript-array-sort-method-for-shuffling Stackoverflow}
       *</ul>
       *
       * @param  {Array.<Jquery>} arr
       * @return {Array.<Jquery>}     Input arr with its elements shuffled.
       * @private
       * @memberOf  _scrambleSlides
       */
      var _shuffle = function(arr) {
/*@TODO: Move to helper.js*/

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

      //Assign the original positions to the shuffled slides.
      V.displaySlides(_shuffle(slides), positions);
    };

    /**
     * compares if two given css-coordinates match
     * helper function
     *
     * @param  {cssCoord} e1
     * @param  {cssCoord} e2
     * @return {Boolean}   confirm if e1 and e2 match
     * @private
     */
    var _compare = function(e1, e2) {
/*@TODO: Move to helper.js*/
      return (e1.left === e2.left && e1.top === e2.top);
    };

    /**
     * obtains slides whose sides are directly adjacent to empty square
     * These adjacent slides can differ in quantity according to position to empty square
     * in following ways:
     * <ul>
     * <li> 2 if empty square is cornered
     * <li> 3 if empty square is touching border of sliding board
     * <li> 4 if empty square in any other place in sliding board
     * </ul>
     *
     * @return {Jquery}        adjacent slides relative to the empty square.
     * @private
     */
    var _getAdjacentSlides = function() {
      var slides = slidingBoard.children();
      var unitBlock = getUnitBlockInfo();

      /**
       * obtain the css coordinates of any adjacent neighbour i to empty square e
       * This helper function is to be used as a higher order function in a mapping below.
       * <b>NOTE: </b>
       * <ul>
       * <li> The function is only intended to work for i being 0, 1, 2 or 3.
       * <li> Regardless of the actual position of the empty square(corner, side board, middle),
       * this function will always return a result for any of the four requested neighbours i.
       * Further discrimination is required to filter out coordinates out of board.
       * </ul>
       * <p>
       * <p><b>Implementation Details</b></p>
       * Following diagram depicts all the possible neighours -i- any empty square on the
       * board theoretically speaking could have:
       *                                    <p>. 3 .
       *                                    <p>2 # 0
       *                                    <p>. 1 .
       *                                    <ul>
       *                                    <li> # represents the empty square
       *                                    <li> 0,1,2,3 represent adjacent neighbours
       *                                    <li> . represents non-adjacent neighbours
       *                                    </ul>
       * According to this depiction, following observations can be made to simplify implementation:
       * <ul>
       * <li>Neighbour 0,1 require 1 positive square distance away from #, in dimensions x and y respectively.
       * <li>Neighbour 2,3 require 1 negative square distance away from #, in dimensions x and y respectively.
       * </ul>
       * The clockwise Numbering of visual depiction corresponds to various neighbours i that are intended to be retrieved.
       *
       * @param  {cssCoord} e representing the empty square
       * @param  {Number}    i representing a neighbour from 0 to 3
       * @return {cssCoord}
       * @private
       */
      var _getAdjacentSquare = function(e, i) {
/*@TODO: Move to helper.js*/
        var sign = (i < 2) ? 1 : -1; //0,1 is always a positive square distance whereas 2,3 are negative square distance
        //only 0 and 2 maintain that square distance horizontally
        var left = (i % 2 === 0) ? e.left + (sign * unitBlock.w) : e.left;
        //only 1 and 3 maintain that square distance vertically
        var top = (i % 2 !== 0) ? e.top + (sign * unitBlock.h) : e.top;
        return {left: left,top: top};
      };

      // Create an array of 4 elements, prefilled with emptySquare.
      // Example: if emptySquare is {top:0,left:0} then the array will be
      // [{top:0,left:0},{top:0,left:0},...]
/*@TODO: Move to helper.js*/
      var emptySquares = Array.apply(null, new Array(4))
                              .map(Object.prototype.valueOf,emptySquare);
      //map the above initialized array to a new array -adjacent- containing all the
      //logic neighbours relative to the empty square, including out of bound ones.
      var adjacent = emptySquares.map(_getAdjacentSquare);
      //Filter out from those logic neighbours only those that are present on board.
      var adjacentSlides = slides.filter(function(i) {
            //For every slide, check if its css position equals to any of the logic neighbours.
            return adjacent.reduce(function(acc, v) {
              return acc || _compare(slides.eq(i).position(),v);
            }, false);
          });
      return adjacentSlides;
    };

    /**
     * obtains slides from DOM, cleaned from Jquery draggable.
     *
     * @return {Jquery} Contains all the slides on the board.
     * @private
     */
    var _getCleanSlides = function() {
/*@TODO: Move to V*/
      var slides = slidingBoard.children();
      $.each(slides, function(i) {
        if (slides.eq(i).is(':data(ui-draggable)')) {
          slides.eq(i).draggable('destroy');
        }
      });
      return slides;
    };

    /**
     * Set up the draggable Jquery-ui handler and limit the usage thereof:
     *           -1 to the direct adjacent neighbours of the empty square
     *           -2 to slide into the empty square leaving behind a new empty square
     * Keep on playing until the original picture is obtained.
     *
     * @param  {Jquery} adjacentSlides encompasses all the actual adjacent neighbours to empty square
     * @private
     */
    var _play = function(adjacentSlides) {
      //Obtain all the slides present on the board, cleaned from any Jquery-ui.
      var slides = _getCleanSlides();
      /**
       * determine if a slide has moved from original place.
       * helper function
       *
       * @param  {cssCoord}  originalPos
       * @param  {cssCoord}  currentPos
       * @return {Boolean}             evaluate if originalPos is different from currentPos
       * @private
       */
      var _isSlided = function(originalPos, currentPos) {
/*@TODO: Move to helper.js*/

        return !_compare(originalPos, currentPos);
      };
      //For debugging purposes to be removed soon.
      slides.css('border', '0px solid red');

      //Set up draggable event handler for each of the adjacent slides.
      $.each(adjacentSlides, function(i) {
        var that = adjacentSlides.eq(i);
        var pos = that.position();
        //Determine offset of css position of slides relative to the window which is the relative
        //position of the image container to the window.
        var offset = {left: that.parent().offset().left,
                      top: that.parent().offset().top};
        var x = [emptySquare.left + offset.left + 1,pos.left + offset.left + 1];
        var y = [emptySquare.top + offset.top + 1,pos.top + offset.top + 1];

        //Containment is a draggable parameter that can be submitted to constrain the movement of the
        //draggable to a specific area. In this case the usage can be depicted as follows:
        //           3
        //         2 # 0
        //           1        ___
        //           For 0 : |# 0|
        //                    ---
        //                    ___
        //           For 2 : |2 #|
        //                    ---
        //                    _
        //           For 1 : |#|
        //                   |1|
        //                    -
        //                    _
        //           For 3 : |3|
        //                   |#|
        //                    -
        //For each neighbour 0,1,2,3 a separate containment is defined that reflects the depiction above
        //so that the domain of the draggable is limited to the boxed area.
        //
        //<b>Important Bug Note</b>: Containment demands left to right, top to bottom orientation of the
        //                           coordinates, from smaller to bigger or else the draggable will not work
        //                           correctly. This orientation is assured below as follows:
        var containment = [Math.min.apply(null, x), Math.min.apply(null, y),
                           Math.max.apply(null, x), Math.max.apply(null, y)];
        //For debugging purposes, to be removed soon.
        that.css('border', '5px solid red');

        //For each neighbour define a draggable with its personalized containment.
        that.draggable({
          distance: 5,
          disabled: false,
          //extend Jquery-ui draggable API specification with extra member.
          originalPos: {left: pos.left, top: pos.top},
          //define containment area.
          containment: containment,
          stop: function(e, ui) {
            var originalPos = that.draggable('option', 'originalPos');
            var currentPos = ui.position;
            //At the slightest movement, complete the movement so as to fill the empty square.
            if (_isSlided(originalPos, currentPos)) {
              //Update original position of the slide.
              that.draggable('option', 'originalPos', {left: currentPos.left,
                                                       top: currentPos.top});
              //Put slide on place of empty square.
              V.putSlide(that, {left: emptySquare.left, top: emptySquare.top});
              //Update position of empty square.
              emptySquare.left = originalPos.left;
              emptySquare.top = originalPos.top;

              if (_puzzleNotSolved()) {
                //Repeat with updated board.
                _play(_getAdjacentSlides());
              }
            }
          }
        });
      });
    };

    /**
     * Determine if the slides have been reorded according to the original image.
     *
     * @return {Boolean}
     * @private
     */
    var _puzzleNotSolved = function() {
      var slides = slidingBoard.children();
      var _unSolved = true;
      $.each(slides, function(i) {
        _unSolved &= _compare(positions[i], slides.eq(i).position());
      });
      return !_unSolved;
    };

    /**
     * initializes the puzzle game
     * <p> this requires: </p>
     * <ol>
     *   <li> Slice up the image according to ratio
     *   <li> Remove initial slide to enable sliding
     *   <li> Scramble the slides when start is pressed
     *   <li> Start the timer
     *   <li> Allow to start playing
     * </ol>
     *
     * @alias C.init
     * @public
     */
    var init = function() {
      var _initialSquare;
      V.init();
      _initialSquare = _popInitialSquare();
      $('#start').on('click', function() {
        emptySquare.left = _initialSquare.left;
        emptySquare.top = _initialSquare.top;
        _scrambleSlides();
        _play(_getAdjacentSlides());
      });
    };

    window.C = {
      init: init,
      getUrl: getUrl,
      getUnitBlockInfo: getUnitBlockInfo,
      savePos: savePos,
      getSlidingBoard: getSlidingBoard
    };
  })();

  /**
   * IIFE representing a closure for View.
   */
  (function() {
    /**
     * storage for url of image
     *
     * @type {String}
     * @private
     */
    var _url = C.getUrl();

    /**
     * storage for unit specifications required to slice image in different blocks
     *
     * @type {unitBlockInfo}
     * @private
     */
    var _unitBlock = C.getUnitBlockInfo();

    /**
     * reference to html element serving as skeleton for a block
     *
     * @type {Jquery}
     * @private
     */
    var _piece = $('<div>');

    /**
     * reference to html representing sliding board
     *
     * @type {Jquery}
     * @private
     */
    var _slidingBoard = C.getSlidingBoard();

    /**
     * extracts a rectangular selection from original image and places it at coordinates l, t
     *
     * @param  {Number} id unique identifier of block
     * @param  {Number} l left side of block
     * @param  {Number} t top side of block
     * @private
     */
    var _putImg = function(id, l, t) {
      _piece.clone()
            .attr('id', id)
            .css({
                  width: _unitBlock.w,
                  height: _unitBlock.h,
                  position: 'absolute',
                  top: t,
                  left: l,
                  backgroundImage: ['url(', _url, ')'].join(''),
                  backgroundPosition: [
                    '-', l, 'px ',
                    '-', t, 'px'].join('')
                }).appendTo(_slidingBoard);
    };

    /**
     * slices original image into blocks that can be slided.
     *
     * @private
     */
    var _sliceImg = function() {
      var w;
      var h;
      var id = 0;
      var totalAmountPieces = _unitBlock.t;
      var wEnd = _unitBlock.w * _unitBlock.aw;
      var hEnd = _unitBlock.h * _unitBlock.ah;

      for (h = 0; h < hEnd; h += _unitBlock.h) {
        for (w = 0; w < wEnd; w += _unitBlock.w) {
          _putImg(id,w,h);
          C.savePos(w,h);
          id++;
        }
      }
      console.log(id === totalAmountPieces); //Better served with an assert.
    };

    /**
     * displays slides according to positions
     *
     * @param  {Array.<Jquery>} slides    Various slides from DOM tree that previously have been shuffled.
     * @param  {Array.<cssCoord>} positions Initial positions of the slides at start of game from top left to bottom right.
     * @alias V.displaySlides
     * @public
     */
    var displaySlides = function(slides, positions) {
      $.each(slides, function(i) {
        putSlide(slides.eq(i), positions[i]);
      });
    };

    /**
     * puts an individual slide to the designated coordinates.
     *
     * @param  {Jquery} slide  Slide to be depicted
     * @param  {cssCoord} position
     * @alias V.putSlide
     * @public
     */
    var putSlide = function(slide, position) {
      slide.css(position);
    };

    /**
     * removes an initial slide from the img so as to make sliding plausible.
     *
     * @param  {Jquery} container
     * @alias V.removeInitialSlide
     * @public
     */
    var removeInitialSlide = function(container) {
      container.find('#0').remove();
    };

    /**
     * initializes the view
     *
     * @alias V.init
     * @public
     */
    var init = function() {
      var _img = $('img');
      _sliceImg();
      _img.remove();
    };

    window.V = {
      init: init,
      displaySlides: displaySlides,
      putSlide: putSlide,
      removeInitialSlide: removeInitialSlide
    };
  })();

  C.init();

}();
