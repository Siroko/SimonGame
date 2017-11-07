precision highp float;
precision highp sampler2D;

attribute vec4 index2D;

uniform sampler2D uGeometryTexture;
uniform sampler2D uGeometryNormals;
uniform sampler2D uSimulationTexture;
uniform sampler2D uSimulationPrevTexture;
uniform sampler2D uHeightMap;
uniform sampler2D uColorMap;

uniform float uTime;

float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main(){

    vec2 cUv = vec2(1.0) - index2D.xy;
    cUv.x = 1.0 - cUv.x;

    vec4 geomVertexPosition = texture2D( uGeometryTexture, index2D.zw );
    vec4 simPosition        = texture2D( uSimulationTexture, index2D.xy );
    vec4 simPrevPosition    = texture2D( uSimulationPrevTexture, index2D.xy );
    vec4 heightValue        = texture2D( uHeightMap, cUv );
    vec4 colorValue         = texture2D( uColorMap, cUv );

     //simPosition.y -= floor( (1.0 - heightValue.a) * 10. );
    // float vHeight = 1.0 - ( (colorValue.r + colorValue.g + colorValue.b ) / 3.0 );
    float vHeight = 0.0;
    simPosition.y -= floor( (1.0 - vHeight * 10.) );


    float scale =  (simPosition.a / 10.0) * 2.0;
    if( scale < 0.0 ){
        scale = abs(scale);
        if( scale > 1.0 ) scale = 1.0;
    } else {
        scale = sin(scale) * 5.0;
    }

    geomVertexPosition *= scale;

   float n = rand( simPosition.rg );

    vec4 rotatedPosition = geomVertexPosition;
    vec3 p = simPosition.rgb + rotatedPosition.rgb;


    gl_Position = projectionMatrix * modelViewMatrix * vec4( p, 1.0 );

}