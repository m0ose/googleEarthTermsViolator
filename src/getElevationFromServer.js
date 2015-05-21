function elevationFromServer(options, cb) {
    this.RGBdata
    this.data
    this.width
    this.height
    this.loaded = false

    cb = cb || function(){} 
    var myOpts = {
        north:0,
        south:0,
        east:0,
        west:0,
        width:1000,
        height:1000,
        server:"http://node.redfish.com/cgi-bin/elevation.py",
        params:function(){
            //lower_left_lat,lower_left_lon,upper_right_lat,upper_right_lon
            //&res=500,500
            return "?bbox="+this.south+","+this.west+","+this.north+","+this.east+"&res="+this.width+","+this.height
        }
    }
    for(var op in options){
        myOpts[op] = options[op]
    }

    this.getUrl = function() {
        return myOpts.server + myOpts.params()
    }

    this.init = function() {
        var url = this.getUrl()
        console.log(url)
        var img = new Image
        img.crossOrigin = 'anonymous'
        var this2 = this
        img.onload = function() {
            //console.log('image loaded')
            this2.width = this.width
            this2.height = this.height
            this2.RGBdata = getImageData(this)
            this2.data = new Float64Array(this.height*this.width)
            var i2 = 0
            //var sum = 0
            for(var i=0; i < this2.RGBdata.data.length; i+=4) {
                var r = this2.RGBdata.data[i]
                var g = this2.RGBdata.data[i+1]
                var b = this2.RGBdata.data[i+2]
                this2.data[i2] = _RGB2DeciMeters(r,g,b)
                //sum += this2.data[i2]
                i2++
            }
            //console.log('sum',sum)
            this2.loaded=true
            cb()
        }
        img.onerror = function(e) {
            cb(e)
        }
        img.src = url
    }

    this.queryLatLon=function(lat,lon) {
        var x = scaleValue(myOpts.west, lon, myOpts.east, 0, this.width)
        x = Math.round(x)
        x = Math.max(0, x)
        x = Math.min(this.width, x)
        var y = scaleValue(myOpts.south, lat, myOpts.north, this.height, 0)
        y = Math.round(y)
        y = Math.max(0, y)
        y = Math.min(this.height, y)
        var index = y*this.width + x
        return this.data[index]
    }

    this.init()
}