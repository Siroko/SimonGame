uniform sampler2D uDiffuseMap;
uniform sampler2D uShadowMap;
uniform sampler2D uShadow1Map;
uniform sampler2D uShadow2Map;
uniform sampler2D uShadow3Map;
uniform sampler2D uShadow4Map;

uniform float uShadowFactor1;
uniform float uShadowFactor2;
uniform float uShadowFactor3;
uniform float uShadowFactor4;

varying vec2 vUv;

float blendOverlay(float base, float blend) {
	return base<0.5?(2.0*base*blend):(1.0-2.0*(1.0-base)*(1.0-blend));
}

vec3 blendOverlay(vec3 base, vec3 blend) {
	return vec3(blendOverlay(base.r,blend.r),blendOverlay(base.g,blend.g),blendOverlay(base.b,blend.b));
}

void main(){

    vec3 baseColor = vec3( 0.8 );

    vec4 shadow = texture2D( uShadowMap, vUv );
    vec4 shadow1 = texture2D( uShadow1Map, vUv );
    vec4 shadow2 = texture2D( uShadow2Map, vUv );
    vec4 shadow3 = texture2D( uShadow3Map, vUv );
    vec4 shadow4 = texture2D( uShadow4Map, vUv );

    vec3 blended1 = shadow1.rgb;
    vec3 blended2 = shadow2.rgb;
    vec3 blended3 = shadow3.rgb;
    vec3 blended4 = shadow4.rgb;

    vec3 c = shadow.rgb * baseColor;
    c +=  blended1 * uShadowFactor1;
    c +=  blended2 * uShadowFactor2;
    c +=  blended3 * uShadowFactor3;
    c +=  blended4 * uShadowFactor4;

    if( c.r > 1.0 ) c.r = 1.0;
    if( c.g > 1.0 ) c.g = 1.0;
    if( c.b > 1.0 ) c.b = 1.0;


    gl_FragColor = vec4( c , 1.0 );

}
