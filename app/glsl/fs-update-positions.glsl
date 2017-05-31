precision highp float;
precision highp sampler2D;

uniform sampler2D uPrevPositionsMap;
uniform sampler2D uGeomPositionsMap;
uniform float uTime;
uniform int uLock;
uniform float uBoundary[ 6 ];
uniform vec3 uDirectionFlow;
uniform vec3 uOffsetPosition;
uniform vec3 uCollision;
uniform float uLifeTime;
uniform float uNoiseTimeScale;
uniform float uNoisePositionScale;
uniform float uNoiseScale;
uniform vec3 uOffset;
uniform float uPersistence;
uniform float uSpeedDie;
uniform float uRadius;
uniform vec3 uMousePosition;

uniform vec3 uOriginEmiter;

varying vec2 vUv;

const int OCTAVES = 1;

vec4 mod289(vec4 x) {
    vec4 r = x - floor(x * (1.0 / 289.0)) * 289.0;
    return r;
}

float mod289(float x) {
    float r = x - floor(x * (1.0 / 289.0)) * 289.0;
    return r;
}

vec4 permute(vec4 x) {
    vec4 r = mod289(((x*34.0)+1.0)*x);
    return r;
}

float permute(float x) {
    float r = mod289(((x*34.0)+1.0)*x);
    return r;
}

vec4 taylorInvSqrt(vec4 r) {
    vec4 f = 1.79284291400159 - 0.85373472095314 * r;
    return f;
}

float taylorInvSqrt(float r) {
    float f = 1.79284291400159 - 0.85373472095314 * r;
    return f;
}

vec4 grad4(float j, vec4 ip) {
    const vec4 ones = vec4(1.0, 1.0, 1.0, -1.0);
    vec4 p,s;

    p.xyz = floor( fract (vec3(j) * ip.xyz) * 7.0) * ip.z - 1.0;
    p.w = 1.5 - dot(abs(p.xyz), ones.xyz);
    s = vec4(lessThan(p, vec4(0.0)));
    p.xyz = p.xyz + (s.xyz*2.0 - 1.0) * s.www;

    return p;
}

vec4 simplexNoiseDerivatives (vec4 v) {
    const vec4  C = vec4( 0.138196601125011,0.276393202250021,0.414589803375032,-0.447213595499958);

    vec4 i  = floor(v + dot(v, vec4(0.309016994374947451)) );
    vec4 x0 = v -   i + dot(i, C.xxxx);

    vec4 i0;
    vec3 isX = step( x0.yzw, x0.xxx );
    vec3 isYZ = step( x0.zww, x0.yyz );
    i0.x = isX.x + isX.y + isX.z;
    i0.yzw = 1.0 - isX;
    i0.y += isYZ.x + isYZ.y;
    i0.zw += 1.0 - isYZ.xy;
    i0.z += isYZ.z;
    i0.w += 1.0 - isYZ.z;

    vec4 i3 = clamp( i0, 0.0, 1.0 );
    vec4 i2 = clamp( i0-1.0, 0.0, 1.0 );
    vec4 i1 = clamp( i0-2.0, 0.0, 1.0 );

    vec4 x1 = x0 - i1 + C.xxxx;
    vec4 x2 = x0 - i2 + C.yyyy;
    vec4 x3 = x0 - i3 + C.zzzz;
    vec4 x4 = x0 + C.wwww;

    i = mod289(i);
    float j0 = permute( permute( permute( permute(i.w) + i.z) + i.y) + i.x);
    vec4 j1 = permute( permute( permute( permute (
                        i.w + vec4(i1.w, i2.w, i3.w, 1.0 ))
                      + i.z + vec4(i1.z, i2.z, i3.z, 1.0 ))
                      + i.y + vec4(i1.y, i2.y, i3.y, 1.0 ))
                      + i.x + vec4(i1.x, i2.x, i3.x, 1.0 ));


    vec4 ip = vec4(1.0/294.0, 1.0/49.0, 1.0/7.0, 0.0) ;

    vec4 p0 = grad4(j0,   ip);
    vec4 p1 = grad4(j1.x, ip);
    vec4 p2 = grad4(j1.y, ip);
    vec4 p3 = grad4(j1.z, ip);
    vec4 p4 = grad4(j1.w, ip);

    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    p4 *= taylorInvSqrt(dot(p4,p4));

    vec3 values0 = vec3(dot(p0, x0), dot(p1, x1), dot(p2, x2)); //value of contributions from each corner at point
    vec2 values1 = vec2(dot(p3, x3), dot(p4, x4));

    vec3 m0 = max(0.5 - vec3(dot(x0,x0), dot(x1,x1), dot(x2,x2)), 0.0); //(0.5 - x^2) where x is the distance
    vec2 m1 = max(0.5 - vec2(dot(x3,x3), dot(x4,x4)), 0.0);

    vec3 temp0 = -6.0 * m0 * m0 * values0;
    vec2 temp1 = -6.0 * m1 * m1 * values1;

    vec3 mmm0 = m0 * m0 * m0;
    vec2 mmm1 = m1 * m1 * m1;

    float dx = temp0[0] * x0.x + temp0[1] * x1.x + temp0[2] * x2.x + temp1[0] * x3.x + temp1[1] * x4.x + mmm0[0] * p0.x + mmm0[1] * p1.x + mmm0[2] * p2.x + mmm1[0] * p3.x + mmm1[1] * p4.x;
    float dy = temp0[0] * x0.y + temp0[1] * x1.y + temp0[2] * x2.y + temp1[0] * x3.y + temp1[1] * x4.y + mmm0[0] * p0.y + mmm0[1] * p1.y + mmm0[2] * p2.y + mmm1[0] * p3.y + mmm1[1] * p4.y;
    float dz = temp0[0] * x0.z + temp0[1] * x1.z + temp0[2] * x2.z + temp1[0] * x3.z + temp1[1] * x4.z + mmm0[0] * p0.z + mmm0[1] * p1.z + mmm0[2] * p2.z + mmm1[0] * p3.z + mmm1[1] * p4.z;
    float dw = temp0[0] * x0.w + temp0[1] * x1.w + temp0[2] * x2.w + temp1[0] * x3.w + temp1[1] * x4.w + mmm0[0] * p0.w + mmm0[1] * p1.w + mmm0[2] * p2.w + mmm1[0] * p3.w + mmm1[1] * p4.w;

    return vec4(dx, dy, dz, dw) * 49.0;
}

vec3 getCurlVelocity( vec4 position ) {

    position.x += uOffset.x;
    float NOISE_TIME_SCALE = uNoiseTimeScale;
    float NOISE_SCALE = uNoiseScale;
    float NOISE_POSITION_SCALE = uNoisePositionScale;

    vec3 oldPosition = position.rgb;
    vec3 noisePosition = oldPosition *  NOISE_POSITION_SCALE;

    float noiseTime = NOISE_TIME_SCALE;

    vec4 xNoisePotentialDerivatives = vec4(0.0);
    vec4 yNoisePotentialDerivatives = vec4(0.0);
    vec4 zNoisePotentialDerivatives = vec4(0.0);

    float persistence = uPersistence;

    for (int i = 0; i < OCTAVES; ++i) {
        float scale = (1.0 / 2.0) * pow(2.0, float(i));

        float noiseScale = pow(persistence, float(i));

        xNoisePotentialDerivatives += simplexNoiseDerivatives(vec4(noisePosition * pow(2.0, float(i)), noiseTime)) * noiseScale * scale;
        yNoisePotentialDerivatives += simplexNoiseDerivatives(vec4((noisePosition + vec3(123.4, 129845.6, -1239.1)) * pow(2.0, float(i)), noiseTime)) * noiseScale * scale;
        zNoisePotentialDerivatives += simplexNoiseDerivatives(vec4((noisePosition + vec3(-9519.0, 9051.0, -123.0)) * pow(2.0, float(i)), noiseTime)) * noiseScale * scale;
    }

    //compute curl
    vec3 noiseVelocity = vec3(
                              zNoisePotentialDerivatives[1] - yNoisePotentialDerivatives[2],
                              xNoisePotentialDerivatives[2] - zNoisePotentialDerivatives[0],
                              yNoisePotentialDerivatives[0] - xNoisePotentialDerivatives[1]
                              ) * NOISE_SCALE;
    return noiseVelocity;
}

float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main () {

    vec2 uv = vUv;

    vec4 geomPositions = texture2D( uGeomPositionsMap, uv );
    vec4 prevPositions = texture2D(uPrevPositionsMap, uv);

    vec3 noiseVelocity = getCurlVelocity( prevPositions );

    vec3 vel = noiseVelocity;
    vec3 dir = uDirectionFlow;

    float pLife = prevPositions.a;


    vec3 newPosition = ( prevPositions.rgb + vel + dir );

    pLife -= uSpeedDie;

    if( pLife < 0.0 ){
        newPosition = geomPositions.xyz + uOffsetPosition;
        pLife = uLifeTime;
    }

    vec3 fPos = mix(geomPositions.rgb, newPosition, uRadius);
    gl_FragColor = vec4( fPos, pLife );

}
