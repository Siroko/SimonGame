/**
 * Created by siroko on 7/8/15.
 */
var THREE = require('three');
var VRControls = require('../utils/VRControls');
var VREffect = require('../utils/VREffect');
var WorldManager = require('./WorldManager');
var GamePads = require('./gamepads/GamePads');
var MousePad = require('./gamepads/MousePad');

var World3D = function( container ) {

    this.container      = container;

    this.camera         = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.1, 10000 );
    this.camera.layers.enable( 1 );

    this.scene          = new THREE.Scene();
    this.renderer       = new THREE.WebGLRenderer( { antialias: true } );
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;

    // Apply VR headset positional data to camera.
    this.controls       = new VRControls( this.camera );
    this.controls.standing = true;

    // Apply VR stereo rendering to renderer.
    this.effect = new VREffect( this.renderer );

    this.pointLight = new THREE.PointLight( 0xFFFFFF, 1 );
    this.pointLight.position.set( -75, 82, 57 );
    this.scene.add( this.pointLight );

    this.dummyCamera = new THREE.Object3D();
    this.dummyCamera.add( this.camera);
    this.scene.add( this.dummyCamera );

    // Create a VR manager helper to enter and exit VR mode.
    var params = {
        hideButton: false, // Default: false.
        isUndistorted: true // Default: false.
    };
    this.manager = new WebVRManager( this.renderer, this.effect, params );
    this.addEvents();

};

World3D.prototype.setup = function() {

    this.renderer.setClearColor( 0x000000, 1 );
    this.container.appendChild( this.renderer.domElement );
    this.render();
};


World3D.prototype.addEvents = function() {

    this.manager.on('initialized', this.onInitializeManager.bind( this ) );
    this.manager.on('modechange', this.onModeChange.bind( this ) );

};

World3D.prototype.onInitializeManager = function( n, o ) {

    if( !this.manager.isVRCompatible || typeof window.orientation !== 'undefined' ) {
        this.gamePads = new MousePad( this.scene, this.camera, this.worldManager, this.effect );
        this.dummyCamera.position.z = 4;
    } else {
        this.gamePads = new GamePads( this.scene, this.camera, this.worldManager, this.effect );
    }

    this.worldManager = new WorldManager( this.scene, this.camera, this.gamePads );

    this.pointer = new THREE.Mesh( new THREE.SphereBufferGeometry( 0.1, 10, 10), new THREE.MeshNormalMaterial() );
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

    this.gamePads.update( timestamp, [this.worldManager.character.calcPlane, this.worldManager.character2.calcPlane, this.worldManager.character3.calcPlane] );
    this.worldManager.update( timestamp );
    // Update VR headset position and apply to camera.
    this.controls.update();
    // Render the scene through the manager.
    this.manager.render( this.scene, this.camera, timestamp);

    this.pointer.position.copy( this.gamePads.intersectPoint );
};

World3D.prototype.onResize = function( w, h ) {

    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.effect.setSize( w, h );
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
};

module.exports = World3D;
