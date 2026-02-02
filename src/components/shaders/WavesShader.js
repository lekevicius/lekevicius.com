/**
 * Waves Shader
 * A gradient wave effect with multiple color layers
 */

import { noiseGLSL, blendGLSL } from "./glsl/index.js";

// Vertex shader
const vertexShader = `
varying vec3 v_color;

void main() {
  float time = u_time * u_global.noiseSpeed;

  vec2 noiseCoord = resolution * uvNorm * u_global.noiseFreq;

  vec2 st = 1. - uvNorm.xy;

  //
  // Tilting the plane
  //

  // Front-to-back tilt
  float tilt = resolution.y / 2.0 * uvNorm.y;

  // Left-to-right angle
  float incline = resolution.x * uvNorm.x / 2.0 * u_vertDeform.incline;

  // Up-down shift to offset incline
  float offset = resolution.x / 2.0 * u_vertDeform.incline * mix(u_vertDeform.offsetBottom, u_vertDeform.offsetTop, uv.y);

  //
  // Vertex noise
  //

  float noise = snoise(vec3(
    noiseCoord.x * u_vertDeform.noiseFreq.x + time * u_vertDeform.noiseFlow,
    noiseCoord.y * u_vertDeform.noiseFreq.y,
    time * u_vertDeform.noiseSpeed + u_vertDeform.noiseSeed
  )) * u_vertDeform.noiseAmp;

  // Fade noise to zero at edges
  noise *= 1.0 - pow(abs(uvNorm.y), 2.0);

  // Clamp to 0
  noise = max(0.0, noise);

  vec3 pos = vec3(
    position.x,
    position.y + tilt + incline + noise - offset,
    position.z
  );

  //
  // Vertex color, to be passed to fragment shader
  //

  if (u_active_colors[0] == 1.) {
    v_color = u_baseColor;
  }

  for (int i = 0; i < u_waveLayers_length; i++) {
    if (u_active_colors[i + 1] == 1.) {
      WaveLayers layer = u_waveLayers[i];

      float noise = smoothstep(
        layer.noiseFloor,
        layer.noiseCeil,
        snoise(vec3(
          noiseCoord.x * layer.noiseFreq.x + time * layer.noiseFlow,
          noiseCoord.y * layer.noiseFreq.y,
          time * layer.noiseSpeed + layer.noiseSeed
        )) / 2.0 + 0.5
      );

      v_color = blendNormal(v_color, layer.color, pow(noise, 4.));
    }
  }

  //
  // Finish
  //

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}`;

// Fragment shader
const fragmentShader = `
varying vec3 v_color;

void main() {
  vec3 color = v_color;
  if (u_darken_top == 1.0) {
    vec2 st = gl_FragCoord.xy/resolution.xy;
    color.g -= pow(st.y + sin(-12.0) * st.x, u_shadow_power) * 0.4;
  }
  gl_FragColor = vec4(color, 1.0);
}`;

/**
 * Create uniforms for the Waves shader
 * @param {MiniGl} minigl - The MiniGL instance
 * @param {Object} options - Shader options
 * @param {Array} options.colors - Array of normalized colors (use normalizeColor)
 * @param {number} options.angle - Rotation angle
 * @param {number} options.amp - Amplitude
 * @param {number} options.seed - Random seed
 * @param {number} options.freqX - X frequency
 * @param {number} options.freqY - Y frequency
 * @param {Array} options.activeColors - Which colors are active [1,1,1,1]
 * @param {boolean} options.darkenTop - Whether to darken the top
 */
export function createWavesUniforms(minigl, options = {}) {
  const {
    colors = [],
    angle = 0,
    amp = 320,
    seed = Math.random() * 10,
    freqX = 10e-5,
    freqY = 29e-5,
    activeColors = [1, 1, 1, 1],
    darkenTop = false
  } = options;

  const uniforms = {
    u_time: new minigl.Uniform({
      value: 0
    }),
    u_shadow_power: new minigl.Uniform({
      value: 5
    }),
    u_darken_top: new minigl.Uniform({
      value: darkenTop ? 1 : 0
    }),
    u_active_colors: new minigl.Uniform({
      value: activeColors,
      type: "vec4"
    }),
    u_global: new minigl.Uniform({
      value: {
        noiseFreq: new minigl.Uniform({
          value: [freqX, freqY],
          type: "vec2"
        }),
        noiseSpeed: new minigl.Uniform({
          value: 5e-6
        })
      },
      type: "struct"
    }),
    u_vertDeform: new minigl.Uniform({
      value: {
        incline: new minigl.Uniform({
          value: Math.sin(angle) / Math.cos(angle)
        }),
        offsetTop: new minigl.Uniform({
          value: -0.5
        }),
        offsetBottom: new minigl.Uniform({
          value: -0.5
        }),
        noiseFreq: new minigl.Uniform({
          value: [3, 4],
          type: "vec2"
        }),
        noiseAmp: new minigl.Uniform({
          value: amp
        }),
        noiseSpeed: new minigl.Uniform({
          value: 10
        }),
        noiseFlow: new minigl.Uniform({
          value: 3
        }),
        noiseSeed: new minigl.Uniform({
          value: seed
        })
      },
      type: "struct",
      excludeFrom: "fragment"
    }),
    u_baseColor: new minigl.Uniform({
      value: colors[0] || [1, 0, 0],
      type: "vec3",
      excludeFrom: "fragment"
    }),
    u_waveLayers: new minigl.Uniform({
      value: [],
      excludeFrom: "fragment",
      type: "array"
    })
  };

  // Create wave layers for additional colors
  for (let i = 1; i < colors.length; i++) {
    uniforms.u_waveLayers.value.push(
      new minigl.Uniform({
        value: {
          color: new minigl.Uniform({
            value: colors[i],
            type: "vec3"
          }),
          noiseFreq: new minigl.Uniform({
            value: [2 + i / colors.length, 3 + i / colors.length],
            type: "vec2"
          }),
          noiseSpeed: new minigl.Uniform({
            value: 11 + 0.3 * i
          }),
          noiseFlow: new minigl.Uniform({
            value: 6.5 + 0.3 * i
          }),
          noiseSeed: new minigl.Uniform({
            value: seed + 10 * i
          }),
          noiseFloor: new minigl.Uniform({
            value: 0.1
          }),
          noiseCeil: new minigl.Uniform({
            value: 0.63 + 0.07 * i
          })
        },
        type: "struct"
      })
    );
  }

  return uniforms;
}

/**
 * Update colors in existing uniforms
 * @param {Object} uniforms - The uniforms object
 * @param {Array} colors - Array of normalized colors
 */
export function updateWavesColors(uniforms, colors) {
  if (!uniforms || !colors || colors.length < 1) return;

  uniforms.u_baseColor.value = colors[0];

  for (let i = 1; i < colors.length; i++) {
    if (
      uniforms.u_waveLayers &&
      uniforms.u_waveLayers.value &&
      uniforms.u_waveLayers.value[i - 1] &&
      uniforms.u_waveLayers.value[i - 1].value &&
      uniforms.u_waveLayers.value[i - 1].value.color
    ) {
      uniforms.u_waveLayers.value[i - 1].value.color.value = colors[i];
    }
  }
}

/**
 * Get the combined vertex shader source
 */
export function getVertexShader() {
  return [noiseGLSL, blendGLSL, vertexShader].join("\n\n");
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
export const WavesShader = {
  name: "waves",
  getVertexShader,
  getFragmentShader,
  createUniforms: createWavesUniforms,
  updateColors: updateWavesColors
};

export default WavesShader;
