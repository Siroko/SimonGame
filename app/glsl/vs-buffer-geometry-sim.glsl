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

    vec4 pos = texture2D( uSimulationTexture, index2D.xy );
    vec4 offset = texture2D( uGeometryTexture, index2D.zw );
    vec3 p = offset.rgb + pos.rgb;

    gl_Position = projectionMatrix * modelViewMatrix * vec4( offset.rgb, 1.0 );

}