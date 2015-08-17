var img = $('img'); //Global variable intended to be passed through as parameter of anonymous function below.

//Only start processing once the entire DOM, image etc. has loaded
//which for this implementation is necessary to avoid trying to read
//properties of image that hasn't been loaded as yet.
window.onload = function(img){
/**
 * IIFE representing the model that will make certain functions public under namespace M
 * @return N/A
 */
(function(){
  var dim = {},
      ratio = {};
  /**
   * Obtain the size dimension attributes of img
   * @return {Record of int} w: size width-wise, h: size height-wise
   */
  var getDim = function(){
    var h, w;
    if (Object.keys(dim).length === 0) {
      h = img.prop('naturalHeight'), //get actual height regardless of css selector
      w = img.prop('naturalWidth');
      dim.w = w;
      dim.h = h;
    }
    return dim;
  };

  /**
   * Obtain the ratio provided as html attr to img which
   * describes division of img in different sliding blocks
   * @return {Record of int} w: amount blocks width-wise, h: # blocks height wise
   */
  var getRatio = function(){
    var h,w;
    if (Object.keys(ratio).length === 0) {
      h = +img.attr("ratio").split(':')[1],
      w = +img.attr("ratio").split(':')[0];
      ratio.h = h;
      ratio.w = w;
    }
    return ratio
  };

  /**
   * Obtain the url from img
   * @return {String} path of image file
   */
  var getUrl = function(){
    return img.attr('src');
  };

  window.M = {
    getDim: getDim,
    getRatio: getRatio,
    getUrl: getUrl
  };
})();
/*
(function(){
  var positions = [],
      slides = [];

  var savePos = function(w,h){
    positions.push({top:h, left: w});
  }

  window.M_slides = {
    savePos: savePos
  };
})();
*/
/**
 * IIFE representing Controller. Functions publicly available through namespace C
 * @return N/A
 */
(function(){
  var positions = [],
      container = $("#puzzle"),
      imgContainer = container.find("figure");

  /**
   * Return html image container
   * @return {JQuery object}
   */
  var getImgContainer = function(){
    return imgContainer;
  };

  /**
   * Obtain url of img file
   * @return {String} path to img file
   */
  var getUrl = function(){
    return M.getUrl()
  };

  /**
   * Obtain the step-size/amount that need to be taken to cover img area
   * according to the ratio in both dimensions.
   * @return {Record of int} w: step-size width-wise
   *                         h: step-size height-wise
   *                         aw: amount of steps width-wise
   *                         ah: amount of steps height-wise
   *                         t: total amount of sliding blocks
   */
  var getSteps = function(){
    var d = M.getDim(),
        r = M.getRatio();
    return {w: Math.floor(d.w/r.w),
            h: Math.floor(d.h/r.h),
            aw: r.w,
            ah: r.h,
            t: r.w * r.h
           };
  };

  /**
   * Save position of slide according to w and h
   * @param  {int} w width
   * @param  {int} h height
   * @return N/A
   */
  var savePos = function(w,h){
    positions.push({top:h, left: w});
  };

  /**
   * Randomly distribute slides over its designated container.
   * @return N/A
   * @effect Manipulation DOM
   */
  var _scrambleSlides = function(){
    var slides = imgContainer.children();
    /**
     * Fisher-Yates implementation of a shuffle function that given an
     * array randomly distributes its elements over it.
     * Documentation:
     *     https://en.wikipedia.org/wiki/Fisher–Yates_shuffle
     *     http://stackoverflow.com/questions/962802/is-it-correct-to-use-javascript-array-sort-method-for-shuffling
     * @param  {Array} arr
     * @return {Array}     Input arr with its elements shuffled.
     */
    var _shuffle = function(arr) {
      var tmp, i, last = arr.length;
      if(last) while(--last) {
        i = Math.floor(Math.random() * (last + 1));
        tmp = arr[i];
        arr[i] = arr[last];
        arr[last] = tmp;
      }
      return arr;
    };

    slides = _shuffle(slides);

    //Assign the original positions to the shuffled slides.
    V.displaySlides(slides, positions);
  };

  /**
   * Initialize the whole game which requires:
   *   1. Slice up the image according to ratio
   *   2. Remove initial slide to enable sliding
   *   3. Scramble the slides when start is pressed
   *   4. Start the timer
   *   5. Allow to start playing
   * @return N/A
   */
  var init = function(){
    V.init();
    V.removeInitialSlide(container);
    positions.shift();
    $("#start").on("click", _scrambleSlides);
    _play();
  };

  /**
   * Constrain the various dragging movements that can be made with the various slides
   * @return N/A
   * @effect Manipulation DOM
   */
  var _play = function(){
    var slides = imgContainer.children(),
        s = getSteps();

    slides.draggable({
        containment: "parent",
        grid: [s.w,s.h],
        start: function(e, ui){
          console.log('Start to drag');
        },
        drag: function(e, ui) {
          console.log('Dragging...');
        },
        stop: function(e, ui){
          console.log('Stop dragging.');
        }
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
 * @return N/A
 */
(function(){
  var url, s,
      piece = $("<div>"),
      imgContainer = C.getImgContainer();
  /**
   * Place a rectangular selection portion of original image at designated coordinates w,h
   * @param  {int} w width
   * @param  {int} h height
   * @return N/A
   * @effect Manipulation of DOM
   */
  var _putImg = function(id,w,h){
    piece.clone()
         .attr("id", id)
         .css({
                width: s.w,
                height: s.h,
                position: "absolute",
                top: h,
                left: w,
                backgroundImage: ["url(", url, ")"].join(""),
                backgroundPosition: [
                  "-", w, "px ",
                  "-", h, "px"].join("")
              }).appendTo(imgContainer);
  };

  /**
   * Slice up original image into sub selections that can be slided.
   * @return N/A
   * @effect Calls on _putImg
   *         positions updated
   */
  var _sliceImg = function(){
    var w,h,
        id = 0,
        totalAmountPieces = s.t,
        w_end = s.w*s.aw,
        h_end = s.h*s.ah;

    for (h=0;h<h_end;h+=s.h) {
      for (w=0;w<w_end;w+=s.w) {
        _putImg(id,w,h);
        C.savePos(w,h);
        id++;
      }
    }
  };

  /**
   * Display slides according to positions
   * @param  {Array} slides    Various slides from DOM tree that previously have been shuffled.
   * @param  {Array} positions Initial positions of the slides at start of game from top left to bottom right.
   * @return N/A
   * @effect Manipulate DOM
   */
  var displaySlides = function(slides, positions){
    $.each(slides, function (i) {
      slides.eq(i).css(positions[i]);
    });
    // slides.appendTo(imgContainer);
  };

  /**
   * Remove an initial slide from the img so as to make sliding plausible.
   * @param  {Array} container ?
   * @return N/A
   * @effect Removal of initial slide from DOM.
   */
  var removeInitialSlide = function(container){
    container.find("#0").remove();
  };

  /**
   * Initialize the view
   * @return N/A
   * @effect Removal original img
   *         Manipulation DOM
   */
  var init = function(){
    url = C.getUrl();
    s = C.getSteps();
    _sliceImg();
    img.remove();
  };

  window.V = {
    init: init,
    displaySlides: displaySlides,
    removeInitialSlide: removeInitialSlide
  };
})();

C.init();

}(img);
