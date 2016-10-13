/**
 * Created by siroko on 5/30/16.
 */

var THREE = require('three');
var OBJLoader = require('./../utils/OBJLoader');
var MTLLoader = require('./../utils/MTLLoader');
var CharacterBase = require('./character/CharacterBase');
var ShadowMapViewer = require('./../utils/ShadowMapViewer');
var GPUGeometrySimulation = require('./../utils/GPUGeometrySimulation');

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
        color: 0xDDDDDD,
        shininess: 0,
        specular: 0x111111
    } ) );

    this.floor.position.set( 0 , 0.1, 0 );
    this.floor.rotation.set( Math.PI * 1.5 , 0, 0 );
    this.scene.add( this.floor );

    // this.geom = new THREE.IcosahedronGeometry( 20, 4 );
    // var m = new THREE.MeshBasicMaterial({
    //     color: 0x9b9188
    // });
    // this.cosica = new THREE.Mesh( this.geom, m );
    // this.cosica.position.x = 30;
    // this.cosica.position.y = 2;
    // this.cosica.position.z = -80;
    // this.scene.add( this.cosica );

    //*****
    // this.gpuGeometrySimulation = new GPUGeometrySimulation( {
    //     geom : geom,
    //     sizeSimulation: 128,
    //     renderer: this.renderer
    // } );
    //
    // this.scene.add( this.gpuGeometrySimulation.bufferMesh );
    //******

    var manager = new THREE.LoadingManager();
    manager.onProgress = function ( item, loaded, total ) {

        console.log( item, loaded, total );

    };

    var onProgress = function ( xhr ) {
        if ( xhr.lengthComputable ) {
            var percentComplete = xhr.loaded / xhr.total * 100;
            console.log( Math.round(percentComplete, 2) + '% downloaded' );
        }
    };

    var onError = function ( xhr ) {
    };

    // model

    var loader = new OBJLoader( manager );
    loader.load( 'assets/models/Trump_lowPoly.obj', (function ( object ) {

        this.gpuGeometrySimulation = new GPUGeometrySimulation( {
            geom : object.children[0].geometry,
            matcap: THREE.ImageUtils.loadTexture('assets/matcap_twilight.jpg'),
            specialMatcap: THREE.ImageUtils.loadTexture('assets/emerald.jpg'),
            special2Matcap: THREE.ImageUtils.loadTexture('assets/matcap_purple.jpg'),
            sizeSimulation: mobilecheck() ? 64 : 20,
            isMobile: mobilecheck(),
            renderer: this.renderer
        } );

        this.scene.add( this.gpuGeometrySimulation.bufferMesh );

    } ).bind( this ), onProgress, onError );

    this.createCharacters();

};

WorldManager.prototype.setupShadows = function() {

    var SHADOW_MAP_WIDTH = 1024;
    var SHADOW_MAP_HEIGHT = 1024;

    this.light = new THREE.SpotLight( 0xffffff, 0.4 );
    this.light.distance = 5;
    this.light.penumbra = 0.1;
    this.light.decay = 1;
    this.light.angle = Math.PI * .8;
    this.light.position.set( 0, 4.4, 0 );
    this.light.target.position.set( 0, 0, 0 );

    this.light.castShadow = true;

    this.light.shadow = new THREE.LightShadow( new THREE.PerspectiveCamera( 50, 1, 2, 7 ) );
    this.light.shadow.bias = 0.0001;

    this.light.shadow.mapSize.width = SHADOW_MAP_WIDTH;
    this.light.shadow.mapSize.height = SHADOW_MAP_HEIGHT;

    this.scene.add( this.light );

    this.renderer.autoClear = false;

    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.floor.castShadow = true;
    this.floor.receiveShadow = true;

    // this.scene.add(  new THREE.CameraHelper( this.light.shadow.camera ) );

    // this.lightShadowMapViewer = new ShadowMapViewer( this.light );
    // this.lightShadowMapViewer.position.x = 0;
    // this.lightShadowMapViewer.position.y = 0;
    // this.lightShadowMapViewer.size.width = 256;
    // this.lightShadowMapViewer.size.height = 256;
    // this.lightShadowMapViewer.update();



};

WorldManager.prototype.createCharacters = function(){

    this.charsSetup = [
        {
            color: new THREE.Color(0xFF3377),
            normalMap : 'assets/normal.jpg',
            matcap : 'assets/matcap_twilight.jpg',
            letter: 'S'
        },
        {
            color: new THREE.Color(0x119977),
            normalMap : 'assets/normal.jpg',
            matcap : 'assets/matcap_twilight.jpg',
            letter: 'P'
        },
        {
            color: new THREE.Color(0xFFFFFF),
            normalMap : 'assets/normal.jpg',
            matcap : 'assets/matcap_twilight.jpg',
            letter: 'R'
        },
        {
            color: new THREE.Color(0x774432),
            normalMap : 'assets/normal.jpg',
            matcap : 'assets/matcap_twilight.jpg',
            letter: 'I'
        },
        {
            color: new THREE.Color(0xFF3377),
            normalMap : 'assets/normal.jpg',
            matcap : 'assets/matcap_twilight.jpg',
            letter: 'N'
        },
        {
            color: new THREE.Color(0xFF3377),
            normalMap : 'assets/normal.jpg',
            matcap : 'assets/matcap_twilight.jpg',
            letter: 'G'
        }

    ];

    // this.totalChars = this.charsSetup.length;
    // this.loadedModels = 0;
    // var separation = 1.3;
    //
    // for ( var i = 0; i < this.totalChars; i++ ) {
    //
    //     var character = new CharacterBase(
    //         new THREE.Vector3( 0.2 + ( (i / this.totalChars) * 2 - 1 ) * separation , 1, -0.5 ),
    //         false,
    //         i,
    //         0.4,
    //         this.renderer,
    //         this.scene,
    //         this.charsSetup[i].color,
    //         this.charsSetup[i].normalMap,
    //         this.charsSetup[i].matcap,
    //         window.pointLights,
    //         this.charsSetup[i].letter
    //     );
    //
    //     character.addEventListener( 'onLoadModel', this.onLoadCharModel.bind( this ) );
    //     this.characters.push( character );
    //
    // }
};

WorldManager.prototype.onLoadCharModel = function( e ){

    this.loadedModels++;

    if( this.loadedModels === this.totalChars) {

        for (var i = 0; i < this.characters.length; i++) {

            var char = this.characters[i];
            this.scene.add(char.mesh);
            this.scene.add(char.calcPlane);

            this.charactersMesh.push(char.mesh);
            this.charactersCalcPlane.push(char.calcPlane);

            if( i === 2 ){

            }

        }
    }
};

WorldManager.prototype.addEvents = function() {
    // window.addEventListener( 'keydown', this.onKeydown.bind( this ) );
};

WorldManager.prototype.onKeydown = function( e ) {

    var separation = 0.9;
    var character = new CharacterBase(
        new THREE.Vector3( this.characters[this.characters.length - 2 ].mesh.position.x + separation , 1, -0.5 ),
        false,
        this.characters.length,
        0.4,
        this.renderer,
        this.scene,
        this.charsSetup[0].color,
        this.charsSetup[0].normalMap,
        this.charsSetup[0].matcap,
        this.charsSetup[0].matcap,
        window.pointLights,
        e.key.toUpperCase()
    );

    character.addEventListener( 'onLoadModel', this.onLoadCharAddModel.bind( this ) );
    this.characters.push( character );
};

WorldManager.prototype.onLoadCharAddModel = function( e ) {

    var char = e.target;
    this.scene.add(char.mesh);
    this.scene.add(char.calcPlane);

    this.charactersMesh.push(char.mesh);
    this.charactersCalcPlane.push(char.calcPlane);

};

WorldManager.prototype.update = function( timestamp, gamePads ) {

    if( this.gpuGeometrySimulation ) this.gpuGeometrySimulation.update();

    // for (var i = 0; i < this.characters.length; i++) {
    //     var char = this.characters[i];
    //     if( char.mesh ) {
    //         if (this.dummyCamera.position.z != 0) {
    //             char.mesh.lookAt(this.dummyCamera.position);
    //         } else {
    //             char.mesh.lookAt(this.camera.position);
    //         }
    //
    //         char.update(timestamp);
    //         char.positionTouch1.copy(gamePads.intersectPoint);
    //         char.positionTouch2.copy(gamePads.intersectPoint2);
    //     }
    //
    // }


    // this.cosica.position.x = ( Math.sin( timestamp * 0.001) ) * 1.7;

};

module.exports = WorldManager;
