/**
 * Created by siroko on 7/15/16.
 */

var Simon = function(){

    this.score = 0; // user score
    this.speed = 250; // speed of the notes to be played
    this.paddingRounds = 400; // time in miliseconds between rounds
    this.padding = 400; // time in miliseconds between notes
    this.machinePattern = []; // current pattern machine generated
    this.userPattern = []; // current pattern user generated
    this.notes = [70, 74, 75, 77]; // current notes
    this.isPlaying = true; // flag for testing if its playing right now

};

Simon.prototype.startGame = function() {

    this._addNote();
    this._playPattern();

};


Simon.prototype._setDefault = function() { // set default values

    this.score = 0; // user score
    this.speed = 250; // speed of the notes to be played
    this.paddingRounds = 400; // time in miliseconds between rounds
    this.padding = 400; // time in miliseconds between notes
    this.machinePattern = []; // current pattern machine generated
    this.userPattern = []; // current pattern user generated
    this.isPlaying = true; // flag for testing if its playing right now

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

    if( this.currentNoteIndex < this.machinePattern.length ) {

        setTimeout( this._playNote.bind( this ), this.padding );

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

    console.log( 'GAME OVER' );

    setTimeout( ( function(){

        this._setDefault();
        this.startGame();

    } ).bind( this ), 1000 );

};

Simon.prototype.setHumanNote = function( noteIndex ) {

    console.log( this.notes[ noteIndex ] , 'user added' );
    this.userPattern.push( this.notes[ noteIndex ] );
    if( this._checkIfCorrect() ){

        if( this.userPattern.length === this.machinePattern.length ) {
            setTimeout( ( function(){

                this._addNote();
                this._playPattern();
                this.userPattern = [];

            } ).bind( this ), this.paddingRounds );
        }

    } else {

        this._gameOver();

    }

};

module.exports = Simon;