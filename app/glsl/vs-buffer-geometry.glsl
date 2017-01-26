attribute vec2 aV2I;

uniform sampler2D uPositionsTexture;
uniform sampler2D uNormalsTexture;

varying vec4 vPos;
varying vec2 vUv;

varying mat3 vNormalMatrix;
varying vec4 vOPosition;
varying vec3 vU;
varying vec4 vWorldPosition;
varying vec4 vNormalSmooth;

#include <shadowmap_pars_vertex>


  void main(){

      vec4 pos = texture2D( uPositionsTexture, aV2I );
      vec4 n = texture2D( uNormalsTexture, aV2I );
      vNormalSmooth = n;

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