#version 300 es
precision mediump float;
in vec2 uv;
out vec4 fragColor;

uniform vec2[64] uZeros;
uniform vec2[64] uPoles;
uniform int uNumZeros;
uniform int uNumPoles;
uniform float uFactor;

uniform int uDisplayFunc;

vec2 cmul(vec2 a, vec2 b) {
    return vec2(a.x*b.x-a.y*b.y, a.x*b.y + a.y*b.x);
}
vec2 cdiv(vec2 a, vec2 b) {
    return cmul(a, vec2(b.x, -b.y)) / dot(b, b);
}

vec3 hue(float angle) {
    return clamp(2. - 2. * abs(mod(angle * 3.0 - vec3(0, 1, 2) - 0.5, 3.0) - 1.0), 0., 1.);
}

vec3 displayColor(vec2 H) {
    if (uDisplayFunc == 0) {
        float L = length(H);
        vec3 col = vec3(1);
        float f = clamp(L, 0., 1.);
        col = mix(col, vec3(0, 0, 1), 1. - f*f);
        f = clamp(1./L, 0., 1.);
        col = mix(col, vec3(1, 0, 0), 1. - f*f);
        return col;
    } else if (uDisplayFunc == 1 || uDisplayFunc == 2) {
        float angle = atan(H.y, H.x) / 6.28318530718;
        return hue(angle);
    }
    return vec3(0);
}

float unitCircle(vec2 uv) {
    float s = 1.5 * dFdx(uv.x);
    return smoothstep(0.0, s, abs(1. - length(uv)));
}

void main() {
    vec2 z = uv;
    vec2 H;
    if (uDisplayFunc == 2) {
        vec2 c = uv;
        z = vec2(0);
        for (int i = 0; i < 100; i++) {
            z = cmul(z, z) + c;
        }
        H = z;
    } else {
        H = vec2(uFactor, 0.0);
        for (int i = 0; i < uNumZeros; i++) {
            H = cmul(H, z - uZeros[i]);
        }
        vec2 denominator = vec2(1, 0);
        for (int i = 0; i < uNumPoles; i++) {
            denominator = cmul(denominator, z - uPoles[i]);
        }
        H = cdiv(H, denominator);
    }
    vec3 col = displayColor(H);
    col *= unitCircle(uv);
    fragColor = vec4(col, 1.0);
}