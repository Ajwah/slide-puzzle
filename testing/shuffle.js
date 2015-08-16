function shuffleA(arr){
  var b = [], j, tmp, arr = arr.slice(),
      l = arr.length;
  var f = function(e){return e};
  console.log(arr);
  while (--l > -1){
    j = Math.floor(Math.random()*l);
    tmp = arr[j];
    arr[j] = arr[l] + "";
    b.push(tmp);
  }
  return b;
}
function shuffle(arr) {
  var tmp, i, last = arr.length;
  if(last) while(--last) {
    i = Math.floor(Math.random() * (last + 1));
    tmp = arr[i];
    arr[i] = arr[last];
    arr[last] = tmp;
  }
  return array;
}

var permutations = function(A) {
  if (A.length == 1) {
    return [A];
  }
  else {
    var perms = [];
    for (var i=0; i<A.length; i++) {
      var x = A.slice(i, i+1);
      var xs = A.slice(0, i).concat(A.slice(i+1));
      var subperms = permutations(xs);
      for (var j=0; j<subperms.length; j++) {
        perms.push(x.concat(subperms[j]));
      }
    }
    return perms;
  }
};

var test = function(A, iterations, func) {
  // init permutations
  var stats = {};
  var perms = permutations(A);
  for (var i in perms){
    stats[""+perms[i]] = 0;
  }

  // shuffle many times and gather stats
  var start=new Date();
  for (var i=0; i<iterations; i++) {
    var shuffled = func(A);
    stats[""+shuffled]++;
    // console.log(shuffled);
  }
  var end=new Date();

  // format result
  var arr=[];
  for (var j in stats) {
    arr.push(j+" "+(stats[j]));
  }
  return arr.join("\n")+"\n\nTime taken: " + ((end - start)/1000) + " seconds.";
};

console.log("shuffleA: " + test([1,2,3,4], 100000, shuffleA));
// console.log("shuffleB: " + test([1,2,3,4], 100000, shuffleB));
