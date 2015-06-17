//
// 3d stuff
//
var my3d = {}
function initThree(){
  var scene = new THREE.Scene()
  var camera = new THREE.PerspectiveCamera(45,400 / 400, -1000, 1000)
  var renderer = new THREE.WebGLRenderer();
  renderer.setClearColor(new THREE.Color(0xEEEEEE, 1.0));
  renderer.setSize(400, 400);
  // add subtle ambient lighting
  var ambientLight = new THREE.AmbientLight(0xffaa66);
  scene.add(ambientLight);
  // directional lighting
  var directionalLight = new THREE.DirectionalLight(0xffffff);
  directionalLight.position.set(1, 1, 1).normalize();
  scene.add(directionalLight);
  var dv = document.getElementById('threeDiv')
  dv.appendChild(renderer.domElement);
  //store some globals
  my3d.scene = scene
  my3d.camera = camera
  my3d.renderer = renderer
}

var _lastRender = 0
function renderBuilding(tin) {
  var coords = tin.geometry.coordinates
  var vertices = []
  var faces = []
  console.log(tin)
  var vcount = 0
  for(var i=0; i < coords.length; i++) {
    var tri = coords[i]
    for(var j=0; j < 3; j++) {
      var v = tri[j]
      var altitude = 0
      if( v[2]>0 && v[3]>0){
        altitude=10*(v[2])
      }      
      var v2 = new THREE.Vector3(1000000*(v[0] ),1000000*(v[1]), altitude)// this is some total bs
      // three js tangled the mesh unless I multiplied it by a huge number
      //var v2 = new THREE.Vector3(Math.random()*10, Math.random()*20, Math.random()*10)
      vertices.push(v2)
      vcount++
    }
    faces.push( new THREE.Face3(vertices.length-3, vertices.length-2, vertices.length-1))
  }
  var geom = new THREE.Geometry()
  geom.vertices = vertices
  geom.faces = faces
  var materials = [
    new THREE.MeshLambertMaterial( { opacity:0.7, color: Math.floor(Math.random()*0xffffff), transparent:true, side:THREE.DoubleSide} ),
    new THREE.MeshBasicMaterial( { color: 0x00ffff, wireframe: true } )
  ];
  //  translate to center
  geom.computeBoundingSphere()
  var bs = geom.boundingSphere
  console.log(bs)
  var mesh = THREE.SceneUtils.createMultiMaterialObject(geom,materials)
  my3d.scene.add(mesh)
  // move camera
  my3d.camera.position.x = bs.center.x 
  my3d.camera.position.y = bs.center.y + 5000
  my3d.camera.position.z = -bs.radius*4
  my3d.camera.lookAt(new THREE.Vector3(bs.center.x, bs.center.y, 0));
  //render in threejs
  var now = new Date().getTime()
  if( now - _lastRender > 1000) {
    _lastRender = now
    my3d.renderer.render( my3d.scene, my3d.camera)
  }
  //
}