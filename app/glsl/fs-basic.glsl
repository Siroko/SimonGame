precision highp float;
precision highp sampler2D;

varying vec4 vPos;
varying vec3 vNormal;

void main(){
    vec4 color = vec4( vNormal, 1.0 );
    gl_FragColor = color;
}
