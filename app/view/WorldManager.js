/**
 * Created by siroko on 5/30/16.
 */

var THREE = require('three');
var OBJLoader = require('./../utils/OBJLoader');
var MTLLoader = require('./../utils/MTLLoader');
var CharacterBase = require('./character/CharacterBase');
var SoundManager = require('./audio/SoundManager');

var Simon = require('./../utils/logic/Simon');

var vs_env = require('./../glsl/vs-base-projection.glsl');
var fs_env = require('./../glsl/fs-blended-maps.glsl');

var WorldManager = function( scene, camera, dummyCamera, renderer ) {

    THREE.EventDispatcher.call( this );

    this.renderer = renderer;
    this.sm = new SoundManager();

    this.dummyCamera = dummyCamera;
    this.camera = camera;
    this.scene = scene;

    this.characters = [];
    this.pointLights = [];
    this.charactersMesh = [];
    this.charactersCalcPlane = [];

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

    objLoader = new OBJLoader();
    objLoader.setPath( 'assets/models/graveyard8k/' );
    objLoader.load( 'graveyard.obj', (function ( object ) {
        var sm = new THREE.ShaderMaterial({
            uniforms: {
                uShadowMap: { type:'t', value : THREE.ImageUtils.loadTexture('assets/models/graveyard8k/graveyard-lights.jpg') },
                uShadow1Map: { type:'t', value : THREE.ImageUtils.loadTexture('assets/models/graveyard8k/graveyard-lights-01.jpg') },
                uShadow2Map: { type:'t', value : THREE.ImageUtils.loadTexture('assets/models/graveyard8k/graveyard-lights-02.jpg') },
                uShadow3Map: { type:'t', value : THREE.ImageUtils.loadTexture('assets/models/graveyard8k/graveyard-lights-03.jpg') },
                uShadow4Map: { type:'t', value : THREE.ImageUtils.loadTexture('assets/models/graveyard8k/graveyard-lights-04.jpg') },
                uShadowFactor1: { type: 'f', value: 0 },
                uShadowFactor2: { type: 'f', value: 0 },
                uShadowFactor3: { type: 'f', value: 0 },
                uShadowFactor4: { type: 'f', value: 0 }
            },
            vertexShader : vs_env,
            fragmentShader: fs_env
        });

        // object.children[0].material = new THREE.MeshNormalMaterial();
        object.children[0].material =  sm;
        this.elements = object.children[0];
        this.scene.add( object );
    }).bind( this ) );

    // objLoader = new OBJLoader();
    // objLoader.setPath( 'assets/models/graveyard/' );
    // objLoader.load( 'graves.obj', (function ( object ) {
    //     var sm = new THREE.ShaderMaterial({
    //         uniforms: {
    //             uDiffuseMap: { type:'t', value : THREE.ImageUtils.loadTexture('assets/models/graveyard/graves.png') },
    //             uShadowMap: { type:'t', value : THREE.ImageUtils.loadTexture('assets/models/graveyard/graves_shadow.png') },
    //             uShadow1Map: { type:'t', value : THREE.ImageUtils.loadTexture('assets/models/graveyard/graves_shadow1.png') },
    //             uShadow2Map: { type:'t', value : THREE.ImageUtils.loadTexture('assets/models/graveyard/graves_shadow2.png') },
    //             uShadow3Map: { type:'t', value : THREE.ImageUtils.loadTexture('assets/models/graveyard/graves_shadow3.png') },
    //             uShadow4Map: { type:'t', value : THREE.ImageUtils.loadTexture('assets/models/graveyard/graves_shadow4.png') },
    //             uShadowFactor1: { type: 'f', value: 0 },
    //             uShadowFactor2: { type: 'f', value: 0 },
    //             uShadowFactor3: { type: 'f', value: 0 },
    //             uShadowFactor4: { type: 'f', value: 0 }
    //         },
    //         vertexShader : vs_env,
    //         fragmentShader: fs_env
    //     });
    //
    //     object.children[0].material =  sm;
    //     this.graves = object.children[0];
    //     this.scene.add( object );
    // }).bind( this ) );
    //
    // objLoader = new OBJLoader();
    // objLoader.setPath( 'assets/models/graveyard/' );
    // objLoader.load( 'ground.obj', (function ( object ) {
    //
    //     var sm = new THREE.ShaderMaterial({
    //         uniforms: {
    //             uDiffuseMap: { type:'t', value : THREE.ImageUtils.loadTexture('assets/models/graveyard/ground.png') },
    //             uShadowMap: { type:'t', value : THREE.ImageUtils.loadTexture('assets/models/graveyard/ground_shadow.png') },
    //             uShadow1Map: { type:'t', value : THREE.ImageUtils.loadTexture('assets/models/graveyard/ground_shadow1.png') },
    //             uShadow2Map: { type:'t', value : THREE.ImageUtils.loadTexture('assets/models/graveyard/ground_shadow2.png') },
    //             uShadow3Map: { type:'t', value : THREE.ImageUtils.loadTexture('assets/models/graveyard/ground_shadow3.png') },
    //             uShadow4Map: { type:'t', value : THREE.ImageUtils.loadTexture('assets/models/graveyard/ground_shadow4.png') },
    //             uShadowFactor1: { type: 'f', value: 0 },
    //             uShadowFactor2: { type: 'f', value: 0 },
    //             uShadowFactor3: { type: 'f', value: 0 },
    //             uShadowFactor4: { type: 'f', value: 0 }
    //         },
    //         vertexShader : vs_env,
    //         fragmentShader: fs_env
    //     });
    //
    //     object.children[0].material =  sm;
    //     this.ground = object.children[0];
    //     this.scene.add( object );
    // }).bind( this ) );

    var instrument = 'fx_8_scifi';
    MIDI.loadPlugin({
        soundfontUrl: "assets/sound/midi/MusyngKite/",
        instrument: instrument,
        onsuccess: (function() {
            MIDI.programChange(0, MIDI.GM.byName[instrument].number);
            this.createCharacters();

        }).bind( this )
    });

};

WorldManager.prototype.createCharacters = function() {
    this.tints = [
        [255, 0, 0], // green
        [0, 255, 0], // red
        [0, 0, 255], // blue
        [255, 0, 255] // yellow
    ].map(c => {
        return [c[0] / 255, c[1] / 255, c[2] / 255];
    });

    var charsSetup = [
        {
            color: new THREE.Color('red'),
            normalMap : 'assets/yellowmatcap.png',
            matcap : 'assets/yellowmatcap.png',
            diffuse: 'assets/models/pumpkin-done.png',
            occlusion: 'assets/models/occlusion-done.png',
            light: 'assets/models/lights-done.png',
            tint: new THREE.Vector3(0, 0, 0)
        },
        {
            color: new THREE.Color(0x119977),
            normalMap : 'assets/brass.jpg',
            matcap : 'assets/brass.jpg',
            diffuse: 'assets/models/pumpkin-done.png',
            occlusion: 'assets/models/occlusion-done.png',
            light: 'assets/models/lights-done.png',
            tint: new THREE.Vector3(0, 0, 0)
        },
        {
            color: new THREE.Color(0xFFFFFF),
            normalMap : 'assets/matcap1.jpg',
            matcap : 'assets/matcap1.jpg',
            diffuse: 'assets/models/pumpkin-done.png',
            occlusion: 'assets/models/occlusion-done.png',
            light: 'assets/models/lights-done.png',
            tint: new THREE.Vector3(0, 0, 0)
        },
        {
            color: new THREE.Color(0x774432),
            normalMap : 'assets/lit-sphere-matball-example.jpg',
            matcap : 'assets/lit-sphere-matball-example.jpg',
            diffuse: 'assets/models/pumpkin-done.png',
            occlusion: 'assets/models/occlusion-done.png',
            light: 'assets/models/lights-done.png',
            tint: new THREE.Vector3(0, 0, 0)
        }

    ];

    var totalChars = 4;
    var separation = 1.1;
    for (var i = 0; i < totalChars; i++) {

        var pos = new THREE.Vector3( 0.3 + ( (i / totalChars) * 2 - 1 ) * separation , 1, -0.5 );
        var character = new CharacterBase(
            pos,
            false,
            i,
            0.025,
            this.renderer,
            this.scene,
            this.sm,
            charsSetup[i].color,
            charsSetup[i].occlusion,
            charsSetup[i].light,
            charsSetup[i].diffuse,
            charsSetup[i].tint,
            window.pointLights
        );
        character.addEventListener('onPlaySound', this.onCharacterPlaySound.bind( this ) );
        this.characters.push( character );

        var pointLight = new THREE.PointLight(0x885500, 0.2, 3, 2);
        pointLight.position.copy( pos );

        this.pointLights.push( pointLight );
        this.scene.add( pointLight );

    }

    for (var i = 0; i < this.characters.length; i++) {

        var char = this.characters[i];
        this.scene.add( char.container );
        this.scene.add( char.calcPlane );

        this.charactersMesh.push( char.container );
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

WorldManager.prototype.onCharacterLoad = function( e ) {

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
    if( char ) {
        char.halo.scale.set(1.2, 1.2, 1.2);

        TweenMax.to(char.halo.material, 0.1, {
            opacity: 0.8,
            ease: 'Expo.easeOut'
        });

        TweenMax.to(char.halo.scale, 1, {
            x: 1.4,
            z: 1.4,
            y: 1.4,
            ease: 'Expo.easeOut'
        });

        TweenMax.to(char.halo.material, 0.9, {
            opacity: 0,
            delay: 0.2,
            ease: 'Expo.easeOut'
        });
    }

};

WorldManager.prototype.onGameOver = function( e ) {

    this.dispatchEvent( {
        type : 'gameOver'
    } );
};

WorldManager.prototype.update = function( timestamp, gamePads ) {

    for (var i = 0; i < this.characters.length; i++) {
        var char = this.characters[i];
        if( char.mesh ) {
            this.pointLights[ i ].position.copy( char.mesh.position );
            this.pointLights[ i ].intensity = char.mesh.material.uniforms.intensity.value * 0.2;
            if (this.dummyCamera.position.z != 0) {
                char.mesh.lookAt(this.dummyCamera.position);
            } else {
                char.mesh.lookAt(this.camera.position);
            }

            char.update(timestamp);
            char.positionTouch1.copy(gamePads.intersectPoint);
            char.positionTouch2.copy(gamePads.intersectPoint2);
        }
    }

    if( this.characters[0] && this.characters[1] && this.characters[2] && this.characters[3] ) {
        // compute tint color, based on shadows factors
        var r = (this.tints[0][0] * this.characters[0].factor)
            + (this.tints[1][0] * this.characters[1].factor)
            + (this.tints[2][0] * this.characters[2].factor)
            + (this.tints[3][0] * this.characters[3].factor);

        var g = (this.tints[0][1] * this.characters[0].factor)
            + (this.tints[1][1] * this.characters[1].factor)
            + (this.tints[2][1] * this.characters[2].factor)
            + (this.tints[3][1] * this.characters[3].factor);

        var b = (this.tints[0][2] * this.characters[0].factor)
            + (this.tints[1][2] * this.characters[1].factor)
            + (this.tints[2][2] * this.characters[2].factor)
            + (this.tints[3][2] * this.characters[3].factor);

        r = Math.min(r, 1);
        g = Math.min(g, 1);
        b = Math.min(b, 1);

        for(var i = 0; i < this.characters.length; ++i) {
            this.characters[i].tint.set(r, g, b);
        }

        // console.log(this.characters[0].factor );
        if (this.elements) {
            this.elements.material.uniforms.uShadowFactor1.value = this.characters[0].factor;
            this.elements.material.uniforms.uShadowFactor2.value = this.characters[1].factor;
            this.elements.material.uniforms.uShadowFactor3.value = this.characters[2].factor;
            this.elements.material.uniforms.uShadowFactor4.value = this.characters[3].factor;
        }
        //
        // if (this.ground) {
        //     this.ground.material.uniforms.uShadowFactor1.value = this.characters[0].factor;
        //     this.ground.material.uniforms.uShadowFactor2.value = this.characters[1].factor;
        //     this.ground.material.uniforms.uShadowFactor3.value = this.characters[2].factor;
        //     this.ground.material.uniforms.uShadowFactor4.value = this.characters[3].factor;
        // }
        //
        // if (this.graves) {
        //     this.graves.material.uniforms.uShadowFactor1.value = this.characters[0].factor;
        //     this.graves.material.uniforms.uShadowFactor2.value = this.characters[1].factor;
        //     this.graves.material.uniforms.uShadowFactor3.value = this.characters[2].factor;
        //     this.graves.material.uniforms.uShadowFactor4.value = this.characters[3].factor;
        // }
    }


};

module.exports = WorldManager;
