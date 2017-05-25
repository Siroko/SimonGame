/**
 * Created by siroko on 5/30/16.
 */

var THREE = require('three');
var OBJLoader = require('./../utils/OBJLoader');
var GPUGeometrySimulation = require('./../utils/GPUGeometrySimulation');

var WorldManager = function( scene, camera, dummyCamera, renderer ) {

    THREE.EventDispatcher.call( this );

    this.renderer = renderer;

    this.camera = camera;
    this.scene = scene;

    this.setup();
    this.addEvents();

};

WorldManager.prototype = Object.create( THREE.EventDispatcher.prototype );

WorldManager.prototype.setup = function(){

    var manager = new THREE.LoadingManager();
    manager.onProgress = function ( item, loaded, total ) {

        console.log( item, loaded, total );

    };

    var onProgress = function ( xhr ) {
        if ( xhr.lengthComputable ) {
            var percentComplete = xhr.loaded / xhr.total * 100;
            console.log( Math.round(percentComplete, 2) + '% downloaded' );
        }
    };

    var onError = function ( xhr ) {
    };

    // model
    var loader = new OBJLoader( manager );
    loader.load( 'assets/models/asteroid.obj', (function ( object ) {

        var s = 128;
        var square = s * s;
        var initialBuffer = new Float32Array( square * 4, 4 );
        var div = 1 / s;
        var scale = 1;
        for (var i = 0; i < square ; i++) {
            initialBuffer[ i * 4 ] = ( 2. * div * ( ( i % s ) + 0.5 ) - 1 ) * s * (1) * scale;
            initialBuffer[ i * 4 + 1 ] = -10;
            initialBuffer[ i * 4 + 2 ] = ( 2. * div * ( Math.floor( i * div ) + 0.5 ) - 1 ) * s * (0.25) * scale;
            initialBuffer[ i * 4 + 3 ] = 1;

        }

        this.gpuGeometrySimulation = new GPUGeometrySimulation( {
            geom : object.children[0].geometry,
            initialBuffer: initialBuffer,
            heightMap: THREE.ImageUtils.loadTexture('assets/textures/heightN_USA.png'),
            colorMap: THREE.ImageUtils.loadTexture('assets/textures/KOO1KLOWNKL4N.jpg'),
            sizeSimulation: mobilecheck() ? s * 0.5 : s,
            isMobile: mobilecheck(),
            renderer: this.renderer
        } );

        this.scene.add( this.gpuGeometrySimulation.bufferMesh );

    } ).bind( this ), onProgress, onError );

};

WorldManager.prototype.addEvents = function() {
    window.addEventListener( 'keydown', this.onKeydown.bind( this ) );
};

WorldManager.prototype.onKeydown = function( e ) {

};

WorldManager.prototype.update = function( timestamp, gamePads ) {

    if( this.gpuGeometrySimulation ) this.gpuGeometrySimulation.update( timestamp );

};

module.exports = WorldManager;
