'use strict';
var img = $('img'); //Global variable intended to be passed through as parameter of anonymous function below.

//Only start processing once the entire DOM, image etc. has loaded
//which for this implementation is necessary to avoid trying to read
//properties of image that haven't been loaded as yet.
window.onload = function(img) {
  /**
   * IIFE representing the model that will make certain functions public under namespace M
   *
   */
  (function() {
    var _dim = {};   //Storage to remember dim and ratio of img even after
    var _ratio = {}; //the img has been deleted from DOM.
    /**
     * Obtain the size dimension attributes of img
     *
     * @return {Object} w: size width-wise, h: size height-wise
     */
    var getDim = function() {
      var h;
      var w;
      if (Object.keys(_dim).length === 0) {
        h = img.prop('naturalHeight'); //get actual height regardless of css selector
        w = img.prop('naturalWidth');
        _dim.w = w;
        _dim.h = h;
      }
      return _dim;
    };

    /**
     * Obtain the ratio provided as html attr to img which
     * describes division of img in different sliding blocks
     *
     * @return {Object} w: amount blocks width-wise, h: # blocks height wise
     */
    var getRatio = function() {
      var h;
      var w;
      if (Object.keys(_ratio).length === 0) {
        h = +img.attr('ratio').split(':')[1];
        w = +img.attr('ratio').split(':')[0];
        _ratio.h = h;
        _ratio.w = w;
      }
      return _ratio;
    };

    /**
     * Obtain the url from img
     *
     * @return {String} path of image file
     */
    var getUrl = function() {
      return img.attr('src');
    };

    window.M = {
      getDim: getDim,
      getRatio: getRatio,
      getUrl: getUrl
    };
  })();

  /**
   * IIFE representing Controller. Functions publicly available through namespace C
   */
  (function() {
    var positions = [];
    var emptySquare = {};
    var _initialOrderingSlides;
    var container = $('#puzzle');
    var imgContainer = container.find('figure');

    /**
     * Return html image container
     *
     * @return {Object} Jquery
     */
    var getImgContainer = function() {
      return imgContainer;
    };

    /**
     * Obtain url of img file
     *
     * @return {String} path to img file
     */
    var getUrl = function() {
      return M.getUrl();
    };

    /**
     * Obtain the step-size/amount that need to be taken to cover img area
     * according to the ratio in both dimensions.
     *
     * @return {Object}        w: step-size width-wise
     *                         h: step-size height-wise
     *                         aw: amount of steps width-wise
     *                         ah: amount of steps height-wise
     *                         t: total amount of sliding blocks
     */
    var getSteps = function() {
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
     * Remove initial square from the board and return the css coordinates thereof.
     *
     * @return {Object} coordinates according to css {top:_,left:_}
     */
    var _popInitialSquare = function() {
      var _initialSquare;
      V.removeInitialSlide(container);
      _initialSquare = positions.shift();
      return _initialSquare;
    };

    /**
     * Save position of slide according to w and h
     *
     * @param  {int} w width
     * @param  {int} h height
     */
    var savePos = function(w, h) {
      positions.push({top: h, left: w});
    };

    /**
     * Randomly distribute slides over its designated container.
     *
     */
    var _scrambleSlides = function() {
      var slides = imgContainer.children();
      /**
       * Fisher-Yates implementation of a shuffle function that given an
       * array randomly distributes its elements over it.
       * Documentation:
       *     https://en.wikipedia.org/wiki/Fisher–Yates_shuffle
       *     http://stackoverflow.com/questions/962802/is-it-correct-to-use-javascript-array-sort-method-for-shuffling
       *
       * @param  {Array} arr
       * @return {Array}     Input arr with its elements shuffled.
       */
      var _shuffle = function(arr) {
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

      slides = _shuffle(slides);

      //Assign the original positions to the shuffled slides.
      V.displaySlides(slides, positions);
    };

    /**
     * Helper function that given two objects e1 and e2,
     * both that represent the coordinates of a slide,
     * will evaluate if they equal or not.
     *
     * @param  {Object} e1 coordinates according to css {top:_, left:_}
     * @param  {Object} e2 coordinates according to css {top:_, left:_}
     * @return {Boolean}   Confirm if e1,e2 are same or different.
     */
    var _compare = function(e1, e2) {
      return (e1.left === e2.left && e1.top === e2.top);
    };

    /**
     * Obtain the slides directly adjacent to the empty cavity on the board
     * according to the 4 primary directions (N,E,S,W).
     * According to the position of the empty cavity on the board, these adjacent
     * slides can amount to 2, 3 or 4 in number.
     *
     * @return {Array<$.Object>}        The adjacent slides relative to the empty square.
     */
    var _getAdjacentSlides = function() {
      //Obtain all the slides currently on the board.
      var slides = imgContainer.children();
      var s = getSteps();
      /**
       * Helper function for the mapping below that given the coordinates of
       * the empty square on the board will calculate and return an object with
       * the coordinates that logically apply to an adjacent neighbour -i- thereof.
       *
       * Following diagram depicts all the possible neighours -i- any empty square on the
       * board theoretically speaking may have:
       *                                        3
       *                                      2 # 0
       *                                        1
       *                                      where # represents the empty square
       *                                      and 0,1,2,3 represent clockwise the
       *                                      potential neighbours thereof.
       * Neighbour 0,1 require 1 positive square distance away from #, in dimensions x and y respectively.
       * Neighbour 2,3 require 1 negative square distance away from #, in dimensions x and y respectively.
       *
       * @param  {Object} e Representing the empty square
       * @param  {int}    i Representing a neighbour from 0 to 3
       * @return {Object}   Encompassing the coordinates such a neighbour -i- should
       *                    have relative to the empty square. This includes coordinates
       *                    that are outside the board which will need to be discriminated
       *                    against seperately.
       */
      var getAdjacentSquare = function(e, i) {
        var sign = (i < 2) ? 1 : -1; //0,1 is always a positive square distance whereas 2,3 are negative square distance
        //only 0 and 2 maintain that square distance horizontally
        var left = (i % 2 === 0) ? e.left + (sign * s.w) : e.left;
        //only 1 and 3 maintain that square distance vertically
        var top = (i % 2 !== 0) ? e.top + (sign * s.h) : e.top;
        return {left: left,top: top};
      };

      // Create an array of 4 elements, prefilled with emptySquare.
      // e.g. say emptySquare is {top:0,left:0} then the array is
      // [{top:0,left:0},{top:0,left:0},...]
      var emptySquares = Array.apply(null, new Array(4))
                              .map(Object.prototype.valueOf,emptySquare);
      //map the above initialized array to a new array -adjacent- containing all the
      //logic neighbours relative to the empty square, including out of bound ones.
      var adjacent = emptySquares.map(getAdjacentSquare);
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
     * Obtain slides from DOM cleaned from jquery draggable.
     *
     * @return {Object} Jquery - Contains all the slides on the board.
     */
    var _getCleanSlides = function() {
      var slides = imgContainer.children();
      $.each(slides, function(i) {
        if (slides.eq(i).is(':data(ui-draggable)')) {
          slides.eq(i).draggable('destroy');
        }
      });
      return slides;
    };

    /**
     * Set up the draggable jquery-ui handler and limit the usage thereof:
     *           -1 to the direct adjacent neighbours of the empty square
     *           -2 to slide into the empty square leaving behind a new empty square
     * Keep on playing until the original picture is obtained.
     *
     * @param  {$Object} adjacentSlides encompasses all the actual adjacent neighbours to empty square
     */
    var _play = function(adjacentSlides) {
      //Obtain all the slides present on the board, cleaned from any jquery-ui.
      var slides = _getCleanSlides();
      /**
       * Helper function to determine if a particular slide has actually moved from its original place.
       *
       * @param  {Object}  originalPos coordinates according to css notation {top:_,left:_}
       * @param  {Object}  uiPos      coordinates according to css notation {top:_,left:_}
       * @return {Boolean}             Evaluate if originalPos equals to uiPos.
       */
      var _isSlided = function(originalPos, uiPos) {
        return (originalPos.left !== uiPos.left) ||
               (originalPos.top !== uiPos.top);
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
        //
        //                    -
        //           For 3 : |3|
        //                   |#|
        //                    -
        //For each neighbour 0,1,2,3 a separate containment is defined that reflects the depiction above
        //so that the domain of the draggable is limited to the boxed area.
        //
        //Important Bug Note: Containment demands left to right, top to bottom orientation of the
        //                    coordinates, from smaller to bigger or else the draggable will not work
        //                    correctly. This orientation is assured below as follows:
        var containment = [Math.min.apply(null, x), Math.min.apply(null, y),
                           Math.max.apply(null, x), Math.max.apply(null, y)];
        //For debugging purposes, to be removed soon.
        that.css('border', '5px solid red');

        //For each neighbour define a draggable with its personalized containment.
        that.draggable({
          distance: 5,
          disabled: false,
          //Parameter below not part of jquery-ui draggable API specification and added for convenience.
          originalPos: {left: pos.left, top: pos.top},
          //define containment area.
          containment: containment,
          stop: function(e, ui) {
            var originalPos = that.draggable('option', 'originalPos');
            //At the slightest registration of a movement, complete the movement
            //so as to fill the empty square.
            if (_isSlided(originalPos, ui.position)) {
              //Update original position of the slide.
              that.draggable('option', 'originalPos', {left: ui.position.left,
                                                       top: ui.position.top});
              //Put slide on place of empty square.
              V.putSlide(that, {left: emptySquare.left, top: emptySquare.top});
              //that.css({left: emptySquare.left, top: emptySquare.top});
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
     */
    var _puzzleNotSolved = function() {
      var slides = imgContainer.children();
      var _unSolved = true;
      $.each(slides, function(i) {
        _unSolved &= _compare(positions[i], slides.eq(i).position());
      });
      return !_unSolved;
    };

    /**
     * Initialize the whole game which requires:
     *   1. Slice up the image according to ratio
     *   2. Remove initial slide to enable sliding
     *   3. Scramble the slides when start is pressed
     *   4. Start the timer
     *   5. Allow to start playing
     */
    var init = function() {
      var _initialSquare;
      V.init();
      _initialSquare = _popInitialSquare();
      _initialOrderingSlides = imgContainer.children();
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
      getSteps: getSteps,
      savePos: savePos,
      getImgContainer: getImgContainer
    };
  })();

  /**
   * IIFE representing View
   */
  (function() {
    var url = C.getUrl();
    var s = C.getSteps();
    var piece = $('<div>');
    var imgContainer = C.getImgContainer();
    /**
     * Place a rectangular selection portion of original image at designated coordinates w,h
     *
     * @param  {int} id width
     * @param  {int} w width
     * @param  {int} h height
     */
    var _putImg = function(id, w, h) {
      piece.clone()
           .attr('id', id)
           .css({
                  width: s.w,
                  height: s.h,
                  position: 'absolute',
                  top: h,
                  left: w,
                  backgroundImage: ['url(', url, ')'].join(''),
                  backgroundPosition: [
                    '-', w, 'px ',
                    '-', h, 'px'].join('')
                }).appendTo(imgContainer);
    };

    /**
     * Slice up original image into sub selections that can be slided.
     *
     *         positions updated
     */
    var _sliceImg = function() {
      var w;
      var h;
      var id = 0;
      var totalAmountPieces = s.t;
      var wEnd = s.w * s.aw;
      var hEnd = s.h * s.ah;

      for (h = 0; h < hEnd; h += s.h) {
        for (w = 0; w < wEnd; w += s.w) {
          _putImg(id,w,h);
          C.savePos(w,h);
          id++;
        }
      }
      console.log(id === totalAmountPieces); //Better served with an assert.
    };

    /**
     * Display slides according to positions
     *
     * @param  {Array} slides    Various slides from DOM tree that previously have been shuffled.
     * @param  {Array} positions Initial positions of the slides at start of game from top left to bottom right.
     */
    var displaySlides = function(slides, positions) {
      $.each(slides, function(i) {
        putSlide(slides.eq(i), positions[i]);
      });
    };

    /**
     * Put an individual slide to the designated coordinates.
     *
     * @param  {Object} slide    Jquery - Slide to be depicted
     * @param  {Object} position Conforming css notation
     */
    var putSlide = function(slide, position) {
      slide.css(position);
    };

    /**
     * Remove an initial slide from the img so as to make sliding plausible.
     *
     * @param  {$.Object} container Jquery - In charge of the DOM portion that encapsulates the img and timer
     */
    var removeInitialSlide = function(container) {
      container.find('#0').remove();
    };

    /**
     * Initialize the view
     *
     */
    var init = function() {
      _sliceImg();
      img.remove();
    };

    window.V = {
      init: init,
      displaySlides: displaySlides,
      putSlide: putSlide,
      removeInitialSlide: removeInitialSlide
    };
  })();

  C.init();

}(img);
