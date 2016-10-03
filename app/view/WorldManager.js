/**
 * Created by siroko on 5/30/16.
 */

var THREE = require('three');
var OBJLoader = require('./../utils/OBJLoader');
var MTLLoader = require('./../utils/MTLLoader');
var CharacterBase = require('./character/CharacterBase');

var WorldManager = function( scene, camera, dummyCamera, renderer ) {

    THREE.EventDispatcher.call( this );

    this.renderer = renderer;

    this.dummyCamera = dummyCamera;
    this.camera = camera;
    this.scene = scene;

    this.characters = [];
    this.charactersMesh = [];
    this.charactersCalcPlane = [];

    this.setup();
    this.setupShadows();
    this.addEvents();

};

WorldManager.prototype = Object.create( THREE.EventDispatcher.prototype );

WorldManager.prototype.setup = function(){

    this.floor = new THREE.Mesh( new THREE.PlaneBufferGeometry( 60, 60, 1, 1 ), new THREE.MeshPhongMaterial( {
        color: 0xFFFFFF,
        ambient: 0xFFFFFF

    } ) );

    this.floor.position.set( 0 , 0.1, 0 );
    this.floor.rotation.set( Math.PI * 1.5 , 0, 0 );
    this.scene.add( this.floor );

    var geom = new THREE.IcosahedronGeometry( 0.01, 1 );
    var m = new THREE.MeshPhongMaterial({
        color: 0xFF00FF
    });
    this.mesh = new THREE.Mesh( geom, m );
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    this.mesh.position.y = 1;
    this.scene.add( this.mesh );


    var instrument = 'xylophone';
    MIDI.loadPlugin({
        soundfontUrl: "assets/sound/midi/MusyngKite/",
        instrument: instrument,
        onsuccess: (function() {
            MIDI.programChange(0, MIDI.GM.byName[instrument].number);
            this.createCharacters();

        }).bind( this )
    });

};

WorldManager.prototype.setupShadows = function() {

    var SHADOW_MAP_WIDTH = 2048;
    var SHADOW_MAP_HEIGHT = 2048;

    this.light = new THREE.SpotLight( 0xffffff, 0.1 );
    this.light.distance = 10;
    this.light.penumbra = 0.1;
    this.light.decay = 0;
    this.light.angle = Math.PI * 0.3;
    this.light.position.set( 0, 1.9, 0 );
    this.light.target.position.set( 0, 0, 0.6 );

    this.light.castShadow = true;

    this.light.shadow = new THREE.SpotLightShadow( new THREE.PerspectiveCamera( 110, 1, 0.5, 5 ) );
    this.light.shadow.bias = 0.0001;

    this.light.shadow.mapSize.width = SHADOW_MAP_WIDTH;
    this.light.shadow.mapSize.height = SHADOW_MAP_HEIGHT;

    this.scene.add( this.light );

    this.renderer.autoClear = false;

    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.floor.castShadow = true;
    this.floor.receiveShadow = true;

    this.scene.add(  new THREE.CameraHelper( this.light.shadow.camera ) );

};

WorldManager.prototype.createCharacters = function(){

    var charsSetup = [
        {
            color: new THREE.Color(0xFF3377),
            normalMap : 'assets/yellowmatcap.png',
            matcap : 'assets/yellowmatcap.png'
        },
        {
            color: new THREE.Color(0x119977),
            normalMap : 'assets/brass.jpg',
            matcap : 'assets/brass.jpg'
        },
        {
            color: new THREE.Color(0xFFFFFF),
            normalMap : 'assets/matcap1.jpg',
            matcap : 'assets/matcap1.jpg'
        },
        {
            color: new THREE.Color(0x774432),
            normalMap : 'assets/lit-sphere-matball-example.jpg',
            matcap : 'assets/lit-sphere-matball-example.jpg'
        }

    ];

    var totalChars = 4;
    var separation = 0.9;
    for (var i = 0; i < totalChars; i++) {

        var character = new CharacterBase(
            new THREE.Vector3( 0.2 + ( (i / totalChars) * 2 - 1 ) * separation , 1, -0.5 ),
            false,
            i,
            0.4,
            this.renderer,
            this.scene,
            charsSetup[i].color,
            charsSetup[i].normalMap,
            charsSetup[i].matcap,
            window.pointLights
        );

        this.characters.push( character );

    }

    for (var i = 0; i < this.characters.length; i++) {

        var char = this.characters[i];
        this.scene.add( char.mesh );
        this.scene.add( char.calcPlane );

        this.charactersMesh.push( char.mesh );
        this.charactersCalcPlane.push( char.calcPlane );

    }

};

WorldManager.prototype.addEvents = function() {

};

WorldManager.prototype.update = function( timestamp, gamePads ) {

    for (var i = 0; i < this.characters.length; i++) {
        var char = this.characters[i];
        if( this.dummyCamera.position.z != 0 ) {
            char.mesh.lookAt( this.dummyCamera.position );
        } else {
            char.mesh.lookAt(this.camera.position);
        }

        char.update( timestamp );
        char.positionTouch1.copy( gamePads.intersectPoint );
        char.positionTouch2.copy( gamePads.intersectPoint2 );
    }

    this.mesh.position.x = Math.sin( timestamp * 0.00001 ) * 2;

};

module.exports = WorldManager;
