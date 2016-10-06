precision highp float;
precision highp sampler2D;

varying vec4 vGeomPosition;

void main(){

    if( vGeomPosition.a < 0.9 ) {
        discard;
    }

    gl_FragColor = vec4(1.0 );
}
