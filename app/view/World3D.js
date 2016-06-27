/**
 * Created by siroko on 7/8/15.
 */
var THREE = require('three');
var VRControls = require('../utils/VRControls');
var VREffect = require('../utils/VREffect');
var Model = require('../model/ModelData');
var PanoramaStereo = require('./PanoramaStereo');

var World3D = function( container ) {

    this.model          = new Model();

    this.container      = container;

    this.camera         = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 100000 );
    this.camera.layers.enable( 1 );

    this.scene          = new THREE.Scene();
    this.renderer       = new THREE.WebGLRenderer( { antialias: true, logarithmicDepthBuffer: true } );

    // Apply VR headset positional data to camera.
    this.controls       = new VRControls(this.camera);

    this.panoramaStereo = new PanoramaStereo();

    // Apply VR stereo rendering to renderer.
    this.effect = new VREffect( this.renderer );

    // Create a VR manager helper to enter and exit VR mode.
    var params = {
        hideButton: false, // Default: false.
        isUndistorted: true // Default: false.
    };

    this.manager = new WebVRManager( this.renderer, this.effect, params );

    this.setup();
};

World3D.prototype.setup = function() {

    this.renderer.setClearColor( 0x000000, 1 );
    this.container.appendChild( this.renderer.domElement );

    this.scene.add( this.panoramaStereo.eyeL );
    this.scene.add( this.panoramaStereo.eyeR );

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
