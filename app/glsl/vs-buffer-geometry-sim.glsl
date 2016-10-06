precision highp float;
precision highp sampler2D;

attribute vec3 position;
attribute vec4 index2D;

uniform sampler2D uGeometryTexture;
uniform sampler2D uSimulationTexture;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;
uniform mat4 modelMatrix;
uniform mat4 viewMatrix;


void main(){

    vec4 pos = texture2D( uGeometryTexture, index2D.zw );
    vec4 offset = texture2D( uSimulationTexture, index2D.xy );
    vec3 p = offset.rgb + pos.rgb;

    gl_Position = projectionMatrix * modelViewMatrix * vec4( p, 1.0 );

}