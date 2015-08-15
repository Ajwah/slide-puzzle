$(document).ready(
$('img').load(function(){
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
   * @return {Record of int} w: amount blocks width-wise, h: # blocks height wise
   */
  var getRatio = function(){
    var h = +$('img').attr("ratio").split(':')[1],
        w = +$('img').attr("ratio").split(':')[0];
    return {w: w, h: h};
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

  window.C = {
    getUrl: getUrl,
    getSteps: getSteps
  };
})();

(function(){
  var url, s,
      idCounter = 0,
      piece = $("<div/>"),
      container = $("#puzzle"),
      imgContainer = container.find("figure"),
      img = imgContainer.find("img");

  var init = function(){
    url = C.getUrl();
    s = C.getSteps();
    processImg();
    img.remove();
  };

  var putImg = function(w,h){
    piece.clone()
         .attr("id", idCounter++)
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

  var processImg = function(){
    var w,h,
        totalAmountPieces = s.t,
        w_end = s.w*s.aw,
        h_end = s.h*s.ah;
    for (h=0;h<h_end;h+=s.h) {
      for (w=0;w<w_end;w+=s.w) {
        putImg(w,h);
      }
    }
  };

  window.V = {
    init: init
  };
})();

V.init();

}));
