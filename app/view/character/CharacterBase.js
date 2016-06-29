/**
 * Created by siroko on 6/27/16.
 */

var ImprovedNoise = require('./../../utils/ImprovedNoise');
var THREE = require('three');
var vs = require('./../../glsl/vs-basic.glsl');
var fs = require('./../../glsl/fs-basic.glsl');


var CharacterBase = function( initPosition, correct ){

    this.positionCharacter = initPosition.clone();
    this.positionCharacterBase = initPosition.clone();

    this.seed = Math.random();
    this.correct = correct;
    this.setup();
};

CharacterBase.prototype.setup = function(){

    this.positionTouch1 = new THREE.Vector3();
    this.worldPosition = new THREE.Vector3();

    this.geom = new THREE.IcosahedronGeometry( 0.5, 2 );
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

    this.mesh.temporal = this.positionCharacter.clone();

    this.calcPlane = new THREE.Mesh( new THREE.PlaneBufferGeometry( 30, 10, 2, 2), new THREE.MeshNormalMaterial({ transparent: true, opacity: 0, depthTest: false, depthWrite: false}) );
    this.calcPlane.position.set( this.positionCharacter.x, this.positionCharacter.y, this.positionCharacter.z * 0.8);


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
    var base = this.positionCharacterBase.clone();
    if( this.correct ){
        if (d < 0.6) {
           base.copy(this.positionTouch1);
        }
    } else {
        if (d < 0.6) {
            var direction = new THREE.Vector3();
            direction.subVectors(this.mesh.position, this.positionTouch1);
            direction.normalize();
            direction.multiplyScalar(0.6 - d);
            this.mesh.position.add(direction);
        }
    }

    var speed = 0.0005;

    this.positionCharacter.x = base.x + (ImprovedNoise().noise(Date.now() * speed, this.seed, Date.now() * speed) * 0.8);
    this.positionCharacter.y = base.y + (ImprovedNoise().noise(Date.now() * speed, this.seed + Date.now() * speed, Date.now() * speed) * 0.8);
    this.positionCharacter.z = base.z;

    this.mesh.rotation.x = (ImprovedNoise().noise(Date.now() * speed, this.seed, Date.now() * speed) * 0.8);
    this.mesh.rotation.z = (ImprovedNoise().noise( this.seed, Date.now() * speed, Date.now() * speed) * 0.8);

};

CharacterBase.prototype.dispose = function(){

};

module.exports = CharacterBase;