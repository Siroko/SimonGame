/**
 * Created by siroko on 7/8/15.
 */
var THREE = require('three');

var WorldManager = require('./WorldManager');

var CameraControl = require('./../utils/CameraControl');
var Simulator = require('./../utils/Simulator');

var dat = require('dat-gui');

var World3D = function( container ) {

    this.container      = container;
    this.camera         = new THREE.PerspectiveCamera( 5, window.innerWidth / window.innerHeight, 1, 100000 );
    this.camera.layers.enable( 1 );

    this.scene          = new THREE.Scene();
    this.renderer       = new THREE.WebGLRenderer( { antialias: true } );

    this.cameraControl = new CameraControl( this.camera, new THREE.Vector3(0, 10, 0) );
    this.addEvents();

};

World3D.prototype.setup = function() {

    this.renderer.setClearColor( 0x000000, 1 );
    this.container.appendChild( this.renderer.domElement );
    this.render( 0 );
};

World3D.prototype.addEvents = function() {

    this.onInitializeManager( null );

};

World3D.prototype.onInitializeManager = function( n, o ) {

    this.worldManager = new WorldManager( this.scene, this.camera, this.renderer );

    this.setup();
};

World3D.prototype.onModeChange = function( n, o ) {
    switch( n ){
        case 3 :
            console.log('Passing to VR mode');
            break;
    }
};


World3D.prototype.render = function( timestamp ) {

    window.requestAnimationFrame( this.render.bind( this ) );

    this.worldManager.update( timestamp );
    this.cameraControl.update();

    // Render the scene through the manager.
    this.renderer.setClearColor( 0xFFFFFF );

    this.renderer.render( this.scene, this.camera );

};

World3D.prototype.onResize = function( w, h ) {

    this.renderer.setPixelRatio( 1 );
    this.renderer.setSize( w, h );

    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();

};

module.exports = World3D;
