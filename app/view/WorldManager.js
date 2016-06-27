/**
 * Created by siroko on 5/30/16.
 */

var THREE = require('three');
var OBJLoader = require('./../utils/OBJLoader');
var MTLLoader = require('./../utils/MTLLoader');
var TweenMax = require('gsap');

var WorldManager = function( scene, camera ) {

    this.camera = camera;
    this.scene = scene;

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
                    obj.material.emissive = new THREE.Color('#000000');
                    obj.material.specular = new THREE.Color('#FFFFFF');
                    obj.material.shininess = 0;

                }
                if( obj.name.indexOf('mountainTorus') >= 0  ) {
                    obj.material.transparent = true;
                    obj.material.opacity = 0.7;

                }

                if( obj.name.indexOf('CloudGeom') >= 0  ) {
                    obj.material.emissive = new THREE.Color('#333333')

                }

                console.log( obj );
            }
            this.scene.add( object );

        } ).bind( this ), onProgress, onError );

    }).bind( this ) );

};

module.exports = WorldManager;
