/**
 * Lava Shader
 * Inspired by smooth interpolation techniques and multi-level sampling
 * Creates a flowing, organic lava-like effect with 4 CSS color stops
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

// Simplex-like noise
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                      -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

// Fractal Brownian Motion with rotation
float fbm(vec2 p, float time) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;
  
  // Rotation matrix for each octave
  mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
  
  for (int i = 0; i < 6; i++) {
    value += amplitude * snoise(p * frequency + time * 0.2);
    p = rot * p;
    amplitude *= 0.5;
    frequency *= 2.0;
  }
  
  return value;
}

// Domain warping for organic flow
float warpedNoise(vec2 p, float time) {
  vec2 q = vec2(
    fbm(p + vec2(0.0, 0.0), time),
    fbm(p + vec2(5.2, 1.3), time)
  );
  
  vec2 r = vec2(
    fbm(p + 4.0 * q + vec2(1.7, 9.2), time * 0.5),
    fbm(p + 4.0 * q + vec2(8.3, 2.8), time * 0.5)
  );
  
  return fbm(p + 4.0 * r, time * 0.3);
}

// Smooth 4-color gradient mapping
vec3 colormap(float t, vec3 c1, vec3 c2, vec3 c3, vec3 c4) {
  t = clamp(t, 0.0, 1.0);
  
  // Smooth step transitions between colors
  float segment = t * 3.0;
  
  vec3 color;
  if (segment < 1.0) {
    color = mix(c1, c2, smoothstep(0.0, 1.0, segment));
  } else if (segment < 2.0) {
    color = mix(c2, c3, smoothstep(0.0, 1.0, segment - 1.0));
  } else {
    color = mix(c3, c4, smoothstep(0.0, 1.0, segment - 2.0));
  }
  
  return color;
}

void main() {
  vec2 uv = v_uv * u_scale;
  uv.x *= aspectRatio;
  
  // Slower, more flowing time
  float time = u_time * 0.0001;
  
  // Create layered warped noise for depth
  float n1 = warpedNoise(uv * 0.8, time);
  float n2 = warpedNoise(uv * 1.2 + 10.0, time * 1.3);
  
  // Combine layers
  float combined = (n1 + n2 * 0.5) / 1.5;
  
  // Normalize to 0-1 range and apply contrast
  float shade = combined * 0.5 + 0.5;
  shade = clamp((shade - 0.15) * 1.4, 0.0, 1.0);
  
  vec3 color = colormap(shade, u_color1, u_color2, u_color3, u_color4);
  
  gl_FragColor = vec4(color, 1.0);
}`;

/**
 * Create uniforms for the Lava shader
 */
export function createLavaUniforms(minigl, options = {}) {
  const {
    colors = [],
    scale = 2.0
  } = options;

  return {
    u_time: new minigl.Uniform({
      value: 0
    }),
    u_scale: new minigl.Uniform({
      value: scale
    }),
    u_color1: new minigl.Uniform({
      value: colors[0] || [0.1, 0.0, 0.1],
      type: "vec3"
    }),
    u_color2: new minigl.Uniform({
      value: colors[1] || [0.4, 0.1, 0.1],
      type: "vec3"
    }),
    u_color3: new minigl.Uniform({
      value: colors[2] || [0.8, 0.3, 0.1],
      type: "vec3"
    }),
    u_color4: new minigl.Uniform({
      value: colors[3] || [1.0, 0.8, 0.3],
      type: "vec3"
    })
  };
}

/**
 * Update colors in existing uniforms
 */
export function updateLavaColors(uniforms, colors) {
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
export const LavaShader = {
  name: "lava",
  getVertexShader,
  getFragmentShader,
  createUniforms: createLavaUniforms,
  updateColors: updateLavaColors
};

export default LavaShader;
