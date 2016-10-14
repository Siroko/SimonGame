#extension GL_OES_standard_derivatives : enable
precision highp float;

uniform vec3 fogColor;
uniform float fogNear;
uniform float fogFar;

varying vec4 vPos;
varying vec4 vColor;
varying float vVertexAO;

void main(){

    vec3 fdx = dFdx( vPos.xyz );
    vec3 fdy = dFdy( vPos.xyz );
    vec3 n = normalize( cross( fdx, fdy ) );

    vec3 occlusion = vec3( vVertexAO );
    // Pretty basic lambertian lighting...
    vec3 lightPosition = vec3( -40.0, 4.0, 0.0 );
    vec4 addedLights = vec4( 0.5, 0.5, 0.5, 1.0 );
    vec3 lightDirection = normalize( vPos.rgb - lightPosition );
    addedLights.rgb += ( clamp( dot( - lightDirection, n ), 0.0, 1.0 ) );

    vec4 c = vec4( vec3(vColor.rgb * addedLights.rgb * occlusion), 1.0 );

    // FOG

        float fogDensity = .009;
        float depth = gl_FragCoord.z / gl_FragCoord.w;
//        float fogFactor = 0.0;

//        if ( fogType == 1.0 ) {
//
//        	fogFactor = smoothstep( fogNear, fogFar, depth );
//
//        } else {

        	const float LOG2 = 1.442695;
        	float fogFactor = exp2( - fogDensity * fogDensity * depth * depth * LOG2 );
        	fogFactor = 1.0 - clamp( fogFactor, 0.0, 1.0 );

//        }

        vec4 fog_color = mix( c, vec4( fogColor, gl_FragColor.w ), fogFactor );


    gl_FragColor = vec4( fog_color.rgb,  1.0 );
}
