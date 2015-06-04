
function HSVtoRGB(h, s, v) {
    var r, g, b, i, f, p, q, t;
    if (h && s === undefined && v === undefined) {
        s = h.s, v = h.v, h = h.h;
    }
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return {
        r: Math.floor(r * 255),
        g: Math.floor(g * 255),
        b: Math.floor(b * 255)
    };
}

var scaleValue = function(minIn, val, maxIn, minOut, maxOut) {
    var rangeIn = maxIn - minIn
    var a = (val-minIn)/rangeIn
    var rangeOut = maxOut - minOut
    var b = a*rangeOut + minOut
    return b
}

function arrayMin(arr) {
  var len = arr.length, min = Infinity;
  while (len--) {
    if (arr[len] < min && arr[len]>0) {
      min = arr[len];
    }
  }
  return min;
};

function arrayMax(arr) {
  var len = arr.length, max = -Infinity;
  while (len--) {
    if (arr[len] > max) {
      max = arr[len];
    }
  }
  return max;
}

//
// image data stuff
//
function getImageCanvas(img){
     var can = document.createElement('canvas');
      can.width = img.width;
      can.height = img.height;
      var ctx = can.getContext('2d');
      ctx.drawImage(img,0,0);
      return ctx
  }

function convertToImageData( img){
    if( img.data && img.data instanceof Uint8ClampedArray){//its an image data
       return img;
    }
    else if( img.src ){//its an image
      return getImageData( img)
    }
    else if( img.nodeName && img.nodeName=="CANVAS"){
      var ctx = img.getContext('2d')
      var imgData = ctx.getImageData(0,0, img.width, img.height);
      return imgData
    }
  }

function getImageData(img) {
      if( img.data && img.data instanceof Uint8ClampedArray){
        return copyImageData(img)
      }
      var ctx = getImageCanvas(img)
      var imgData = ctx.getImageData(0,0, ctx.canvas.width, ctx.canvas.height);
      return imgData;
  }

var _RGB2DeciMeters = function(r,g,b){
    var negative = 1
    if( r > 63 ){
       negative = -1
       r = 0;
    }
    var n = negative * (r*256*256 + g*256 + b);
    n=n/10;
    return n;
}

function getUrl(url) {
  return new Promise(function(resolve, reject) {
    var req = new XMLHttpRequest();
    req.open('GET', url);
    req.onload = function() {
      if (req.status == 200) {
        // Resolve the promise with the response text
        resolve(req.response);
      }
      else {
        reject(Error(req.statusText));
      }
    };
    req.onerror = function() {
      reject(Error("Network Error"));
    };
    req.send();
  });
}



