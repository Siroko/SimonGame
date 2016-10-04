#extension GL_OES_standard_derivatives : enable
precision highp float;
precision highp sampler2D;

#define MAX_POINT_LIGHTS 2

varying vec2 vUv;

uniform sampler2D tShadow;

#include <common>
#include <packing>
#include <bsdfs>
#include <lights_pars>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>

void main(){

    vec4 c = texture2D( tShadow, vUv );
//    SpotLight spotLight = spotLights[ 0 ];
//    vec4 deb = vec4(
//        bool( spotLight.shadow ) ? getShadow( spotShadowMap[ 0 ], spotLight.shadowMapSize, spotLight.shadowBias, spotLight.shadowRadius, vSpotShadowCoord[ 0 ] ) : 1.0,
//        bool( spotLight.shadow ) ? getShadow( spotShadowMap[ 0 ], spotLight.shadowMapSize, spotLight.shadowBias, spotLight.shadowRadius, vSpotShadowCoord[ 0 ] ) : .0,
//        bool( spotLight.shadow ) ? getShadow( spotShadowMap[ 0 ], spotLight.shadowMapSize, spotLight.shadowBias, spotLight.shadowRadius, vSpotShadowCoord[ 0 ] ) : .0,
//        bool( spotLight.shadow ) ? getShadow( spotShadowMap[ 0 ], spotLight.shadowMapSize, spotLight.shadowBias, spotLight.shadowRadius, vSpotShadowCoord[ 0 ] ) : 1.0
//    );

    gl_FragColor = c;

}
