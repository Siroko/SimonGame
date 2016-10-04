#extension GL_OES_standard_derivatives : enable

precision highp float;

attribute vec3 position;
attribute vec3 normal;
attribute vec2 aV2I;
attribute vec2 uv;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;
uniform mat4 modelMatrix;
uniform mat4 viewMatrix;

uniform sampler2D uPositionsTexture;

varying vec4 vPos;
varying vec2 vUv;

varying mat3 vNormalMatrix;
varying vec4 vOPosition;
varying vec3 vU;
varying vec4 vWorldPosition;

#include <shadowmap_pars_vertex>


  void main(){

      vec4 pos = texture2D( uPositionsTexture, aV2I );

      vPos = pos;
      vOPosition = modelViewMatrix * vPos;
      vU = normalize( vec3( modelViewMatrix * vPos ) );
      vUv = aV2I;
      vNormalMatrix = normalMatrix;
      vWorldPosition = modelMatrix * vec4(pos.xyz, 1.0);

      #include <begin_vertex>
      #include <project_vertex>
      #include <worldpos_vertex>
      #include <shadowmap_vertex>

      gl_Position = projectionMatrix * modelViewMatrix * vPos;


  }