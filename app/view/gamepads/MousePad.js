/**
 * Created by siroko on 6/27/16.
 */

var THREE = require('three');

var MousePad = function( scene, camera, worldManager ) {
    this.worldManager = worldManager;

    this.raycaster = new THREE.Raycaster();
    this.screenVector = new THREE.Vector2( 0, 0 );

    this.scene = scene;
    this.camera = camera;
    this.intersectPoint = new THREE.Vector3();

    this.addEvents();
};


MousePad.prototype.addEvents = function(){
    window.addEventListener('mousemove', this.onMouseMove.bind( this ) )
};

MousePad.prototype.onMouseMove = function( e ){

    this.screenVector.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.screenVector.y = (1 - (e.clientY / window.innerHeight)) * 2 - 1;

};

MousePad.prototype.update = function( t ) {
    if( this.worldManager.ground ) {
        this.raycaster.setFromCamera(this.screenVector, this.camera);
        var intersects = this.raycaster.intersectObjects([this.worldManager.character.calcPlane, this.worldManager.character.mesh]);

        if (intersects.length > 0) {
            this.intersectPoint.copy(intersects[0].point);
        }
    }
};

module.exports = MousePad;