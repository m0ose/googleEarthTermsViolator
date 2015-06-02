//
// generate TIN
//
var TINNER = new function(){
  function makeTin( feature) {
  try{
    var extctx = gatherPoints(feature)
    extctx.triangulate();
  }catch(e){
    console.error(e)
  }
  var triangles = extctx.getTriangles();
  var polys = []
  for(var i=0; i < triangles.length; i++){
    var tri = triangles[i].getPoints()
    var p = [
      [unNormalize(tri[0].x), unNormalize(tri[0].y)], 
      [unNormalize(tri[1].x), unNormalize(tri[1].y)], 
      [unNormalize(tri[2].x), unNormalize(tri[2].y)],
      [unNormalize(tri[0].x), unNormalize(tri[0].y)]
    ]
    polys.push(p)
  }
  //console.log(polys)
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
        extctx.addPoint(new poly2tri.Point( normalize(hits[i].x), normalize(hits[i].y) ) )
        //exterior.push(new poly2tri.Point(hits[i].x*normalizer, hits[i].y*normalizer))
      }
    }
    return extctx
  }

}()
