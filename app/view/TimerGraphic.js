/**
 * Created by siroko on 6/3/16.
 */
var THREE = require('three');
var vsBase = require('./../glsl/vs-basic.glsl');
var fsArc = require('./../glsl/fs-arc.glsl');

var TimerGraphic = function(){
    this.init();
};

TimerGraphic.prototype.init = function(){

    this.geom = new THREE.SphereBufferGeometry(0.15, 10, 10, 10);
    this.mat = new THREE.MeshBasicMaterial({
        opacity : 0.5,
        transparent: true,
        color: 0xFFFF00
    });

    this.planeMesh = new THREE.Mesh( this.geom, this.mat );

    this.progress(0);
};

TimerGraphic.prototype.progress = function( v ) {

    var s = (1 - v) + 0.41;
    this.planeMesh.scale.set( s, s, s );

};

module.exports = TimerGraphic;