/**
 * Created by siroko on 5/30/16.
 */

var THREE = require('three');
var OBJLoader = require('./../utils/OBJLoader');
var GPUGeometrySimulation = require('./../utils/GPUGeometrySimulation');
var ShadowMapViewer = require('./../utils/ShadowMapViewer');
var triangleOBJ = require('../assets/cube.obj');

var WorldManager = function( scene, camera, renderer, cameraControl ) {

    THREE.EventDispatcher.call( this );

    this.renderer = renderer;

    this.camera = camera;
    this.scene = scene;
    this.cameraControl = cameraControl;

    this.setup();
    this.setupShadows();
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
    var scale = 0.98;

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

    this.floor = new THREE.Mesh(new THREE.PlaneBufferGeometry(1000, 1000, 2, 2), new THREE.MeshPhongMaterial({
        color:0xEEEEEE,
        specular: 0x111111,
        emissive: 0x0000000,
        shininess: 0,
        side: THREE.DoubleSide
    }));

    this.floor.rotation.x = Math.PI * 1.5;
    this.floor.position.y = -45;
    this.scene.add(this.floor);

};

WorldManager.prototype.setupShadows = function() {

    var SHADOW_MAP_WIDTH = 512;
    var SHADOW_MAP_HEIGHT = 512;

    // LIGHTS
    this.scene.add(new THREE.AmbientLight(0xCCCCCC));
    this.light = new THREE.SpotLight( 0x222222);
    this.light.penumbra = 0.1;
    this.light.decay = 2;

    this.light.position.set( 0, 250, 0 );
    this.light.target.position.set( 0, 0, 0 );

    this.light.castShadow = true;
    this.light.shadow = new THREE.LightShadow( new THREE.PerspectiveCamera( 120, 1, 100, 400 ) );
    this.light.shadow.map = new THREE.WebGLRenderTarget( SHADOW_MAP_WIDTH, SHADOW_MAP_HEIGHT, {
        wrapS: THREE.ClampToEdgeWrapping,
        wrapT: THREE.ClampToEdgeWrapping,
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        type: THREE.FloatType,
        stencilBuffer: false,
        depthBuffer: false,
        generateMipmaps: false
    });

    // this.light.shadow.bias = 0.000001;
    this.light.shadow.mapSize.width = SHADOW_MAP_WIDTH;
    this.light.shadow.mapSize.height = SHADOW_MAP_HEIGHT;

    this.scene.add( this.light );
    this.renderer.autoClear = false;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.floor.castShadow = true;
    this.floor.receiveShadow = true;

    // this.scene.add(  new THREE.CameraHelper( this.light.shadow.camera ) );
    //
    // this.lightShadowMapViewer = new ShadowMapViewer( this.light );
    // this.lightShadowMapViewer.position.x = 0;
    // this.lightShadowMapViewer.position.y = 0;
    // this.lightShadowMapViewer.size.width = 256;
    // this.lightShadowMapViewer.size.height = 256;
    // this.lightShadowMapViewer.update();

};

WorldManager.prototype.addEvents = function() {
    window.addEventListener( 'keydown', this.onKeydown.bind( this ) );
};

WorldManager.prototype.onKeydown = function( e ) {

};

WorldManager.prototype.update = function( timestamp ) {

    if( this.gpuGeometrySimulation ) {

        this.gpuGeometrySimulation.update( timestamp );
        var d = 0.05 + (this.cameraControl.distanceScreen * 20);
        d = d > 1 ? 1 : d;

        this.gpuGeometrySimulation.simulator.updatePositionsMaterial.uniforms.uMousePosition.value.x += (this.cameraControl.intersectPoint.x - this.gpuGeometrySimulation.simulator.updatePositionsMaterial.uniforms.uMousePosition.value.x) / 5;
        this.gpuGeometrySimulation.simulator.updatePositionsMaterial.uniforms.uMousePosition.value.y += (this.cameraControl.intersectPoint.y - this.gpuGeometrySimulation.simulator.updatePositionsMaterial.uniforms.uMousePosition.value.y) / 5;
        this.gpuGeometrySimulation.simulator.updatePositionsMaterial.uniforms.uMousePosition.value.z += (this.cameraControl.intersectPoint.z - this.gpuGeometrySimulation.simulator.updatePositionsMaterial.uniforms.uMousePosition.value.z) / 5;
        this.gpuGeometrySimulation.simulator.updatePositionsMaterial.uniforms.uRadius.value += (d - this.gpuGeometrySimulation.simulator.updatePositionsMaterial.uniforms.uRadius.value) / 10;
    }

    // if( this.lightShadowMapViewer ) this.lightShadowMapViewer.render(this.renderer);

};

module.exports = WorldManager;
