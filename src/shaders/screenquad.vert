#version 300 es
precision mediump float;
vec2 corners[4] = vec2[4](
    vec2(-1., 1.),
    vec2(-1.,-1.),
    vec2( 1., 1.),
    vec2( 1.,-1.)
);
out vec2 uv;

uniform vec2 uViewCorner0;
uniform vec2 uViewCorner1;

void main() {
    vec2 corner = corners[gl_VertexID % 4];
    uv = mix(uViewCorner0, uViewCorner1, corner * 0.5 + 0.5);
    gl_Position = vec4(corner, 0., 1.);
}