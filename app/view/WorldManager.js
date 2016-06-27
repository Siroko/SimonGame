/**
 * Created by siroko on 5/30/16.
 */

var THREE = require('three');
var TweenMax = require('gsap');

var WorldManager = function( scene, camera, data ) {

    this.scale = 0.001;
    this.data = data;
    this.scene = scene;

};

WorldManager.prototype.fadeOut = function(){
    TweenMax.to( this.earthGeom.material, 1, {
        opacity: 0,
        ease: 'Expo.easeInOut'
    });

    TweenMax.to( this.cloudsGeom.material, 1, {
        opacity: 0,
        ease: 'Expo.easeInOut'
    });
};

WorldManager.prototype.fadeIn = function(){
    TweenMax.to( this.earthGeom.material, 1, {
        opacity: 1,
        ease: 'Expo.easeInOut'
    });

    TweenMax.to( this.cloudsGeom.material, 1, {
        opacity: 1,
        ease: 'Expo.easeInOut'
    });
};

WorldManager.prototype.createEarth = function(){

    var geometry	= new THREE.SphereGeometry( this.radius, 32, 32 );
    var material	= new THREE.MeshBasicMaterial({
        map		: THREE.ImageUtils.loadTexture('assets/5_night_4k.jpg'),
        side    : THREE.DoubleSide,
        transparent: true,
        opacity: 1

    });

    this.earthGeom	= new THREE.Mesh(geometry, material);
    this.earthContainer.add( this.earthGeom );

    var material_clouds	= new THREE.MeshBasicMaterial({
        map		: THREE.ImageUtils.loadTexture('assets/fair_clouds_4k.jpg'),
        transparent: true,
        blending: THREE.AdditiveBlending,
        opacity: 1
    });

    this.cloudsGeom	= new THREE.Mesh(geometry, material_clouds);
    this.cloudsGeom.scale.set( 1.05, 1.05, 1.05 );
    this.earthContainer.add( this.cloudsGeom );
    this.earthContainer.position.set( 100000, 1000, 0 );

    TweenMax.to( this.earthContainer.position, 5, {
        delay: 1,
        x : 0,
        y : 0,
        z : 0,
        ease: 'Expo.easeInOut'
    });

    TweenMax.to( this.earthContainer.rotation, 5, {
        delay: 4,
        y : -Math.PI * 0.7,
        ease: 'Expo.easeOut'
    });

    this.createPoints();
    this.scene.add( this.earthContainer );

    this.radialMaterial = new THREE.MeshBasicMaterial({
        map: THREE.ImageUtils.loadTexture('assets/radialBase.png'),
        transparent : true,
        side: THREE.DoubleSide,
        opacity: 0
    });
    this.radialGeometry = new THREE.PlaneBufferGeometry( 45000, 45000, 2, 2 );
    this.radialBaseGeom = new THREE.Mesh(this.radialGeometry, this.radialMaterial);
    this.radialBaseGeom.rotation.x = 2 * Math.PI;
    this.scene.add( this.radialBaseGeom );

    this.radialTextMaterial = new THREE.MeshBasicMaterial({
        map: THREE.ImageUtils.loadTexture('assets/radialText.png'),
        transparent : true,
        side: THREE.DoubleSide,
        opacity: 0,
        depthWrite: false,
        depthTest: false
    });
    this.radialTextGeometry = new THREE.PlaneBufferGeometry( 21600, 2500, 2, 2 );
    this.radialTextGeom = new THREE.Mesh(this.radialTextGeometry, this.radialTextMaterial );
    this.radialTextGeom.position.x = 45000;
    this.radialTextGeom.position.y = 6500;
    this.radialTextGeom.position.z = 35000;
    this.radialTextGeom.rotation.y = -Math.PI * 0.4;
    this.radialTextGeom.scale.set(5.5, 5.5, 5.5);
    this.radialBaseGeom.add( this.radialTextGeom );

    TweenMax.to( this.radialBaseGeom.material, 1, {
        delay: 6,
        opacity: 1,
        ease: 'Expo.easeInOut'
    });
    TweenMax.to( this.radialTextGeom.material, 1, {
        delay: 6,
        opacity: 1,
        ease: 'Expo.easeInOut'
    });

};

WorldManager.prototype.createPoints = function(){

    var g = new THREE.SphereBufferGeometry( 100000 * this.scale, 10, 10 );
    var m = new THREE.MeshBasicMaterial({
        color: 0xfa954d
    });

    for (var i = 0; i < this.data.data.length; i++) {
        var story = this.data.data[i];

        var pos = this.calcPosFromLatLonRad( story.lat, story.long, this.radius );
        var mesh = new THREE.Mesh( g, m );
        mesh.position.x = pos[0];
        mesh.position.y = pos[1];
        mesh.position.z = pos[2];

        mesh.userData.storyId = story.id;

        this.hotspots.add( mesh );
    }

    this.earthContainer.add( this.hotspots );

};

WorldManager.prototype.calcPosFromLatLonRad = function( lat, lon, radius ) {

    var phi   = ( 90 - lat ) * ( Math.PI / 180 );
    var theta = ( lon + 180 ) * ( Math.PI / 180 );

    var x = -( ( radius ) * Math.sin( phi ) * Math.cos( theta ) );
    var z = ( ( radius ) * Math.sin( phi ) * Math.sin( theta ) );
    var y = ( ( radius ) * Math.cos( phi ) );

    return [ x, y, z ];

};

WorldManager.prototype.checkIntersect = function() {

    this.radialBaseGeom.lookAt( this.cameraDummy.position );
    this.raycaster.setFromCamera( this.screenVector, this.camera );
    var intersects = this.raycaster.intersectObjects( this.hotspots.children, true );

    if( intersects.length > 0 && this.hotspots.visible ) {

        return {
            obj: intersects[0].object
        }
    }
};

WorldManager.prototype.setState = function( state ) {
    if( state ) {
        this.hotspots.visible = false;

        TweenMax.to( this.radialBaseGeom.material, 1, {
            opacity: 0,
            ease: 'Expo.easeInOut'
        });
        TweenMax.to( this.radialTextGeom.material, 1, {
            opacity: 0,
            ease: 'Expo.easeInOut'
        });

    } else {

        TweenMax.to( this.radialBaseGeom.material, 1, {
            opacity: 1,
            ease: 'Expo.easeInOut'
        });
        TweenMax.to( this.radialTextGeom.material, 1, {
            opacity: 1,
            ease: 'Expo.easeInOut'
        });

        this.hotspots.visible = true;
    }
};

module.exports = WorldManager;
