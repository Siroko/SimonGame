/**
 * Created by siroko on 7/8/15.
 */

var THREE = require('three');

var BaseGLPass = require('./BaseGLPass');

var vs_bufferParticles  = require('../glsl/vs-buffer-particles.glsl');
var fs_bufferParticles  = require('../glsl/fs-buffer-particles.glsl');
var vs_createPositions  = require('../glsl/vs-create-positions.glsl');
var fs_createPositions  = require('../glsl/fs-create-positions.glsl');
var vs_simpleQuad       = require('../glsl/vs-simple-quad.glsl');
var fs_updatePositions  = require('../glsl/fs-update-positions.glsl');
var fs_copy             = require('../glsl/fs-copy.glsl');


var Simulator = function( params ) {

    BaseGLPass.call( this, params );

    this.sizeW      = params.sizeW;
    this.sizeH      = params.sizeH;

    this.positionsGeom = params.positionsGeom;

    this.setup();
};

Simulator.prototype = Object.create( BaseGLPass.prototype );

Simulator.prototype.setup = function() {

    this.VI2dRT             = this.getRenderTarget( this.sizeW, this.sizeH );
    this.positionsRT        = this.getRenderTarget( this.sizeW, this.sizeH );
    this.prevPositionsRT    = this.getRenderTarget( this.sizeW, this.sizeH );
    this.geometryRT         = this.getRenderTarget( this.sizeW, this.sizeH );
    this.finalPositionsRT   = this.getRenderTarget( this.sizeW, this.sizeH );

    this.total              = this.sizeW * this.sizeH;

    this.index2D            = new THREE.BufferAttribute( new Float32Array( this.total * 2 ), 2 );
    this.positions          = new THREE.BufferAttribute( new Float32Array( this.total * 3 ), 3 );

    var div = 1 / this.sizeW;
    for (var i = 0; i < this.total; i++) {

        this.index2D.setXY( i, ( ( 2. * div * ( ( i % this.sizeW ) + 0.5 ) - 1 ) + 1 ) / 2,  ( ( 2. * div * ( Math.floor( i * div ) + 0.5 ) - 1 ) + 1 ) / 2 );
        this.positions.setXYZ( i, Math.random() * 30 - 15, Math.random() * 30 - 15, Math.random() * 30 - 15 );
    }

    this.bufferGeometry = new THREE.BufferGeometry();
    this.bufferGeometry.addAttribute( 'aV2I', this.index2D );
    this.bufferGeometry.addAttribute( 'position', this.positions );

    this.bufferMaterial = new THREE.ShaderMaterial( {

        uniforms: {
            'textureMap'            : { type: "t", value : THREE.ImageUtils.loadTexture( 'assets/particle.png' ) },
            'uPositionsT'           : { type: "t", value : this.finalPositionsRT }
        },

        vertexShader                : vs_bufferParticles,
        fragmentShader              : fs_bufferParticles,

        depthWrite                  : false,
        transparent                 : true
    } );

    this.bufferMesh = new THREE.Points( this.bufferGeometry, this.bufferMaterial );

    this.drawPositionsMaterial = new THREE.ShaderMaterial( {

        uniforms: {
            'uGeomToDraw'           : { type: "f",  value: 1 }
        },
        vertexShader                : vs_createPositions,
        fragmentShader              : fs_createPositions
    } );

    this.bufferMesh2 = new THREE.Points( this.bufferGeometry.clone(), this.drawPositionsMaterial );
    this.sceneBuffer.add( this.bufferMesh2 );

    this.updatePositionsMaterial = new THREE.ShaderMaterial( {
        uniforms: {
            'uPrevPositionsMap'     : { type: "t", value: this.positionsRT },
            'uGeomPositionsMap'     : { type: "t", value: this.geometryRT },
            'uTime'                 : { type: "f", value: 0 }
        },

        vertexShader                : vs_simpleQuad,
        fragmentShader              : fs_updatePositions
    } );

    this.copyMaterial = new THREE.ShaderMaterial( {
        uniforms: {
            textureMap              : { type: "t", value: this.finalPositionsRT }
        },

        vertexShader                : vs_simpleQuad,
        fragmentShader              : fs_copy
    } );

    var quad_geom = new THREE.PlaneBufferGeometry( 2, 2, 1, 1 );
    this.quad = new THREE.Mesh( quad_geom, this.updatePositionsMaterial );
    this.sceneRT.add(this.quad);

    this.passBuffer( this.drawPositionsMaterial, this.positionsRT );
    this.passBuffer( this.drawPositionsMaterial, this.geometryRT );
    this.drawPositionsMaterial.uniforms.uGeomToDraw.value = 1.0;
    this.passBuffer( this.drawPositionsMaterial, this.VI2dRT );

    this.pass( this.updatePositionsMaterial, this.finalPositionsRT );
    this.updatePositionsMaterial.uniforms.uPrevPositionsMap.value = this.prevPositionsRT;

    this.pass( this.copyMaterial, this.prevPositionsRT );
};

Simulator.prototype.update = function() {

    this.updatePositionsMaterial.uniforms.uTime.value = Math.sin(Date.now() * 0.001) * 0.001;

    this.pass( this.updatePositionsMaterial, this.finalPositionsRT );
    this.pass( this.copyMaterial, this.prevPositionsRT );
};

module.exports = Simulator;