/**
 * Created by siroko on 5/30/16.
 */

var THREE = require('three');
var OBJLoader = require('./../utils/OBJLoader');
var MTLLoader = require('./../utils/MTLLoader');
var CharacterBase = require('./character/CharacterBase');

var WorldManager = function( scene, camera, gamepads, dummyCamera ) {

    this.dummyCamera = dummyCamera;
    this.camera = camera;
    this.scene = scene;
    this.gamePads = gamepads;

    this.characters = [];
    this.charactersMesh = [];
    this.charactersCalcPlane = [];

    this.setup();

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
                    obj.material.emissive = new THREE.Color('#999999');
                    obj.material.transparent = true;
                    obj.material.opacity = 0.7;

                    obj.castShadow = true;
                    obj.receiveShadow = true;

                }

                if( obj.name.indexOf('CloudGeom') >= 0  ) {
                    obj.material = new THREE.MeshBasicMaterial({
                        map: THREE.ImageUtils.loadTexture('assets/ao_color.jpg'),
                        transparent : true
                    });

                }

                if( obj.name.indexOf('faceSun') >= 0  ) {
                    obj.material = new THREE.MeshBasicMaterial({
                        map: THREE.ImageUtils.loadTexture('assets/faceSun_2048.png'),
                        transparent : true
                    });

                    var texture = obj.material.map;
                    //texture.generateMipmaps = false;
                    texture.magFilter = THREE.LinearFilter;
                    texture.minFilter = THREE.LinearFilter;

                    this.faceSun = obj;

                }

                if( obj.name.indexOf('ground') >= 0  ) {
                    obj.castShadow = true;
                    obj.receiveShadow = true;

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
                obj.geometry.computeBoundingSphere();
            }

            this.scene.add( object );

        } ).bind( this ), onProgress, onError );

    }).bind( this ) );

    this.character = new CharacterBase( new THREE.Vector3( -1, 1.6, -0.5 ), false, 'char1', 0.5 );
    this.character2 = new CharacterBase( new THREE.Vector3( -0.35, 1.6, -0.5 ), false, 'char2', 0.5 );
    this.character3 = new CharacterBase( new THREE.Vector3( 0.35, 1.6, -0.5 ), false, 'char3', 0.5 );
    this.character4 = new CharacterBase( new THREE.Vector3( 1, 1.6, -0.5 ), false, 'char4', 0.5 );

    this.characters.push( this.character );
    //this.characters.push( this.character2 );
    //this.characters.push( this.character3 );
    //this.characters.push( this.character4 );

    for (var i = 0; i < this.characters.length; i++) {
        var char = this.characters[i];
        this.scene.add( char.mesh );
        this.scene.add( char.calcPlane );

        this.charactersMesh.push( char.mesh );
        this.charactersCalcPlane.push( char.calcPlane );
    }

};

WorldManager.prototype.update = function( timestamp ) {

    for (var i = 0; i < this.characters.length; i++) {
        var char = this.characters[i];
        if( this.dummyCamera.position.z != 0 ) {
            char.calcPlane.lookAt(this.dummyCamera.position);
            char.mesh.lookAt( this.dummyCamera.position );
        } else {
            char.calcPlane.lookAt(this.camera.position);
            char.mesh.lookAt( this.camera.position );
        }
        char.update( timestamp );
        char.positionTouch1.copy( this.gamePads.intersectPoint );

    }

    if( this.sun ){
        this.sun.rotation.z = Math.sin( timestamp * 0.001 ) * 0.1;
        this.faceSun.rotation.z = Math.sin( timestamp * 0.001 ) * 0.1;
    }


};

module.exports = WorldManager;
