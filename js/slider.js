'use strict';
/**
 * famously known framework jQuery
 *
 * @typedef Jquery
 * @type {Object}
 */

/**
 * namespace for IIFE that represents Model
 *
 * @type {Object}
 * @namespace M
 */
var M = {};

/**
 * namespace for IIFE that represents View
 *
 * @type {Object}
 * @namespace V
 */
var V = {};

/**
 * namespace for IIFE that represents Controller
 *
 * @type {Object}
 * @namespace C
 */
var C = {};

//onload will only process once all images have loaded, preventing futile access to a non-existent DOM element by code below.
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
      V.removeInitialSlide();
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
      var slides = V.getSlides();
      //Assign the original positions to the shuffled slides.
      V.displaySlides(CHelper.shuffle(slides), positions);
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
      var slides = V.getSlides();
      var unitBlock = getUnitBlockInfo();

      /**
       * calculate the css coordinates of any adjacent neighbour i to empty square e
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
      var _calculateAdjacentSquare = function(e, i) {
        var sign = (i < 2) ? 1 : -1; //0,1 is always a positive square distance whereas 2,3 are negative square distance
        //only 0 and 2 maintain that square distance horizontally
        var left = (i % 2 === 0) ? e.left + sign * (unitBlock.w + 5): e.left;
        //only 1 and 3 maintain that square distance vertically
        var top = (i % 2 !== 0) ? e.top + sign * (unitBlock.h + 5): e.top;
        return {left: left, top: top};
      };

      // Create an array of 4 elements, prefilled with emptySquare.
      var emptySquares = CHelper.prefillArrayWithObject(4, emptySquare);

      //map the above initialized array to a new array -adjacent- containing all the
      //logic neighbours relative to the empty square, including out of bound ones.
      var adjacent = emptySquares.map(_calculateAdjacentSquare);
      //Filter out from those logic neighbours only those that are present on board.
      var adjacentSlides = slides.filter(function(i) {
        //For every slide, check if its css position equals to any of the logic neighbours.
        return adjacent.reduce(function(acc, v) {
          return acc || CHelper.compare(slides.eq(i).position(),v);
        }, false);
      });
      return adjacentSlides;
    };

    var direction = function(xs, ys) {
      var xAxis = ['left', '', 'right'];
      var yAxis = ['up', '', 'down'];
      var dir = function(a, b) {
        var r = a - b;
        return (r < 0) ? 0 : (r > 0) ? 2 : 1
      };
      return xAxis[dir(xs[0], xs[1])] + yAxis[dir(ys[0], ys[1])];
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
      var slides = V.getCleanSlides();

      //For debugging purposes to be removed soon.
      // slides.css('border', '0px solid red');

      //Set up draggable event handler for each of the adjacent slides.
      $.each(adjacentSlides, function(i) {
        var that = adjacentSlides.eq(i);
        var pos = that.position();
        //Determine offset of css position of slides relative to the window which is the relative
        //position of the image _container to the window.
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
        // that.css('border', '5px solid red');

        //For each neighbour define a draggable with its personalized containment.
        that.draggable({
          distance: 5,
          //extend Jquery-ui draggable API specification with extra member.
          originalPos: {left: pos.left, top: pos.top},
          //define containment area.
          containment: containment,
          stop: function(e, ui) {
            var originalPos = that.draggable('option', 'originalPos');
            var currentPos = ui.position;
            //At the slightest movement, complete the movement so as to fill the empty square.
            if (CHelper.isSlided(originalPos, currentPos)) {
              //Update original position of the slide.
              that.draggable('option', 'originalPos', {left: currentPos.left,
                                                       top: currentPos.top});
              //Put slide on place of empty square.
              V.putSlide(that, {left: emptySquare.left, top: emptySquare.top}, function(){});
              that.effect('shake', {
                direction: direction(x,y),
                distance: 5,
                times: 7}, 50, function(){
                  console.log("Callback ");
                  //Update position of empty square.
                  emptySquare.left = originalPos.left;
                  emptySquare.top = originalPos.top;

                  if (_puzzleNotSolved()) {
                    //Repeat with updated board.
                    _play(_getAdjacentSlides());
                  } else {
                    _puzzleEnded();
                  }
                });
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
      var slides = V.getSlides();
      var _solved = true;
      $.each(slides, function(i) {
        _solved &= CHelper.compare(positions[i], slides.eq(i).position());
      });
      return !_solved;
    };

    var _puzzleEnded = function() {
      V.getCleanSlides();
      V.puzzleEnded();
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
        V.expandToGrooves();
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
      savePos: savePos
    };
  })();

  /**
   * IIFE representing a closure for View.
   */
  (function() {
    var grooves = {w: 5, h: 5};

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
     * reference to interaction board on screen
     *
     * @type {Jquery}
     * @private
     */
    var _container = $('#puzzle');

    /**
     * reference to the sliding board on screen
     *
     * @type {Jquery}
     * @private
     */
    var _slidingBoard = _container.find('figure');

    var _initialSlide;

    /**
     * returns reference to the sliding board on screen
     *
     * @return {Jquery}
     * @alias V.getSlides
     * @public
     */
    var getSlides = function() {
      return _slidingBoard.children();
    };

    /**
     * provides slides from DOM, cleaned from Jquery draggable.
     *
     * @return {Jquery} Contains all the slides on the board.
     * @alias V.getCleanSlides
     * @public
     */
    var getCleanSlides = function() {
      var slides = getSlides();
      $.each(slides, function(i) {
        if (slides.eq(i).is(':data(ui-draggable)')) {
          slides.eq(i).draggable('destroy');
        }
      });
      return slides;
    };

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
          C.savePos(w + grooves.w * (id % _unitBlock.aw),
                    h + grooves.h * (Math.floor(id / _unitBlock.aw)));
          console.log(id, (id%_unitBlock.aw), Math.floor(id/_unitBlock.aw)+1);
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
    var putSlide = function(slide, position, cb) {
      slide.css(position);
    };

    var expandToGrooves = function() {
      var originalDim = {
        width: _unitBlock.w * _unitBlock.aw,
        height: _unitBlock.h * _unitBlock.ah
      };

      var amountGrooves = {
        width: _unitBlock.aw - 1,
        height: _unitBlock.ah - 1
      };

      _slidingBoard.css({
        width:  originalDim.width + grooves.w * amountGrooves.width,
        height:  originalDim.height + grooves.h * amountGrooves.height
      });
    };

    /**
     * removes an initial slide from the img so as to make sliding plausible.
     *
     * @alias V.removeInitialSlide
     * @public
     */
    var removeInitialSlide = function() {
      _initialSlide = _container.find('#0');
      _container.find('#0').remove();
    };

    var puzzleEnded = function() {
      $("#ui").append("<div class='completed'><p>COMPLETED</p></div>");
      _slidingBoard.append(_initialSlide);
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
      getSlides: getSlides,
      getCleanSlides: getCleanSlides,
      displaySlides: displaySlides,
      putSlide: putSlide,
      expandToGrooves: expandToGrooves,
      removeInitialSlide: removeInitialSlide,
      puzzleEnded: puzzleEnded
    };
  })();

  C.init();
}();
