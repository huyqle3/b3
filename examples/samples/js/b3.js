/*
Loading b3.js will create a Three.js camera and scene for the project.
The project will have an empty scene and full sized camera.
*/
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 25, window.innerWidth / window.innerHeight, 0.1, 10000 );

function initiate(){
  /*
  Initiate function creates the 3D environment with a world coordinate grid.
  */
	var cameraControls;
	var coords1;
  var coords2;
  var coords3;
	var lastControlsIndex = -1;
  var controlsIndex = -1;
  var index = -1;

	/*
	Setup three.js WebGL renderer.
	*/
	var renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setSize($(window).width(), $(window).height());
	renderer.setClearColor(0xffffff, 1);

	/*
	Append the canvas element created by the renderer to document body element.
	*/
	document.body.appendChild( renderer.domElement );

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
  var lineMaterial = new THREE.LineDashedMaterial({color: 0x000000, dashSize: 1, gapSize: 2});
  var coords = new THREE.Line(lineGeometry, lineMaterial);
  scene.add(coords);

	/*
	OrbitControls is used for mouse coontrols on the Camera.
  LeapCameraControls is used for LeapMotion motion controllers on the camera.
	*/
	var controls = new THREE.OrbitControls( camera, renderer.domElement );
	cameraControls = new THREE.LeapCameraControls(camera);

  cameraControls.rotateEnabled  = true;
  cameraControls.rotateSpeed    = 3;
  cameraControls.rotateHands    = 1;
  cameraControls.rotateFingers  = [2, 3];
    
  cameraControls.zoomEnabled    = true;
  cameraControls.zoomSpeed      = 6;
  cameraControls.zoomHands      = 1;
  cameraControls.zoomFingers    = [4, 5];
  cameraControls.zoomMin        = 50;
  cameraControls.zoomMax        = 2000;
    
  cameraControls.panEnabled     = true;
  cameraControls.panSpeed       = 2;
  cameraControls.panHands       = 2;
  cameraControls.panFingers     = [6, 12];
  cameraControls.panRightHanded = false; // for left-handed people

	/*
	effect variable is used to generate the Virtual Reality effect
	*/
	var effect = new THREE.VREffect( renderer );
	effect.setSize( window.innerWidth, window.innerHeight );

	/*
	Request animation frame loop function
	*/
	function animate() {
		/*
		Apply rotation to cube mesh
		*/
		// cube.rotation.y += 0.01;

		/*
		Use mouse controls and update VR headset position and apply to camera.
		*/
		controls.update();

		/*
		Render the scene with the VR.
		*/
		effect.render( scene, camera );

		requestAnimationFrame( animate );
	}

	/*
	Kick off animation loop with the function above.
	*/
	animate();

	/*
  Leap Motion loads with loop function.
  */
  Leap.loop(function(frame) {
    // Show cursosr is a function from Leap Controls.
    showCursor(frame);

    // Set correct camera control.
    controlsIndex = focusObject(frame);
    if (index == -1) {
      cameraControls.update(frame);
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
  Extra function originally used to render the VR effect.
  */
  function render() {
  	effect.render(scene, camera);
  };

	/*
	Listen for double click event to enter full-screen VR mode
	*/
	document.body.addEventListener( 'dblclick', function() {
		effect.setFullScreen( true );
	});

	/*
	Listen for keyboard event and zero positional sensor on appropriate keypress.
	*/
	function onkey(event) {
  	event.preventDefault();

    // Z key for zero positional
  	if (event.keyCode == 90) {
  		controls.zeroSensor();
  	}
  };

  // Add event listener to listen for the z key.
  window.addEventListener("keydown", onkey, true);

	/*
	Preliminary function to handle window resizes.
	*/
  /*
	function onWindowResize() {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		effect.setSize( window.innerWidth, window.innerHeight );
	}

	window.addEventListener( 'resize', onWindowResize, false );
  */
}

function coordinates(jsonFile){
  var b3Json = null;

  // var b3Json = require(jsonFile);
  $.getJSON(jsonFile, function(json) {
    console.log(json); // this will show the info it in firebug console
  });
  // console.log(b3Json);

	for (var i = 0; i < 20; i ++) {
    var objects = [], objectsControls = [];

		var geometry = new THREE.SphereGeometry(3, 10, 10);

		var material = new THREE.MeshNormalMaterial( {color: 0x38758A} );

		var object = new THREE.Mesh(geometry, material);
		object.position.x = Math.random()* 125;
		object.position.y = Math.random()* 125;
		object.position.z = Math.random()* 125;

		object.receiveShadow = true;

		// leap object controls
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
		scene.add( object );
		objects.push(object);
		objectsControls.push(objectControls);
  }
}