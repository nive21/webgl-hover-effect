uniform sampler2D uTexture1;
uniform sampler2D uTexture2;
uniform sampler2D uDisplacement;
uniform float uProgress;
varying vec2 vUv;

void main() {
    // Sample displacement map
    float displacement = texture2D(uDisplacement, vUv).r;

    // Strength of distortion (strongest at the middle of the transition)
    float distortionStrength = (1.0 - abs(2.0 * uProgress - 1.0)) * 0.3; 

    // Distort both textures
    vec2 distortedUV1 = vUv + (displacement - 0.5) * distortionStrength; // Distortion for image1
    vec2 distortedUV2 = vUv - (displacement - 0.5) * distortionStrength; // Distortion for image2

    // Sample both images with their respective distortion
    vec4 tex1 = texture2D(uTexture1, distortedUV1);
    vec4 tex2 = texture2D(uTexture2, distortedUV2);

    // Blend the images
    gl_FragColor = mix(tex1, tex2, uProgress);
}
