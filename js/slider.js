/**
 * IIFE representing the model that will make certain functions public under namespace M
 * @return N/A
 */
(function(){
  /**
   * Obtain the size dimension attributes of img
   * @return {Record of int} w: size width-wise, h: size height-wise
   */
  var getDim = function(){
    var h = +$('img').height(),
        w = +$('img').width();
    return {w: w, h: h};
  };

  /**
   * Obtain the ratio provided as html attr to img which
   * describes division of img in different sliding blocks
   * @return {Record of int} w: amount blocks width-wise, h: # blocks height wise, t: total
   */
  var getRatio = function(){
    var h = +$('img').attr("ratio").split(':')[1]
        w = +$('img').attr("ratio").split(':')[0];
    return {w: w, h: h, t: h*w};
  };

  /**
   * Obtain the url from img
   * @return {String} path of image file
   */
  var getUrl = function(){
    return $('img').attr('src');
  };

  window.M = {
    getDim: getDim,
    getRatio: getRatio,
    getUrl: getUrl
  };
})();

/**
 * IIFE representing Controller. Functions publicaly available through namespace C
 * @return N/A
 */
(function(){

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
   */
  var getSteps = function(){
    var d = M.getDim(),
        r = M.getRatio();
    return {w: Math.floor(d.w/r.w),
            h: Math.floor(d.h/r.h),
            aw: r.w,
            ah: r.h
           };
  };

  window.C = {
    getUrl: getUrl,
    getSteps: getSteps
  };
})();


$(document).ready(
  console.log(C.getSteps())
);
