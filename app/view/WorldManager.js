/**
 * Created by siroko on 5/30/16.
 */

var THREE = require('three');
var OBJLoader = require('./../utils/OBJLoader');
var GPUGeometrySimulation = require('./../utils/GPUGeometrySimulation');
var triangleOBJ = require('../assets/cube.obj');

var WorldManager = function( scene, camera, renderer, cameraControl ) {

    THREE.EventDispatcher.call( this );

    this.renderer = renderer;

    this.camera = camera;
    this.scene = scene;
    this.cameraControl = cameraControl;

    this.setup();
    this.addEvents();

};

WorldManager.prototype = Object.create( THREE.EventDispatcher.prototype );

WorldManager.prototype.setup = function(){

    var manager = new THREE.LoadingManager();
    manager.onProgress = function ( item, loaded, total ) {

        console.log( item, loaded, total );

    };

    // model
    var loader = new OBJLoader( manager );
    var object = loader.parse(triangleOBJ);

    var s = 256;
    var square = s * s;
    var initialBuffer = new Float32Array( square * 4, 4 );
    var div = 1 / s;
    var scale = 0.9;
    for (var i = 0; i < square ; i++) {
        initialBuffer[ i * 4 ] = ( 2. * div * ( ( i % s ) + 0.5 ) - 1 ) * s * (1) * scale;
        initialBuffer[ i * 4 + 1 ] = -10;
        initialBuffer[ i * 4 + 2 ] = ( 2. * div * ( Math.floor( i * div ) + 0.5 ) - 1 ) * s * (1) * scale;
        initialBuffer[ i * 4 + 3 ] = Math.random() * 10;
    }

    var artworkImg = new Image();
    var artworkTexture = new THREE.Texture();
    artworkImg.onload = ( function () {

        artworkTexture.image = artworkImg;
        artworkTexture.needsUpdate = true;

        var lettersImg = new Image();
        var lettersTexture = new THREE.Texture();

        lettersImg.onload = (function(){

            lettersTexture.image = lettersImg;
            lettersTexture.needsUpdate = true;

            this.gpuGeometrySimulation = new GPUGeometrySimulation( {
                geom : object.children[0].geometry,
                initialBuffer: initialBuffer,
                heightMap: lettersTexture,
                colorMap: artworkTexture,
                sizeSimulation: mobilecheck() ? s * 0.5 : s,
                isMobile: mobilecheck(),
                renderer: this.renderer
            } );

            this.scene.add( this.gpuGeometrySimulation.bufferMesh );

        }).bind(this);

        lettersImg.src = window.lettersImg;

    }).bind(this);

    artworkImg.src = window.artworkImg;

};

WorldManager.prototype.addEvents = function() {
    window.addEventListener( 'keydown', this.onKeydown.bind( this ) );
};

WorldManager.prototype.onKeydown = function( e ) {

};

WorldManager.prototype.update = function( timestamp ) {

    if( this.gpuGeometrySimulation ){

        this.gpuGeometrySimulation.update( timestamp );
        var d = 0.05 + (this.cameraControl.distanceScreen * 20);
        d = d > 1 ? 1 : d;

        this.gpuGeometrySimulation.simulator.updatePositionsMaterial.uniforms.uMousePosition.value.x += (this.cameraControl.intersectPoint.x - this.gpuGeometrySimulation.simulator.updatePositionsMaterial.uniforms.uMousePosition.value.x) / 5;
        this.gpuGeometrySimulation.simulator.updatePositionsMaterial.uniforms.uMousePosition.value.y += (this.cameraControl.intersectPoint.y - this.gpuGeometrySimulation.simulator.updatePositionsMaterial.uniforms.uMousePosition.value.y) / 5;
        this.gpuGeometrySimulation.simulator.updatePositionsMaterial.uniforms.uMousePosition.value.z += (this.cameraControl.intersectPoint.z - this.gpuGeometrySimulation.simulator.updatePositionsMaterial.uniforms.uMousePosition.value.z) / 5;
        this.gpuGeometrySimulation.simulator.updatePositionsMaterial.uniforms.uRadius.value += (d - this.gpuGeometrySimulation.simulator.updatePositionsMaterial.uniforms.uRadius.value) / 10;
    }

};

module.exports = WorldManager;
