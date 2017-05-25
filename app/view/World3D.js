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

    // Apply VR headset positional data to camera.
    // this.controls       = new VRControls( this.camera );
    // this.controls.standing = true;

    // Apply VR stereo rendering to renderer.
    // this.effect = new VREffect( this.renderer, null, null, this.onRenderLeft.bind( this ), this.onRenderRight.bind( this ) );

    // this.pointLight = new THREE.PointLight( 0xFFFFFF, 0.4 );
    // this.pointLight.position.set( 0, 3, 1 );
    // this.scene.add( this.pointLight );
    //
    // this.pointLight2 = new THREE.PointLight( 0x446688, 0.2 );
    // this.pointLight2.position.set( 0, 3, 1 );
    // this.scene.add( this.pointLight2 );
    //
    // this.amb = new THREE.AmbientLight( 0x8C857C, 1 );
    // this.scene.add( this.amb );

    // window.pointLights = [ this.pointLight, this.pointLight2 ];

    // this.dummyCamera = new THREE.Object3D();
    // this.dummyCamera.add( this.camera);
    // this.scene.add( this.dummyCamera );

    // Create a VR manager helper to enter and exit VR mode.
    // var params = {
    //     hideButton: false, // Default: false.
    //     isUndistorted: false // Default: false.
    // };

    // this.manager = new WebVRManager( this.renderer, this.effect, params );

    this.cameraControl = new CameraControl( this.camera, new THREE.Vector3(0, 10, 0) );
    this.addEvents();

};

World3D.prototype.onRenderLeft = function() {

};

World3D.prototype.onRenderRight = function() {

};

World3D.prototype.setup = function() {

    this.renderer.setClearColor( 0x000000, 1 );
    this.container.appendChild( this.renderer.domElement );
    this.render( 0 );
};

World3D.prototype.addEvents = function() {

    this.onInitializeManager( null );
    // this.manager.on('initialized', this.onInitializeManager.bind( this ) );
    // this.manager.on('modechange', this.onModeChange.bind( this ) );

};

World3D.prototype.onInitializeManager = function( n, o ) {

    this.worldManager = new WorldManager( this.scene, this.camera, this.dummyCamera, this.renderer );

    // if( !this.manager.isVRCompatible || typeof window.orientation !== 'undefined' ) {

        this.gamePads = new MousePad( this.scene, this.camera, this.worldManager, {} );
        // this.dummyCamera.position.z = 0.9;
        //
        // this.dummyCamera.position.y = - 0.3;

    // } else {
    //
    //     this.gamePads = new GamePads( this.scene, this.camera, this.worldManager, this.effect );
    //
    // }

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

    // this.renderer.setRenderTarget( null ); // add this line
    // this.renderer.clear();
    //
    // // this.renderer.render( this.scene, this.camera );
    //
    // this.renderer.autoClearColor = true;

    this.composer.reset();
    // this.scene.overrideMaterial = this.depthMaterial;
    // this.composer.render( this.scene, this.camera, null, this.depthTexture );
    // this.aoPass.params.tDepth = this.depthTexture.texture;
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
