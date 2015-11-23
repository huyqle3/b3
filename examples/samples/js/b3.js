/*
Create a three.js scene
*/
var scene = new THREE.Scene();

var camera = new THREE.PerspectiveCamera( 25, window.innerWidth / window.innerHeight, 0.1, 10000 );

var objects = [], objectsControls = [];

function initiate(){
	var cameraControls;
	var coords1, coords2, coords3;
	var lastControlsIndex = -1, controlsIndex = -1, index = -1;

	/*
	Setup three.js WebGL renderer
	*/
	var renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setSize($(window).width(), $(window).height());
	renderer.setClearColor(0xffffff, 1);

	/*
	Append the canvas element created by the renderer to document body element.
	*/
	document.body.appendChild( renderer.domElement );

	/*
	Create a three.js camera
	*/
	camera.position.x = 200;
    camera.position.y = 200;
    camera.position.z = 200;
   	
	var origin = new THREE.Vector3(0, 0, 0);
	camera.lookAt(origin);

    // world coordinate system (thin dashed helping lines)
    var lineGeometry = new THREE.Geometry();
    var vertArray = lineGeometry.vertices;
    vertArray.push(new THREE.Vector3(150, 0, 0), origin, new THREE.Vector3(0, 150, 0), origin, new THREE.Vector3(0, 0, 150));
    lineGeometry.computeLineDistances();
    var lineMaterial = new THREE.LineDashedMaterial({color: 0x000000, dashSize: 1, gapSize: 2});
    var coords = new THREE.Line(lineGeometry, lineMaterial);
    scene.add(coords);

	/*
	Apply VR headset orientation and positional to camera.
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
    cameraControls.panRightHanded = false; // for left-handed person


	/*
	Apply VR stereo rendering to renderer
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
		Update VR headset position and apply to camera.
		*/
		controls.update();

		/*
		Render the scene through the VREffect.
		*/
		effect.render( scene, camera );

		requestAnimationFrame( animate );
	}

	/*
	Kick off animation loop
	*/
	animate();

	// leap loop
    Leap.loop(function(frame) {
      // show cursor
      showCursor(frame);

      // set correct camera control
      controlsIndex = focusObject(frame);
      if (index == -1) {
        cameraControls.update(frame);
      } else {
        objectsControls[index].update(frame);
      };

      effect.render(scene, camera);
    });

    // detect controls change
    setInterval(changeControlsIndex, 250);

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

	if (event.keyCode == 90) { // z
		controls.zeroSensor();
	}
  	};

  window.addEventListener("keydown", onkey, true);


	/*
	Handle window resizes
	*/
	function onWindowResize() {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		effect.setSize( window.innerWidth, window.innerHeight );
	}

	window.addEventListener( 'resize', onWindowResize, false );
}

function createPoints(){
	for (var i = 0; i < 20; i ++) {
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