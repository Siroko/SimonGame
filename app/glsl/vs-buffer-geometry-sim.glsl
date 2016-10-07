precision highp float;
precision highp sampler2D;

attribute vec3 position;
attribute vec4 index2D;

uniform sampler2D uGeometryTexture;
uniform sampler2D uGeometryNormals;
uniform sampler2D uSimulationTexture;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;
uniform mat4 modelMatrix;
uniform mat4 viewMatrix;

varying vec4 vGeomPosition;
varying vec4 vPos;
varying mat3 vNormalMatrix;
varying vec4 vOPosition;
varying vec2 vUv;
varying vec3 vU;
varying vec4 vWorldPosition;

varying vec4 vNormal;

void main(){

    vec4 pos = texture2D( uGeometryTexture, index2D.zw );
    vec4 offset = texture2D( uSimulationTexture, index2D.xy );
    vec3 p = offset.rgb + pos.rgb;

    vGeomPosition = pos;
    vPos = vec4(p, 1.0);
    vOPosition = modelViewMatrix * vPos;
    vU = normalize( vec3( modelViewMatrix * vPos ) );
    vUv = index2D.zw;
    vNormalMatrix = normalMatrix;

    vWorldPosition = modelMatrix * vec4(pos.xyz, 1.0);

    vNormal = texture2D( uGeometryNormals, index2D.zw );

    gl_Position = projectionMatrix * modelViewMatrix * vec4( p, 1.0 );

}