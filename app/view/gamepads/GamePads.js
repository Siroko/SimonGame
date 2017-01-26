/**
 * Created by siroko on 6/27/16.
 */

var THREE = require('three');

var OBJLoader = require('./../../utils/OBJLoader');

var GamePads = function( scene, camera, worldManager, effect ){

    THREE.EventDispatcher.call( this );

    this.started = false;

    this.worldManager = worldManager;
    this.scene = scene;
    this.camera = camera;
    this.effect = effect;

    this.intersectPoint = new THREE.Vector3();
    this.intersectPoint2 = new THREE.Vector3();
    this.sTSMat = new THREE.Matrix4();
    this.tmpVector = new THREE.Vector3();
    this.tmpVector2 = new THREE.Vector3();

    this.h1 = new THREE.Object3D();
    this.h1.matrixAutoUpdate = false;
    this.h2 = new THREE.Object3D();
    this.h2.matrixAutoUpdate = false;
    this.handlers = [ this.h1, this.h2 ];

    this.tmpVect = new THREE.Vector3();

    this.scene.add( this.h1 );
    this.scene.add( this.h2 );

    this.loadAssets();

};

GamePads.prototype = Object.create( THREE.EventDispatcher.prototype );

GamePads.prototype.loadAssets = function(){
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
    objLoader.load( 'handR.obj', ( function ( object ) {

        for (var i = 0; i < object.children.length; i++) {
            var obj = object.children[i];
            obj.geometry.computeVertexNormals();
            if( obj.name.indexOf('bola') >= 0 ){
                this.h1Handler =  obj;
            }

            obj.castShadow = true;
            obj.receiveShadow = true;
        }
        this.h1.add(object);

    } ).bind( this ), onProgress, onError );

    objLoader.load( 'handL.obj', ( function ( object ) {

        for (var i = 0; i < object.children.length; i++) {
            var obj = object.children[i];
            obj.geometry.computeVertexNormals();
            if( obj.name.indexOf('bola') >= 0 ){
                this.h2Handler =  obj;
            }

            obj.castShadow = true;
            obj.receiveShadow = true;
        }
        this.h2.add(object);

    } ).bind( this ), onProgress, onError );

};

GamePads.prototype.checkStart = function(){

    this.worldManager.collisionBox.getWorldPosition( this.tmpVect );

    if( this.intersectPoint.distanceTo( this.tmpVect ) < 0.1 || this.intersectPoint2.distanceTo( this.tmpVect ) < 0.1 ) {

        this.started = true;
        this.dispatchEvent( {
            type: 'onStartGame'
        } );

    }

};

GamePads.prototype.update = function( t ){

    // Loop over every gamepad and if we find any that have a pose use it.
    var vrGamepads = [];
    var gamepads = navigator.getGamepads();

    if( this.effect.getVRDisplay() ) {
        if( this.effect.getVRDisplay().stageParameters ) {
            this.sTSMat.fromArray(this.effect.getVRDisplay().stageParameters.sittingToStandingTransform);
        }
    }

    for (var i = 0; i < gamepads.length; ++i) {

        var gamepad = gamepads[i];

        // The array may contain undefined gamepads, so check for that as
        // well as a non-null pose.
        if ( gamepad && gamepad.pose ) {

            vrGamepads.push(gamepad);

            //this.intersectPoint.quaternion.fromArray( gamepad.pose.orientation );
            this.handlers[ i ].position.fromArray( gamepad.pose.position );
            this.handlers[ i ].quaternion.fromArray( gamepad.pose.orientation );
            this.handlers[ i ].updateMatrix();
            this.handlers[ i ].applyMatrix( this.sTSMat );
            this.handlers[ i ].updateMatrixWorld();

            if( this.h1Handler ) {
                this.h1Handler.updateMatrixWorld();
                this.tmpVector.set( -0.1, 0.3, -0.35);
                this.tmpVector.applyMatrix4( this.h1Handler.matrixWorld );
            }

            if( this.h2Handler ) {
                this.h2Handler.updateMatrixWorld();
                this.tmpVector2.set( 0.1, 0.3, -0.35);
                this.tmpVector2.applyMatrix4( this.h2Handler.matrixWorld );
            }

            this.intersectPoint.copy( this.tmpVector );
            this.intersectPoint2.copy( this.tmpVector2 );

            try {
                if (!this.started) this.checkStart();
            } catch( e ) {
                console.log( e );
            }

            //if ("vibrate" in gamepad) {
            //    for (var j = 0; j < gamepad.buttons.length; ++j) {
            //        if (gamepad.buttons[j].pressed) {
            //            //gamepad.vibrate(1000);
            //            // Vibrate the gamepad relative to the amount the button is pressed.
            //            var vibrationDelay = (500 * (1.0 - gamepad.buttons[j].value)) + 100;
            //            if (t - lastVibration > vibrationDelay) {
            //                gamepad.vibrate(100);
            //                lastVibration = t;
            //            }
            //            break;
            //        }
            //    }
            //}
        }
    }
};

module.exports = GamePads;