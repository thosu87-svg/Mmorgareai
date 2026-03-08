'use client';

/**
 * Axiom Shader - Hardened High-Clarity Edition
 * Permanently stripped of Fog, Sky, and Sun mixing to ensure 100% texture visibility.
 */

export const axiomVertexShader = `
varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;

uniform float uTime;
uniform float uBiome; 

void main() {
  vUv = uv;
  vec3 pos = position;
  
  float elevation = sin(pos.x * 0.05) * cos(pos.z * 0.05) * 0.5;
  pos.y += elevation;
  
  vec4 modelPosition = modelMatrix * vec4(pos, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  
  vPosition = modelPosition.xyz;
  vNormal = normalMatrix * normal;

  gl_Position = projectionMatrix * viewPosition;
}
`;

export const axiomFragmentShader = `
varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;

uniform float uTime;
uniform float uBiome;
uniform vec3 uCameraPosition;

void main() {
    vec3 normal = normalize(vNormal);
    float lighting = 1.0; 

    vec3 finalColor = vec3(0.04, 0.05, 0.1); // Default
    if (abs(uBiome - 0.0) < 0.1) finalColor = vec3(0.01, 0.02, 0.06); 
    else if (abs(uBiome - 1.0) < 0.1) finalColor = vec3(0.01, 0.06, 0.03); 
    else if (abs(uBiome - 2.0) < 0.1) finalColor = vec3(0.05, 0.05, 0.05); 
    else if (abs(uBiome - 3.0) < 0.1) finalColor = vec3(0.08, 0.04, 0.08); 

    // Grid Overlay
    vec2 gridUV = vPosition.xz * 0.25; 
    vec2 grid = abs(fract(gridUV - 0.5) - 0.5);
    float line = min(grid.x, grid.y);
    float gridPattern = smoothstep(0.0, 0.05, 0.01 / (line + 0.001));
    
    vec3 gridColor = vec3(0.1, 0.6, 0.6);
    finalColor = mix(finalColor, gridColor, clamp(gridPattern, 0.0, 1.0) * 0.15);

    // VISUAL CLARITY LOCK: Fog and atmospheric washout logic are strictly forbidden.
    gl_FragColor = vec4(finalColor * lighting, 1.0);
}
`;