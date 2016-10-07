//#extension GL_OES_standard_derivatives : enable

precision highp float;
precision highp sampler2D;

varying vec4 vNormal;
varying vec4 vSimColor;

void main(){

    gl_FragColor = vec4( vec3(vNormal.r * vSimColor.b), 1.0 );
}
