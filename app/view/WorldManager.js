/**
 * Created by siroko on 5/30/16.
 */

var THREE = require('three');
var OBJLoader = require('./../utils/OBJLoader');
var MTLLoader = require('./../utils/MTLLoader');
var CharacterBase = require('./character/CharacterBase');
//var SoundManager = require('./audio/SoundManager');
var AudioManager = require('audio-manager');

var WorldManager = function( scene, camera, gamepads, dummyCamera, renderer ) {

    this.renderer = renderer;
    //this.am = new AudioManager();
    //debugger;
    this.dummyCamera = dummyCamera;
    this.camera = camera;
    this.scene = scene;
    this.gamePads = gamepads;

    this.characters = [];
    this.charactersMesh = [];
    this.charactersCalcPlane = [];
    this.mountainTorus = [];
    this.bubbles = [];

    this.setup();
    this.addEvents();

};

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
                    obj.material.emissive = new THREE.Color().setRGB(0.949, 0.416, 0.129);
                    obj.material.specular = new THREE.Color('#555555');
                    obj.material.shininess = 0;

                    this.sun = obj;

                }
                if( obj.name.indexOf('mountainTorus') >= 0  ) {
                    obj.material.emissive = new THREE.Color('#555555');
                    obj.material.transparent = true;
                    obj.material.opacity = 0.7;

                    obj.castShadow = true;
                    obj.receiveShadow = true;

                    this.mountainTorus.push( obj );

                }

                if( obj.name.indexOf('CloudGeom') >= 0  ) {
                    obj.material = new THREE.MeshPhongMaterial({
                        map: THREE.ImageUtils.loadTexture('assets/ao_color.jpg'),
                        transparent : true,
                        emissive : new THREE.Color().setRGB(0,0,0),
                        specular : new THREE.Color('#FFFFFF'),
                        shininess : 0
                    });

                }

                if( obj.name.indexOf('water') >= 0  ) {
                    obj.material.transparent = true;
                    obj.material.opacity = 0.8;

                }

                if( obj.name.indexOf('faceSun') >= 0  ) {
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
                    obj.material.specular = new THREE.Color('#000000');
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

    }).bind( this ) );

    for (var i = 0; i < 1; i++) {
        var character = new CharacterBase( new THREE.Vector3( Math.sin( i * 0.25 ) * 2 , 1.5 + i * 0.05, 1 - Math.cos( i * 0.25 ) * 2 ), false, i, 1, this.renderer);
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

    this.onTouchStartHandler = this.onTouchStart.bind( this );
    window.addEventListener( 'touchstart', this.onTouchStartHandler );

    this.onTouchStart( null );

};

WorldManager.prototype.onTouchStart = function( e ) {

    window.removeEventListener( 'touchstart', this.onTouchStartHandler );
    //this.soundManager.start();

    for (var i = 0; i < this.characters.length; i++) {
        var char = this.characters[i];
        //char.getNode();
    }
};

WorldManager.prototype.update = function( timestamp ) {

    for (var i = 0; i < this.characters.length; i++) {
        var char = this.characters[i];
        if( this.dummyCamera.position.z != 0 ) {
            char.mesh.lookAt( this.dummyCamera.position );
        } else {
            char.mesh.lookAt(this.camera.position);
        }

        char.update( timestamp );
        char.positionTouch1.copy( this.gamePads.intersectPoint );

    }

    if( this.sun ){
        this.sun.rotation.z = Math.sin( timestamp * 0.001 ) * 0.1;
        this.faceSun.rotation.z = Math.sin( timestamp * 0.001 ) * 0.1;

        // for (var r = 0; r < this.mountainTorus.length; r++) {
        //     var t = this.mountainTorus[r];
        //     t.rotation.y += 0.1;
        // }
    }

    for (var r = 0; r < this.bubbles.length; r++) {
        var rand = (Math.random() + 0.1) * 3;
        var mesh = this.bubbles[ r ];
        mesh.scale.set( rand, rand, rand );
        mesh.position.set( -9.749, -1.863, 146.747 );
        mesh.position.x += (Math.random() * 2 - 1 ) * 8;
        mesh.position.y += Math.random() * 2 - 1;
    }


};

module.exports = WorldManager;
