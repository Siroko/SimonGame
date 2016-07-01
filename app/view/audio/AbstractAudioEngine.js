/**
 *
 * Author Roger Pujol
 *
 * @fileoverview
 *
 * Audio Engine
 * -------------
 *
 */

goog.require('goog.events.EventTarget');

/**
 @constructor
 */

AbstractAudioEngine = function () {

    var o 			        = options || {};

    this.id 		        = id;
    this.url 		        = url;
    this.source             = null;

    this.loop 		        = false;
    this.loopStart	        = 0;
    this.loopEnd	        = 0;

    this.isPaused 	        = false;
    this.pausedTime         = 0;

    this.isReady 			= false;
    this.extension			= null;
    this.audioCache			= [];
    this.channels			= [];
    this.workingChannels	= [];
    this.generalVolume		= 1;
    this.type 				= "";

};
goog.inherits( AbstractAudioEngine, goog.events.EventTarget );

AbstractAudioEngine.MAX_NUM_CHANNELS	= 10;

AbstractAudioEngine.AudioTypes	= {

    'mp3'	: 'audio/mpeg;',
    'ogg'	: 'audio/ogg; codecs="vorbis"',
    'webm'	: 'audio/webm; codecs="vorbis"',
    'mp4'	: 'audio/mp4; codecs="mp4a.40.2"',
    'wav'	: 'audio/wav; codecs="1"'
};

AbstractAudioEngine.EventType = {
    READY : 'ready'
}

AbstractAudioEngine.prototype.initialize = function ( numChannels ) {

    this.getExtension();
    this.onReady();

};

AbstractAudioEngine.prototype.onReady = function () {

    if(this.isReady === false){
        this.isReady = true;

        goog.events.dispatchEvent( this, {
            type : AbstractAudioEngine.EventType.READY
        } );
    }

}

/**
 @protected
 */

AbstractAudioEngine.prototype.getExtension = function () {

    var audio = document.createElement( 'audio' );
    var audioTypes = AbstractAudioEngine.AudioTypes;

    for ( var extension in audioTypes ) {

        if ( audio.canPlayType && audio.canPlayType( audioTypes[ extension ] ) ) {

            this.extension = extension;
            break;
        }
    }
};

/**
 @protected
 */

AbstractAudioEngine.prototype.createChannels = function ( numChannels ) {

};

/**
 @public
 */

AbstractAudioEngine.prototype.createAudio = function ( id, urlWithoutExtension, callback ) {

    if ( this.extension ) {

        var url = urlWithoutExtension + '.' + this.extension;
        return this.createAudioFromURL( id, url, callback );
    }

    return false;
};

/**
 @public
 */

AbstractAudioEngine.prototype.createAudioFromURL = function ( id, url, callback ) {

    return false;
};

/**
 @protected
 */

AbstractAudioEngine.prototype.onAudioLoaded = function ( e ) {

};

/**
 @protected
 */

AbstractAudioEngine.prototype.getAudioFromId = function ( audioId ) {

    return null;
};

/**
 * @public
 * @param {string} id The audio id.
 * @param {number} volume The volume value range is between 0 and 1.
 * @param {boolean} loop Wheter the audio should loop
 * @param {boolean} overlap Wheter the audio should overlap playback.
 */

AbstractAudioEngine.prototype.play = function ( id, volume, loop, overlap ) {

    return null;
};


/**
 * @public
 * @param {string} id The audio id.
 * @param {number} fade The fade time in seconds.
 */

AbstractAudioEngine.prototype.pause = function ( id, fade ) {

    return null;

};


/**
 * @public
 * @param {string} id The audio id.
 */

AbstractAudioEngine.prototype.stop = function ( id ) {

}

/**
 * @public
 * @param {string} id The audio id.
 * @param {number} time The time in milliseconds the audio should stop.
 */

AbstractAudioEngine.prototype.stopAt = function ( id, time ) {

}

/**
 @public
 */

AbstractAudioEngine.prototype.stopAll = function () {

}



AbstractAudioEngine.prototype.createBiquadFilter = function ( id, settings ) {
    return null;
}

AbstractAudioEngine.prototype.createJavascriptNode = function ( id ) {
    return null;
}

/**
 * @public
 * @param {string} id The audio id.
 * @param {number} volume The volume value range is between 0 and 1.
 */

AbstractAudioEngine.prototype.setVolume = function ( audioId, volume ) {


};

/**
 * @public
 * @param {string} id The audio id.
 * @param {number} pan The pan value range is between -1 and 1.
 */

AbstractAudioEngine.prototype.setPan = function ( audioId, pan ) {


};

/**
 * @public
 * @param {string} id The audio id.
 * @param {number} time The fade time.
 */

AbstractAudioEngine.prototype.fadeIn = function ( audioId, timeFade ) {


};

/**
 * @public
 * @param {string} id The audio id.
 * @param {number} time The fade time.
 */

AbstractAudioEngine.prototype.fadeOut = function ( audioId, timeFade ) {


};

AbstractAudioEngine.prototype.fadeInChannel = function ( channel, audio, timeFade ) {


};

AbstractAudioEngine.prototype.fadeOutChannel = function ( channel, audio, timeFade ) {

};

AbstractAudioEngine.prototype.setGeneralVolume = function ( generalVolume, fade, timeFade ) {

};

/**
 @return {boolean} isAvailable
 */

AbstractAudioEngine.determineAvailability_ = function() {
    return false;
};

/**
 @type {boolean}
 */

AbstractAudioEngine.isAvailable = AbstractAudioEngine.determineAvailability_();

module.exports = AbstractAudioEngine;