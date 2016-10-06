/**
 * Created by siroko on 06/10/16.
 */

var THREE = require('three');
var GPUGeometry = require('./GPUGeometry');
var SimulationTexture = require('./SimulationTexture');

var vs_buffer = require('./../glsl/vs-buffer-geometry-sim.glsl');
var fs_buffer = require('./../glsl/fs-buffer-geometry-sim.glsl');

var GPUGeometrySimulation = function( params ) {

    this.renderer = params.renderer;
    this.geom = params.geom;
    this.sizeSimulation = params.sizeSimulation;

    this.init();
    this.setupMesh();

};

GPUGeometrySimulation.prototype.init = function(){

    this.gpuGeometry = new GPUGeometry( {
        geom: this.geom,
        renderer: this.renderer
    } );

    this.simulator = new SimulationTexture( {
        sizeW: this.sizeSimulation,
        sizeH: this.sizeSimulation,
        renderer: this.renderer
    } );

    this.totalVertices = this.gpuGeometry.total * this.sizeSimulation;
    this.totalSimulation = this.sizeSimulation * this.sizeSimulation;

};

GPUGeometrySimulation.prototype.setupMesh = function(){

    this.positions = new THREE.BufferAttribute( new Float32Array( this.totalVertices * 3 ), 3 );
    this.index2D = new THREE.BufferAttribute( new Float32Array( this.totalVertices * 4 ), 4 );

    var geomSize = Math.sqrt(this.gpuGeometry.total);
    var divSim = 1 / this.sizeSimulation;
    var divGeom = 1 / geomSize;


    var uvSim  = new THREE.Vector2( 0, 0 );
    var uvGeom = new THREE.Vector2( 0, 0 );

    for ( var r = 0; r < this.totalSimulation; r++ ) {

        uvSim.x = ( r % this.sizeSimulation ) / this.sizeSimulation;
        if (r % this.sizeSimulation == 0 && r != 0) uvSim.y += divSim;

        for (var i = 0; i < this.gpuGeometry.total; i++) {

            uvGeom.x = ( i % geomSize ) / geomSize;
            if (i % geomSize == 0 && i != 0) uvGeom.y += divGeom;

            this.index2D.setXYZW( r, uvSim.x, uvSim.y, uvGeom.x, uvGeom.y );
            this.positions.setXYZ( r, Math.random() * 10, Math.random() * 10, Math.random() * 10 );
        }

        uvGeom.y = 0;
    }

    this.bufferGeometry = new THREE.BufferGeometry();
    this.bufferGeometry.addAttribute( 'position', this.positions );
    this.bufferGeometry.addAttribute( 'index2D', this.index2D );

    this.bufferMaterial = new THREE.RawShaderMaterial( {
        'uniforms': {
            'uGeometryTexture': { type: 't', value: this.gpuGeometry.geometryRT },
            'uSimulationTexture': { type: 't', value: this.simulator.targets[ 1 - this.simulator.pingpong ] }
        },
        vertexShader: vs_buffer,
        fragmentShader: fs_buffer

    } );

    this.bufferMesh = new THREE.Mesh( this.bufferGeometry, this.bufferMaterial );

    this.debugPlaneGeom = new THREE.Mesh( new THREE.PlaneBufferGeometry(1, 1, 1, 1), new THREE.MeshBasicMaterial({
        map: this.bufferMaterial.uniforms['uGeometryTexture'].value
    }));
    this.debugPlaneGeom.position.set(-2, 1, -0.5 );

    this.debugPlaneSimulator = new THREE.Mesh( new THREE.PlaneBufferGeometry(1, 1, 1, 1), new THREE.MeshBasicMaterial({
        map:  this.bufferMaterial.uniforms['uSimulationTexture'].value
    }));
    this.debugPlaneSimulator.position.set(-1, 1, -1 );

};

GPUGeometrySimulation.prototype.update = function(){

    this.simulator.update();

};

module.exports = GPUGeometrySimulation;