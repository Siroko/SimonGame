precision highp float;
precision highp sampler2D;

uniform sampler2D textureMap;
varying vec4 vColor;

void main(){

    vec4 color = texture2D(textureMap, gl_PointCoord);
    float alpha = vColor.a / 10.0;

    gl_FragColor = vec4( vColor.xy, 1.0, alpha );
}