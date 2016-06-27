/**
 * Created by siroko on 7/8/15.
 */

var World3D = require('./view/World3D');
var ModelData = require('./model/ModelData');

var Main = function(){
    this.model = null;
    this.world3D = null;
};

Main.prototype.init = function() {

    console.log('APP initializing');

    var container = document.getElementById( "container" );
    this.model = new ModelData();
    this.world3D = new World3D( container, this.model );

    this.addEvents();
    this.onResize( null );

};

Main.prototype.addEvents = function() {

    window.addEventListener( 'resize', this.onResize.bind( this ) );
    window.addEventListener( 'vrdisplaypresentchange', this.onResize.bind( this ), true );
};

Main.prototype.onResize = function( e ) {

    var w = window.innerWidth;
    var h = window.innerHeight;

    this.world3D.onResize( w, h );
};

module.exports = Main;