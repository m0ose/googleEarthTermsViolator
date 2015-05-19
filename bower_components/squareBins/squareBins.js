//put 2d data into bins

function squareBins(options) {

  var myOpts = {
    minX:0,
    minY:0,
    maxX:1,
    maxY:1,
    width:10,
    height:10
  }
  this.bins
  //myOpts = _.extend(myOpts, options)
  for(var op in options){
    myOpts[op] = options[op]
  }

  this.init = function() {
    this.bins = new Array(myOpts.width)
    for(var i=0; i<this.bins.length; i++){
      this.bins[i] = new Array(myOpts.height)
      for( var j=0; j<myOpts.height;j++) {
        this.bins[i][j] = []
      }
    }
  }

  this.scaleValue = function(minIn, val, maxIn, minOut, maxOut) {
    var rangeIn = maxIn - minIn
    var a = (val-minIn)/rangeIn
    var rangeOut = maxOut - minOut
    var b = a*rangeOut + minOut
    return b
  }

  this.addPoint = function(x,y,val) {
    var binxy = this.xy2binxy(x,y)
    if(binxy[0]>myOpts.width || binxy[0]<0 || binxy[1]>myOpts.height || binxy[1]<0) {
      throw('point out of range')
    }
    this.bins[binxy[0]][binxy[1]].push({x:x, y:y, val:val})
  }

  this.xy2binxy = function(x,y) {
    var binX = Math.floor(this.scaleValue( myOpts.minX, x, myOpts.maxX, 0, myOpts.width))
    var binY = Math.floor(this.scaleValue( myOpts.minY, y, myOpts.maxY, 0, myOpts.height))
    binX = Math.min(myOpts.width-1, binX)
    binY = Math.min(myOpts.height-1, binY)  
    return [binX, binY]
  }

  this.binxy2xy = function(x,y) {
    var x2 = this.scaleValue( 0, x, myOpts.width, myOpts.minX, myOpts.maxX)
    var y2 = this.scaleValue( 0, y, myOpts.height, myOpts.minY, myOpts.maxY)
    return [x2, y2]
  }

  /*
    Traverse like your reading a book(in chinese)
    |_V_|_V_|_V_|
    |_V_|_V_|_V_|
    |_V_|_V_|_V_|
  */
  this.forEachBin_top2bottom = function(cb) {
    for(var x=0; x<this.bins.length; x++) {
      for( var y=0; y<this.bins[x].length; y++) {
        cb(this.bins[x][y],x,y)
      }
    }
  }

  /*
    Traverse like your reading a book(in english)
    |_->_|_->_|_->_|
    |_->_|_->_|_->_|
    |_->_|_->_|_->_|
  */
  this.forEachBin_left2right = function(cb) {
    for( var y=0; y<this.bins[0].length; y++) {
      for(var x=0; x<this.bins.length; x++) {
        cb(this.bins[x][y],x,y)
      }
    }
  }

  /*
    zigzag through the bins
    |_->_|_->_|_->_|
    |_<-_|_<-_|_<-_|
    |_->_|_->_|_->_|
  */
  this.forEachBin_zigzag = function(cb) {
    for( var y=0; y<this.bins[0].length; y++) {
      for(var x=0; x<this.bins.length; x++) {
        var x2 = x
        if(y%2 == 1) { 
          x2 = this.bins.length - x - 1
        }
        cb(this.bins[x2][y],x2,y)
      }
    }
  }

  this.forEachBin_hilbert = function(cb) {
    //todo
  }

  this.init()
}

//return squareBins

