#extension GL_OES_standard_derivatives : enable
#define MAX_POINT_LIGHTS 2

precision highp float;
precision highp sampler2D;

uniform sampler2D occlusionMap;
uniform sampler2D lightMap;

uniform sampler2D diffuseMap;
uniform sampler2D textureMap;
uniform sampler2D normalMap;

uniform vec3 pointLightColor[MAX_POINT_LIGHTS];
uniform vec3 pointLightPosition[MAX_POINT_LIGHTS];
uniform float pointLightIntensity[MAX_POINT_LIGHTS];
uniform float uLights;

uniform float intensity;

varying vec4 vPos;

varying mat3 vNormalMatrix;
varying vec4 vOPosition;
varying vec3 vU;
varying vec2 vUv;

varying vec3 vNormalValue;
varying vec2 vUvValue;

float random(vec3 scale,float seed){return fract(sin(dot(gl_FragCoord.xyz+seed,scale))*43758.5453+seed);}

void main(){

    vec3 n = vNormalValue;

    vec3 vNormal = vNormalMatrix * n;
    vec3 vONormal = n;

    vec4 base = texture2D( diffuseMap, vUvValue );
    vec4 occlusion = texture2D( occlusionMap, vUvValue );
    vec4 light = texture2D( lightMap, vUvValue );

    // Pretty basic lambertian lighting...
    vec4 addedLights = vec4( 0.0, 0.0, 0.0, 1.0 );

    if( uLights == 1.0 ){
        for( int l = 0; l < MAX_POINT_LIGHTS; l++ ) {

            vec3 lightDirection = normalize( vOPosition.rgb - pointLightPosition[ l ] );
            addedLights.rgb += ( clamp( dot( - lightDirection, vNormal ), 0.0, 1.0 ) * pointLightColor[ l ] ) * vec3(pointLightIntensity[ l ]);

        }
    } else {
        addedLights = vec4( 1.0, 1.0, 1.0, 1.0 );
    }

    gl_FragColor = base * light * occlusion * intensity;

}
