/**
 * Created by siroko on 6/27/16.
 */

var ImprovedNoise = require('./../../utils/ImprovedNoise');
var THREE = require('three');
var vs = require('./../../glsl/vs-basic.glsl');
var fs = require('./../../glsl/fs-basic.glsl');


var CharacterBase = function( initPosition, correct, name, scale ){

    this.name = name;
    this.cuddleness = 100;
    this.life = 100;

    this.scale = scale;

    this.positionCharacter = initPosition.clone();
    this.positionCharacterBase = initPosition.clone();

    this.seed = Math.random();
    this.correct = correct;

    this.regularTexture = THREE.ImageUtils.loadTexture('assets/faceCreature.png');
    this.happyTexture = THREE.ImageUtils.loadTexture('assets/faceCreatureHappy.png');

    this.returnFaceTimer = 0;

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
        transparent: true,
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


    this.faceMaterial = new THREE.MeshBasicMaterial({
        map: this.regularTexture,
        transparent: true,
        depthWrite: false,
        depthTest: false
    });
    this.faceGeom = new THREE.PlaneBufferGeometry(0.6, 0.3, 2, 2);
    this.facePlane = new THREE.Mesh( this.faceGeom, this.faceMaterial );
    this.facePlane.rotation.x = Math.PI * 2;
    this.facePlane.position.z = 0.3;

    this.mesh.add( this.facePlane );
    this.mesh.scale.set( this.scale, this.scale, this.scale );

    this.createLifeCuddleBars();
};

CharacterBase.prototype.createLifeCuddleBars = function(){

    this.lifeMat = new THREE.MeshBasicMaterial({
        color: 0xFFFFFF
    });

    this.lifeGeom = new THREE.BoxBufferGeometry(0.1, 0.5, 0.1, 2, 2, 2);
    this.lifeMesh = new THREE.Mesh( this.lifeGeom, this.lifeMat );
    this.lifeMesh.position.y = -0.6;
    this.lifeMesh.rotation.z = Math.PI * 0.5;
    this.mesh.add( this.lifeMesh );

    this.cuddleMat = new THREE.MeshBasicMaterial({
        color: 0x00FF55
    });

    this.cuddleMesh = new THREE.Mesh( this.lifeGeom, this.cuddleMat );
    this.cuddleMesh.position.y = -0.75;
    this.cuddleMesh.rotation.z = Math.PI * 0.5;
    this.mesh.add( this.cuddleMesh );

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
        if ( d < ( 0.5 * this.scale ) ) {

            var direction = new THREE.Vector3();
            direction.subVectors(this.mesh.position, this.positionTouch1);
            direction.normalize();
            direction.multiplyScalar((0.5 * this.scale) - d);
            this.mesh.position.add(direction);

            this.cuddleness += 0.5;

            this.faceMaterial.map = this.happyTexture;
            clearTimeout( this.returnFaceTimer );
            this.returnFaceTimer = setTimeout( this.returnFaceBack.bind( this ), 500 );

            if( this.cuddleness > 100 ) this.cuddleness = 100;

        } else {
            this.cuddleness -= 0.09;
            if( this.cuddleness < 0 ) this.cuddleness = 0.0001;
        }
    }

    if( this.cuddleness <= 0.0001 ){
        this.life -= 0.9;
        if( this.life < 0 ) this.life = 0.0001;
    }

    var lpercent = this.life / 100;
    var cpercent = this.cuddleness / 100;

    this.lifeMesh.scale.y = lpercent;
    this.cuddleMesh.scale.y = cpercent;

    var speed = 0.0005;

    this.positionCharacter.x = base.x + (ImprovedNoise().noise(Date.now() * speed, this.seed, Date.now() * speed) * (0.8 * this.scale));
    this.positionCharacter.y = base.y + (ImprovedNoise().noise(Date.now() * speed, this.seed + Date.now() * speed, Date.now() * speed) * (0.8 * this.scale));
    this.positionCharacter.z = base.z;

    this.mesh.rotation.x = (ImprovedNoise().noise(Date.now() * speed, this.seed, Date.now() * speed) * (0.8 * this.scale));
    this.mesh.rotation.z = (ImprovedNoise().noise( this.seed, Date.now() * speed, Date.now() * speed) * (0.8 * this.scale));

    this.calcPlane.position.copy( this.mesh.position );
    this.calcPlane.position.z += 0.2;
    //console.log( this["name"], this["life"], this["cuddleness"])

};

CharacterBase.prototype.returnFaceBack = function(){
    this.faceMaterial.map = this.regularTexture;
};

module.exports = CharacterBase;