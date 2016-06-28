/**
 * Created by siroko on 6/27/16.
 */

var THREE = require('three');
var vs = require('./../../glsl/vs-basic.glsl');
var fs = require('./../../glsl/fs-basic.glsl');

var CharacterBase = function(){
    this.setup();
};

CharacterBase.prototype.setup = function(){

    this.positionTouch1 = new THREE.Vector3();
    this.worldPosition = new THREE.Vector3();

    this.geom = new THREE.SphereBufferGeometry( 0.8, 20, 20 );
    this.material = new THREE.ShaderMaterial({
        uniforms: {
            'uTime': { type:'f', value:0 },
            'uTouch1': { type:'v3', value: this.positionTouch1 },
            'uWorldPosition': { type:'v3', value: this.worldPosition }
        },
        vertexShader: vs,
        fragmentShader: fs,
        shading: THREE.FlatShading,
        side: THREE.DoubleSide
    } );

    this.mesh = new THREE.Mesh( this.geom, this.material );
    this.mesh.castShadow = true;
    this.mesh.position.set( 0, .5, -1 );


    this.calcPlane = new THREE.Mesh( new THREE.PlaneBufferGeometry( 10, 10, 2, 2), new THREE.MeshNormalMaterial({depthWrite: false, depthTest: false, transparent:true, opacity:0}) );

    this.calcPlane.position.set( 1, .5, -1 );
    this.calcPlane.rotation.x = Math.PI * 2;


};

CharacterBase.prototype.addEvents = function(){

};

CharacterBase.prototype.update = function( t ){

    this.worldPosition.copy( this.mesh.position );

    this.material.uniforms.uTime.value = t;
    this.material.uniforms.uTouch1.value = this.positionTouch1;
    this.material.uniforms.uWorldPosition.value = this.worldPosition;

    //this.mesh.position.y = Math.sin( t * 0.001 ) + 1.5;

};

CharacterBase.prototype.dispose = function(){

};

module.exports = CharacterBase;