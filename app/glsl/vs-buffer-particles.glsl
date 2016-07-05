precision highp float;
precision highp sampler2D;

attribute vec2 aV2I;
attribute vec3 position;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;
uniform mat4 modelMatrix;
uniform mat4 viewMatrix;

uniform sampler2D uPositionsT;
uniform sampler2D map;

varying float vColor;

void main()	{

    vec2 ind = aV2I;
    vec4 prevPos = vec4(texture2D( uPositionsT, ind ).rgb, 1.0) ;
    vec4 pos = vec4(texture2D( map, ind ).rgb, 1.0) ;
    
    vec4 mvPosition = modelViewMatrix * pos;
    vColor = texture2D( uPositionsT, ind ).a;
    float incrementSize = (1.0 - clamp(vColor, 0.0, 1.0)) * 5.0;

    gl_PointSize = pow( min( 150.0, .1 * ( 150.0 / length( mvPosition.xyz ) ) ), 2.0 ) + 5.0;
    gl_Position = projectionMatrix * modelViewMatrix * pos;
}