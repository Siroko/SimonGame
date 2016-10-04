/**
 * Created by siroko on 6/27/16.
 */

var THREE = require('three');

var MousePad = function( scene, camera, worldManager ) {

    THREE.EventDispatcher.call( this );

    this.worldManager = worldManager;

    this.raycaster = new THREE.Raycaster();
    this.screenVector = new THREE.Vector2( 0, 0 );

    this.scene = scene;
    this.camera = camera;
    this.intersectPoint = new THREE.Vector3();
    this.intersectPoint2 = new THREE.Vector3();

    this.pointer = new THREE.Mesh( new THREE.SphereBufferGeometry( 0.01, 10, 10), new THREE.MeshBasicMaterial( {
        color: 0xFF4473,
        transparent:true

    } ) );

    this.pointer.castShadow=true;

    this.scene.add( this.pointer );

    this.pointerB = new THREE.Mesh( new THREE.SphereBufferGeometry( 0.01, 10, 10), new THREE.MeshBasicMaterial( {
        color: 0xFF4473,
        transparent:true,
        opacity: 0.5

    } ) );
    this.pointerB.castShadow=true;
    this.scene.add( this.pointerB );

    this.addEvents();

};

MousePad.prototype = Object.create( THREE.EventDispatcher.prototype );

MousePad.prototype.addEvents = function() {

    this.mouseMoveHandler = this.onMouseMove.bind( this );
    this.mouseClickHandler = this.mouseClick.bind( this );

    window.addEventListener( 'mousemove', this.mouseMoveHandler );
    window.addEventListener( 'touchstart', this.mouseClickHandler );
    window.addEventListener( 'touchend', this.onTouchEnd.bind( this ) );

    // disable mobile safari "bounce"
    document.addEventListener('touchmove', function(e){ e.preventDefault(); }, false);

};

MousePad.prototype.mouseClick = function( e ) {
    console.log('click');
    MIDI.noteOn(0, 1, 1, 0);
    //var note = 70;
    //var delay = 0; // play one note every quarter second
    //var velocity = 127; // how hard the note hits
    //
    //MIDI.setVolume(0, 127);
    //MIDI.noteOn(0, note, velocity, delay);
    //MIDI.noteOff(0, note, delay + 0.75);
    //window.removeEventListener( 'click', this.mouseClickHandler );
};

MousePad.prototype.onMouseMove = function( e ){

     this.screenVector.x = (e.clientX / window.innerWidth) * 2 - 1;
     this.screenVector.y = (1 - (e.clientY / window.innerHeight)) * 2 - 1;

};

MousePad.prototype.onTouchEnd = function( e ){

    window.removeEventListener('mousemove', this.mouseMoveHandler );

    this.screenVector.x = 0;
    this.screenVector.y = 0;
};

MousePad.prototype.update = function( t, objs ) {

    this.raycaster.setFromCamera(this.screenVector, this.camera);

    var intersects = this.raycaster.intersectObjects( objs );
    if (intersects.length > 0) {
        this.intersectPoint.copy(intersects[0].point);
        this.intersectPoint2.copy(intersects[0].point);
    }

    this.pointer.position.copy( this.intersectPoint );
    this.pointerB.position.copy( this.intersectPoint );

    if( this.worldManager.collisionBox ) {

        intersects = this.raycaster.intersectObjects([this.worldManager.collisionBox]);
        if (intersects.length > 0) {
            this.pointerB.scale.x += 0.1;
            this.pointerB.scale.y += 0.1;
            this.pointerB.scale.z += 0.1;

            if( this.pointerB.scale.y > 5 ){
                this.dispatchEvent( {
                    type: 'onStartGame'
                } );

                this.pointerB.scale.set( 1, 1, 1 );
            }
        } else {
            this.pointerB.scale.set( 1, 1, 1 );
        }
    }


};

module.exports = MousePad;