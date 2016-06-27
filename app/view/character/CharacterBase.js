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

    this.geom = new THREE.SphereBufferGeometry( 0.5, 20, 20 );
    this.material = new THREE.ShaderMaterial({
        uniforms: {
            'uTime': { type:'f', value:0 }
        },
        vertexShader: vs,
        fragmentShader: fs,
        shading: THREE.FlatShading,
        side: THREE.DoubleSide
    } );

    this.mesh = new THREE.Mesh( this.geom, this.material );
    this.mesh.castShadow = true;
    this.mesh.position.set( 0, 1.5, -1.3 );

};

CharacterBase.prototype.addEvents = function(){

};

CharacterBase.prototype.update = function( t ){

    this.material.uniforms.uTime.value = t;

};

CharacterBase.prototype.dispose = function(){

};

module.exports = CharacterBase;