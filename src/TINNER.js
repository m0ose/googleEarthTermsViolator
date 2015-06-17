//
// generate TIN
//
var TINNER = new function(){
  function makeTin( feature) {
  try{
    var extctx = gatherPoints(feature)
    extctx.triangulate();
  }catch(e){
    throw(e)
    console.error(e)
  }
  var triangles = extctx.getTriangles()
  //estimatePerimeterElevation(triangles)
  //get ready for geojson
  var polys = []
  for(var i=0; i < triangles.length; i++){
    var tri = triangles[i].getPoints()
    var p1 = [unNormalize(tri[0].x), unNormalize(tri[0].y), tri[0].a, tri[0].g]
    var p2 = [unNormalize(tri[1].x), unNormalize(tri[1].y), tri[1].a, tri[1].g]
    var p3 = [unNormalize(tri[2].x), unNormalize(tri[2].y), tri[2].a, tri[2].g]
    var p = [p1, p2, p3, p1]
    polys.push(p)
  }
  //convert polygon into geojson
  var polygon = turf.polygon(polys)
  return polygon
  }
  this.makeTin = makeTin

  // This tries to sanitize the input
  //   The randomness REALY helps avoid the errors. (stack overflow and poly2tri Intersecting Constraints)
  //   Adding 180 makes the values positive,
  //   and multiplying by a 10000 helps minimize the effect of the randomness
  function normalize(x, randomness){
    randomness = randomness || 1e-8 // 1e-8 seems to work good
    y= (x+180)*10000 + Math.random()*randomness
    return y
  }

  function unNormalize(x){
    return (x/10000)-180
  }

  function gatherPoints( feature){
    var exterior = []
    var holes = []
    var coords = feature.geometry.coordinates
    // add exterior points
    for( var j=0; j < coords.length; j++) {
      var hole = []
      for(var k=1; k<coords[j].length; k++) {
        var p =  new poly2tri.Point( normalize(coords[j][k][0]) , normalize(coords[j][k][1]) )
        if( j == 0) { //exterior
          exterior.push(p)
        } else { //hole
          hole.push(p)
        }
      }
      if( hole.length > 2 ) {
        holes.push(hole)
      }
    }
    // make mesh
    var extctx = new poly2tri.SweepContext(exterior)
    holes.forEach( function(h){
      extctx.addHole(h)
    })
    // add steiner points here
    var hits = _.sample(feature.properties.hits,300)
    if( hits) {
      console.log('steiner',feature.properties.hits)
      for(var i=0; i < hits.length; i++) {
        var p = new poly2tri.Point( normalize(hits[i].x), normalize(hits[i].y) ) 
        p.a = hits[i].a
        p.g = hits[i].g
        extctx.addPoint(p)
        //exterior.push(new poly2tri.Point(hits[i].x*normalizer, hits[i].y*normalizer))
      }
    }
    return extctx
  }

  function estimatePerimeterElevation(triangles) {
    var noAltCount = 0
    var altCount = 0
    for(var i=0; i<triangles.length; i++) {
      var t = triangles[i]
      for(var i2=0; i2<t.points_.length; i2++) {
        var pnt1 = t.points_[i2]
        if( pnt1 && !pnt1.a) {
          var minDist = Number.MAX_SAFE_INTEGER
          var minNode = undefined
          var pntlist = []
          //check points in this triangle
          for(var n=0; n<t.points_.length; n++) {
            var pt2 =  t.points_[n]
            if(pt2.a > 0) 
            pntlist.push(pt2)
          }
          //check points in other triangles
          for(var n=0; n<t.neighbors_.length; n++) {
            var nei = t.neighbors_[i]
            for(var j=0; nei && j < nei.points_.length; j++) {
              var pnt3 = nei.points_[j]
              if( pnt3.a > 0 ){
                pntlist.push(pnt3)
              }
            }
          }
          // go through point list
          for(var n=0; n<pntlist.length; n++) {
            var pnt4 = pntlist[n]
            var dist = Math.hypot(pnt1.x-pnt4.x, pnt1.y-pnt4.y)
            if( dist<minDist) {
              minDist = dist
              minNode = pnt4
            }
          }
          if(minNode) {
            pnt1.a = minNode.a
            pnt1.g = minNode.g
            altCount++
          } else {
            noAltCount++
          }
        }
      }
    }
    console.log('no alt: ', noAltCount, 'changed: ', altCount)
  }

}()
