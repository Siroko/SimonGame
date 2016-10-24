/**
 * Created by siroko on 7/15/16.
 */

var THREE = require( 'three' );

var Simon = function(){

    THREE.EventDispatcher.call( this );

    this.score = 0; // user score
    this.speed = 250; // speed of the notes to be played
    this.paddingRounds = 1200; // time in miliseconds between rounds
    this.padding = 600; // time in miliseconds between notes
    this.machinePattern = []; // current pattern machine generated
    this.userPattern = []; // current pattern user generated
    this.notes = [100, 74, 75, 77]; // current notes
    this.isPlaying = false; // flag for testing if its playing right now

    this.isGameRunning = false;

};

Simon.prototype = Object.create( THREE.EventDispatcher.prototype );

Simon.prototype.startGame = function() {

    console.log('starting GAME_________________');

    this._addNote();
    this._playPattern();

    this.isPlaying = true;
    this.isGameRunning = true;
};


Simon.prototype._setDefault = function() { // set default values

    this.score = 0; // user score
    this.speed = 250; // speed of the notes to be played
    this.paddingRounds = 1200; // time in miliseconds between rounds
    this.padding = 600; // time in miliseconds between notes
    this.machinePattern = []; // current pattern machine generated
    this.userPattern = []; // current pattern user generated
    this.isPlaying = false; // flag for testing if its playing right now

};

// get random value from given
Simon.prototype._rand = function( lowest, highest) {

    var adjustedHigh = (highest - lowest) + 1;
    return Math.floor(Math.random()*adjustedHigh) + parseFloat(lowest);

};

Simon.prototype._addNote = function() {

    var note = this.notes[ this._rand( 0, this.notes.length - 1 ) ];
    this.machinePattern.push( note );

    console.log( this.machinePattern );

};

Simon.prototype._playPattern = function() {

    this.currentNoteIndex= 0;
    this.isPlaying = true;

    this._playNote();

};

Simon.prototype._playNote = function(){

    var note = this.machinePattern[ this.currentNoteIndex ];
    var delay = 0; // play one note every quarter second
    var velocity = 127; // how hard the note hits

    MIDI.setVolume(0, 127);
    MIDI.noteOn(0, note, velocity, delay);
    MIDI.noteOff(0, note, delay + 0.75);

    this.currentNoteIndex ++;

    console.log( 'index note ', this.notes.indexOf( note ) );
    this.dispatchEvent({
        type: 'playNote',
        index: this.notes.indexOf( note )

    });

    if( this.currentNoteIndex < this.machinePattern.length ) {

        setTimeout( (function(){
            this._playNote();


        }).bind( this ) , this.padding );

    } else {

        this._recording();

    }

};

Simon.prototype._recording = function() {

    this.isPlaying = false;

};

Simon.prototype._checkIfCorrect = function () {

    var userPatternLength = this.userPattern.length;
    var correct = true;

    for (var i = 0; i < userPatternLength; i++) {

        var noteM = this.machinePattern[ i ];
        var noteU = this.userPattern[ i ];

        if( noteM != noteU ) correct = false;

    }

    return correct;
};

Simon.prototype._gameOver = function() {

    setTimeout( ( function(){

        this._setDefault();



    } ).bind( this ), 2000 );

    this.dispatchEvent({
        type: 'gameOver'
    });

    this.isGameRunning = false;

    ////debugger;
    var note = 60;
    var delay = 0; // play one note every quarter second
    var velocity = 127; // how hard the note hits

    MIDI.setVolume(0, 127);
    MIDI.noteOn(0, note, velocity, delay);
    MIDI.noteOff(0, note, 2);



};

Simon.prototype.setHumanNote = function( noteIndex ) {

    if( this.isGameRunning ) {
        console.log( this.notes[ noteIndex ] , 'user added' );
        this.userPattern.push(this.notes[noteIndex]);
        if (this._checkIfCorrect()) {

            if (this.userPattern.length === this.machinePattern.length) {

                setTimeout(( function () {

                    this._addNote();
                    this._playPattern();
                    this.userPattern = [];

                } ).bind(this), this.paddingRounds);

            }

        } else {
            // stop current wrong note
            MIDI.noteOff(0, this.notes[noteIndex], 0);
            MIDI.setVolume(0, 0);
            this._gameOver();
        }
    }
};

module.exports = Simon;