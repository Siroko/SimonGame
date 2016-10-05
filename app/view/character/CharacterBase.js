/**
 * Created by siroko on 6/27/16.
 */


var THREE = require('three');

var vs = require('./../../glsl/vs-character.glsl');
var fs = require('./../../glsl/fs-character.glsl');

var ImprovedNoise = require('./../../utils/ImprovedNoise');
var Simulator = require('./../../utils/Simulator');
var GPUDisplacedGeometry = require('./../../utils/GPUDisplacedGeometry');

var CharacterBase = function( initPosition, correct, name, scale, renderer, scene, color, matcap, matcapNormal, lights, letter ){

    THREE.EventDispatcher.call( this );

    this.lights = lights;
    this.scene = scene;
    this.renderer = renderer;
    this.soundOverride = true;
    this.name = name;
    this.cuddleness = 100;
    this.life = 100;

    this.color = color;
    this.matcap = matcap;
    this.matcapNormal = matcapNormal;

    this.scale = scale;

    this.positionCharacter = initPosition.clone();
    this.positionCharacterBase = initPosition.clone();

    this.seed = Math.random();

    this.regularTexture = THREE.ImageUtils.loadTexture('assets/faceCreature.png');
    this.happyTexture = THREE.ImageUtils.loadTexture('assets/faceCreatureHappy.png');

    this.returnFaceTimer = 0;
    this.returnParticlesTimer = 0;

    this.notes = [70, 74, 75, 77];

   this.loadModel( letter );

};

CharacterBase.prototype = Object.create( THREE.EventDispatcher.prototype );

CharacterBase.prototype.loadModel = function(name) {

    var loader = new THREE.JSONLoader();
    var url = 'assets/letters/' + name + '.json';
    loader.load( url, this.onLoadGeom.bind( this ) );

};

CharacterBase.prototype.onLoadGeom = function( geometry, materials) {

    geometry.computeFaceNormals();
    geometry.computeVertexNormals();

    this.geom = geometry;

    this.setup();
    this.dispatchEvent( {
        type: 'onLoadModel'
    } );
};

CharacterBase.prototype.setup = function(){

    this.positionTouch1 = new THREE.Vector3();
    this.positionTouch2 = new THREE.Vector3();

    this.positionsTouch = [ this.positionTouch1, this.positionTouch2 ];

    this.worldPosition = new THREE.Vector3();

    // this.geom = new THREE.IcosahedronGeometry( 0.5, 3 );

    this.displacedGeometry = new GPUDisplacedGeometry({
        'renderer'          : this.renderer,
        'geom'              : this.geom,
        'lights'            : this.lights,
        'uniforms'          : {
            'uTime'         : { type: 'f', value: 0 },
            'uTouch'        : { type: 'v3v', value: [ this.positionTouch1, this.positionTouch2 ] },
            'uWorldPosition': { type: 'v3', value: this.worldPosition },

            'normalMap'     : { type: 't', value: THREE.ImageUtils.loadTexture(this.matcapNormal ) },
            'textureMap'    : { type: 't', value: THREE.ImageUtils.loadTexture(this.matcap) }
        }
    });

    //this.scene.add( this.displacedGeometry.planeDebug );

    this.mesh = this.displacedGeometry.mesh;
    this.displacedGeometry.mesh.name = 'cosica';
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;

    this.mesh.position.copy( this.positionCharacter );
    this.mesh.temporal = this.positionCharacter.clone();

    // this.mesh.add( this.halo );

    this.calcPlane = new THREE.Mesh( new THREE.PlaneBufferGeometry( 30, 10, 2, 2), new THREE.MeshNormalMaterial({ transparent: true, opacity: 0, depthTest: false, depthWrite: false}) );
    this.calcPlane.position.set( this.positionCharacter.x, this.positionCharacter.y, this.positionCharacter.z);

    //this.mesh.position.x = 1;
    //this.mesh.position.y = 1;
    //this.mesh.position.z = 1;

    this.faceMaterial = new THREE.MeshLambertMaterial({
        map: this.regularTexture,
        transparent: true,
        depthWrite: false,
        depthTest: false
    });
    this.faceGeom = new THREE.PlaneBufferGeometry(0.6, 0.3, 2, 2);
    this.facePlane = new THREE.Mesh( this.faceGeom, this.faceMaterial );
    this.facePlane.rotation.x = Math.PI * 2;
    this.facePlane.position.z = 0;

    // this.mesh.add( this.facePlane );
    this.mesh.scale.set( this.scale, this.scale, this.scale );

    var particlesQuantity = 32;
    var initBuffer = new Float32Array( particlesQuantity * particlesQuantity * 4 );
    for ( var i = 0; i < particlesQuantity * particlesQuantity; i++ ) {

        var x0, y0, z0;
        x0 = y0 = z0 = 0;
        var radius = 0.3;
        var u = Math.random();
        var v = Math.random();
        var theta = 2 * Math.PI * u;
        var phi = Math.acos(2 * v - 1);
        var x = x0 + (radius * Math.sin(phi) * Math.cos(theta));
        var y = y0 + (radius * Math.sin(phi) * Math.sin(theta));
        var z = z0 + (radius * Math.cos(phi));

        initBuffer[ i * 4 ]     =  x;
        initBuffer[ i * 4 + 1 ] =  y;
        initBuffer[ i * 4 + 2 ] =  z;
        initBuffer[ i * 4 + 3 ] = 15; // frames life

    }

    this.simulator = new Simulator({
        sizeW: particlesQuantity,
        sizeH: particlesQuantity,
        directionFlow: new THREE.Vector3(0, 0.017, 0.01),
        initialBuffer: initBuffer,
        pointSize: 3,
        locked: 1,
        renderer: this.renderer,
        lifeTime: 15,
        colorParticle: new THREE.Vector3(1.0, 1.0, 1.0),
        noiseTimeScale: 0.6,
        noisePositionScale: 0.0025,
        noiseScale: 0.002

    });

    // this.scene.add( this.simulator.bufferMesh );
    this.simulator.bufferMesh.scale.set( this.scale, this.scale, this.scale );
    this.simulator.bufferMesh.visible = false;

    //this.createLifeCuddleBars();
};

CharacterBase.prototype.createLifeCuddleBars = function(){

    this.lifeMat = new THREE.MeshBasicMaterial( {
        color: 0xFFFFFF
    } );

    this.lifeGeom = new THREE.BoxBufferGeometry( 0.1, 0.5, 0.1, 2, 2, 2 );
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

    this.displacedGeometry.updateSpringMaterial.uniforms.uTime.value = t;
    this.displacedGeometry.updateSpringMaterial.uniforms.uTouch.value = [ this.positionTouch1, this.positionTouch2 ];
    this.displacedGeometry.updateSpringMaterial.uniforms.uWorldPosition.value = this.worldPosition;

    var div = 0.04;
    var damp = 0.9;
    this.mesh.temporal.x = ( this.mesh.temporal.x + ( this.mesh.position.x - this.positionCharacter.x ) * div ) * damp;
    this.mesh.temporal.y = ( this.mesh.temporal.y + ( this.mesh.position.y - this.positionCharacter.y ) * div ) * damp;
    this.mesh.temporal.z = ( this.mesh.temporal.z + ( this.mesh.position.z - this.positionCharacter.z ) * div ) * damp;
    this.mesh.position.x -= this.mesh.temporal.x;
    this.mesh.position.y -= this.mesh.temporal.y;
    this.mesh.position.z -= this.mesh.temporal.z;

    this.simulator.updatePositionsMaterial.uniforms.uOffsetPosition.value.copy( this.mesh.position );
    this.simulator.updatePositionsMaterial.uniforms.uOffsetPosition.value.x /= this.scale;
    this.simulator.updatePositionsMaterial.uniforms.uOffsetPosition.value.y /= this.scale;
    this.simulator.updatePositionsMaterial.uniforms.uOffsetPosition.value.z /= this.scale;

    var base = this.positionCharacterBase.clone();
    var prePositive = false;

    for (var i = 0; i < this.positionsTouch.length; i++) {

        var obj = this.positionsTouch[ i ];
        var d = obj.distanceTo( this.mesh.position );

        if ( d < ( 0.5 * this.scale ) ) {

            var direction = new THREE.Vector3();
            direction.subVectors(this.mesh.position, obj);
            direction.normalize();
            direction.multiplyScalar((0.5 * this.scale) - d);

            this.mesh.position.add(direction);
            this.cuddleness += 0.5;
            this.faceMaterial.map = this.happyTexture;

            clearTimeout( this.returnFaceTimer );
            this.returnFaceTimer = setTimeout( this.returnFaceBack.bind( this ), 100 );

            clearTimeout( this.returnParticlesTimer );
            this.returnParticlesTimer = setTimeout( this.returnParticlesBack.bind( this ), 2100 );

            this.simulator.bufferMesh.visible = true;
            if( this.cuddleness > 100 ) this.cuddleness = 100;

            this.simulator.updatePositionsMaterial.uniforms.uLock.value = 0;


            if( this.soundOverride) {

                var delay = 0; // play one note every quarter second
                var note = this.notes[ this.name ]; // the MIDI note
                var velocity = 127; // how hard the note hits

                // MIDI.setVolume(0, 127);
                // MIDI.noteOn(0, note, velocity, delay);
                // MIDI.noteOff(0, note, delay + 0.75);

                prePositive = true;

                // dispatchEvent play sound
                this.dispatchEvent({
                    type: 'onPlaySound',
                    idCharacter: this.name
                });

            }

            this.soundOverride = false;

        } else {

            this.cuddleness -= 0.09;
            if( this.cuddleness < 0 ) this.cuddleness = 0.0001;

            if( !prePositive ) {
                this.simulator.updatePositionsMaterial.uniforms.uLock.value = 1;
            }

        }

    }

    // this.simulator.update();
    this.displacedGeometry.update();

    if( this.cuddleness <= 0.0001 ){
        this.life -= 0.9;
        if( this.life < 0 ) this.life = 0.0001;
    }

    var lpercent = this.life / 100;
    var cpercent = this.cuddleness / 100;

    if( this.lifeMesh ) {
        this.lifeMesh.scale.y = lpercent;
        this.cuddleMesh.scale.y = cpercent;
    }

    var speed = 0.0005;

    this.positionCharacter.x = base.x + (ImprovedNoise().noise(Date.now() * speed, this.seed,  this.name + Date.now() * speed ) * (0.5 * this.scale));
    this.positionCharacter.y = base.y + (ImprovedNoise().noise(Date.now() * speed, this.seed + this.name + Date.now() * speed, Date.now() * speed) * (0.5 * this.scale));
    this.positionCharacter.z = base.z;

    this.mesh.rotation.x = (ImprovedNoise().noise(Date.now() * speed, this.seed, Date.now() * speed) * (0.8 * this.scale));
    this.mesh.rotation.z = (ImprovedNoise().noise( this.seed, Date.now() * speed, Date.now() * speed) * (0.8 * this.scale));

    this.calcPlane.position.copy( this.mesh.position );

};

CharacterBase.prototype.returnParticlesBack = function(){
    this.simulator.bufferMesh.visible = false;
};

CharacterBase.prototype.returnFaceBack = function(){
    this.soundOverride = true;
    this.faceMaterial.map = this.regularTexture;
};

module.exports = CharacterBase;