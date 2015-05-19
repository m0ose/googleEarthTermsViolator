/*


  Make a map for wuickly hit testing building footprints


*/
var pointInGeojsonTester = function(jsonObject, options) {
  var this2 = this
  options = options || { width:400, height:400}
  if (options.width) {
    this.width = options.width
  }
  if (options.height) {
    this.height = options.height
  }

  this.features = [];
  this.jsonObject = jsonObject
  this.xMin = Number.MAX_VALUE
  this.xMax = Number.MIN_SAFE_INTEGER
  this.yMin = Number.MAX_VALUE
  this.yMax = Number.MIN_SAFE_INTEGER
  var n = 1;

  this.canvas = document.createElement('canvas')
  this.canvas.width = this.width
  this.canvas.height = this.height
  this.ctx = this.canvas.getContext('2d')
  this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

  this.imgdata = null;

  //this.ctx.fillStyle = "#000"
  //this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

  this.init = function() {
    var features = []
    var evacPoint = null;
    if( this.jsonObject && (this.jsonObject['type'] == 'FeatureCollection' ) ){
       features = this.jsonObject['features']
    }
    else {
      for (var i in this.jsonObject) {
        var ft = this.jsonObject[i];
        if (ft.type && ft.type == 'FeatureCollection') {
          for (var j in ft.features) {
            var ft2 = ft.features[j]
            features.push(ft2)
          }
        } else {
          features.push(ft)
        }
      }
    }
    this.draw(features, 'bounds')
    this.draw(features, 'draw')
    this.features = features;
    console.log(features)
  }

  this.draw = function(geojsonObj, type) {
    n = 1;
    var features = geojsonObj
    for (var i = 0; i < features.length; i++) {
      var coords = features[i].geometry.coordinates;
      var geomtype = features[i].geometry.type;
      if (geomtype == "Polygon") {
        traverseCoordinates(coords[0], type);
      } else if (geomtype == "MultiPolygon") {
        for (var k = 0; k < coords.length; k++) {
          traverseCoordinates(coords[k][0], type);
        }
      }
      //console.log(n);
      n++;
    }
    this.imgdata = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height)
  }

  this.latlon2CanXY = function(lat,lon) {
    x = (lon - this2.xMin) * (this2.canvas.width / (this2.xMax - this2.xMin))
    y = (lat - this2.yMin) * (this2.canvas.height / (this2.yMax - this2.yMin))
    return [x,this2.canvas.height-y]
  }

  this.canXY2LatLon = function(x,y) {
    var lon = x / (this2.canvas.width / (this2.xMax - this2.xMin)) + this2.xMin
    var lat = (this2.canvas.height-y) / (this2.canvas.height / (this2.yMax - this2.yMin)) + this2.yMin
    return [lat,lon]
  }

  this.indexOf = function(lat, lon) {
    var xy = this.latlon2CanXY(lat,lon)
    return this.indexOfCanvasXY(xy[0], xy[1])
  }

  this.indexOfCanvasXY = function(x, y) {
    if (x > this.canvas.width || x < 0 || y > this.canvas.height || y < 0) {
      return null
    }
    var index = 4 * Math.round(Math.round(y) * this.canvas.width + Math.round(x))
    var r = this.imgdata.data[index ]
    var g = this.imgdata.data[index + 1]
    var b = this.imgdata.data[index + 2]
    var a = this.imgdata.data[index + 3]

    var index2 = this.rgb2Index(r,g,b)
    if(a<255){return null}
    return index2;
  }

  this.rgb2Index = function(r,g,b) {
    return  r*256*256 + g * 256 + b;
  }

  this.index2rgb = function( index) {
    var r = n >> 16
    var g = n >> 8
    var b = n % 256
    return [r,g,b]
  }

  this.featureOf = function(lat, lon) {
    var index = this.indexOf(lat, lon)
    if (!index) {
      return null
    }
    return this.features[index]//the indexes start at one but the features are zero indexed
  }

  this.featureOfCanXY = function(x,y) {
    var index = this.indexOfCanvasXY(x,y)
    if (!index) {
      return null
    }
    return this.features[index]//the indexes start at one but the features are zero indexed
  }

  function traverseCoordinates(coordinates, type) {
    var ctx = this2.ctx;
    var rgb = this2.index2rgb(n)
    var r = rgb[0]
    var g = rgb[1]
    var b = rgb[2]
    ctx.fillStyle = 'rgb(' + r + ',' + g + ',' + b + ')'
    ctx.lineWidth = 0;
    if (type == 'bounds') {
      for (var j = 0; j < coordinates.length; j++) {
        var x = coordinates[j][0];
        var y = coordinates[j][1];
        this2.xMin = Math.min(this2.xMin, x)
        this2.xMax = Math.max(this2.xMax, x)
        this2.yMin = Math.min(this2.yMin, y)
        this2.yMax = Math.max(this2.yMax, y)
      }
    }
    if (type == 'draw') {
      for (var j = 0; j < coordinates.length; j++) {
        var lon = coordinates[j][0];
        var lat = coordinates[j][1];
        var xy = this2.latlon2CanXY( lat,lon)
        if (j == 0) {
          //begin drawing on the first point
          ctx.beginPath();
          ctx.moveTo(xy[0], xy[1]);
        } else {
          //continue drawing
          ctx.lineTo(xy[0], xy[1]);
        }
      }
    }
    ctx.fill();
  }

  this.calcCentroids = function() {
    var tab = []
    var tabsLatLon = []
    var centroids = []
    var centroidsLatLon = []
    var ctx = this.canvas.getContext('2d')
    var imgd = ctx.getImageData(0, 0, this.canvas.width, this.canvas.height)
    for(var i=0; i<imgd.data.length; i+=4) {
      var r = imgd.data[i]
      var g = imgd.data[i+1]
      var b = imgd.data[i+2]
      var x = (i/4)%this.canvas.width
      var y = Math.floor((i/4)/this.canvas.width)
      var index = this.rgb2Index(r,g,b)
      if( !tab[index]) {
        tab[index]=[]
        tabsLatLon[index]=[]
      }
      tab[index].push([x,y])
      tabsLatLon[index].push(this.canXY2LatLon(x,y))
    }
    for(i=0; i<tab.length; i++){
      var mean = jStat(tab[i]).mean()
      centroids[i] = mean
      centroidsLatLon[i] = this.canXY2LatLon(mean[0], mean[1])
    }
    return {allPoints:tab, allPointsLatLon:tabsLatLon, centroidsLatLon:centroidsLatLon, centroids:centroids}
  }

  this.centroids2properties = function() {
    var cents = this.calcCentroids()
    for(var i in cents.centroidsLatLon){
      if(this.features[i] && this.features[i].properties){
        this.features[i].properties.clat = cents.centroidsLatLon[i][0]
        this.features[i].properties.clon = cents.centroidsLatLon[i][1]
      }
    }
  }

  
  this.init()
}
