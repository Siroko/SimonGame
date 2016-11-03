/**
 * Created by siroko on 7/8/15.
 */

var World3D = require('./view/World3D');
var AssetsLoader = require('assets-loader');

var Main = function(){
    this.world3D = null;
};

Main.prototype.init = function() {

    var assetsLoader = new AssetsLoader(
        {
            assets: [

                { url: '/assets/models/pumpkin.json', type: 'json' },
                { url: '/assets/models/pumpkin-done_unify.jpg', type: 'jpg' },
                { url: '/assets/models/pumpkin-done_unify_1k.jpg', type: 'jpg' },
                { url: '/assets/models/graveyard1k/graveyard-lights.jpg', type: 'jpg' },
                { url: '/assets/models/graveyard1k/graveyard-lights.jpg', type: 'jpg' },
                { url: '/assets/models/graveyard1k/graveyard-lights-01.jpg', type: 'jpg' },
                { url: '/assets/models/graveyard1k/graveyard-lights-02.jpg', type: 'jpg' },
                { url: '/assets/models/graveyard1k/graveyard-lights-03.jpg', type: 'jpg' },
                { url: '/assets/models/graveyard1k/graveyard-lights-04.jpg', type: 'jpg' },
                { url: '/assets/models/graveyard8k/graveyard.obj', type: 'text' },
                { url: '/assets/models/graveyard8k/graveyard-lights.jpg', type: 'jpg' },
                { url: '/assets/models/graveyard8k/graveyard-lights-01.jpg', type: 'jpg' },
                { url: '/assets/models/graveyard8k/graveyard-lights-02.jpg', type: 'jpg' },
                { url: '/assets/models/graveyard8k/graveyard-lights-03.jpg', type: 'jpg' },
                { url: '/assets/models/graveyard8k/graveyard-lights-04.jpg', type: 'jpg' },
                { url: '/assets/models/hand-zombie-left.obj', type: 'text' },
                { url: '/assets/models/hand-zombie-right.obj', type: 'text' },
                { url: 'assets/models/hand-zombie-diffuse.png', type: 'png' },
                { url: 'assets/models/hand-zombie-right-occlusion.png', type: 'png' },
                { url: 'assets/models/hand-zombie-left-occlusion.png', type: 'png' },
                { url: 'assets/sound/HALLOWEEN.mp3', type: 'mp3' },
                { url: 'assets/sound/midi/MusyngKite/fx_8_scifi-mp3.js', type: 'text' },
                { url: 'assets/sound/midi/MusyngKite/fx_8_scifi-ogg.js', type: 'text' }

            ]
        }
    ).on('complete', this.onLoadAssets.bind( this ) );

    assetsLoader.start();

};

Main.prototype.onLoadAssets = function( e ){
    console.log('APP initializing');

    var container = document.getElementById( "container" );
    this.world3D = new World3D( container );

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