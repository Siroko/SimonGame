precision highp float;

attribute vec3 position;
attribute vec4 index2D;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;
uniform mat4 modelMatrix;
uniform mat4 viewMatrix;

uniform sampler2D uGeometryTexture;
uniform sampler2D uGeometryNormals;
uniform sampler2D uSimulationTexture;
uniform sampler2D uSimulationPrevTexture;
uniform sampler2D uHeightMap;
uniform sampler2D uColorMap;

uniform float uTime;

varying mat3 vNormalMatrix;
varying vec4 vPos;
varying vec4 vColor;
varying float vVertexAO;

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

//    heightValue.r = 0.5;

    simPosition.y -= floor( (1.0 - heightValue.a) * 50. );
    simPosition.y += 50.;

    float n = rand( simPosition.rg );

    vec4 rotatedPosition = geomVertexPosition;
    vec3 p = simPosition.rgb + rotatedPosition.rgb;

    vVertexAO       = 1.0 - step(rotatedPosition.y, 0.0) + ( (1.0 - heightValue.r) * 0.2);
    vPos            = vec4( p, 1.0 );
    vColor          = colorValue;

    vNormalMatrix = normalMatrix;

    gl_Position = projectionMatrix * modelViewMatrix * vec4( p, 1.0 );
}