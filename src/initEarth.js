var ge = null;
google.setOnLoadCallback(init);
google.load("earth", "1");

function init() { google.earth.createInstance('map3d', initCB, failureCB); }

function failureCB(instance) { alert('launch of google earth failed.');}

function initCB(instance) 
{   ge = instance; 
    ge.getWindow().setVisibility(true); 
    ge.getOptions().setTerrainExaggeration(1);
    ge.getOptions().setUnitsFeetMiles(false);
    ge.getOptions().setStatusBarVisibility(true);
    ge.getOptions().setScaleLegendVisibility(true);
    ge.getOptions().setFadeInOutEnabled(false);
    ge.getOptions().setFlyToSpeed(ge.SPEED_TELEPORT);
    // i think for this we want both terrain and buildings on. Building without terrain is sketchy. and terrain only doesn't show buildings
    ge.getLayerRoot().enableLayerById(ge.LAYER_BUILDINGS, true);
    ge.getLayerRoot().enableLayerById(ge.LAYER_TERRAIN, true);
    startHitTester()
}