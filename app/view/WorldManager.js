/**
 * Created by siroko on 5/30/16.
 */

var THREE = require('three');
var OBJLoader = require('./../utils/OBJLoader');
var MTLLoader = require('./../utils/MTLLoader');
var CharacterBase = require('./character/CharacterBase');
var SoundManager = require('./audio/SoundManager');
var UltraStarManager = require('./../utils/ultrastar/UltraStarManager');

var Simon = require('./../utils/logic/Simon');

var WorldManager = function( scene, camera, dummyCamera, renderer ) {

    THREE.EventDispatcher.call( this );

    this.renderer = renderer;
    this.sm = new SoundManager();

    this.dummyCamera = dummyCamera;
    this.camera = camera;
    this.scene = scene;

    this.characters = [];
    this.charactersMesh = [];
    this.charactersCalcPlane = [];
    this.mountainTorus = [];
    this.bubbles = [];

    //this.ultraStarManager = new UltraStarManager();
    //this.ultraStarManager.setSong( 0 );
    //this.scene.add( this.ultraStarManager.container );

    this.simon = new Simon();

    this.setup();
    this.addEvents();

};

WorldManager.prototype = Object.create( THREE.EventDispatcher.prototype );

WorldManager.prototype.setup = function(){

    var onProgress = function ( xhr ) {
        if ( xhr.lengthComputable ) {
            var percentComplete = xhr.loaded / xhr.total * 100;
            console.log( Math.round(percentComplete, 2) + '% downloaded' );
        }
    };

    var onError = function ( xhr ) {
    };

    var mtlLoader = new MTLLoader();
    mtlLoader.setPath( 'assets/' );
    mtlLoader.load( 'sceneClouds.mtl', (function( materials ) {
        materials.preload();

        var objLoader = new OBJLoader();
        objLoader.setMaterials( materials );
        objLoader.setPath( 'assets/' );
        objLoader.load( 'sceneClouds.obj', (function ( object ) {
            console.log( object );
            for (var i = 0; i < object.children.length; i++) {
                var obj = object.children[i];
                if( obj.name.indexOf('sun') >= 0  ) {
                    obj.material.emissive = new THREE.Color().setRGB(20 / 255, 20 / 255, 0.2 / 255);
                    obj.material.specular = new THREE.Color('#555555');
                    obj.material.shininess = 0;

                    this.sun = obj;

                }
                if( obj.name.indexOf('mountainTorus') >= 0  ) {
                    //obj.material.emissive = new THREE.Color('#555555');
                    //obj.material.transparent = true;
                    //obj.material.opacity = 0.7;

                    obj.castShadow = true;
                    obj.receiveShadow = true;

                    this.mountainTorus.push( obj );

                }

                if( obj.name.indexOf('CloudGeom') >= 0  ) {
                    obj.material = new THREE.MeshPhongMaterial({
                        map: THREE.ImageUtils.loadTexture('assets/ao_color.jpg'),
                        emissive : new THREE.Color().setRGB(0,0,0),
                        specular : new THREE.Color('#FFFFFF'),
                        shininess : 0
                    });

                }

                if( obj.name.indexOf('water') >= 0  ) {
                    //obj.material.transparent = true;
                    //obj.material.opacity = 0.8;

                }

                if( obj.name.indexOf('faceSun') >= 0  ) {
                    obj.visible = false;
                    obj.material = new THREE.MeshBasicMaterial({
                        map: THREE.ImageUtils.loadTexture('assets/faceSun_2048.png'),
                        depthWrite : false,
                        transparent : true
                    });

                    var texture = obj.material.map;
                    //texture.generateMipmaps = false;
                    texture.magFilter = THREE.LinearFilter;
                    texture.minFilter = THREE.LinearFilter;

                    this.faceSun = obj;

                }

                if( obj.name.indexOf('ground') >= 0  ) {

                    var t = THREE.ImageUtils.loadTexture('assets/test_Light.jpg');

                    for (var j = 0; j < obj.material.materials.length; j++) {
                        var mat = obj.material.materials[j];
                        mat.map = t;
                    }

                    this.ground = obj;
                }

                if( obj.name.indexOf('stone') >= 0  ) {
                    obj.material.emissive = new THREE.Color('#000000');
                    obj.material.specular = new THREE.Color('#000000')
                    obj.material.color = new THREE.Color('#555555');
                    obj.material.shininess = 0;

                    obj.castShadow = true;
                    obj.receiveShadow = true;

                }

                if( obj.name.indexOf('cascadeBottom') >= 0  ) {
                    obj.material.visible = false;
                    this.createBubbles( obj.position );
                }

                obj.geometry.computeBoundingSphere();
                //obj.material = new THREE.MeshBasicMaterial({
                //    color: 0xff0000,
                //    wireframe: true
                //});
            }

            this.scene.add( object );

        } ).bind( this ), onProgress, onError );

    }).bind( this ), onProgress, onError );

    var objLoader = new OBJLoader();
    objLoader.setPath( 'assets/' );
    objLoader.load( 'startPlane.obj', (function ( object ) {

        for (var i = 0; i < object.children.length; i++) {
            var obj = object.children[i];
            if (obj.name.indexOf('collision') >= 0) {
                this.collisionBox = obj;
            }

            if (obj.name.indexOf('planeBase') >= 0) {
                obj.material = new THREE.MeshBasicMaterial({
                        map : THREE.ImageUtils.loadTexture('assets/start.png'),
                        transparent: true,
                        depthTest: false,
                        depthWrite: false
                    })
            }
        }

        object.position.y = 1.5;
        object.position.z = -0.65;
        this.planeStartContainer = object;
        this.scene.add( object );
    }).bind( this ) );

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
            new THREE.Vector3( ( (i / totalChars) * 2 - 1 ) * separation , 1, -0.5 ),
            false,
            i,
            0.4,
            this.renderer,
            this.scene,
            this.sm,
            charsSetup[i].color,
            charsSetup[i].normalMap,
            charsSetup[i].matcap,
            window.pointLights
        );
        character.addEventListener('onPlaySound', this.onCharacterPlaySound.bind( this ) );
        this.characters.push( character );

    }

    for (var i = 0; i < this.characters.length; i++) {

        var char = this.characters[i];
        this.scene.add( char.mesh );
        this.scene.add( char.calcPlane );

        this.charactersMesh.push( char.mesh );
        this.charactersCalcPlane.push( char.calcPlane );

    }

    //this.planeInfo = new THREE.Mesh( new THREE.PlaneBufferGeometry(1.5, 1.5, 1, 1), new THREE.MeshBasicMaterial({
    //    map : THREE.ImageUtils.loadTexture('assets/start.png'),
    //    transparent: true,
    //    depthTest: false,
    //    depthWrite: false
    //}));
    //
    ////this.planeInfo.rotation.y = Math.PI * 0.5;
    //this.planeInfo.position.y = 1.5;
    //this.planeInfo.position.z = -0.65;
    //this.scene.add( this.planeInfo );

};

WorldManager.prototype.onCharacterPlaySound = function( e ) {

    this.simon.setHumanNote( e.idCharacter );
};

WorldManager.prototype.createBubbles = function( p ) {

    var geom = new THREE.IcosahedronGeometry( 0.5 + Math.random() * 0.3, 1 );
    var mat = new THREE.MeshLambertMaterial( {
        color: 0xFFFFFF,
        shading: THREE.FlatShading,
        emissive: 0x888888
    } );

    for (var i = 0; i < 25; i++) {

        var mesh = new THREE.Mesh( geom, mat );
        var r = (Math.random() + 0.1) * 3;
        mesh.scale.set( r, r, r );
        this.bubbles.push( mesh );
        mesh.position.copy( new THREE.Vector3(-9.749, -1.863, 146.747) );
        mesh.position.x += (Math.random() * 2 - 1 ) * 8;
        mesh.position.y += Math.random() * 4;
        this.scene.add( mesh );

    }

};

WorldManager.prototype.addEvents = function() {

    this.simon.addEventListener('gameOver', this.onGameOver.bind( this ) );
    this.simon.addEventListener( 'playNote', this.onPlayNote.bind( this ) );

};

WorldManager.prototype.onPlayNote = function( e ) {

    var char = this.characters[ e.index ];

    char.halo.scale.set( 1, 1, 1 );

    TweenMax.to( char.halo.material, 0.5, {
        opacity: 0.5,
        ease : 'Expo.easeIn'
    } );

    TweenMax.to( char.halo.scale, 1, {
        x: 2.5,
        z: 2.5,
        y: 2.5,
        ease : 'Expo.easeIn'
    } );

    TweenMax.to( char.halo.material, 0.5, {
        opacity: 0,
        delay : 0.5,
        ease : 'Expo.easeOut'
    } );

};

WorldManager.prototype.onGameOver = function( e ) {

    this.dispatchEvent( {
        type : 'gameOver'
    } );
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

    if( this.sun ){
        this.sun.rotation.z = Math.sin( timestamp * 0.001 ) * 0.1;
       if( this.faceSun) this.faceSun.rotation.z = Math.sin( timestamp * 0.001 ) * 0.1;
    }

    for (var r = 0; r < this.bubbles.length; r++) {
        var rand = (Math.random() + 0.1) * 3;
        var mesh = this.bubbles[ r ];
        mesh.scale.set( rand, rand, rand );
        mesh.position.set( -9.749, -1.863, 146.747 );
        mesh.position.x += (Math.random() * 2 - 1 ) * 8;
        mesh.position.y += Math.random() * 2 - 1;
    }

    //this.ultraStarManager.update();


};

module.exports = WorldManager;
