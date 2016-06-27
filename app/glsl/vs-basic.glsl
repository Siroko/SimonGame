precision highp float;

attribute vec3 position;
attribute vec2 uv;
attribute vec3 normal;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

varying vec2 vUv;
varying vec4 vPos;

void main()	{

    vUv = uv;
    vPos = vec4(position, 1.0);

    gl_Position = projectionMatrix * modelViewMatrix * vPos;
}