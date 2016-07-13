/**
 * Created by Jaume Sanchez @thespite  on 7/13/16.
 */

var SongPoint = require('./SongPoint');

var UltraStarParser = function() {

    this.text = '';
    this.bpm = 0;
    this.gap = 0;
    this.lines = [];

    this.pathFiles = 'assets/ultrastar/'

};

UltraStarParser.prototype.load = function( songObject ) {

    this.song = songObject;
    var src = this.pathFiles + songObject.file + '.txt';

    return new Promise( function( resolve, reject ) {

        fetch( src ).then( response =>
            response.text().then( text => { this.parse( text ).then( function(){
                resolve();
            } );
        } ) );

    }.bind( this ) );

};

UltraStarParser.prototype.get = function( time ) {

    var currentBeat = Math.floor( ( time - this.gap ) * this.song.factor );
    var line = this.lines[ currentBeat ];

    for( var j = this.lines.length - 2; j >= 0; j-- ) {
        var l = this.lines[ j ];
        if( l.beat <= currentBeat && ( l.beat + l.duration ) >= currentBeat ) {
            return l;
        }
    }
    //return line;

};

UltraStarParser.prototype.parse = function( text ) {

    return new Promise( function( resolve, reject ) {

        this.text = text.split( '\n' );

        var pitches = {};

        this.text.forEach( line => {

            if( line[ 0 ] === ':' ) {

                var parts = line.split( /:[\s]+([\S]+)[\s]+([\S]+)+[\s]+([\S]+)[\s]+([\S]+)/gmi );
                var p = new SongPoint( parts[ 1 ], parts[ 2 ], parts[ 3 ], parts[ 4 ] );
                this.lines.push( p );
                if( pitches[ p.pitch ] ) pitches[ p.pitch ]++;
                else pitches[ p.pitch ] = 1;

            } else if( line[ 0 ] === '*' ) {

                var parts = line.split( /\*[\s]+([\S]+)[\s]+([\S]+)+[\s]+([\S]+)[\s]+([\S]+)/gmi );
                var p = new SongPoint( parts[ 1 ], parts[ 2 ], parts[ 3 ], parts[ 4 ] )
                this.lines.push( p );

                if( pitches[ p.pitch ] ) pitches[ p.pitch ]++;
                else pitches[ p.pitch ] = 1;

            } else if( line[ 0 ] === '-' ) {

            } else if( line[ 0 ] === 'F' ) {

            } else if( line[ 0 ] === 'E' ) {

            } else {
                var parts = line.split( /#([\S]*):(.*)/gmi );
                if( parts[ 1 ] === 'BPM' ) this.bpm = parseFloat( parts[ 2 ].replace( ',', '.' ) );
                if( parts[ 1 ] === 'GAP' ) this.gap = parseFloat( parts[ 2 ] ) / 1000;
            }
        } );

        this.bpm = 119;
        this.pitches = pitches;

        //var s = 10;
        //
        //this.lines.forEach( l => {
        //
        //    var d = document.createElement( 'div' );
        //    d.className = 'note';
        //    d.style.top = ( l.beat * s ) + 'px';
        //    d.style.left = ( ( l.pitch + 10 ) * 2 ) + 'vw';
        //    d.style.height = ( l.duration * s ) + 'px';
        //    this.dom.appendChild( d );
        //
        //} );

        resolve();

    }.bind( this ) );

};

module.exports = UltraStarParser;