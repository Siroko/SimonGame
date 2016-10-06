#extension GL_OES_standard_derivatives : enable

precision highp float;
precision highp sampler2D;

varying vec4 vGeomPosition;
varying vec4 vPos;
varying mat3 vNormalMatrix;
varying vec4 vOPosition;
varying vec3 vU;
varying vec2 vUv;
varying vec4 vWorldPosition;

void main(){

    vec3 fdx = dFdx( vPos.xyz );
    vec3 fdy = dFdy( vPos.xyz );
    vec3 n = normalize(cross(fdx, fdy));

    vec3 vNormal = vNormalMatrix * n;
    vec3 vONormal = n;

    gl_FragColor = vec4( vNormal, 1.0 );
}
