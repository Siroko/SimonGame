/**
 * Created by siroko on 6/27/16.
 */


var THREE = require('three');

var vs = require('./../../glsl/vs-character.glsl');
var fs = require('./../../glsl/fs-character.glsl');

var ImprovedNoise = require('./../../utils/ImprovedNoise');
var Simulator = require('./../../utils/Simulator');
var GPUDisplacedGeometry = require('./../../utils/GPUDisplacedGeometry');

var CharacterBase = function( initPosition, correct, name, scale, renderer, scene, soundmanager, color, occlusionMap, lightMap, diffuse, tint, lights ){

    THREE.EventDispatcher.call( this );

    this.factor = 0;
    this._factor = 0;

    this.container = new THREE.Object3D();

    this.lights = lights;
    this.scene = scene;
    this.renderer = renderer;
    this.soundManager = soundmanager;
    this.soundOverride = true;
    this.name = name;
    this.cuddleness = 100;
    this.life = 100;

    this.color = color;
    this.occlusionMap = occlusionMap;
    this.lightMap = lightMap;
    this.diffuse = diffuse;
    this.tint = tint;

    this.scale = scale;

    this.positionCharacter = initPosition.clone();
    this.positionCharacterBase = initPosition.clone();

    this.seed = Math.random();

    this.notes = [40, 41, 42, 43];

    this.halo = new THREE.Mesh( new THREE.IcosahedronGeometry( 0.55, 1 ), new THREE.MeshBasicMaterial({
        color: this.color,
        transparent : true,
        opacity: 0,
        depthWrite: false,
        depthTest: false
    } ) );

    this.geom = new THREE.JSONLoader();
    this.geom.load('assets/models/pumpkin.json', this.onLoadGeom.bind( this ) );

    this.calcPlane = new THREE.Mesh( new THREE.PlaneBufferGeometry( 30, 10, 2, 2), new THREE.MeshNormalMaterial({ transparent: true, opacity: 0, depthTest: false, depthWrite: false}) );
    this.calcPlane.position.set( this.positionCharacter.x, this.positionCharacter.y, this.positionCharacter.z);

};

CharacterBase.prototype = Object.create( THREE.EventDispatcher.prototype );

CharacterBase.prototype.onLoadGeom = function( geom, mats ) {

    this.geom = geom;

    this.setup();
};

CharacterBase.prototype.getNode = function() {

    this.node = this.soundManager.getNode();

};

CharacterBase.prototype.setup = function(){

    this.positionTouch1 = new THREE.Vector3();
    this.positionTouch2 = new THREE.Vector3();

    this.positionsTouch = [ this.positionTouch1, this.positionTouch2 ];

    this.worldPosition = new THREE.Vector3();


    this.displacedGeometry = new GPUDisplacedGeometry({
        'renderer'          : this.renderer,
        'geom'              : this.geom,
        'lights'            : this.lights,
        'uniforms'          : {
            'uTime'         : { type: 'f', value: 0 },
            'uTouch'        : { type: 'v3v', value: [ this.positionTouch1, this.positionTouch2 ] },
            'uWorldPosition': { type: 'v3', value: this.worldPosition },

            'occlusionMap'     : { type: 't', value: THREE.ImageUtils.loadTexture(this.occlusionMap ) },
            'lightMap'    : { type: 't', value: THREE.ImageUtils.loadTexture(this.lightMap) },
            'diffuseMap'    : { type: 't', value: THREE.ImageUtils.loadTexture(this.diffuse) },
            'uTint': { type: 'v3', value: this.tint }
        }
    });

    this.mesh = this.displacedGeometry.mesh;
    this.container.add( this.mesh );

    this.mesh.castShadow = true;
    this.mesh.position.copy( this.positionCharacter );
    this.mesh.temporal = this.positionCharacter.clone();

    this.mesh.add( this.halo );

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

    this.mesh.scale.set( this.scale, this.scale, this.scale );

};

CharacterBase.prototype.update = function( t ){

    this.worldPosition.copy( this.mesh.position );

    this.factor += ( this._factor - this.factor ) * 0.2;

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

    var base = this.positionCharacterBase.clone();
    var prePositive = false;

    for (var i = 0; i < this.positionsTouch.length; i++) {

        var obj = this.positionsTouch[ i ];
        var d = obj.distanceTo( this.mesh.position );

        if ( d < ( 0.6 * (this.scale * 15) ) ) {

            var direction = new THREE.Vector3();
            direction.subVectors(this.mesh.position, obj);
            direction.normalize();
            direction.multiplyScalar((0.6 * this.scale * 15) - d);

            this.mesh.position.add(direction);

            if( this.timer ) clearTimeout( this.timer );
            this.timer = setTimeout( (function(){
                this._factor = 0.0001;
                this.soundOverride = true;
            } ).bind( this ), 100);
            this._factor = 1;

            if( this.soundOverride) {

                var delay = 0; // play one note every quarter second
                var note = this.notes[ this.name ]; // the MIDI note
                var velocity = 127; // how hard the note hits

                MIDI.setVolume(0, 127);
                MIDI.noteOn(0, note, velocity, delay);
                MIDI.noteOff(0, note, delay + 0.75);

                prePositive = true;

            }

            this.soundOverride = false;

        } else {

        }
    }

    this.displacedGeometry.update( t );

    var speed = 0.0005;

    this.positionCharacter.x = base.x + (ImprovedNoise().noise(Date.now() * speed, this.seed, Date.now() * speed) * (0.5 * this.scale * 7));
    this.positionCharacter.y = base.y + (ImprovedNoise().noise(Date.now() * speed, this.seed + Date.now() * speed, Date.now() * speed) * (0.5 * this.scale*7));
    this.positionCharacter.z = base.z;

    this.mesh.rotation.x = (ImprovedNoise().noise(Date.now() * speed, this.seed, Date.now() * speed) * (0.8 * this.scale * 7));
    this.mesh.rotation.z = (ImprovedNoise().noise( this.seed, Date.now() * speed, Date.now() * speed) * (0.8 * this.scale * 7));

    this.calcPlane.position.copy( this.mesh.position );

};

module.exports = CharacterBase;
