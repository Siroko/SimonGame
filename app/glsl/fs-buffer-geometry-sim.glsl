precision highp float;
precision highp sampler2D;

uniform sampler2D uMatcap;
uniform sampler2D uNormalMap;
uniform float opacity;

varying vec4 vPos;
varying mat3 vNormalMatrix;
varying vec4 vU;
varying vec4 vHeightColor;
varying vec4 vColor;

float random(vec3 scale,float seed){return fract(sin(dot(gl_FragCoord.xyz+seed,scale))*43758.5453+seed);}

void main(){

    vec3 fdx = dFdx( vPos.xyz );
    vec3 fdy = dFdy( vPos.xyz );
    vec3 n = normalize(cross(fdx, fdy));

    // Pretty basic lambertian lighting...
    vec3 lightPosition = vec3(-40.0, 4.0, 0.0);
    vec4 addedLights = vec4( 0.5, 0.5, 0.5, 1.0 );
    vec3 lightDirection = normalize( vPos.rgb - lightPosition );
    addedLights.rgb += ( clamp( dot( - lightDirection, n ), 0.0, 1.0 ) );

    gl_FragColor = vec4( vColor.rgb * addedLights.rgb,  1.0);
}
