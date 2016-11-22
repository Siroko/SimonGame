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

mat4 rotationMatrix(vec3 axis, float angle){

    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;

    return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
                oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
                0.0,                                0.0,                                0.0,                                1.0);
}

void main(){

    vec2 cUv = vec2(1.0) - index2D.xy;
    cUv.x = 1.0 - cUv.x;
//    cUv.y *= 1.5;
//    cUv.y += 0.60;
//    cUv *= 0.5;
//    cUv.x += 0.25;
////    cUv.x += uTime;
//    cUv.x = mod( cUv.x, 2.0 ) * 0.5;

    vec4 geomVertexPosition = texture2D( uGeometryTexture, index2D.zw );
    vec4 simPosition        = texture2D( uSimulationTexture, index2D.xy );
    vec4 heightValue        = texture2D( uHeightMap, cUv );
    vec4 colorValue         = texture2D( uColorMap, cUv );

    simPosition.y -= floor( (1.0 - heightValue.r) * 100. );
    simPosition.y += 50.;
    geomVertexPosition.y *= heightValue.r * 10.; // scale Y

    vec3 p = simPosition.rgb + geomVertexPosition.rgb;
    float n = rand( simPosition.rg );
    mat4 rot = rotationMatrix(vec3(0.0, 1.0, 0.0), n * 6.3 );
    geomVertexPosition *= rot;

    p = simPosition.rgb + geomVertexPosition.rgb;
    p.x += n * 0.3;
    p.y += n*2.;
    p.z += n * 0.3;

    vVertexAO       = 1.0 - step(geomVertexPosition.y, 0.0) + ( (1.0 - heightValue.r) * 0.2);
    vPos            = vec4( p, 1.0 );
    vColor          = colorValue;

    vNormalMatrix = normalMatrix;

    gl_Position = projectionMatrix * modelViewMatrix * vec4( p, 1.0 );
}