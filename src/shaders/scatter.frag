#version 300 es
precision mediump float;

uniform sampler2D uSampler;

out vec4 fragColor;

void main() {
    fragColor = texture(uSampler, gl_PointCoord);
    //if (fragColor.a < 0.01) discard;
}