/**
 * Created by siroko on 7/11/16.
 */

var THREE = require('three');

var BaseGLPass = require('./BaseGLPass');

var GPUGeometry = function( params ) {

    BaseGLPass.call( this, params );

    this.geom = params.geom;

    if( this.geom.faces ) {

        var totalGeomVertices = this.geom.faces.length * 3;

    } else {

        var totalGeomVertices = this.geom.attributes.position.array.length / 3;

    }
    
    var sqrtTotalGeom       = Math.sqrt( totalGeomVertices );
    // Aproximatino to the nearest upper power of two number
    var totalPOT            = Math.pow( 2, Math.ceil( Math.log( sqrtTotalGeom ) / Math.log( 2 ) ) );

    this.sizeW = totalPOT;
    this.sizeH = totalPOT;

    this.total              = this.sizeW * this.sizeH;

    this.data = new Float32Array( this.total * 4 );
    this.normalsData = new Float32Array( this.total * 4 );

    if( this.geom.faces ) {

        var v;
        var n;
        var vertices = this.geom.vertices;

        for (var i = 0; i < this.geom.faces.length; i++) {

            var face = this.geom.faces[i];
            n = face.vertexNormals;

            this.normalsData[i * 12]      = n[0].x;
            this.normalsData[i * 12 + 1]  = n[0].y;
            this.normalsData[i * 12 + 2]  = n[0].z;
            this.normalsData[i * 12 + 3]  = 1;

            v = vertices[face.a];
            this.data[i * 12]             = v.x;
            this.data[i * 12 + 1]         = v.y;
            this.data[i * 12 + 2]         = v.z;
            this.data[i * 12 + 3]         = 1;

            this.normalsData[i * 12 + 4]  = n[1].x;
            this.normalsData[i * 12 + 5]  = n[1].y;
            this.normalsData[i * 12 + 6]  = n[1].z;
            this.normalsData[i * 12 + 7]  = 1;

            v = vertices[face.b];
            this.data[i * 12 + 4]         = v.x;
            this.data[i * 12 + 5]         = v.y;
            this.data[i * 12 + 6]         = v.z;
            this.data[i * 12 + 7]         = 1;

            this.normalsData[i * 12 + 8]  = n[2].x;
            this.normalsData[i * 12 + 9]  = n[2].y;
            this.normalsData[i * 12 + 10] = n[2].z;
            this.normalsData[i * 12 + 11] = 1;

            v = vertices[face.c];
            this.data[i * 12 + 8]         = v.x;
            this.data[i * 12 + 9]         = v.y;
            this.data[i * 12 + 10]        = v.z;
            this.data[i * 12 + 11]        = 1;
        }

    } else {
        var it = 0;
        for (var i = 0; i < this.geom.attributes.position.array.length; i++) {

            var position = this.geom.attributes.position.array[ i ];
            this.data[ it ] = position;

            var normal = this.geom.attributes.normal.array[ i ];
            this.normalsData[ it ] = normal;

            if( ( i + 1 ) % 3 == 0 && i != 0 ) {
                it++;
                this.data[ it ]     = 1;
                this.normalsData[ it ] = 1;
            }
            it ++;
        }
    }

    this.geometryRT = new THREE.DataTexture( this.data, this.sizeW, this.sizeH, THREE.RGBAFormat, THREE.FloatType);
    this.geometryRT.minFilter = THREE.NearestFilter;
    this.geometryRT.magFilter = THREE.NearestFilter;
    this.geometryRT.needsUpdate = true;


    this.normalsRT = new THREE.DataTexture( this.normalsData, this.sizeW, this.sizeH, THREE.RGBAFormat, THREE.FloatType);
    this.normalsRT.minFilter = THREE.NearestFilter;
    this.normalsRT.magFilter = THREE.NearestFilter;
    this.normalsRT.needsUpdate = true;

};

GPUGeometry.prototype = Object.create( BaseGLPass.prototype );


module.exports = GPUGeometry;