precision highp float;
precision highp sampler2D;

varying vec4 vPos;
varying vec3 vNormal;

void main(){
    vec3 c1 = vec3(1.0, 1.0, 1.0);
    vec4 color = vec4( c1 * vNormal.b, 1.0 );

        float invRed = 1.5 - color.r;
        color.r += invRed * 0.4;
        color.g += invRed * 0.4;

    gl_FragColor = color;
}
