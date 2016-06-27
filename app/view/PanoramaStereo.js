/**
 * Created by siroko on 5/27/16.
 */

var THREE = require('three');

var vs_panorama = require('../glsl/vs-basic.glsl');
var fs_panorama = require('../glsl/fs-spheric-stereo-panorama.glsl');

var PanoramaStereo = function(){

    this.init();
    this.addEvents();
};

PanoramaStereo.prototype.init = function() {

    this.screenVector = new THREE.Vector3( 0, 0, 0.5 );
    this.raycaster = new THREE.Raycaster();

    this.video = document.createElement('video');
    this.video.src = 'assets/video3d_2048.mp4';
    makeVideoPlayableInline(this.video);

    //this.texture1 = new THREE.VideoTexture( this.video, null, THREE.ClampToEdgeWrapping, THREE.ClampToEdgeWrapping, null, THREE.NearestFilter  );

    this.texture1 = THREE.ImageUtils.loadTexture('assets/scene.png');
    this.angle = new THREE.Vector2();

    this.geom = new THREE.SphereBufferGeometry( 1000, 10, 10 );
    this.matL = new THREE.RawShaderMaterial({
        side: THREE.BackSide,
        uniforms:{
            'offsetEye': { value: 0 },
            'texture1': { value: this.texture1 },
            'texture2': { value: this.texture1 },
            'angle': {value: this.angle}
        },

        vertexShader: vs_panorama,
        fragmentShader: fs_panorama
    });

    this.matR = new THREE.RawShaderMaterial({
        side: THREE.BackSide,
        uniforms:{
            'offsetEye': { value: 0.5 },
            'texture1': { value: this.texture1 },
            'texture2': { value: this.texture1 },
            'angle': {value: this.angle}
        },

        vertexShader: vs_panorama,
        fragmentShader: fs_panorama
    });

    this.eyeL = new THREE.Mesh( this.geom, this.matL );
    this.eyeL.layers.set( 1 );

    this.eyeR = new THREE.Mesh( this.geom, this.matR );
    this.eyeR.layers.set( 2 );
};

PanoramaStereo.prototype.addEvents = function( ) {
    window.addEventListener('touchstart', this.onTouchStart.bind( this ) );
    window.addEventListener('mousedown', this.onTouchStart.bind( this ) );
};

PanoramaStereo.prototype.onTouchStart = function( e ) {
    console.log('click');
    this.video.play();
};

module.exports = PanoramaStereo;