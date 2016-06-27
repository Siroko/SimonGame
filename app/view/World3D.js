/**
 * Created by siroko on 7/8/15.
 */
var THREE = require('three');
var VRControls = require('../utils/VRControls');
var VREffect = require('../utils/VREffect');
var Model = require('../model/ModelData');
var WorldManager = require('./WorldManager');

var World3D = function( container ) {

    this.model          = new Model();

    this.container      = container;

    this.camera         = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 10000 );
    this.camera.layers.enable( 1 );

    this.scene          = new THREE.Scene();
    this.renderer       = new THREE.WebGLRenderer( { antialias: true, logarithmicDepthBuffer: true } );
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;

    // Apply VR headset positional data to camera.
    this.controls       = new VRControls(this.camera);
    this.controls.standing = true;

    // Apply VR stereo rendering to renderer.
    this.effect = new VREffect( this.renderer );

    var SHADOW_MAP_WIDTH, SHADOW_MAP_HEIGHT;
    SHADOW_MAP_WIDTH = SHADOW_MAP_HEIGHT = 64;
    this.pointLight = new THREE.PointLight( 0xFFFFFF, 1 );
    this.pointLight.position.set( -75, 82, 57 );
    this.pointLight.castShadow = true;
    this.pointLight.shadow.bias = -.0000025;
    this.pointLight.shadow.mapSize.width = SHADOW_MAP_WIDTH;
    this.pointLight.shadow.mapSize.height = SHADOW_MAP_HEIGHT;

    this.scene.add( this.pointLight );

    // Create a VR manager helper to enter and exit VR mode.
    var params = {
        hideButton: false, // Default: false.
        isUndistorted: true // Default: false.
    };
    this.worldManager = new WorldManager( this.scene, this.camera );
    this.manager = new WebVRManager( this.renderer, this.effect, params );

    this.setup();
};

World3D.prototype.setup = function() {

    this.renderer.setClearColor( 0x000000, 1 );
    this.container.appendChild( this.renderer.domElement );

    this.addEvents();
    this.render();
};


World3D.prototype.addEvents = function() {

    this.manager.on('modechange', this.onModeChange.bind( this ) );

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

    // Update VR headset position and apply to camera.
    this.controls.update();
    // Render the scene through the manager.
    this.manager.render( this.scene, this.camera, timestamp);

};

World3D.prototype.onResize = function( w, h ) {

    this.renderer.setPixelRatio( window.devicePixelRatio );

    this.effect.setSize( w, h );

    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();

    //this.renderer.setSize( w, h );

};

module.exports = World3D;
