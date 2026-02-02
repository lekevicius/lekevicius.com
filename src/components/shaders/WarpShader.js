/**
 * Warp Shader
 * Based on "Base warp fBM" by trinketMage (Shadertoy)
 * Adapted to use CSS color variables
 */

const vertexShader = `
varying vec2 v_uv;
varying vec3 v_color;

void main() {
  // Use uvNorm (normalized -1 to 1) and convert to 0-1 range for fragment shader
  v_uv = uvNorm * 0.5 + 0.5;
  
  // Must use uv attribute to prevent WebGL optimization removing it
  v_color = vec3(uv.x, uv.y, 0.0);
  
  // The geometry uses XZ plane, map to XY for screen
  vec3 pos = vec3(position.x, position.z, 0.0);
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}`;

const fragmentShader = `
varying vec2 v_uv;
varying vec3 v_color;

float rand(vec2 n) { 
  return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 ip = floor(p);
  vec2 u = fract(p);
  u = u * u * (3.0 - 2.0 * u);

  float res = mix(
    mix(rand(ip), rand(ip + vec2(1.0, 0.0)), u.x),
    mix(rand(ip + vec2(0.0, 1.0)), rand(ip + vec2(1.0, 1.0)), u.x),
    u.y
  );
  return res * res;
}

mat2 mtx = mat2(0.80, 0.60, -0.60, 0.80);

float fbm(vec2 p, float time) {
  float f = 0.0;

  f += 0.500000 * noise(p + 0.4 * time); p = mtx * p * 2.02;
  f += 0.031250 * noise(p); p = mtx * p * 2.01;
  f += 0.250000 * noise(p); p = mtx * p * 2.03;
  f += 0.125000 * noise(p); p = mtx * p * 2.01;
  f += 0.062500 * noise(p); p = mtx * p * 2.04;
  f += 0.015625 * noise(p + sin(0.4 * time));

  return f / 0.96875;
}

float pattern(vec2 p, float time) {
  return fbm(p + fbm(p + fbm(p, time), time), time);
}

vec3 colormap(float t, vec3 c1, vec3 c2, vec3 c3, vec3 c4) {
  float segment = clamp(t, 0.0, 1.0) * 3.0;
  
  if (segment < 1.0) {
    return mix(c1, c2, segment);
  } else if (segment < 2.0) {
    return mix(c2, c3, segment - 1.0);
  } else {
    return mix(c3, c4, segment - 2.0);
  }
}

void main() {
  vec2 uv = v_uv * u_scale;
  uv.x *= aspectRatio;
  
  // Scale time - adjust multiplier for desired speed
  float time = u_time * 0.00015;
  float shade = pattern(uv, time);
  
  // Remap to ensure all 4 colors get equal representation
  shade = clamp((shade - 0.05) * 1.8, 0.0, 1.0);
  
  vec3 color = colormap(shade, u_color1, u_color2, u_color3, u_color4);
  
  gl_FragColor = vec4(color, 1.0);
}`;

/**
 * Create uniforms for the Warp shader
 */
export function createWarpUniforms(minigl, options = {}) {
  const {
    colors = [],
    scale = 1.5
  } = options;

  return {
    u_time: new minigl.Uniform({
      value: 0
    }),
    u_scale: new minigl.Uniform({
      value: scale
    }),
    u_color1: new minigl.Uniform({
      value: colors[0] || [0.2, 0.0, 0.1],
      type: "vec3"
    }),
    u_color2: new minigl.Uniform({
      value: colors[1] || [0.5, 0.1, 0.2],
      type: "vec3"
    }),
    u_color3: new minigl.Uniform({
      value: colors[2] || [0.9, 0.4, 0.2],
      type: "vec3"
    }),
    u_color4: new minigl.Uniform({
      value: colors[3] || [1.0, 0.9, 0.5],
      type: "vec3"
    })
  };
}

/**
 * Update colors in existing uniforms
 */
export function updateWarpColors(uniforms, colors) {
  if (!uniforms || !colors || colors.length < 1) return;

  if (colors[0]) uniforms.u_color1.value = colors[0];
  if (colors[1]) uniforms.u_color2.value = colors[1];
  if (colors[2]) uniforms.u_color3.value = colors[2];
  if (colors[3]) uniforms.u_color4.value = colors[3];
}

/**
 * Get the vertex shader source
 */
export function getVertexShader() {
  return vertexShader;
}

/**
 * Get the fragment shader source
 */
export function getFragmentShader() {
  return fragmentShader;
}

/**
 * Export shader configuration object
 */
export const WarpShader = {
  name: "warp",
  getVertexShader,
  getFragmentShader,
  createUniforms: createWarpUniforms,
  updateColors: updateWarpColors
};

export default WarpShader;
