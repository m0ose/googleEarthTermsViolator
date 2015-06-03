OSMtools = function(){
 
  this.rawData
  this.parsedData
 
  this.loadOSM = function(bounds, cb) {
    //var url = "http://api.openstreetmap.org/api/0.6/map?bbox=" + bounds.ul.x + "," + bounds.lr.y + "," + bounds.lr.x + "," + bounds.ul.y
    var url = "http://api.openstreetmap.fr/xapi?way[bbox=" + bounds.ul.x + "," + bounds.lr.y + "," + bounds.lr.x + "," + bounds.ul.y+"]"
    var xhr = new window.XMLHttpRequest()
    xhr.onreadystatechange = function(e) {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          this.rawData = xhr.responseText
          this.parseOSM(this.rawData)
          cb(null, this.rawData)
        } else {
          cb(e)
        }
      }
    }.bind(this)
    xhr.open("get", url)
    xhr.send()
  }

  this.parseOSM = function(rawData) {
    this.parsedData = (new DOMParser()).parseFromString(rawData, "text/xml")
    return this.parsedData
  }

  this.wayFilter = function( func) {
    var myways=this.parsedData.getElementsByTagName("way")
    // convert html collection to array
    var b = Array.prototype.slice.call( myways )
    var filtered = b.filter( func)
    // find nodes for corrosponding filtered arrays
    var lookup = {}
    for(var i=0; i<filtered.length; i++){
      var g = filtered[i]
      var nodes = g.getElementsByTagName('nd')
      for(var j=0; j<nodes.length; j++) {
        var nod = nodes[j]
        var id = nod.getAttribute('ref')
        lookup[id] = id
      }
    }
    //extract nodes from xml
    var nodes = this.parsedData.getElementsByTagName('node')
    nodes = Array.prototype.slice.call( nodes )
    var goodNodes = nodes.filter( function(something) {
      var id = something.getAttribute('id')
      if(id && id == lookup[id]) {
        return true
      }
    })
    var filteredResults = goodNodes.concat(filtered)
    // generate valid xml
    var result2 = this.elemList2xml( filteredResults)
    return result2
  }

  this.elemList2xml = function( elemList) {
    // xml is tough to deal with
    var header = "<osm version='0.6' generator='Overpass API'>"+
                "<note>The data included in this document is from www.openstreetmap.org. The data is made available under ODbL.</note>"+
                "<meta osm_base='2015-06-03T21:00:02Z'/>" 
    elemList.forEach( function(tag){
      header += tag.outerHTML + "\n"
    })  
    header += "</osm>"
    var xmlOut = (new DOMParser()).parseFromString(header, "text/xml")   
    return xmlOut
  }

  this.getGeoJson = function( xml){
    return osmtogeojson(xml)
  }

  this.filterJustBuildings = function(){
        var buildings = this.wayFilter(function(entry){
          var tags = entry.getElementsByTagName('tag')
          for(var i=0; i<tags.length; i++){
            var g = tags[i]
            if(g.getAttribute('k') == 'building') {
              return true
            }
          }
          return false
        })
        return buildings
    }

}
