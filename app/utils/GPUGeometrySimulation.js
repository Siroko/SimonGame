/**
 * Created by siroko on 06/10/16.
 */

var THREE = require('three');
var GPUGeometry = require('./GPUGeometry');
var SimulationTexture = require('./SimulationTexture');

var vs_buffer = require('./../glsl/vs-buffer-geometry-sim.glsl');
var fs_buffer = require('./../glsl/fs-buffer-geometry-sim.glsl');
var vs_depth_buffer = require('./../glsl/vs-buffer-geometry-sim-depth.glsl');

var vs_buffer_mobile = require('./../glsl/vs-buffer-geometry-sim-mobile.glsl');
var fs_buffer_mobile = require('./../glsl/fs-buffer-geometry-sim-mobile.glsl');

var GPUGeometrySimulation = function( params ) {

    this.renderer = params.renderer;
    this.heightMap = params.heightMap;
    this.colorMap = params.colorMap;
    this.geom = params.geom;
    this.sizeSimulation = params.sizeSimulation;
    this.initialBuffer = params.initialBuffer;

    this.fog = params.fog || {
            fogColor: new THREE.Color(0xFFFFFF),
            fogNear: 1,
            fogFar: 2000
        };

    this.isMobile = params.isMobile;

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
        initialBuffer: this.initialBuffer,
        renderer: this.renderer
    } );

    this.totalSimulation = this.sizeSimulation * this.sizeSimulation;
    this.totalVertices = this.gpuGeometry.total * this.totalSimulation;

};

GPUGeometrySimulation.prototype.setupMesh = function(){

    this.positions = new THREE.BufferAttribute( new Float32Array( this.totalVertices * 3 ), 3 );
    this.index2D = new THREE.BufferAttribute( new Float32Array( this.totalVertices * 4 ), 4 );

    var geomSize = Math.sqrt(this.gpuGeometry.total);
    var divSim = 1 / this.sizeSimulation;
    var divGeom = 1 / geomSize;

    var uvSim  = new THREE.Vector2( 0, 0 );
    var uvGeom = new THREE.Vector2( 0, 0 );
    var counter = 0;

    for ( var r = 0; r < this.totalSimulation; r++ ) {

        uvSim.x = ( r % this.sizeSimulation ) / this.sizeSimulation;
        if (r % this.sizeSimulation == 0 && r != 0) uvSim.y += divSim;

        for (var i = 0; i < this.gpuGeometry.total; i++) {

            uvGeom.x = ( i % geomSize ) / geomSize;
            if (i % geomSize == 0 && i != 0) uvGeom.y += divGeom;

            this.index2D.setXYZW( counter, uvSim.x, uvSim.y, uvGeom.x, uvGeom.y );
            this.positions.setXYZ( counter, Math.random() * 10, Math.random() * 10, Math.random() * 10 );

            counter++;

        }

        uvGeom.y = 0;
        counter --;
    }

    this.bufferGeometry = new THREE.BufferGeometry();
    this.bufferGeometry.addAttribute( 'position', this.positions );
    this.bufferGeometry.addAttribute( 'index2D', this.index2D );

    this.bufferMaterial = new THREE.RawShaderMaterial();
    // if( this.isMobile ){
    //     this.bufferMaterial.vertexShader =  vs_buffer_mobile;
    //     this.bufferMaterial.fragmentShader = fs_buffer_mobile;
    // } else {
        this.bufferMaterial.vertexShader =  vs_buffer;
        this.bufferMaterial.fragmentShader = fs_buffer;
    // }

    this.colorMap.wrapS = THREE.RepeatWrapping;
    this.colorMap.wrapT = THREE.RepeatWrapping;
    this.colorMap.repeat = new THREE.Vector2(1000, 1000);
    this.heightMap.wrapS = THREE.RepeatWrapping;
    this.heightMap.wrapT = THREE.RepeatWrapping;
    this.heightMap.repeat = new THREE.Vector2(1000, 1000);
    this.bufferMaterial.uniforms['uGeometryTexture'] = { type: 't', value: this.gpuGeometry.geometryRT };
    this.bufferMaterial.uniforms['uGeometryNormals'] = { type: 't', value: this.gpuGeometry.normalsRT };
    this.bufferMaterial.uniforms['uSimulationTexture'] = { type: 't', value: this.simulator.targets[ 1 - this.simulator.pingpong ] };
    this.bufferMaterial.uniforms['uSimulationPrevTexture'] = { type: 't', value: this.simulator.targets[ this.simulator.pingpong ] };
    this.bufferMaterial.uniforms['uColorMap'] = { type: 't', value: this.colorMap };
    this.bufferMaterial.uniforms['uHeightMap'] = { type: 't', value: this.heightMap};
    this.bufferMaterial.uniforms['fogColor'] = { type: "c", value: this.fog.fogColor };
    this.bufferMaterial.uniforms['fogNear'] =  { type: "f", value: this.fog.near };
    this.bufferMaterial.uniforms['fogFar'] =  { type: "f", value: this.fog.far };
    this.bufferMaterial.uniforms['uTime'] =  { type: "f", value: 0 };

    this.bufferMesh = new THREE.Mesh( this.bufferGeometry, this.bufferMaterial );
    // this.bufferMesh.castShadow = true;
    // this.bufferMesh.receiveShadow = true;

    // magic here
    // this.bufferMesh.customDepthMaterial = new THREE.ShaderMaterial( {
    //     defines: {
    //         'USE_SHADOWMAP': '',
    //         'DEPTH_PACKING': '3201'
    //     },
    //     vertexShader: vs_depth_buffer,
    //     fragmentShader: THREE.ShaderLib.depth.fragmentShader,
    //
    //     uniforms: this.bufferMaterial.uniforms
    // } );

    this.simulator.update();
};

GPUGeometrySimulation.prototype.update = function( timestamp ){

    this.bufferMaterial.uniforms['uTime'].value = timestamp * 0.001;
    // this.simulator.update();
    // this.bufferMaterial.uniforms[ 'uSimulationTexture' ].value = this.simulator.targets[ 1 - this.simulator.pingpong ];
    // this.bufferMaterial.uniforms[ 'uSimulationTexture' ].needsUpdate = true;
    // this.bufferMaterial.uniforms[ 'uSimulationPrevTexture' ].value = this.simulator.targets[ this.simulator.pingpong ];
    // this.bufferMaterial.uniforms[ 'uSimulationPrevTexture' ].needsUpdate = true;
};

module.exports = GPUGeometrySimulation;