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

                { url: 'assets/sound/music.mp3', type: 'mp3' },
                { url: 'assets/models/snowflake_.obj', type: 'text' },
                { url: 'assets/sceneClouds.obj', type: 'text' },
                { url: 'assets/matcap_twilight.jpg', type: 'jpg' },
                { url: 'assets/faceSun_2048.png', type: 'png' },
                { url: 'assets/ao_color.jpg', type: 'jpg' },
                { url: 'assets/test_Light.jpg', type: 'jpg' },
                { url: 'assets/sound/midi/MusyngKite/tinkle_bell-ogg.js', type: 'text' },
                { url: 'assets/letters/M.json', type: 'json' },
                { url: 'assets/letters/E.json', type: 'json' },
                { url: 'assets/letters/R.json', type: 'json' },
                { url: 'assets/letters/Y.json', type: 'json' },
                { url: 'assets/letters/X.json', type: 'json' },
                { url: 'assets/letters/A.json', type: 'json' },
                { url: 'assets/letters/S.json', type: 'json' },
                { url: 'assets/faceCreature.png', type: 'png' },
                { url: 'assets/faceCreatureHappy.png', type: 'png' },
                { url: 'assets/normal.jpg', type: 'jpg' },
                { url: 'assets/matcaps/matcap_yellow.png', type: 'png' },
                { url: 'assets/matcaps/matcap_red.png', type: 'png' },
                { url: 'assets/matcaps/matcap_neutral.png', type: 'png' },
                { url: 'assets/matcaps/matcap_green.png', type: 'png' }

            ]
        }
    ).on('complete', this.onLoadAssets.bind( this ) );

    assetsLoader.start();

};

Main.prototype.onLoadAssets = function( e ){
    console.log('APP initializing');

    var container = document.getElementById( "container" );
    container.style.opacity = "0";
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