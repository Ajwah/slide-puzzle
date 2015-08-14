/**
 * IIFE representing the model that will make certain functions public under namespace Model
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
   * Obtain the ratio provided as html attr to img
   * which describes division of img in different sliding blocks
   * @return {Record of int} w: amount blocks width-wise, h: # blocks height wise, t: total
   */
  var getRatio = function(){
    var h = +$('img').attr("ratio").split(':')[0]
        w = +$('img').attr("ratio").split(':')[1];
    return {w: w, h: h, t: h*w};
  };

  window.Model = {
    getDim: getDim,
    getRatio: getRatio
  };
})();

$(document).ready(
  console.log(Model.getRatio())
);
