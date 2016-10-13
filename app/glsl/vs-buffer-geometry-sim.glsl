attribute vec4 index2D;

uniform sampler2D uGeometryTexture;
uniform sampler2D uGeometryNormals;
uniform sampler2D uSimulationTexture;
uniform sampler2D uSimulationPrevTexture;
uniform sampler2D uHeightMap;
uniform sampler2D uColorMap;

varying vec4 vPos;
varying vec4 vHeightColor;
varying vec4 vColor;
//varying mat3 vNormalMatrix;
//varying vec4 vOPosition;
//varying vec4 vU;

//
//mat4 rotationMatrix(vec3 axis, float angle){
//
//    axis = normalize(axis);
//    float s = sin(angle);
//    float c = cos(angle);
//    float oc = 1.0 - c;
//
//    return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
//                oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
//                oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
//                0.0,                                0.0,                                0.0,                                1.0);
//}

void main(){

    vec2 cUv = vec2(1.0) - index2D.xy;
    cUv.x = 1.0 - cUv.x;
    vec4 geomVertexPosition = texture2D( uGeometryTexture, index2D.zw );
//    vec4 geomVertexNormal = texture2D( uGeometryNormals, index2D.zw );
    vec4 simPosition = texture2D( uSimulationTexture, index2D.xy );
//    vec4 simPrevPosition = texture2D( uSimulationPrevTexture, index2D.xy );
    vec4 heightValue = texture2D( uHeightMap, cUv );
    vec4 colorValue = texture2D( uColorMap, cUv );

//    vec3 rotationVec = normalize( simPrevPosition.rgb - simPosition.rgb );

//    mat4 rx = rotationMatrix( vec3( 1.0, 0.0, 0.0 ), rotationVec.x);
//    mat4 ry = rotationMatrix( vec3( 0.0, 1.0, 0.0 ), rotationVec.y);
//    mat4 rz = rotationMatrix( vec3( 0.0, 0.0, 1.0 ), rotationVec.z);
//    mat4 rMatrix = rx * ry * rz;

    vec4 rotatedPosition = geomVertexPosition;
    simPosition.y -= (1.0 - heightValue.r) * 15.;
    simPosition.y+= 15.0;

    vec3 p = simPosition.rgb + rotatedPosition.rgb;

    vPos = vec4(p, 1.0);
//    vOPosition = modelViewMatrix * vPos;
//    vU = vec4(normalize( vec3( modelViewMatrix * vPos ) ), index2D.x/index2D.y);
//    vNormalMatrix = normalMatrix;
    vHeightColor = heightValue;
    vColor = colorValue;


    gl_Position = projectionMatrix * modelViewMatrix * vec4( p, 1.0 );

}