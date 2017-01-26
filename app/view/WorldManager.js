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
    this.mountainTorus = [];

    this.setup();
    this.setupShadows();
    this.addEvents();

};

WorldManager.prototype = Object.create( THREE.EventDispatcher.prototype );

WorldManager.prototype.setup = function(){

    this.floor = new THREE.Mesh( new THREE.PlaneBufferGeometry( 60, 60, 1, 1 ), new THREE.MeshPhongMaterial( {
        color: 0xcccccc,
        ambient: 0x9c9c9c

    } ) );

    this.floor.position.set( 0 , 0.1, 0 );
    this.floor.rotation.set( Math.PI * 1.5 , 0, 0 );
    // this.scene.add( this.floor );

    // this.geom = new THREE.IcosahedronGeometry( 0.08, 1 );
    // var m = new THREE.MeshPhongMaterial({
    //     color: 0xFF00FF
    // });
    // this.cosica = new THREE.Mesh( this.geom, m );
    // this.cosica.castShadow = true;
    // this.cosica.receiveShadow = true;
    // this.cosica.position.y = 1.3;
    // this.cosica.position.z = -0.25;
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
    loader.load( 'assets/models/snowflake_.obj', (function ( object ) {

        this.gpuGeometrySimulation = new GPUGeometrySimulation( {
            geom : object.children[0].geometry,
            matcap: THREE.ImageUtils.loadTexture('assets/matcap_twilight.jpg'),
            sizeSimulation: mobilecheck() ? 8 : 8,
            renderer: this.renderer
        } );
        this.gpuGeometrySimulation.bufferMesh.position.set(0, 0.2, -1);
        this.scene.add( this.gpuGeometrySimulation.bufferMesh );

    } ).bind( this ), onProgress, onError );

    loader.load( 'assets/sceneClouds.obj', (function ( object ) {

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

                // obj.castShadow = true;
                // obj.receiveShadow = true;

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
                this.ground.receiveShadow = true;
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

    var instrument = 'tinkle_bell';
    MIDI.loadPlugin({
        soundfontUrl: "assets/sound/midi/MusyngKite/",
        instrument: instrument,
        onsuccess: (function() {
            MIDI.programChange(0, MIDI.GM.byName[instrument].number);
            this.createCharacters();
        }).bind( this )
    });



};

WorldManager.prototype.createBubbles = function( p ) {

    this.bubbles = [];
    var geom = new THREE.IcosahedronGeometry( 0.5 + Math.random() * 0.3, 1 );
    var mat = new THREE.MeshLambertMaterial( {
        color: 0xFFFFFF,
        shading: THREE.FlatShading
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

WorldManager.prototype.setupShadows = function() {

    var SHADOW_MAP_WIDTH = 512;
    var SHADOW_MAP_HEIGHT = 512;

    this.light = new THREE.SpotLight( 0xffffff, 0.1 );
    this.light.distance = 15;
    this.light.penumbra = 0.5;
    this.light.decay = 0;
    this.light.angle = Math.PI * 0.4;
    this.light.position.set( 0, 3.9, 0 );
    //this.light.target.position.set( 0, 0, 0 );

    this.light.castShadow = true;

    this.light.shadow = new THREE.LightShadow( new THREE.PerspectiveCamera( 90, 1, 1.3, 5 ) );
    this.light.shadow.bias = 0;

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
            matcap : 'assets/matcaps/matcap_red.png',
            letter: 'M',
            position : new THREE.Vector3( -0.7 , 1.7, -0.5 )
        },
        {
            color: new THREE.Color(0x119977),
            normalMap : 'assets/normal.jpg',
            matcap : 'assets/matcaps/matcap_neutral.png',
            letter: 'E',
            position : new THREE.Vector3( -0.34 , 1.7, -0.5 )
        },
        {
            color: new THREE.Color(0xFFFFFF),
            normalMap : 'assets/normal.jpg',
            matcap : 'assets/matcaps/matcap_red.png',
            letter: 'R',
            position : new THREE.Vector3( 0.02 , 1.7, -0.5 )
        },
        {
            color: new THREE.Color(0x774432),
            normalMap : 'assets/normal.jpg',
            matcap : 'assets/matcaps/matcap_neutral.png',
            letter: 'R',
            position : new THREE.Vector3( 0.38 , 1.7, -0.5 )
        },
        {
            color: new THREE.Color(0xFF3377),
            normalMap : 'assets/normal.jpg',
            matcap : 'assets/matcaps/matcap_red.png',
            letter: 'Y',
            position : new THREE.Vector3( 0.74 , 1.7, -0.5 )
        },
        {
            color: new THREE.Color(0xFF3377),
            normalMap : 'assets/normal.jpg',
            matcap : 'assets/matcaps/matcap_green.png',
            letter: 'X',
            position : new THREE.Vector3( -0.75 , 1.2, -0.5 )
        },
        {
            color: new THREE.Color(0x119977),
            normalMap : 'assets/normal.jpg',
            matcap : 'assets/matcaps/matcap_green.png',
            letter: 'M',
            position : new THREE.Vector3( -0.16 , 1.2, -0.5 )
        },
        {
            color: new THREE.Color(0xFFFFFF),
            normalMap : 'assets/normal.jpg',
            matcap : 'assets/matcaps/matcap_green.png',
            letter: 'A',
            position : new THREE.Vector3( 0.25 , 1.2, -0.5 )
        },
        {
            color: new THREE.Color(0x774432),
            normalMap : 'assets/normal.jpg',
            matcap : 'assets/matcaps/matcap_green.png',
            letter: 'S',
            position : new THREE.Vector3( 0.75 , 1.2, -0.5 )
        },
        {
            color: new THREE.Color(0x774432),
            normalMap : 'assets/normal.jpg',
            matcap : 'assets/matcaps/matcap_yellow.png',
            letter: null,
            position : new THREE.Vector3( -0.75 , 1, -0.25 )
        },
        {
            color: new THREE.Color(0x774432),
            normalMap : 'assets/normal.jpg',
            matcap : 'assets/matcaps/matcap_yellow.png',
            letter: null,
            position : new THREE.Vector3( -0.35 , 1, -0.25 )
        },
        {
            color: new THREE.Color(0x774432),
            normalMap : 'assets/normal.jpg',
            matcap : 'assets/matcaps/matcap_yellow.png',
            letter: null,
            position : new THREE.Vector3( 0.35 , 1, -0.25 )
        },
        {
            color: new THREE.Color(0x774432),
            normalMap : 'assets/normal.jpg',
            matcap : 'assets/matcaps/matcap_yellow.png',
            letter: null,
            position : new THREE.Vector3( 0.75 , 1, -0.25 )
        }

    ];

    this.totalChars = this.charsSetup.length;
    this.loadedModels = 0;
    var separation = 0.9;

    for ( var i = 0; i < this.totalChars; i++ ) {
        var character = new CharacterBase(
            this.charsSetup[i].position,
            false,
            i,
            0.4,
            this.renderer,
            this.scene,
            this.charsSetup[i].color,
            this.charsSetup[i].normalMap,
            this.charsSetup[i].matcap,
            window.pointLights,
            this.charsSetup[i].letter
        );

        character.addEventListener( 'onLoadModel', this.onLoadCharModel.bind( this ) );
        this.characters.push( character );
        character.load();



    }
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
        setTimeout(function(){
            var container = document.getElementById( "container" );
            container.style.opacity = "1";
            var loader = document.getElementById( "loader" );
            loader.style.display = "none";
        }, 2000);

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

    for (var i = 0; i < this.characters.length; i++) {
        var char = this.characters[i];
        if( char.mesh ) {
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

    if(this.bubbles) {
        for (var r = 0; r < this.bubbles.length; r++) {
            var rand = (Math.random() + 0.1) * 3;
            var mesh = this.bubbles[r];
            mesh.scale.set(rand, rand, rand);
            mesh.position.set(-9.749, -1.863, 146.747);
            mesh.position.x += (Math.random() * 2 - 1 ) * 8;
            mesh.position.y += Math.random() * 2 - 1;
        }
    }

    // this.cosica.position.x = ( Math.sin( timestamp * 0.001) ) * 1.7;

};

module.exports = WorldManager;
