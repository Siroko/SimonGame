/**
 * Created by siroko on 7/13/16.
 */

var THREE = require( 'three' );

var UltraStarParser = require('./UltraStarParser');
var SongsModel = require('./SongsModel');

var UltraStarManager = function(){

    this.model = new SongsModel();
    this.ultraStarParser = new UltraStarParser();

    this.container = new THREE.Object3D();
    this.container.position.z = -2;
    this.container.position.y = 35;
    //this.container.position.x = -19;

    this.mainText = '';
};

UltraStarManager.prototype.setSong = function( id ) {
    this.ultraStarParser.load( this.model.library[ id ] ).then( this.onSongParsed.bind( this ) );

    this.main = new Howl({
        src : ['assets/sound/'+this.model.library[ id ].file+'.wav'],
        loop: true
    });

};

UltraStarManager.prototype.onSongParsed = function() {

    this.main.play();

    var geom = new THREE.BoxBufferGeometry(0.3, 0.3, 0.3, 2, 2, 2);
    var mat = new THREE.MeshBasicMaterial({color:0xFF0000});
    var l;

    for (var i = 0; i < 1000000; i++) {

        l = this.ultraStarParser.get( i );
        if( l ) {
            var m = new THREE.Mesh( geom, mat );
            m.scale.y = l.duration;
            m.position.y = l.beat * 0.1;
            m.position.x = l.pitch * 0.8;

            this.container.add( m );
        }
    }
};

UltraStarManager.prototype.update = function() {

    //this.container.position.y = this.main.pos()._pos;


    //if( this.main.playing() ){
    //    var t = this.main.seek();
    //    //this.container.position.y = (t) * -1;
    //    //console.log( t );
    //    var p = this.ultraStarParser.get( t );
    //    if( p ){
    //        if( this.mainText != p.text ) {
    //            this.mainText = p.text;
    //            console.log(this.mainText);
    //        }
    //    }
    //}

};

module.exports = UltraStarManager;