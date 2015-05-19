
earthUtils = new function() {

    function singleShot( x,y) {
        var hitGlobe = ge.getView().hitTest(x, ge.UNITS_PIXELS,y, ge.UNITS_PIXELS, ge.HIT_TEST_GLOBE)
        var hitTerrain = ge.getView().hitTest(x, ge.UNITS_PIXELS, y, ge.UNITS_PIXELS, ge.HIT_TEST_TERRAIN)
        var hitBuildings = ge.getView().hitTest(x, ge.UNITS_PIXELS, y, ge.UNITS_PIXELS, ge.HIT_TEST_BUILDINGS)
        var hitFu = ge.getView().hitTest(x, ge.UNITS_PIXELS, y, ge.UNITS_PIXELS, 3)//not sure what this on is?
        var result = {x:x, y:y}
        if( hitGlobe){
            result.globe = {y:hitGlobe.getLatitude(), x:hitGlobe.getLongitude(), a:hitGlobe.getAltitude()}
        }
        if( hitTerrain){
            result.terrain = {y:hitTerrain.getLatitude(), x:hitTerrain.getLongitude(), a:hitTerrain.getAltitude()}
        }
        if( hitBuildings){
            result.buildings = {y:hitBuildings.getLatitude(), x:hitBuildings.getLongitude(), a:hitBuildings.getAltitude()}
        }
        if(hitFu){
            result.fu = {y:hitFu.getLatitude(), x:hitFu.getLongitude(), a:hitFu.getAltitude()}
        }
        return result
    }
    this.singleShot = singleShot

    //
    // I highly recomend width*height < 1000. If you want to avoid the crash
    //
    function batchShot(x,y,width,height,step) {
        step = step || 1
        if( width*height > 1000){
            console.warn("I highly recomend width*height < 1000. If you want to avoid the crash")
        }
        var result = []
        var funky = function(){
            for(var i=0; i<width; i += step){
                for(var j=0; j<height; j += step){
                    result.push( singleShot(x+i,y+j))
                }
            }
        }
        google.earth.executeBatch( ge, funky)
        return result
    }
    this.batchShot = batchShot

    function listShot(list) {
        var result = []
        var funky = function(){
            for(var i=0; i < list.length; i++) {
                var x = list[i][0]
                var y = list[i][1]
                result.push( singleShot(x,y))
            }
        }
        google.earth.executeBatch( ge, funky)
        return result
    }
    this.listShot = listShot

    function gotoLatLon(lat, lon, alt){
        var camera = ge.getView().copyAsCamera(ge.ALTITUDE_ABSOLUTE );
        camera.setAltitude(alt || 800);
        camera.setLatitude(lat);
        camera.setLongitude(lon); 
        ge.getView().setAbstractView(camera);
    }
    this.gotoLatLon = gotoLatLon

    function gotoSanFran(){
        var camera = ge.getView().copyAsCamera(ge.ALTITUDE_ABSOLUTE );
        camera.setAltitude(1200);
        camera.setLatitude(37.79);
        camera.setLongitude(-122.396); 
        ge.getView().setAbstractView(camera);
    }
    this.gotoSanFran = gotoSanFran

    function getEarthDimensions() {
        var dv = document.getElementById('map3d')
        var a = dv.getBoundingClientRect()
        var ul = singleShot(0,0)
        var lr = singleShot(a.width, a.height)
        return({div:a, ul:ul.globe, lr:lr.globe})
    }
    this.getEarthDimensions = getEarthDimensions

    var g_placemark 
    function moveBaloon(lat, lon) {
      if(!g_placemark) {
        g_placemark = ge.createPlacemark('')
        //g_placemark.setName("Center")
        var point = ge.createPoint('')
        point.setLatitude(lat)
        point.setLongitude(lon) 
        ge.getFeatures().appendChild(g_placemark)
      }
      //console.log( 'moveTo', lat, lon)
      var point = ge.createPoint('')
      point.setLatitude(lat)
      point.setLongitude(lon)
      g_placemark.setGeometry(point)
    }
    this.moveBaloon = moveBaloon

    return this
}()


