/**
 * Noise Overlay
 * A configurable noise overlay that can be applied on top of any shader
 * Supports multiple blend modes to preserve color vividness
 */

import { blendGLSL } from "./glsl/index.js";

/**
 * Blend mode constants
 */
export const BLEND_MODES = {
  NORMAL: 0,
  SCREEN: 1,
  MULTIPLY: 2,
  OVERLAY: 3,
  SOFT_LIGHT: 4,
  HARD_LIGHT: 5,
  VIVID_LIGHT: 6,
  LINEAR_LIGHT: 7,
  LIGHTEN: 8,
  COLOR_DODGE: 9,
  COLOR_BURN: 10,
  LINEAR_DODGE: 11,
  LINEAR_BURN: 12,
};

/**
 * Fragment shader for noise overlay
 * This is designed to be injected into the main shader's fragment shader
 * NOTE: Uniforms are NOT declared here - MiniGL auto-generates them from the uniforms object
 */
export const noiseOverlayGLSL = `
// Simple hash function for noise
float noiseHash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

// Value noise function
float valueNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  
  // Smooth interpolation
  vec2 u = f * f * (3.0 - 2.0 * f);
  
  // Four corners
  float a = noiseHash(i);
  float b = noiseHash(i + vec2(1.0, 0.0));
  float c = noiseHash(i + vec2(0.0, 1.0));
  float d = noiseHash(i + vec2(1.0, 1.0));
  
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

// Fractal Brownian Motion noise for more natural look
float fbmNoise(vec2 p, float time, float seed) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;
  
  // Add slight time-based movement for subtle animation
  p += time * 0.1;
  p += seed * 100.0;
  
  for (int i = 0; i < 4; i++) {
    value += amplitude * valueNoise(p * frequency);
    amplitude *= 0.5;
    frequency *= 2.0;
  }
  
  return value;
}

// Apply noise overlay with blend mode
vec3 applyNoiseOverlay(vec3 baseColor, vec2 uv, float time) {
  if (u_noise_enabled < 0.5) {
    return baseColor;
  }
  
  // Generate noise
  vec2 noiseCoord = uv * u_noise_scale;
  float animTime = time * u_noise_speed;
  
  float noise = fbmNoise(noiseCoord, animTime, u_noise_seed);
  float noiseLow = min(u_noise_low, u_noise_high);
  float noiseHigh = max(u_noise_low, u_noise_high);
  
  // Create noise color (can be monochrome or colored)
  vec3 noiseColor;
  if (u_noise_monochrome > 0.5) {
    noiseColor = vec3(mix(noiseLow, noiseHigh, noise));
  } else {
    // Slight color variation
    noiseColor = vec3(
      mix(noiseLow, noiseHigh, fbmNoise(noiseCoord, animTime, u_noise_seed)),
      mix(noiseLow, noiseHigh, fbmNoise(noiseCoord + vec2(17.0, 31.0), animTime, u_noise_seed + 1.0)),
      mix(noiseLow, noiseHigh, fbmNoise(noiseCoord + vec2(59.0, 83.0), animTime, u_noise_seed + 2.0))
    );
  }
  
  // Apply blend mode with intensity
  // Cast float uniform to int for comparison
  int blendMode = int(u_noise_blend_mode + 0.5);
  vec3 blendedColor;
  
  if (blendMode == 0) {
    blendedColor = blendNormal(baseColor, noiseColor, u_noise_intensity);
  } else if (blendMode == 1) {
    blendedColor = blendScreen(baseColor, noiseColor, u_noise_intensity);
  } else if (blendMode == 2) {
    blendedColor = blendMultiply(baseColor, noiseColor, u_noise_intensity);
  } else if (blendMode == 3) {
    blendedColor = blendOverlay(baseColor, noiseColor, u_noise_intensity);
  } else if (blendMode == 4) {
    blendedColor = blendSoftLight(baseColor, noiseColor, u_noise_intensity);
  } else if (blendMode == 5) {
    blendedColor = blendHardLight(baseColor, noiseColor, u_noise_intensity);
  } else if (blendMode == 6) {
    blendedColor = blendVividLight(baseColor, noiseColor, u_noise_intensity);
  } else if (blendMode == 7) {
    blendedColor = blendLinearLight(baseColor, noiseColor, u_noise_intensity);
  } else if (blendMode == 8) {
    blendedColor = blendLighten(baseColor, noiseColor, u_noise_intensity);
  } else if (blendMode == 9) {
    blendedColor = blendColorDodge(baseColor, noiseColor, u_noise_intensity);
  } else if (blendMode == 10) {
    blendedColor = blendColorBurn(baseColor, noiseColor, u_noise_intensity);
  } else if (blendMode == 11) {
    blendedColor = blendLinearDodge(baseColor, noiseColor, u_noise_intensity);
  } else if (blendMode == 12) {
    blendedColor = blendLinearBurn(baseColor, noiseColor, u_noise_intensity);
  } else {
    // Default to soft light (best for preserving vividness)
    blendedColor = blendSoftLight(baseColor, noiseColor, u_noise_intensity);
  }
  
  return blendedColor;
}
`;

/**
 * Create noise overlay uniforms
 * @param {MiniGl} minigl - The MiniGL instance
 * @param {Object} options - Noise overlay options
 * @param {boolean} options.enabled - Whether noise is enabled (default: true)
 * @param {number} options.intensity - Noise intensity/opacity 0-1 (default: 0.05)
 * @param {number} options.scale - Noise scale/frequency (default: 100)
 * @param {number} options.speed - Animation speed (default: 0.0001 for very slow)
 * @param {number} options.seed - Random seed (default: random)
 * @param {number} options.blendMode - Blend mode from BLEND_MODES (default: SOFT_LIGHT)
 * @param {boolean} options.monochrome - Whether noise is grayscale (default: true)
 */
export function createNoiseOverlayUniforms(minigl, options = {}) {
  const {
    enabled = true,
    intensity = 0.05,
    scale = 100,
    speed = 0.0001,
    seed = Math.random() * 1000,
    blendMode = BLEND_MODES.SOFT_LIGHT,
    monochrome = true,
    low = 0.0,
    high = 1.0,
  } = options;

  return {
    u_noise_enabled: new minigl.Uniform({
      value: enabled ? 1.0 : 0.0,
    }),
    u_noise_intensity: new minigl.Uniform({
      value: intensity,
    }),
    u_noise_scale: new minigl.Uniform({
      value: scale,
    }),
    u_noise_speed: new minigl.Uniform({
      value: speed,
    }),
    u_noise_seed: new minigl.Uniform({
      value: seed,
    }),
    u_noise_blend_mode: new minigl.Uniform({
      value: blendMode,
    }),
    u_noise_monochrome: new minigl.Uniform({
      value: monochrome ? 1.0 : 0.0,
    }),
    u_noise_low: new minigl.Uniform({
      value: low,
    }),
    u_noise_high: new minigl.Uniform({
      value: high,
    }),
  };
}

/**
 * Wrap a fragment shader to include noise overlay
 * @param {string} fragmentShader - Original fragment shader
 * @returns {string} Modified fragment shader with noise overlay
 */
export function wrapFragmentShaderWithNoise(fragmentShader) {
  // Find the main function and modify it to apply noise
  // We need to capture the color before it's assigned to gl_FragColor

  // First, add the noise overlay GLSL code (blend functions + noise functions)
  const noiseCode = blendGLSL + "\n\n" + noiseOverlayGLSL;

  // Modify the fragment shader to apply noise before final output
  // This regex finds gl_FragColor = vec4(color, 1.0); or similar patterns
  const modifiedShader = fragmentShader.replace(
    /gl_FragColor\s*=\s*vec4\s*\(\s*(\w+)\s*,\s*1\.0\s*\)\s*;/g,
    (_match, colorVar) => {
      return `vec3 finalColorWithNoise = applyNoiseOverlay(${colorVar}, gl_FragCoord.xy / resolution.xy, u_time * 0.001);
  gl_FragColor = vec4(finalColorWithNoise, 1.0);`;
    },
  );

  return noiseCode + "\n\n" + modifiedShader;
}

/**
 * Get default noise overlay configuration
 */
export function getDefaultNoiseConfig() {
  return {
    enabled: true,
    intensity: 0.05, // Low contrast
    scale: 100, // Medium grain size
    speed: 0.0001, // Very slow animation
    seed: Math.random() * 1000,
    blendMode: BLEND_MODES.SOFT_LIGHT, // Preserves color vividness
    monochrome: true,
    low: 0.0,
    high: 1.0,
  };
}

export default {
  BLEND_MODES,
  noiseOverlayGLSL,
  createNoiseOverlayUniforms,
  wrapFragmentShaderWithNoise,
  getDefaultNoiseConfig,
};
