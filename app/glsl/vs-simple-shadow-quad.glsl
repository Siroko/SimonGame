precision highp float;

attribute vec3 normal;
attribute vec2 uv;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;
uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
attribute vec3 position;

varying vec2 vUv;

#include <shadowmap_pars_vertex>

void main() {

    vUv = uv;

    #include <begin_vertex>
    #include <project_vertex>
    #include <worldpos_vertex>
    #include <shadowmap_vertex>

    gl_Position = vec4( position, 1.0 );
}