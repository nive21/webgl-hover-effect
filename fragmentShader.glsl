uniform sampler2D uTexture1;
uniform sampler2D uTexture2;
uniform sampler2D uDisplacement;
uniform float uProgress;
varying vec2 vUv;

void main() {
    // Sample the displacement map
    float displacement = texture2D(uDisplacement, vUv).r;

    // Offset UV coordinates using the displacement map
    vec2 distortedUV = vUv + (displacement - 0.5) * 0.2 * uProgress;

    // Sample both textures with distortion
    vec4 tex1 = texture2D(uTexture1, distortedUV);
    vec4 tex2 = texture2D(uTexture2, distortedUV);

    // Blend between the two textures
    gl_FragColor = mix(tex1, tex2, uProgress);
}
