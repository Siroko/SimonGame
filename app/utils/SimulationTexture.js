/**
 * Created by siroko on 7/8/15.
 */

var THREE = require('three');

var BaseGLPass = require('./BaseGLPass');

var vs_simpleQuad       = require('../glsl/vs-simple-quad.glsl');
var fs_updatePositions  = require('../glsl/fs-update-positions.glsl');

var dat = require('dat-gui');
var gsap = require('gsap');

var SimulationTexture = function( params ) {

    BaseGLPass.call( this, params );

    this.sizeW      = params.sizeW;
    this.sizeH      = params.sizeH;

    this.total      = this.sizeW * this.sizeH;

    this.pointSize  = params.pointSize || 0;
    this.initialBuffer = params.initialBuffer;

    this.boundary   = params.boundary || {
            position : new THREE.Vector3( 0, 10, 0 ),
            size : new THREE.Vector3( 4, 4, 4 )
        };

    this.directionFlow = params.directionFlow;
    this.locked = params.locked || 0;

    this.colorParticle = params.colorParticle || new THREE.Color(0xFFFFFF);

    this.noiseTimeScale = params.noiseTimeScale || 2.57;
    this.noisePositionScale = params.noisePositionScale || 0.01;
    this.noiseScale = params.noiseScale || 0.08;
    this.lifeTime = params.lifeTime || 100;
    this.persistence = params.persistence || 0.03;
    this.speedDie = params.speedDie || 0.0001;
    this.bending = params.bending || 1.000;

    this.offset = params.offset || new THREE.Vector3(0, 0, 0);

    this.timesCycle = 1;

    this.setup();
};

SimulationTexture.prototype = Object.create( BaseGLPass.prototype );

SimulationTexture.prototype.setup = function() {

    this.pingpong           = 0;
    this.finalPositionsRT   = this.getRenderTarget( this.sizeW, this.sizeH );

    this.data = new Float32Array( this.sizeW * this.sizeH * 4 );

    if( this.initialBuffer ) { // if initial buffer is defined just feed it to the data texture
        this.data = this.initialBuffer;
    } else { // else we just set them randomly

        for( var i = 0; i < this.total; i ++ ) {

            this.data[ i * 4 ]     = ( ( Math.random() * 2 - 1 ) * 0.5 ) * this.boundary.size.x + this.boundary.position.x;
            this.data[ i * 4 + 1 ] = ( ( Math.random() * 2 - 1 ) * 0.5 ) * this.boundary.size.y + this.boundary.position.y;
            this.data[ i * 4 + 2 ] = ( ( Math.random() * 2 - 1 ) * 0.5 ) * this.boundary.size.z + this.boundary.position.z;
            this.data[ i * 4 + 3 ] = 100; // frames life

        }

    }

    this.geometryRT = new THREE.DataTexture( this.data, this.sizeW, this.sizeH, THREE.RGBAFormat, THREE.FloatType );
    this.geometryRT.minFilter = THREE.NearestFilter;
    this.geometryRT.magFilter = THREE.NearestFilter;
    this.geometryRT.needsUpdate = true;

    this.updatePositionsMaterial = new THREE.RawShaderMaterial( {
        uniforms: {
            'uPrevPositionsMap'     : { type: "t", value: this.geometryRT },
            'uGeomPositionsMap'     : { type: "t", value: this.geometryRT },
            'uTime'                 : { type: "f", value: 0 },
            'uLifeTime'             : { type: "f", value: this.lifeTime },
            'uDirectionFlow'        : { type: "v3", value: this.directionFlow || new THREE.Vector3(0, 0.01, 0) },
            'uOffsetPosition'       : { type: "v3", value: new THREE.Vector3() },
            'uLock'                 : { type: "i", value: this.locked },
            'uCollision'            : { type: "v3", value: new THREE.Vector3() },
            'uNoiseTimeScale'       : { type: "f", value: this.noiseTimeScale },
            'uNoisePositionScale'   : { type: "f", value: this.noisePositionScale },
            'uNoiseScale'           : { type: "f", value: this.noiseScale },
            'uOffset'               : { type: "v3", value: this.offset },
            'uPersistence'          : { type: "f", value: this.persistence },
            'uSpeedDie'             : { type: "f", value: this.speedDie },
            'uBending'             : { type: "f", value: this.bending },
            'uOriginEmiter'         : { type: "v3", value: new THREE.Vector3() },
            'uBoundary'             : { type: 'fv1', value : [
                this.boundary.position.x,
                this.boundary.position.y,
                this.boundary.position.z,
                this.boundary.size.x,
                this.boundary.size.y,
                this.boundary.size.z
            ] }
        },
        vertexShader                : vs_simpleQuad,
        fragmentShader              : fs_updatePositions

    } );

    this.targets = [  this.finalPositionsRT,  this.finalPositionsRT.clone() ];
    this.pass( this.updatePositionsMaterial,  this.finalPositionsRT );

    this.uniforms = {
        uNoiseTimeScale: this.noiseTimeScale,
        uNoisePositionScale: this.noisePositionScale,
        uNoiseScale: this.noiseScale,
        uBending: this.bending
    };

    this.gui = new dat.GUI();
    this.gui.add(this.uniforms, 'uNoiseTimeScale', 0, 3);
    this.gui.add(this.uniforms, 'uNoisePositionScale', 0, 0.2);
    this.gui.add(this.uniforms, 'uNoiseScale', 0, 0.1);
    this.gui.add(this.uniforms, 'uBending', 0.00000, 1.00000);

    setTimeout( this.tickBending.bind( this ), 20000);

};

SimulationTexture.prototype.tickBending = function() {

    this.timesCycle = 1 - this.timesCycle;
    TweenMax.to(this, 2, {
        bending: this.timesCycle,
        onUpdate: (function(){ this.uniforms.uBending = this.bending }).bind( this )
    });

    setTimeout( this.tickBending.bind( this ), 5000 * (Math.pow((this.timesCycle + 1), 2));
};

SimulationTexture.prototype.update = function() {

    this.updatePositionsMaterial.uniforms.uTime.value = Math.sin(Date.now()) * 0.001;
    this.updatePositionsMaterial.uniforms.uPrevPositionsMap.value = this.targets[ this.pingpong ];

    this.pingpong = 1 - this.pingpong;
    this.pass( this.updatePositionsMaterial, this.targets[ this.pingpong ] );

    for( var p in this.uniforms ){
        this.updatePositionsMaterial.uniforms[ p ].value = this.uniforms[ p ];
    }
};

module.exports = SimulationTexture;