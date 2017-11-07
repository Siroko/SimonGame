precision highp float;

uniform vec3 fogColor;
uniform float fogNear;
uniform float fogFar;

varying mat3 vNormalMatrix;
varying vec4 vPos;
varying vec4 vColor;
varying float vVertexAO;
varying vec4 vWorldPosition;

#include <common>
#include <packing>
#include <bsdfs>
#include <lights_pars>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>

void main(){

    vec3 fdx = dFdx( vPos.xyz );
    vec3 fdy = dFdy( vPos.xyz );
    vec3 n = normalize( cross( fdx, fdy ) * vNormalMatrix );

    vec3 occlusion = vec3( vVertexAO );

    // Pretty basic lambertian lighting...
    vec3 lightPosition = vec3( -400.0, 4.0, 0.0 );
    vec4 addedLights = vec4( 0.3, 0.3, 0.3, 1.0 );
    vec3 lightDirection = normalize( vPos.rgb - lightPosition );
    addedLights.rgb += ( clamp( dot( - lightDirection, n ), 0.0, 1.0 ) );

    vec4 c = vec4( vec3(vColor.rgb * addedLights.rgb * occlusion), 1.0 );
    c *= vec4(1.7);

    float shadowMask = getShadowMask() + 0.5;

    shadowMask = shadowMask > 1.0 ? 1.0 : shadowMask;

    gl_FragColor = vec4( c.rgb * shadowMask,  1.0);

}
