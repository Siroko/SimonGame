/**
 * Created by siroko on 7/8/15.
 */
var THREE = require('three');
var VRControls = require('../utils/VRControls');
var VREffect = require('../utils/VREffect');
var WorldManager = require('./WorldManager');
var GamePads = require('./gamepads/GamePads');
var MousePad = require('./gamepads/MousePad');

var Simulator = require('./../utils/Simulator');

var Mirror = require('./../utils/Mirror');

var World3D = function( container ) {

    this.container      = container;

    this.camera         = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.1, 10000 );
    this.camera.layers.enable( 1 );

    this.scene          = new THREE.Scene();
    //this.scene.fog      = new THREE.Fog( 0xefd1b5, 100, 1000);

    this.renderer       = new THREE.WebGLRenderer( { antialias: true } );

    // Apply VR headset positional data to camera.
    this.controls       = new VRControls( this.camera );
    this.controls.standing = true;

    // Apply VR stereo rendering to renderer.
    this.effect = new VREffect( this.renderer, null, null, this.onRenderLeft.bind( this ), this.onRenderRight.bind( this ) );

    this.pointLight = new THREE.PointLight( 0xFFFFFF, 0.5 );
    this.pointLight.position.set( 0, 82, 0 );
    this.scene.add( this.pointLight );

     this.pointLight2 = new THREE.PointLight( 0xFF4433, 0.5 );
     this.pointLight2.position.set( 0, 82, 0 );
     this.scene.add( this.pointLight2 );

    this.dummyCamera = new THREE.Object3D();
    this.dummyCamera.add( this.camera);
    this.scene.add( this.dummyCamera );

    // Create a VR manager helper to enter and exit VR mode.
    var params = {
        hideButton: false, // Default: false.
        isUndistorted: false // Default: false.
    };
    this.manager = new WebVRManager( this.renderer, this.effect, params );
    this.addEvents();

    this.simulator = new Simulator({
        sizeW: 8,
        sizeH: 8,
        pointSize: 2,
        renderer: this.renderer
    });

    this.scene.add( this.simulator.bufferMesh );


    this.floorGeom = new THREE.PlaneBufferGeometry( 10, 10, 2 );

    this.groundMirror = new Mirror( this.renderer, this.camera, { clipBias: 1, textureWidth: 1024, textureHeight: 1024, color: 0x777777 } );

    this.mirrorMesh = new THREE.Mesh( this.floorGeom, this.groundMirror.material );
    this.mirrorMesh.add( this.groundMirror );
    this.mirrorMesh.rotateX( - Math.PI / 2 );
    this.scene.add( this.mirrorMesh );

};

World3D.prototype.onRenderLeft = function() {
    console.log('rendering Left', this);

};

World3D.prototype.onRenderRight = function() {
    console.log('rendering Right', this);
};

World3D.prototype.setup = function() {

    this.renderer.setClearColor( 0x000000, 1 );
    this.container.appendChild( this.renderer.domElement );
    this.render( 0 );
};


World3D.prototype.addEvents = function() {

    this.manager.on('initialized', this.onInitializeManager.bind( this ) );
    this.manager.on('modechange', this.onModeChange.bind( this ) );

};

World3D.prototype.onInitializeManager = function( n, o ) {

    if( !this.manager.isVRCompatible || typeof window.orientation !== 'undefined' ) {
        this.gamePads = new MousePad( this.scene, this.camera, this.worldManager, this.effect );
        this.dummyCamera.position.z = 0.3;
        this.dummyCamera.position.y = - 0.3;
    } else {
        this.gamePads = new GamePads( this.scene, this.camera, this.worldManager, this.effect );
    }

    this.worldManager = new WorldManager( this.scene, this.camera, this.gamePads, this.dummyCamera, this.renderer );

    this.pointer = new THREE.Mesh( new THREE.SphereBufferGeometry( 0.01, 10, 10), new THREE.MeshNormalMaterial({
        transparent:true
    }) );
    this.scene.add( this.pointer );

    this.setup();
};

World3D.prototype.onModeChange = function( n, o ) {
    switch(n){
        case 3 :
            console.log('Passing to VR mode');
            break;
    }
};

World3D.prototype.render = function( timestamp ) {

    window.requestAnimationFrame( this.render.bind( this ) );

    this.groundMirror.render();
    this.gamePads.update( timestamp, this.worldManager.charactersCalcPlane );

    this.worldManager.update( timestamp );
    // Update VR headset position and apply to camera.
    this.controls.update();

    this.simulator.update();
    // Render the scene through the manager.
    this.renderer.setClearColor( 0x202020 );
    this.renderer.setRenderTarget( null ); // add this line
    this.manager.render( this.scene, this.camera, timestamp);

    this.pointer.position.copy( this.gamePads.intersectPoint );

};

World3D.prototype.onResize = function( w, h ) {

    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.effect.setSize( w, h );
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    //
    //this.renderer.domElement.style.width = "100%";
    //this.renderer.domElement.style.height = "100%";
};

module.exports = World3D;
