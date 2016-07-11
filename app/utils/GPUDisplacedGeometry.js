/**
 * Created by siroko on 7/11/16.
 */

var THREE = require('three');

var BaseGLPass = require('./BaseGLPass');

var vs_bufferGeometry   = require('../glsl/vs-buffer-geometry.glsl');
var fs_bufferGeometry   = require('../glsl/fs-buffer-geometry.glsl');
var vs_simpleQuad       = require('../glsl/vs-simple-quad.glsl');
var fs_updatePositions  = require('../glsl/fs-update-positions-geometry.glsl');
var fs_updateSpring     = require('../glsl/fs-update-positions-spring.glsl');

var GPUDisplacedGeometry = function( params ) {

    this.geom = params.geom;

};

module.exports = GPUDisplacedGeometry;