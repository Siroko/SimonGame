/**
 *
 * Author Roger Pujol
 *
 * @fileoverview
 *
 * Web Audio Engine
 * -------------
 * This class is a sound engine implementation which can play at least 'numChannels' sounds at the same time.
 * createAudio will accept a URL/URI or a HTMLAudioElement as source.
 */

var AbstractAudioEngine = require('./AbstractAudioEngine');

/**
 @constructor
 */

var WebAudioEngine = function () {

    AbstractAudioEngine.call( this );

    this.type = "WebAudio";
    this.context = null;
    this.buffersCache = {};

};

WebAudioEngine.prototype = Object.create( AbstractAudioEngine.prototype );

WebAudioEngine.context_ = null;

WebAudioEngine.prototype.initialize = function ( numChannels ) {

    this.context = this.getAudioContext_();

    this.getExtension();
    this.onReady();
};

WebAudioEngine.prototype.getAudioContext_ = function() {

    if(soccer.WebAudioEngine.context_ === null){
        soccer.WebAudioEngine.context_ = new AudioContext();
    }

    return soccer.WebAudioEngine.context_;

}


WebAudioEngine.prototype.getExtension = function () {

    if(goog.userAgent.product.SAFARI){
        return this.extension = 'mp3';
    }

    goog.base(this, 'getExtension');
};


WebAudioEngine.prototype.createAudioFromURL = function ( id, url, callback ) {

    var audio = new soccer.Audio(id, url);
    this.channels.push( audio );

    var self	= this,
        request	= new XMLHttpRequest();

    request.open( 'GET', url, true );
    request.responseType = 'arraybuffer';

    request.onload = function() {
        self.context.decodeAudioData(
            request.response,
            function ( buffer ) {
                self.onBufferAudio( buffer, id, url, callback );
            },
            function ( buffer ) {
                self.onBufferAudioError( buffer, id, url, callback );
            }
        );
    };
    request.send();

    return audio;
};

WebAudioEngine.prototype.onBufferAudio = function ( buffer, id, url, callback ) {

    this.buffersCache[url] = buffer;

    var audio 			= this.getAudioFromId(id);
    var source			= this.context.createBufferSource( ),
        gainNode		= ( this.context.createGain )? this.context.createGain( ) : this.context.createGainNode( ),
        panNode			= ( this.context.createPanner )? this.context.createPanner( ) : this.context.createPannerNode( );

    panNode.panningModel = 1;
    panNode.distanceModel = 0;
    panNode.refDistance = 0;
    panNode.maxDistance = 2;

    source.buffer	= buffer;
    source.gain		= gainNode.gain;
    source.volume	= 1;

    audio.source = source;
    audio.panNode = panNode;

    this.addNode_(audio, gainNode);
    this.addNode_(audio, panNode);

    goog.events.dispatchEvent( this, {

        type	: soccer.EventType.LOAD,
        id		: id,
        error	: false
    } );

    if ( callback ) callback();
};

WebAudioEngine.prototype.onBufferAudioError = function ( buffer, id, url, callback ) {
    if(goog.DEBUG) console.log('Could not decode the buffer for ' + id);
    goog.events.dispatchEvent( this, {

        type	: soccer.EventType.LOAD,
        id		: id,
        error	: true
    } );

    if ( callback ) callback();
};


WebAudioEngine.prototype.getAudioFromId = function ( id ) {

    for ( var i = 0; i < this.channels.length; i++ ) {

        if ( this.channels[ i ].id == id ) return this.channels[ i ];
    }

    return null;
};

WebAudioEngine.prototype.play = function ( id, volume, loop, overlap, offset ) {

    return this.play_( id, volume, loop, overlap, offset );

};

WebAudioEngine.prototype.play_ = function ( id, volume, loop, overlap, offset ) {

    var audio = this.getAudioFromId( id );
    var audioSource = audio.source;

    if(audio.isPaused && audioSource.playbackState === audioSource.PLAYING_STATE){
        this.stop_(audioSource);
    }else{

        // Allow audio to overlap by default
        if( overlap == undefined ){
            overlap = true;
        }

        if(audioSource.playbackState === audioSource.PLAYING_STATE && overlap === false){
            return null;
        }
    }

    if(audioSource.playbackState > 0){
        audioSource = this.refreshBufferSource_(audio);
    }

    audio.volume = ( volume === null )? audio.volume : volume;

    if(audio.isPaused){
        audio.isPaused = false;

        if(offset === undefined){
            offset = audio.pausedTime;
        }
        audio.pausedTime = null;

        this.setVolume_(audioSource.gain, 0, 0);
        this.setVolume_(audioSource.gain, audio.volume, 1);
    }else{
        this.setVolume_(audioSource.gain, audio.volume, 0);
    }

    if ( loop ) {
        audio.loop = true;
        audioSource.loop = audio.loop;
        audioSource.loopStart = audio.loopStart;
        audioSource.loopEnd = audio.loopEnd;

        this.workingChannels.push( audio );
    }

    audio.startOffset = offset || 0;
    audio.startTime = this.context.currentTime - audio.startOffset;

    if ( audioSource.start ){
        audioSource.start( audio.startTime, audio.startOffset );
    } else {
        audioSource.noteOn( audio.startTime, audio.startOffset );
    }

    return audio;
};

WebAudioEngine.prototype.pause = function ( id, fade ) {

    var audio = this.getAudioFromId( id );
    var audioSource = audio.source;

    audio.isPaused = true;
    audio.pausedTime = this.context.currentTime - audio.startTime;

    fade = fade || 0;

    if(fade){
        this.setVolume_(audioSource.gain, 0, fade);
    }

    this.stop_(audioSource, this.context.currentTime + fade);

    return audio;

};

WebAudioEngine.prototype.stop = function ( id ) {

    var audio = this.getAudioFromId( id );
    var audioSource = audio.source;

    this.stop_(audioSource);

    audio.loop = false;
    audio.startTime = null;
    audio.isPaused = false;

    var audioIndex = this.workingChannels.indexOf(audio);
    if(audioIndex >= 0){
        this.workingChannels.splice( audioIndex, 1 );
    }
};

WebAudioEngine.prototype.stop_ = function ( audioSource, when ) {

    if(when === undefined){
        when = 0;
    }

    if(audioSource.playbackState === audioSource.PLAYING_STATE){

        if ( audioSource.stop ) {
            audioSource.stop( when );
        } else {
            audioSource.noteOff( when );
        }
    }

}

WebAudioEngine.prototype.stopAt = function ( id, time ) {

    var audio = this.getAudioFromId( id );
    this.stop_(audio.source, time);

};

soccer.WebAudioEngine.prototype.stopAll = function () {

    // Copy current working channels array (Hack)
    var channels = [].concat(this.channels);

    for (var i = 0, len = channels.length; i < len; i++) {
        this.stop_(channels[ i ].source);
    }

};

WebAudioEngine.prototype.createBiquadFilter = function ( id, settings ) {

    var audio = this.getAudioFromId( id );
    var audioSource = audio.source;

    var s = settings || {
            type: 0,
            frequency:{
                value: 440
            }
        };

    var filter = this.context.createBiquadFilter();
    filter.type = s.type;
    filter.frequency.value = ( s.frequency && s.frequency.value ) ? s.frequency.value : 440;

    if( s.Q && s.Q.value ) {
        filter.Q.value = s.Q.value;
    }
    else {
        filter.Q.value = 0;
    }


    this.addNode_(audio, filter);

    return filter;
};

WebAudioEngine.prototype.createJavascriptNode = function ( id ) {

    var audio = this.getAudioFromId( id );
    var audioSource = audio.source;

    var args = Array.prototype.slice.call(arguments, 1);
    var filter = this.context.createJavaScriptNode.apply(this.context, args);

    this.addNode_(audio, filter);

    return filter;
};

WebAudioEngine.prototype.addNode_ = function ( audio, node ) {

    if(!audio.nodes){
        audio.nodes = [];
    }

    audio.nodes.push(node);
    audio.source.disconnect(0);

    var lastN = this.context.destination;
    for (var i = 0, len = audio.nodes.length; i < len; i++) {
        audio.nodes[i].disconnect(0);
        audio.nodes[i].connect(lastN);
        lastN = audio.nodes[i];
    };

    audio.source.connect(lastN);
}


/**
 * @public
 * @param {string} id The audio id.
 * @param {number} volume The volume value range is between 0 and 1.
 * @param {number} fade The fade time.
 */

WebAudioEngine.prototype.setVolume = function ( audioId, volume, fade ) {

    var audio = this.getAudioFromId( audioId );
    audio.volume = ( volume === null )? 1 : volume;
    this.setVolume_(audio.source.gain, audio.volume, fade);

};

/**
 * @private
 * @param {GainNode} gainNode The gain node to set volume to.
 * @param {number} volume The volume value range is between 0 and 1.
 * @param {number} fade The fade time.
 */

WebAudioEngine.prototype.setVolume_ = function ( gainNode, volume, fade ) {

    if ( fade ) {

        var tweenObj = { vol: gainNode.value };

        TweenLite.to( tweenObj, fade, {

            vol : volume,
            onUpdate : function(){
                gainNode.value = tweenObj.vol * this.generalVolume;
            },
            onUpdateScope : this,
            ease : Power2.easeOut

        });

    } else {

        gainNode.value = volume * this.generalVolume;

    }

};

WebAudioEngine.prototype.setPan = function ( audioId, pan ) {

    var audio = this.getAudioFromId( audioId );

    if ( typeof( pan ) === "number" ) {
        audio.panNode.setOrientation( -pan, 0, 0 );
        audio.panNode.setPosition( pan, 0, -0.5 );
    }
    else if ( pan.x != undefined && pan.y != undefined ) {
        audio.panNode.setOrientation( -pan.x, pan.y, 0 );
        audio.panNode.setPosition( pan.x, pan.y, 0 );
    }

};

WebAudioEngine.prototype.setCurrentTime = function ( audioId, time) {

    var audio = this.getAudioFromId( audioId );

    if(audio.startTime){
        this.stop(audio.id);
    }

    this.play_(audio.id, audio.volume, audio.loop, null, time);

};

WebAudioEngine.prototype.getCurrentTime = function ( audioId ) {

    var audio = this.getAudioFromId( audioId );
    var time = audio.startTime || this.context.currentTime;

    if(audio.isPaused){
        return audio.pausedTime
    }

    if(audio.source && audio.source.playbackState === audio.source.FINISHED_STATE){
        return audio.source.buffer.duration;
    }

    if(audio.source && audio.source.buffer.duration){

        var iterationTime = (this.context.currentTime - time) / audio.source.buffer.duration;

        if(iterationTime > 1){
            time += audio.source.buffer.duration * Math.floor(iterationTime);
        }

    }

    return Math.max(0, this.context.currentTime - time);

};

WebAudioEngine.prototype.fadeIn = function ( audioId, timeFade, callback ) {

    var audio			= this.getAudioFromId( audioId ),
        currentTime		= this.context.currentTime,
        self			= this;

    TweenLite.killTweensOf( audio );
    TweenLite.to( audio, timeFade, {

        volume	: 1,
        ease	: Linear.None,
        onUpdate : function () {

            audio.source.gain.value = parseFloat(audio.volume * self.generalVolume);
        },
        onComplete : function(){

            callback && callback(audio);
        }
    });
};

WebAudioEngine.prototype.fadeOut = function ( audioId, timeFade, callback ) {

    var audio			= this.getAudioFromId( audioId ),
        currentTime		= this.context.currentTime,
        self			= this;

    TweenLite.killTweensOf( audio );
    TweenLite.to( audio, timeFade, {

        volume	: 0,
        ease	: Linear.None,
        onUpdate : function () {

            audio.source.gain.value = parseFloat(audio.volume * self.generalVolume);
        },
        onComplete : function(){

            callback && callback(audio);
        }
    });
};

WebAudioEngine.prototype.setGeneralVolume = function ( volume, fade, timeFade ) {

    var self = this,
        updateVolume = function () {

            for ( var i = 0; i < self.channels.length; i++ ) {

                var audio = self.channels[ i ];
                var gain = parseFloat(audio.volume * self.generalVolume);

                if(gain){
                    audio.source.gain.value = gain;
                }
            }
        };

    if ( fade ) {

        // TweenLite.killTweensOf( this );
        TweenLite.to( this, timeFade || 1, {

            generalVolume : volume,
            ease : Power2.easeOut,
            onUpdate : updateVolume
        });
    } else {

        this.generalVolume = volume;
        updateVolume();
    }
};

WebAudioEngine.prototype.refreshBufferSource_ = function(audio) {

    // Create (or replace) buffer source
    audio.source = this.context.createBufferSource();

    // Attach buffer to buffer source
    audio.source.buffer = this.buffersCache[audio.url];

    // Connect to gain node
    audio.source.connect(audio.nodes[audio.nodes.length-1]);

    // Update settings
    audio.source.loop = audio.loop;

    return audio.source;
};


/**
 @return {boolean} isAvailable
 */

WebAudioEngine.determineAvailability_ = function() {

    try {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
    }catch(e) {
    }

    if (typeof window.AudioContext !== 'undefined') {
        return true
    }

    return false;

};

/**
 @type {boolean}
 */

WebAudioEngine.isAvailable = WebAudioEngine.determineAvailability_();


module.exports = WebAudioEngine;