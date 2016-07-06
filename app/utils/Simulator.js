/**
 * Created by siroko on 7/8/15.
 */

var THREE = require('three');

var BaseGLPass = require('./BaseGLPass');

var vs_bufferParticles  = require('../glsl/vs-buffer-particles.glsl');
var fs_bufferParticles  = require('../glsl/fs-buffer-particles.glsl');
var vs_simpleQuad       = require('../glsl/vs-simple-quad.glsl');
var fs_updatePositions  = require('../glsl/fs-update-positions.glsl');

var Simulator = function( params ) {

    BaseGLPass.call( this, params );

    this.sizeW      = params.sizeW;
    this.sizeH      = params.sizeH;

    this.pointSize  = params.pointSize || 0;
    this.initialBuffer = params.initialBuffer;

    this.boundary   = params.boundary || {
            position : new THREE.Vector3( 0, 0, 0 ),
            size : new THREE.Vector3( 10, 10, 10 )
        };

    this.directionFlow = params.directionFlow;

    this.temVect = new THREE.Vector3();

    this.setup();
};

Simulator.prototype = Object.create( BaseGLPass.prototype );

Simulator.prototype.setup = function() {

    this.pingpong           = 0;
    this.finalPositionsRT   = this.getRenderTarget( this.sizeW, this.sizeH );

    this.total              = this.sizeW * this.sizeH;

    this.index2D            = new THREE.BufferAttribute( new Float32Array( this.total * 2 ), 2 );
    this.positions          = new THREE.BufferAttribute( new Float32Array( this.total * 3 ), 3 );

    var div = 1 / this.sizeW;
    for (var i = 0; i < this.total; i++) {

        this.index2D.setXY( i, ( ( 2. * div * ( ( i % this.sizeW ) + 0.5 ) - 1 ) + 1 ) / 2,  ( ( 2. * div * ( Math.floor( i * div ) + 0.5 ) - 1 ) + 1 ) / 2 );
        this.positions.setXYZ( i, ( ( Math.random() * 2 - 1 ) * 0.5 ) * this.boundary.size.x, ( ( Math.random() * 2 - 1 ) * 0.5 ) * this.boundary.size.y, ( ( Math.random() * 2 - 1 ) * 0.5 ) * this.boundary.size.z );
    }

    this.bufferGeometry = new THREE.BufferGeometry();
    this.bufferGeometry.addAttribute( 'aV2I', this.index2D );
    this.bufferGeometry.addAttribute( 'position', this.positions );

    this.bufferMaterial = new THREE.RawShaderMaterial( {

        uniforms: {
            'textureMap'            : { type: "t", value : THREE.ImageUtils.loadTexture( 'assets/particle.png' ) },
            'uPositionsT'           : { type: "t", value : this.finalPositionsRT },
            'map'                   : { type: "t", value : this.finalPositionsRT },
            'uPointSize'            : { type: 'f', value : this.pointSize }
        },

        vertexShader                : vs_bufferParticles,
        fragmentShader              : fs_bufferParticles,

        transparent: true

    } );

    this.bufferMesh = new THREE.Points( this.bufferGeometry, this.bufferMaterial );

    this.data = new Float32Array( this.sizeW * this.sizeH * 4 );

    if( this.initialBuffer ) { // if initial buffer is defined we set the positions according

        for( var i = 0; i < this.total; i ++ ) {

            this.data[ i * 4 ]     = this.initialBuffer[ i * 4 ];
            this.data[ i * 4 + 1 ] = this.initialBuffer[ i * 4 ];
            this.data[ i * 4 + 2 ] = this.initialBuffer[ i * 4 ];
            this.data[ i * 4 + 3 ] = 1; // frames life

        }

    } else { // else we just set them randomly

        for( var i = 0; i < this.total; i ++ ) {

            this.data[ i * 4 ]     = ( ( Math.random() * 2 - 1 ) * 0.5 ) * this.boundary.size.x + this.boundary.position.x;
            this.data[ i * 4 + 1 ] = ( ( Math.random() * 2 - 1 ) * 0.5 ) * this.boundary.size.y + this.boundary.position.y;
            this.data[ i * 4 + 2 ] = ( ( Math.random() * 2 - 1 ) * 0.5 ) * this.boundary.size.z + this.boundary.position.z;
            this.data[ i * 4 + 3 ] = 1; // frames life

        }

    }


    this.geometryRT = new THREE.DataTexture( this.data, this.sizeW, this.sizeH, THREE.RGBAFormat, THREE.FloatType, null, null, null, THREE.NearestFilter, THREE.NearestFilter);
    this.geometryRT.needsUpdate = true;

    this.updatePositionsMaterial = new THREE.RawShaderMaterial( {
        uniforms: {
            'uPrevPositionsMap'     : { type: "t", value: this.geometryRT },
            'uGeomPositionsMap'     : { type: "t", value: this.geometryRT },
            'uTime'                 : { type: "f", value: 0 },
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

    var quad_geom = new THREE.PlaneBufferGeometry( 2, 2, 1, 1 );
    this.quad = new THREE.Mesh( quad_geom, this.updatePositionsMaterial );
    this.sceneRT.add( this.quad );

    this.targets = [  this.finalPositionsRT,  this.finalPositionsRT.clone() ];
    this.pass( this.updatePositionsMaterial,  this.finalPositionsRT );

};

Simulator.prototype.update = function() {

    this.updatePositionsMaterial.uniforms.uTime.value = Math.sin(Date.now()) * 0.001;
    //this.updatePositionsMaterial.uniforms.uDirectionFlow.value = this.directionFlow || this.temVect.set( this.updatePositionsMaterial.uniforms.uTime.value, 0.0007, this.updatePositionsMaterial.uniforms.uTime.value )
    this.updatePositionsMaterial.uniforms.uPrevPositionsMap.value = this.targets[ this.pingpong ];
    this.bufferMaterial.uniforms.uPositionsT.value = this.targets[ this.pingpong ];
    this.bufferMaterial.uniforms.map.value = this.targets[ 1 - this.pingpong ];

    this.pingpong = 1 - this.pingpong;
    this.pass( this.updatePositionsMaterial, this.targets[ this.pingpong ] );

};

module.exports = Simulator;