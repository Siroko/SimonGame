/**
 * Created by siroko on 7/13/15.
 */

var THREE = require('three');

var BaseGLPass = function( params ) {

    THREE.EventDispatcher.call( this );

    this.renderer   = params.renderer;

    this.bufferGeometry = null;

    this.sceneRT = new THREE.Scene();
    this.sceneBuffer = new THREE.Scene();

    this.cameraOrto = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, 1, 1000 );
};

BaseGLPass.prototype = Object.create( THREE.EventDispatcher.prototype );


BaseGLPass.prototype.pass = function( material, target ) {

    this.quad.material = material;
    this.renderer.render( this.sceneRT, this.cameraOrto, target );

};

BaseGLPass.prototype.passBuffer = function( material, target ) {

    this.bufferMesh.geometry.material = material;
    this.renderer.render( this.sceneBuffer, this.cameraOrto, target );

};

BaseGLPass.prototype.getRenderTarget = function( w, h, linear ) {

    var renderTarget = new THREE.WebGLRenderTarget( w, h, {
        wrapS           : THREE.RepeatWrapping,
        wrapT           : THREE.RepeatWrapping,
        minFilter       : linear ? THREE.LinearFilter : THREE.NearestFilter,
        magFilter       : linear ? THREE.LinearFilter : THREE.NearestFilter,
        format          : THREE.RGBFormat,
        type            : THREE.HalfFloatType,
        stencilBuffer   : false
    } );

    return renderTarget;
};

module.exports = BaseGLPass;