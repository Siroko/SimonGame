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

    this.positionCharacter = new THREE.Vector3( 0, 1.5, 0 );

    this.positionTouch1 = new THREE.Vector3();
    this.worldPosition = new THREE.Vector3();

    this.geom = new THREE.IcosahedronGeometry( 0.8, 2 );
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
    this.mesh.position.copy( this.positionCharacter );

    this.mesh.temporal =this.positionCharacter.clone();

    this.calcPlane = new THREE.Mesh( new THREE.PlaneBufferGeometry( 10, 10, 2, 2), new THREE.MeshNormalMaterial({depthWrite: false, depthTest: false, transparent:true, opacity:0}) );

    this.calcPlane.position.set( 0, 1.5, -1.3 );
    this.calcPlane.rotation.x = Math.PI * 2;

    this.mesh.position.x = 1;
    this.mesh.position.y = 1;
    this.mesh.position.z = 1;
};

CharacterBase.prototype.addEvents = function(){

};

CharacterBase.prototype.update = function( t ){

    this.worldPosition.copy( this.mesh.position );

    this.material.uniforms.uTime.value = t;
    this.material.uniforms.uTouch1.value = this.positionTouch1;
    this.material.uniforms.uWorldPosition.value = this.worldPosition;

    var div = .04;
    this.mesh.position.x -= this.mesh.temporal.x = ( this.mesh.temporal.x + ( this.mesh.position.x - this.positionCharacter.x ) * div ) * 0.84;
    this.mesh.position.y -= this.mesh.temporal.y = ( this.mesh.temporal.y + ( this.mesh.position.y - this.positionCharacter.y ) * div ) * 0.84;
    this.mesh.position.z -= this.mesh.temporal.z = ( this.mesh.temporal.z + ( this.mesh.position.z - this.positionCharacter.z ) * div ) * 0.84;

    var d = this.positionTouch1.distanceTo( this.mesh.position );
    if( d < 1 ){
        var direction = new THREE.Vector3();
        direction.subVectors( this.mesh.position, this.positionTouch1 );
        direction.normalize();
        direction.multiplyScalar( 1 - d );
        this.mesh.position.add( direction );
    }

    //this.mesh.position.y = Math.sin( t * 0.001 ) + 1.5;

};

CharacterBase.prototype.dispose = function(){

};

module.exports = CharacterBase;