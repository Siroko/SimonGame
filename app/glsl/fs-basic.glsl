precision highp float;
precision highp sampler2D;

varying vec4 vPos;

void main(){

    vec3 fdx = dFdx( vPos.xyz );
	vec3 fdy = dFdy( vPos.xyz );
	vec3 n = normalize(cross(fdx, fdy));

    vec3 c1 = vec3(1.0, 1.0, 1.0);
    vec4 color = vec4( .5 + .5 * n, 1.0 );

//        float invRed = 1.5 - color.r;
//        color.r += invRed * 0.4;
//        color.g += invRed * 0.4;
//
//        color = vec4(vec3(vDist), 1.0);

    gl_FragColor = color;
}
