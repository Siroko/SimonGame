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
    this.camera         = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 10000 );
    this.camera.layers.enable( 1 );

    this.scene          = new THREE.Scene();
    this.renderer       = new THREE.WebGLRenderer( { antialias: true } );

    this.cameraControl = new CameraControl( this.camera, new THREE.Vector3(0, 10, 0) );
    
    this.floorPlane = new THREE.Mesh(new THREE.PlaneBufferGeometry(1000, 1000, 1, 1), new THREE.MeshNormalMaterial({
        side: THREE.DoubleSide,
        visible : false
    }));
    this.floorPlane.rotation.x = 0.5 * Math.PI;
    this.floorPlane.position.y = -19;
    this.scene.add( this.floorPlane );

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

    this.worldManager = new WorldManager( this.scene, this.camera, this.renderer, this.cameraControl );

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

    this.cameraControl.update();
    this.cameraControl.getIntersects([this.floorPlane]);

    // Render the scene through the manager.
    this.renderer.setClearColor( 0xFFFFFF );
    this.renderer.setRenderTarget( null ); // add this line
    this.renderer.clear();
    this.renderer.render( this.scene, this.camera );
    this.worldManager.update( timestamp );

};

World3D.prototype.onResize = function( w, h ) {

    this.renderer.setPixelRatio( 1 );
    this.renderer.setSize( w, h );

    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();

};

module.exports = World3D;
