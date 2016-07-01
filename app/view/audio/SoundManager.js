/**
 * Created by siroko on 7/1/16.
 */

var SoundManager = function(){

    this.MAX_OSC = 50;

    this.oscillators = [];
    this.init();
};

SoundManager.prototype.init = function() {

    var AudioContext = AudioContext || webkitAudioContext;
    this.context = new AudioContext();

    this.masterGain = this.context.createGain();
    this.masterGain.gain.value = 10;

    for ( var i = 0; i < this.MAX_OSC; i++ ) {

        var osc =this. context.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime( 0, 0 );

        this.oscillators.push( osc );

        osc.connect( this.masterGain );
    }

    this.masterGain.connect( this.context.destination );

};

SoundManager.prototype.start = function() {
    for (var i = 0; i < this.MAX_OSC; i++) {
        this.oscillators[ i ].start( 0 );
    }
};

SoundManager.prototype.getNode = function() {

    var node = this.oscillators.pop();

    return node;

};

SoundManager.prototype.releaseNode = function( node ) {

    this.oscillators.push( node );

};

SoundManager.prototype.setValue = function( node, value ) {

    node.frequency.setValueAtTime( value, this.context.currentTime + .1 );

};

module.exports = SoundManager;