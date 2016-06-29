/**
 * Created by siroko on 5/30/16.
 */

var THREE = require('three');
var OBJLoader = require('./../utils/OBJLoader');
var MTLLoader = require('./../utils/MTLLoader');
var CharacterBase = require('./character/CharacterBase');
var TweenMax = require('gsap');

var WorldManager = function( scene, camera, gamepads ) {

    this.camera = camera;
    this.scene = scene;
    this.gamePads = gamepads;

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

    var mtlLoaderDevice = new MTLLoader();
    mtlLoaderDevice.setPath( 'assets/' );
    mtlLoaderDevice.load( 'device.mtl', (function( materials ) {
        materials.preload();

        var objLoader = new OBJLoader();
        objLoader.setMaterials( materials );
        objLoader.setPath( 'assets/' );
        objLoader.load( 'device.obj', (function ( object ) {
            console.log( object );
            for (var i = 0; i < object.children.length; i++) {
                var obj = object.children[i];
                if( obj.name.indexOf('sun') >= 0  ) {
                    obj.material.emissive = new THREE.Color().setRGB(0.949, 0.416, 0.129);
                    obj.material.specular = new THREE.Color('#555555');
                    obj.material.shininess = 0;

                    this.sun = obj;

                }

                obj.geometry.computeBoundingSphere();
            }

            this.scene.add( object );

        } ).bind( this ), onProgress, onError );

    }).bind( this ) );


    this.character = new CharacterBase( new THREE.Vector3( -2, 1.6, -0.75), false );
    this.character2 = new CharacterBase( new THREE.Vector3( -0.75, 1.6, -1.5), false );
    this.character3 = new CharacterBase( new THREE.Vector3( 0.75, 1.6, -1.5), false );
    this.character4 = new CharacterBase( new THREE.Vector3( 2, 1.6, -0.75), false );
    this.scene.add( this.character.mesh );
    this.scene.add( this.character.calcPlane );
    this.scene.add( this.character2.mesh );
    this.scene.add( this.character2.calcPlane );
    this.scene.add( this.character3.mesh );
    this.scene.add( this.character3.calcPlane );
    this.scene.add( this.character4.mesh );
    this.scene.add( this.character4.calcPlane );

};

WorldManager.prototype.update = function( timestamp ) {

    this.character.calcPlane.lookAt(this.camera.position);
    this.character2.calcPlane.lookAt(this.camera.position);
    this.character3.calcPlane.lookAt(this.camera.position);
    this.character4.calcPlane.lookAt(this.camera.position);

    this.character.update( timestamp );
    this.character2.update( timestamp );
    this.character3.update( timestamp );
    this.character4.update( timestamp );

    this.character.positionTouch1.copy( this.gamePads.intersectPoint );
    this.character2.positionTouch1.copy( this.gamePads.intersectPoint );
    this.character3.positionTouch1.copy( this.gamePads.intersectPoint );
    this.character4.positionTouch1.copy( this.gamePads.intersectPoint );

    if( this.sun ){
        this.sun.rotation.z = Math.sin( timestamp * 0.001 ) * 0.1;
        this.faceSun.rotation.z = Math.sin( timestamp * 0.001 ) * 0.1;
    }


};

module.exports = WorldManager;
