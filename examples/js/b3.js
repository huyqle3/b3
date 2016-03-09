/*
 * https://github.com/huyle333/b3
 */

// Global variables for the full screen width and height.
var SCREEN_WIDTH = window.innerWidth;
var SCREEN_HEIGHT = window.innerHeight;

// Global variable for 45 degrees perspective view.
var VIEW_ANGLE = 45;
var ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT;
var NEAR = 0.1;
var FAR = 20000;

// Add a camera to the scene.
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
scene.add(camera);

// Array that holds all the objects generated on the scene.
var objects = [];
var objectControls = [];

// b3Json holds the contents of the ingested JSON file.
var b3Json;
// timeSeriesCount is a variable that stores the increments of the time series graph.
var timeSeriesCount = 0;

// effect is used for VR.
var effect;
var renderer;

// vrControls is used for VR and orbitMouseControls is used for the mouse.
var vrControls;
var orbitMouseControls;

// projector is used to project the sprite toolbox.
var projector;
// mouse controls the placement of the mouse at origin.
var mouse = { x: 0, y: 0 };
// intersect checks to see if mouse intersected with an object.
var INTERSECTED;

// sprite, canvas, context, texture control the content of the projected sprite toolbox.
var sprite1;
var canvas1, context1, texture1;

function initiate(){
  /*
  Initiate function creates the 3D environment with a world coordinate grid.
  */
  var leapCameraControls;
  var coords1;
  var coords2;
  var coords3;
  var lastControlsIndex = -1;
  var controlsIndex = -1;
  var index = -1;

  /*
  Setup three.js WebGL renderer.
  */
  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
	renderer.setClearColor(0xffffff, 1);

	/*
	Append the canvas element created by the renderer to document body element.
	*/
	container = document.getElementById( 'b3' );
  container.appendChild( renderer.domElement );

	/*
	Set the x, y, z coordinates of the camera.
	*/
	camera.position.x = 200;
  camera.position.y = 200;
  camera.position.z = 200;
   	
  /*
  Origin is set to (0, 0, 0), and the camera will look at the origin when page is loaded.
  */
	var origin = new THREE.Vector3(0, 0, 0);
	camera.lookAt(origin);

  /*
  World coordinate system act in the place of the graph indicator.
  Add the coordinates to the scene.
  */
  var lineGeometry = new THREE.Geometry();
  var vertArray = lineGeometry.vertices;
  vertArray.push(new THREE.Vector3(150, 0, 0), origin, new THREE.Vector3(0, 150, 0), origin, new THREE.Vector3(0, 0, 150));
  lineGeometry.computeLineDistances();
  var lineMaterial = new THREE.LineDashedMaterial({color: 0x000000, dashSize: 1, gapSize: 1});
  var coords = new THREE.Line(lineGeometry, lineMaterial);
  scene.add(coords);

	/*
	OrbitControls is used for mouse vrControls on the Camera.
  LeapCameraControls is used for LeapMotion motion controllers on the camera.
	*/
	orbitMouseControls = new THREE.OrbitControls( camera, renderer.domElement );
  vrControls = new THREE.VRControls( camera );

	leapCameraControls = new THREE.LeapCameraControls(camera);

  leapCameraControls.rotateEnabled  = true;
  leapCameraControls.rotateSpeed    = 3;
  leapCameraControls.rotateHands    = 1;
  leapCameraControls.rotateFingers  = [2, 3];
    
  leapCameraControls.zoomEnabled    = true;
  leapCameraControls.zoomSpeed      = 6;
  leapCameraControls.zoomHands      = 1;
  leapCameraControls.zoomFingers    = [4, 5];
  leapCameraControls.zoomMin        = 50;
  leapCameraControls.zoomMax        = 2000;
    
  leapCameraControls.panEnabled     = true;
  leapCameraControls.panSpeed       = 2;
  leapCameraControls.panHands       = 2;
  leapCameraControls.panFingers     = [6, 12];
  leapCameraControls.panRightHanded = false; // for left-handed people

	/*
	effect variable is used to generate the Virtual Reality effect
	*/
	effect = new THREE.VREffect( renderer );
	effect.setSize( window.innerWidth, window.innerHeight );

	/*
  Leap Motion loads with loop function.
  */
  Leap.loop(function(frame) {
    // Show cursosr is a function from Leap Controls.
    showCursor(frame);

    // Set correct camera control.
    controlsIndex = focusObject(frame);
    if (index == -1) {
      leapCameraControls.update(frame);
    } else {
      objectsControls[index].update(frame);
    };

    effect.render(scene, camera);
  });

  // setInterval is a timer that runs changeControlsIndex every 250 milliseconds.
  setInterval(changeControlsIndex, 250);

  /*
  Filler function in the works to set highlighting objects.
  */
  function changeControlsIndex() {
    if (lastControlsIndex == controlsIndex) {
      if (index != controlsIndex && controlsIndex > -2) {
        // new object or camera to control
        if (controlsIndex > -2) {
          if (index > -1) objects[index].material.color.setHex(0xefefef);
          index = controlsIndex;
          if (index > -1) objects[index].material.color.setHex(0xff0000);
        }
      };
    }; 
    lastControlsIndex = controlsIndex;
  };

  /*
  Filer function to allow transformation of objects
  */
  function transform(tipPosition, w, h) {
    var width = 150;
    var height = 150;
    var minHeight = 100;

    var ftx = tipPosition[0];
    var fty = tipPosition[1];
    ftx = (ftx > width ? width - 1 : (ftx < -width ? -width + 1 : ftx));
    fty = (fty > 2*height ? 2*height - 1 : (fty < minHeight ? minHeight + 1 : fty));
    var x = THREE.Math.mapLinear(ftx, -width, width, 0, w);
    var y = THREE.Math.mapLinear(fty, 2*height, minHeight, 0, h);
    return [x, y];
  };

  /*
  showCursor is used to project a red pointer to the screen with Leap Motion controller.
  */
  function showCursor(frame) {
    var hl = frame.hands.length;
    var fl = frame.pointables.length;

    if (hl == 1 && fl == 1) {
      var f = frame.pointables[0];
      var cont = $(renderer.domElement);
      var offset = cont.offset();
      var coords = transform(f.tipPosition, cont.width(), cont.height());
      $("#cursor").css('left', offset.left + coords[0] - (($("#cursor").width() - 1)/2 + 1));
      $("#cursor").css('top', offset.top + coords[1] - (($("#cursor").height() - 1)/2 + 1));
    } else {
      $("#cursor").css('left', -1000);
      $("#cursor").css('top', -1000);
    };
  };

  /*
  Selection of an object.
  */
  function focusObject(frame) {
    var hl = frame.hands.length;
    var fl = frame.pointables.length;

    if (hl == 1 && fl == 1) {
      var f = frame.pointables[0];
      var cont = $(renderer.domElement);
      var coords = transform(f.tipPosition, cont.width(), cont.height());
      var vpx = (coords[0]/cont.width())*2 - 1;
      var vpy = -(coords[1]/cont.height())*2 + 1;
      var vector = new THREE.Vector3(vpx, vpy, 0.5);
      // projector.unprojectVector(vector, camera);
      var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
      raycaster.setFromCamera(vector, camera);

      var intersects = raycaster.intersectObjects(objects);
      if (intersects.length > 0) { 
        var i = 0;
        while(!intersects[i].object.visible) i++;
        var intersected = intersects[i];
        return objects.indexOf(intersected.object);
      } else {
        return -1;
      };
    };

    return -2;
  };

  /*
  Fullscreen and resize window
  */
  THREEx.WindowResize(renderer, camera, effect);
  THREEx.FullScreen.bindKey({ charCode : 'm'.charCodeAt(0) });

  // initialize object to perform world/screen calculations
  projector = new THREE.Projector();
  // when the mouse moves, call the given function
  document.addEventListener( 'mousemove', onDocumentMouseMove, false );

  // create a canvas element
  canvas1 = document.createElement('canvas');
  context1 = canvas1.getContext('2d');
  context1.font = "Bold 20px Arial";
  context1.fillStyle = "rgba(0,0,0,0.95)";
  context1.fillText('Toolbox', 0, 20);

  // canvas contents will be used for a texture
  texture1 = new THREE.Texture(canvas1) 
  texture1.needsUpdate = true;

  // create the sprite that renders on the canvas object  
  var spriteMaterial = new THREE.SpriteMaterial( { map: texture1} );
  
  sprite1 = new THREE.Sprite( spriteMaterial );
  sprite1.scale.set(100,100,1.0);
  sprite1.position.set(50, 50, 0 );
  // scene.add( sprite1 ); 

  window.addEventListener("keydown", updateTimeSeriesCoordinates, false);

  /*
  Kick off animation loop with the function above.
  */
  animate();
}

/*
 * Request animation frame loop function
 */
function animate() {
  /*
   * Use mouse vrControls and update VR headset position and apply to camera.
   */
  render();
  requestAnimationFrame( animate );
  update();
}

/*
 * Updates the location of the mouse to check if mouse touches an object.
 */
function update(){
  // create a Ray with origin at the mouse position
  // and direction into the scene (camera direction)
  var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
  // projector.unprojectVector( vector, camera );
  // var ray = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );
  var ray = new THREE.Raycaster();

  ray.setFromCamera(vector, camera);
  // create an array containing all objects in the scene with which the ray intersects
  var intersects = ray.intersectObjects( scene.children );

  // INTERSECTED = the object in the scene currently closest to the camera 
  // and intersected by the Ray projected from the mouse position  
  
  // if there is one (or more) intersections
  if ( intersects.length > 0 )
  {
    // if the closest object intersected is not the currently stored intersection object
    if ( intersects[ 0 ].object != INTERSECTED ) 
    {
        // restore previous intersection object (if it exists) to its original color
      if ( INTERSECTED ) 
        INTERSECTED.material.color.setHex( INTERSECTED.currentHex );
      // store reference to closest object as current intersection object
      INTERSECTED = intersects[ 0 ].object;
      // store color of closest object (for later restoration)
      INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
      // set a new color for closest object
      INTERSECTED.material.color.setHex( 0xe60039 );
      
      // update text, if it has a "name" field.
      if ( intersects[ 0 ].object.name )
      {
        context1.clearRect(0,0,640,480);
        var message = intersects[ 0 ].object.name;
        updateToolBox(message);
        var metrics = context1.measureText(message);
        var width = metrics.width;
        context1.fillStyle = "rgba(0,0,0,0.95)"; // black border
        context1.fillRect( 0,0, width+8,20+8);
        context1.fillStyle = "rgba(255,255,255,0.95)"; // white filler
        context1.fillRect( 2,2, width+4,20+4 );
        context1.fillStyle = "rgba(0,0,0,1)"; // text color
        context1.fillText( message, 4,20 );
        texture1.needsUpdate = true;
      }
      else
      {
        context1.clearRect(0,0,300,300);
        texture1.needsUpdate = true;
      }
    }
  } 
  else // there are no intersections
  {
    // restore previous intersection object (if it exists) to its original color
    if ( INTERSECTED ) 
      INTERSECTED.material.color.setHex( INTERSECTED.currentHex );
    // remove previous intersection object reference
    //     by setting current intersection object to "nothing"
    INTERSECTED = null;
    context1.clearRect(0,0,300,300);
    texture1.needsUpdate = true;
  }

    
  vrControls.update();
  // orbitMouseControls.update();
}


/*
 * Renders the VR effect onto screen.
 */
function render(){
  effect.render(scene, camera);
  // renderer.render(scene, camera);
}

/*
 * Update mouse movement when mouse moves.
 */
function onDocumentMouseMove( event ){
  // the following line would stop any other event handler from firing
  // (such as the mouse's TrackballControls)
  // event.preventDefault();

  // update sprite position
  sprite1.position.set( event.clientX, event.clientY - 20, 0 );
  // sprite1.position.set(window.innerWidth /2.0, window.innerHeight/2.0, 0)
  
  // update the mouse variable
  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

/*
 * Grabs JSON coordinates from file ingested.
 */
function coordinates(jsonFile){
  $.getJSON(jsonFile, function(json) {
    b3Json = json;

    updateInfo(b3Json[timeSeriesCount][0]["ts"]);

    console.log(b3Json[23169][0]["positions"]);


    console.log(b3Json[timeSeriesCount][0]["positions"]);
    console.log(b3Json[timeSeriesCount][0]["id"]);
    console.log(b3Json[timeSeriesCount][0]["positions"][1]);

    
    for(var i = 0; i < b3Json[timeSeriesCount][0]["positions"].length; i++){
      var geometry = new THREE.SphereGeometry(1.5, 5, 5);
      var material = new THREE.MeshBasicMaterial( {color: 0x38758A} );
      var object = new THREE.Mesh(geometry, material);

      object.position.x = b3Json[timeSeriesCount][0]["positions"][i][0] * 10;
      object.position.y = b3Json[timeSeriesCount][0]["positions"][i][1] * 10;
      object.position.z = b3Json[timeSeriesCount][0]["positions"][i][2] * 10;

      object.name = b3Json[timeSeriesCount][0]["id"][i] + ": " + (object.position.x).toFixed(2) + ", " + 
      (object.position.y).toFixed(2) + ", " + (object.position.z).toFixed(2);

      var geometryLine = new THREE.Geometry();
      var lineMaterial2 = new THREE.LineDashedMaterial({color: 0x000000, dashSize: 1, gapSize: 1});
      geometryLine.vertices.push(new THREE.Vector3(object.position.x, object.position.y, object.position.z));
      geometryLine.vertices.push(new THREE.Vector3(object.position.x, object.position.y, object.position.z + 3));
      geometryLine.vertices.push(new THREE.Vector3(object.position.x + 1.5, object.position.y, object.position.z + 1.5));
      geometryLine.vertices.push(new THREE.Vector3(object.position.x, object.position.y, object.position.z + 3));
      geometryLine.vertices.push(new THREE.Vector3(object.position.x - 1.5, object.position.y, object.position.z + 1.5));

      var line = new THREE.Line(geometryLine, lineMaterial2);

      object.receiveShadow = true;

      scene.add(object);
      scene.add(line);
      objects.push(object);
      objects.push(line);
    }
  });

  /*
	for (var i = 0; i < 20; i ++) {
    var objects = [], objectsControls = [];

		var geometry = new THREE.SphereGeometry(3, 10, 10);

		var material = new THREE.MeshNormalMaterial( {color: 0x38758A} );

		var object = new THREE.Mesh(geometry, material);
		object.position.x = Math.random()* 125;
		object.position.y = Math.random()* 125;
		object.position.z = Math.random()* 125;

		object.receiveShadow = true;

		// leap object vrControls
		var objectControls = new THREE.LeapObjectControls(camera, object);

		objectControls.rotateEnabled  = true;
		objectControls.rotateSpeed    = 3;
		objectControls.rotateHands    = 1;
		objectControls.rotateFingers  = [2, 3];

		objectControls.scaleEnabled   = true;
		objectControls.scaleSpeed     = 3;
		objectControls.scaleHands     = 1;
		objectControls.scaleFingers   = [4, 5];

		objectControls.panEnabled     = true;
		objectControls.panSpeed       = 3;
		objectControls.panHands       = 2;
		objectControls.panFingers     = [6, 12];
		objectControls.panRightHanded = false; // for left-handed person

		/*
		Add cube mesh to your three.js scene
		*/
    /*
		scene.add( object );
		objects.push(object);
		objectsControls.push(objectControls);
  }
  */
}

/*
 * Helper function that removes objects not in the current position of JSON file index.
 */
function removeObjects(){
  console.log(objects);
  for( var i = objects.length - 1; i >= 0; i--) {
    scene.remove(objects[i]);
  }
  objects = [];
}

/*
 * Helper function to update time series graph.
 */
function updateTimeSeriesCoordinates(e){
  if (e.keyCode == "37") {
    timeSeriesCount--;
  }else if(e.keyCode == "39"){
    timeSeriesCount++;
  }else{
    return;
  }

  removeObjects();

  if(timeSeriesCount >= b3Json.length){
    timeSeriesCount = 0;
  }
  if(timeSeriesCount <= -1){
    timeSeriesCount = b3Json.length - 1;
  }
  updateInfo(b3Json[timeSeriesCount][0]["ts"]);

  for(var i = 0; i < b3Json[timeSeriesCount][0]["positions"].length; i++){
    var geometry = new THREE.SphereGeometry(1.5, 5, 5);
    var material = new THREE.MeshBasicMaterial( {color: 0x38758A} );
    var object = new THREE.Mesh(geometry, material);

    object.position.x = b3Json[timeSeriesCount][0]["positions"][i][0] * 10;
    object.position.y = b3Json[timeSeriesCount][0]["positions"][i][1] * 10;
    object.position.z = b3Json[timeSeriesCount][0]["positions"][i][2] * 10;

    object.name = b3Json[timeSeriesCount][0]["id"][i] + ": " + (object.position.x).toFixed(2) + ", " + 
    (object.position.y).toFixed(2) + ", " + (object.position.z).toFixed(2);

    var geometryLine = new THREE.Geometry();
    var lineMaterial2 = new THREE.LineDashedMaterial({color: 0x000000, dashSize: 1, gapSize: 1});
    geometryLine.vertices.push(new THREE.Vector3(object.position.x, object.position.y, object.position.z));
    geometryLine.vertices.push(new THREE.Vector3(object.position.x, object.position.y, object.position.z + 3));
    geometryLine.vertices.push(new THREE.Vector3(object.position.x + 1.5, object.position.y, object.position.z + 1.5));
    geometryLine.vertices.push(new THREE.Vector3(object.position.x, object.position.y, object.position.z + 3));
    geometryLine.vertices.push(new THREE.Vector3(object.position.x - 1.5, object.position.y, object.position.z + 1.5));

    var line = new THREE.Line(geometryLine, lineMaterial2);

    object.receiveShadow = true;

    scene.add( object );
    scene.add( line );
    objects.push(object);
    objects.push(line);
  }
}

function randomizeBar(){
  // rectangles
  for (var i = 0; i < 20; i ++) {
    var geometry = new THREE.CubeGeometry(5, Math.random()*200, 5);

    var material = new THREE.MeshNormalMaterial({color: 0x38758A});

    var object = new THREE.Mesh(geometry, material);
    object.position.x = Math.random()* 125;
    object.position.y = 0;
    object.position.z = Math.random()* 125;

    object.receiveShadow = true;

    // leap object controls
    /*
    var objectControls = new THREE.LeapObjectControls(camera, object);

    objectControls.rotateEnabled  = true;
    objectControls.rotateSpeed    = 3;
    objectControls.rotateHands    = 1;
    objectControls.rotateFingers  = [2, 3];
    
    objectControls.scaleEnabled   = true;
    objectControls.scaleSpeed     = 3;
    objectControls.scaleHands     = 1;
    objectControls.scaleFingers   = [4, 5];
    
    objectControls.panEnabled     = true;
    objectControls.panSpeed       = 3;
    objectControls.panHands       = 2;
    objectControls.panFingers     = [6, 12];
    objectControls.panRightHanded = false; // for left-handed person
    */

    /*
    Add cube mesh to your three.js scene
    */
    scene.add(object);
    objects.push(object);
    // objectsControls.push(objectControls);
  }
}

function ingestCSV(){
  
}

function randomizeScatter(){
  // spheres
  for (var i = 0; i < 20; i ++) {
    var geometry = new THREE.SphereGeometry(3, 10, 10);

    var material = new THREE.MeshNormalMaterial( {color: 0x38758A} );

    var object = new THREE.Mesh(geometry, material);
    object.position.x = Math.random()* 125;
    object.position.y = Math.random()* 125;
    object.position.z = Math.random()* 125;

    object.receiveShadow = true;

    // leap object controls
    /*
    var objectControls = new THREE.LeapObjectControls(camera, object);

    objectControls.rotateEnabled  = true;
    objectControls.rotateSpeed    = 3;
    objectControls.rotateHands    = 1;
    objectControls.rotateFingers  = [2, 3];
    
    objectControls.scaleEnabled   = true;
    objectControls.scaleSpeed     = 3;
    objectControls.scaleHands     = 1;
    objectControls.scaleFingers   = [4, 5];
    
    objectControls.panEnabled     = true;
    objectControls.panSpeed       = 3;
    objectControls.panHands       = 2;
    objectControls.panFingers     = [6, 12];
    objectControls.panRightHanded = false; // for left-handed person
    */
    /*
    Add sphere mesh to your three.js scene
    */
    scene.add( object );
    objects.push(object);
    // objectsControls.push(objectControls);
  }
}

function surfacePlot(){
  initGraph();
  
  function initGraph(){
    data = initData();
    var geometry = new THREE.Geometry();
    var colors = [];

    var width = data.length, height = data[0].length;
      data.forEach(function(col){
        col.forEach(function(val){
          geometry.vertices.push(new THREE.Vector3(val.x,val.y,val.z))
          colors.push(getColor(2.5,0,val.z));
        });
    });

    var offset = function(x,y){
      return x*width+y;
    }
    
    for(var x=0;x<width-1;x++){
      for(var y=0;y<height-1;y++){
        var vec0 = new THREE.Vector3(), vec1 = new THREE.Vector3(), n_vec = new THREE.Vector3();
        // one of two triangle polygons in one rectangle
        vec0.subVectors(geometry.vertices[offset(x,y)],geometry.vertices[offset(x+1,y)]);
        vec1.subVectors(geometry.vertices[offset(x,y)],geometry.vertices[offset(x,y+1)]); 
        n_vec.crossVectors(vec0,vec1).normalize();
        geometry.faces.push(new THREE.Face3(offset(x,y),offset(x+1,y),offset(x,y+1), n_vec, [colors[offset(x,y)],colors[offset(x+1,y)],colors[offset(x,y+1)]]));
        geometry.faces.push(new THREE.Face3(offset(x,y),offset(x,y+1),offset(x+1,y), n_vec.negate(), [colors[offset(x,y)],colors[offset(x,y+1)],colors[offset(x+1,y)]]));
        // the other one
        vec0.subVectors(geometry.vertices[offset(x+1,y)],geometry.vertices[offset(x+1,y+1)]);
        vec1.subVectors(geometry.vertices[offset(x,y+1)],geometry.vertices[offset(x+1,y+1)]); 
        n_vec.crossVectors(vec0,vec1).normalize();
        geometry.faces.push(new THREE.Face3(offset(x+1,y),offset(x+1,y+1),offset(x,y+1), n_vec, [colors[offset(x+1,y)],colors[offset(x+1,y+1)],colors[offset(x,y+1)]]));
        geometry.faces.push(new THREE.Face3(offset(x+1,y),offset(x,y+1),offset(x+1,y+1), n_vec.negate(), [colors[offset(x+1,y)],colors[offset(x,y+1)],colors[offset(x+1,y+1)]]));
      }
    }

    var material = new THREE.MeshNormalMaterial( {color: 0x38758A} );
    var mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
  }

  function initData(){
    var BIGIN=-10, END=10;
    var data = new Array();
    for(var x=BIGIN;x<END;x++){
      var row = [];
      for(var y=BIGIN;y<END;y++){
        z = 2.5*(Math.cos(Math.sqrt(x*x+y*y))+1);
        row.push({x: y, y: z, z: x});
      }
      data.push(row);
    }
    return data;
  }

  function getColor(max,min,val){
    var MIN_L=40,MAX_L=100;
    var color = new THREE.Color();
    var h = 0/240;
    var s = 80/240;
    var l = (((MAX_L-MIN_L)/(max-min))*val)/240;
    color.setHSL(h,s,l);
    return color;
  }
}

/*
 * Helper function to update current time on timeseries.
 */
function updateInfo(currentTime){
  $("#infoButton")
       .text(currentTime)
  .css(
  { "z-index":"2",
    "font-size": "50px",
    "background":"rgba(0,0,0,0)", "opacity":"0.9", 
    "position":"absolute", "top":"10px", "left":"10px"
  }); 
}

/*
 * Helper function to update metadata on info.
 */
function updateToolBox(info){
  $("#toolBox")
       .text(info)
  .css(
  { "z-index":"2",
    "font-size": "20px",
    "background":"rgba(0,0,0,0)", "opacity":"0.9", 
    "position":"absolute", "top":"70px", "left":"10px"
  }); 
}