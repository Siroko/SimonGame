/**
 * Created by Jaume Sanchez @thespite on 7/13/16.
 */

var SongPoint = function ( beat, duration, pitch, text ) {

    this.beat = parseFloat( beat );
    this.duration = parseFloat( duration );
    this.pitch = parseFloat( pitch );
    this.text = text;

};

module.exports = SongPoint;