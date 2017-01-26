/**
 * Created by siroko on 6/27/16.
 */


var THREE = require('three');

var vs = require('./../../glsl/vs-character.glsl');
var fs = require('./../../glsl/fs-character.glsl');

var ImprovedNoise = require('./../../utils/ImprovedNoise');
var Simulator = require('./../../utils/Simulator');
var GPUDisplacedGeometry = require('./../../utils/GPUDisplacedGeometry');

var CharacterBase = function( initPosition, correct, name, scale, renderer, scene, color, matcapNormal, matcap, lights, letter ){

    THREE.EventDispatcher.call( this );

    this.lights = lights;
    this.scene = scene;
    this.renderer = renderer;
    this.soundOverride = true;
    this.name = name;

    this.color = color;
    this.matcap = matcap;
    this.matcapNormal = matcapNormal;

    this.scale = scale;

    this.positionCharacter = initPosition.clone();
    this.positionCharacterBase = initPosition.clone();

    this.seed = Math.random();

    this.returnFaceTimer = 0;

    this.notes = [106, 103, 104, 105];
    this.letter = letter;


};

CharacterBase.prototype = Object.create( THREE.EventDispatcher.prototype );

CharacterBase.prototype.load = function(){
    if( this.letter ) {
        this.loadModel(this.letter);
    } else {
        this.geom = new THREE.BufferGeometry().fromGeometry(new THREE.IcosahedronGeometry( 0.35, mobilecheck() ? 1 : 2 ));
        this.regularTexture = THREE.ImageUtils.loadTexture('assets/faceCreature.png');
        this.happyTexture = THREE.ImageUtils.loadTexture('assets/faceCreatureHappy.png');
        this.setup();
        this.dispatchEvent( {
            type: 'onLoadModel'
        } );
    }
};

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

    this.displacedGeometry = new GPUDisplacedGeometry({
        'isMobile'          : mobilecheck(),
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
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;

    this.mesh.position.copy( this.positionCharacter );
    this.mesh.temporal = this.positionCharacter.clone();

    // this.mesh.add( this.halo );

    this.calcPlane = new THREE.Mesh( new THREE.PlaneBufferGeometry( 30, 10, 2, 2), new THREE.MeshNormalMaterial({ transparent: true, opacity: 0, depthTest: false, depthWrite: false}) );
    this.calcPlane.position.set( this.positionCharacter.x, this.positionCharacter.y, this.positionCharacter.z);

    this.faceMaterial = new THREE.MeshLambertMaterial({
        map: this.regularTexture,
        transparent: true,
        depthWrite: false,
        depthTest: false
    });
    this.faceGeom = new THREE.PlaneBufferGeometry(0.6, 0.3, 2, 2);
    this.facePlane = new THREE.Mesh( this.faceGeom, this.faceMaterial );
    this.facePlane.rotation.x = Math.PI * 2;
    this.facePlane.position.z = 0.1;

    if( this.regularTexture ) this.mesh.add( this.facePlane );
    this.mesh.scale.set( this.scale, this.scale, this.scale );

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
            this.faceMaterial.map = this.happyTexture;

            clearTimeout( this.returnFaceTimer );
            this.returnFaceTimer = setTimeout( this.returnFaceBack.bind( this ), 100 );

            if( this.soundOverride) {

                var inx = (this.name )%4;
                var delay = 0; // play one note every quarter second
                var note = this.notes[ inx ]; // the MIDI note
                var velocity = 127; // how hard the note hits

                console.log(inx);

                MIDI.setVolume(0, 127);
                MIDI.noteOn(0, note, velocity, delay);
                MIDI.noteOff(0, note, delay + 0.75);

                prePositive = true;

                // dispatchEvent play sound
                this.dispatchEvent({
                    type: 'onPlaySound',
                    idCharacter: this.name
                });

            }

            this.soundOverride = false;

        } else {

        }

    }

    this.displacedGeometry.update();

    var speed = 0.0003;

    this.positionCharacter.x = base.x + (ImprovedNoise().noise(Date.now() * speed, this.seed,  this.name + Date.now() * speed ) * (0.5 * this.scale));
    this.positionCharacter.y = base.y + (ImprovedNoise().noise(Date.now() * speed, this.seed + this.name + Date.now() * speed, Date.now() * speed) * (0.5 * this.scale));
    this.positionCharacter.z = base.z;

    this.mesh.rotation.x = (ImprovedNoise().noise(Date.now() * speed, this.seed, Date.now() * speed) * (0.8 * this.scale));
    this.mesh.rotation.y = (ImprovedNoise().noise(Date.now() * speed, this.seed, Date.now() * speed + Date.now() * speed) * (0.8 * this.scale)) * 2;
    this.mesh.rotation.z = (ImprovedNoise().noise( this.seed, Date.now() * speed, Date.now() * speed) * (0.8 * this.scale));

    this.calcPlane.position.copy( this.mesh.position );

};

CharacterBase.prototype.returnFaceBack = function(){
    this.soundOverride = true;
    this.faceMaterial.map = this.regularTexture;
};

module.exports = CharacterBase;