/**
 * Created by siroko on 7/8/15.
 */
var THREE = require('three');
var WAGNER = require('@superguigui/wagner');
var BloomPass = require('@superguigui/wagner/src/passes/bloom/MultiPassBloomPass');
var NoisePass = require('@superguigui/wagner/src/passes/noise/noise');
var AOPass = require('@superguigui/wagner/src/passes/ssao/ssaopass');
var FXAAPass = require('@superguigui/wagner/src/passes/fxaa/FXAAPass');
var TiltShiftPass = require('@superguigui/wagner/src/passes/tiltshift/tiltshiftPass');
var VignettePass = require('@superguigui/wagner/src/passes/vignette/VignettePass');
var RGBPass = require('@superguigui/wagner/src/passes/rgbsplit/rgbsplit');
var depth_vs = require('./../glsl/vs-packed-depth.glsl');
var depth_fs = require('./../glsl/fs-packed-depth.glsl');

var WorldManager = require('./WorldManager');
var GamePads = require('./gamepads/GamePads');
var MousePad = require('./gamepads/MousePad');

var CameraControl = require('./../utils/CameraControl');
var Simulator = require('./../utils/Simulator');

var dat = require('dat-gui');

var World3D = function( container ) {

    this.container      = container;
    this.camera         = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.01, 10000 );
    this.camera.layers.enable( 1 );

    this.scene          = new THREE.Scene();
    this.renderer       = new THREE.WebGLRenderer( { antialias: true } );

    this.postprocessing = {};

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

    this.worldManager = new WorldManager( this.scene, this.camera, this.dummyCamera, this.renderer );
    this.gamePads = new MousePad( this.scene, this.camera, this.worldManager, {} );


    this.initPostprocessing();
    this.setup();
};

World3D.prototype.onModeChange = function( n, o ) {
    switch( n ){
        case 3 :
            console.log('Passing to VR mode');
            break;
    }
};

World3D.prototype.initPostprocessing = function() {

    this.composer = new WAGNER.Composer( this.renderer, { useRGBA: false } );

    this.depthMaterial = new THREE.ShaderMaterial( {
        uniforms: {
            mNear: { type: 'f', value: this.camera.near },
            mFar: { type: 'f', value: this.camera.far }
        },
        vertexShader: depth_vs,
        fragmentShader: depth_fs,
        shading: THREE.SmoothShading
    } );

    this.bloomPass = new BloomPass({
        blurAmount: 3,
        applyZoomBlur: true
    });

    this.aoPass = new AOPass();
    this.aoPass.params.isPacked = false;
    this.aoPass.params.onlyOcclusion = false;
    this.fxaaPass = new FXAAPass();
    this.noisePass = new NoisePass();
    this.noisePass.params.amount = 0.05;

    this.vignettePass = new VignettePass({
        boost: 1,
        reduction: 1

    });

    this.rgbPass = new RGBPass({
        delta: new THREE.Vector2( 3, 2 )
    });

    this.tiltShiftPass = new TiltShiftPass();
    this.tiltShiftPass.params.center = 1.1;
    this.tiltShiftPass.params.bluramount = 1;
    this.tiltShiftPass.params.stepSize = 0.003;

    this.onResize( window.innerWidth, window.innerHeight );
};

World3D.prototype.render = function( timestamp ) {

    window.requestAnimationFrame( this.render.bind( this ) );

    this.worldManager.update( timestamp, this.gamePads );
    this.cameraControl.update();

    // Render the scene through the manager.
    this.renderer.setClearColor( 0xFFFFFF );

    this.composer.reset();
    this.composer.render( this.scene, this.camera );

    this.composer.pass( this.tiltShiftPass );
    this.composer.pass( this.noisePass );
    this.composer.pass( this.vignettePass );
    this.composer.pass( this.rgbPass );

    this.composer.toScreen();

};

World3D.prototype.onResize = function( w, h ) {

    this.renderer.setPixelRatio( 1 );
    this.renderer.setSize( w, h );
    this.composer.setSize( w , h );
    this.depthTexture = new THREE.WebGLRenderTarget(w, h, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBFormat
    });
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();

};

module.exports = World3D;
