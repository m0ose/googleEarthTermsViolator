
function singleShot( x,y) {
    var hitGlobe = ge.getView().hitTest(x, ge.UNITS_PIXELS,y, ge.UNITS_PIXELS, ge.HIT_TEST_GLOBE)
    var hitTerrain = ge.getView().hitTest(x, ge.UNITS_PIXELS, y, ge.UNITS_PIXELS, ge.HIT_TEST_TERRAIN)
    var hitBuildings = ge.getView().hitTest(x, ge.UNITS_PIXELS, y, ge.UNITS_PIXELS, ge.HIT_TEST_BUILDINGS)
    var hitFu = ge.getView().hitTest(x, ge.UNITS_PIXELS, y, ge.UNITS_PIXELS, 3)//not sure what this on is?
    var result = {x:x, y:y}
    if( hitGlobe){
        result.globe = {x:hitGlobe.getLatitude(), y:hitGlobe.getLongitude(), a:hitGlobe.getAltitude()}
    }
    if( hitTerrain){
        result.terrain = {x:hitTerrain.getLatitude(), y:hitTerrain.getLongitude(), a:hitTerrain.getAltitude()}
    }
    if( hitBuildings){
        result.buildings = {x:hitBuildings.getLatitude(), y:hitBuildings.getLongitude(), a:hitBuildings.getAltitude()}
    }
    if(hitFu){
        result.fu = {x:hitFu.getLatitude(), y:hitFu.getLongitude(), a:hitFu.getAltitude()}
    }
    return result
}

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

function gotoLatLon(lat, lon, alt){
    var camera = ge.getView().copyAsCamera(ge.ALTITUDE_ABSOLUTE );
    camera.setAltitude(alt || 800);
    camera.setLatitude(lat);
    camera.setLongitude(lon); 
    ge.getView().setAbstractView(camera);
}

function gotoSanFran(){
    var camera = ge.getView().copyAsCamera(ge.ALTITUDE_ABSOLUTE );
    camera.setAltitude(1200);
    camera.setLatitude(37.79);
    camera.setLongitude(-122.396); 
    ge.getView().setAbstractView(camera);
}