/**
 * Created by siroko on 06/10/16.
 */

var THREE = require('three');
var GPUGeometry = require('./GPUGeometry');
var SimulationTexture = require('./SimulationTexture');

var vs_buffer = require('./../glsl/vs-buffer-geometry-sim.glsl');
var fs_buffer = require('./../glsl/fs-buffer-geometry-sim.glsl');
var vs_depth_buffer = require('./../glsl/vs-buffer-geometry-sim-depth.glsl');

var GPUGeometrySimulation = function( params ) {

    this.renderer = params.renderer;
    this.geom = params.geom;
    this.sizeSimulation = params.sizeSimulation;
    this.matcap = params.matcap;

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
    // this.bufferMaterial.lights = true;
    // this.bufferMaterial.uniforms["opacity"] =  { value: 1.0 };
    // this.bufferMaterial.uniforms["uLights"] = { type: 'f', value: 1 };

    this.bufferMaterial.uniforms['uGeometryTexture'] = { type: 't', value: this.gpuGeometry.geometryRT };
    this.bufferMaterial.uniforms['uGeometryNormals'] = { type: 't', value: this.gpuGeometry.normalsRT };
    this.bufferMaterial.uniforms['uSimulationTexture'] = { type: 't', value: this.simulator.targets[ 1 - this.simulator.pingpong ] };
    this.bufferMaterial.uniforms['uSimulationPrevTexture'] = { type: 't', value: this.simulator.targets[ this.simulator.pingpong ] };
    this.bufferMaterial.uniforms['uMatcap'] = { type: 't', value: this.matcap };
    this.bufferMaterial.uniforms['uNormalMap'] = { type: 't', value: this.matcap};
    this.bufferMaterial.vertexShader =  vs_buffer;
    this.bufferMaterial.fragmentShader = fs_buffer;

    this.bufferMesh = new THREE.Mesh( this.bufferGeometry, this.bufferMaterial );

    // magic here
    this.bufferMesh.customDepthMaterial = new THREE.ShaderMaterial( {

        defines: {
            'USE_SHADOWMAP': '',
            'DEPTH_PACKING': '3200'
        },
        vertexShader: vs_depth_buffer,
        fragmentShader: THREE.ShaderLib.depth.fragmentShader,

        uniforms: this.bufferMaterial.uniforms
    } );

    this.bufferMesh.castShadow = true;
    this.bufferMesh.receiveShadow = true;

};

GPUGeometrySimulation.prototype.update = function(){

    this.simulator.update();
    this.bufferMaterial.uniforms[ 'uSimulationTexture' ].value = this.simulator.targets[ 1 - this.simulator.pingpong ];
    this.bufferMaterial.uniforms[ 'uSimulationTexture' ].needsUpdate = true;
    this.bufferMaterial.uniforms[ 'uSimulationPrevTexture' ].value = this.simulator.targets[ this.simulator.pingpong ];
    this.bufferMaterial.uniforms[ 'uSimulationPrevTexture' ].needsUpdate = true;
};

module.exports = GPUGeometrySimulation;