#version 300 es
precision mediump float;

uniform vec2 uViewCorner0;
uniform vec2 uViewCorner1;
uniform float uRadius;

in vec2 vPos;

void main() {
    vec2 uv = (vPos - uViewCorner0) / (uViewCorner1 - uViewCorner0);
    gl_Position = vec4(uv * 2. - 1., 0, 1);
    gl_PointSize = uRadius;
}