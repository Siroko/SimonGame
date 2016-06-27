precision highp float;

varying vec2 vUv;
varying vec4 vPos;

void main()	{

    vUv = uv;
    vPos = vec4(position, 1.0);

    gl_Position = projectionMatrix * modelViewMatrix * vPos;
}