#extension GL_OES_standard_derivatives : enable
precision highp float;

uniform vec3 fogColor;
uniform float fogNear;
uniform float fogFar;

varying mat3 vNormalMatrix;
varying vec4 vPos;
varying vec4 vColor;
varying float vVertexAO;

void main(){

    vec3 fdx = dFdx( vPos.xyz );
    vec3 fdy = dFdy( vPos.xyz );
    vec3 n = normalize( cross( fdx, fdy ) * vNormalMatrix );

    vec3 occlusion = vec3( vVertexAO );

    // Pretty basic lambertian lighting...
    vec3 lightPosition = vec3( -400.0, 4.0, 0.0 );
    vec4 addedLights = vec4( 0.5, 0.5, 0.5, 1.0 );
    vec3 lightDirection = normalize( vPos.rgb - lightPosition );
    addedLights.rgb += ( clamp( dot( - lightDirection, n ), 0.0, 1.0 ) );

    vec4 c = vec4( vec3(vColor.rgb * addedLights.rgb * occlusion), 1.0 );

    gl_FragColor = vec4( c.rgb,  1.0 );
}
