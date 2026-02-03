import { MiniGl, normalizeColor } from "./MiniGL.js";
import WavesShader from "./shaders/WavesShader.js";
import WarpShader from "./shaders/WarpShader.js";
import {
  BLEND_MODES,
  createNoiseOverlayUniforms,
  wrapFragmentShaderWithNoise,
  getDefaultNoiseConfig
} from "./shaders/NoiseOverlay.js";

/**
 * Gradient class - manages the animated background
 */
class Gradient {
  constructor(shader = WarpShader, noiseConfig = null) {
    // Shader configuration
    this.shader = shader;

    // Noise overlay configuration
    this.noiseConfig = noiseConfig !== null ? noiseConfig : getDefaultNoiseConfig();
    this.noiseUniforms = null;

    // DOM elements
    this.el = null;
    this.computedCanvasStyle = null;

    // CSS variable loading
    this.cssVarRetries = 0;
    this.maxCssVarRetries = 200;

    // Animation state
    this.isLoadedClass = false;

    // Configuration
    this.conf = null;
    this.uniforms = null;

    // Time tracking
    this.t = 1253106;
    this.last = 0;

    // Dimensions
    this.width = null;
    this.height = 900;
    this.xSegCount = null;
    this.ySegCount = null;

    // WebGL objects
    this.mesh = null;
    this.material = null;
    this.geometry = null;
    this.minigl = null;

    // Shader-specific
    this.sectionColors = null;
    this.angle = 0;
    this.amp = 320;
    this.seed = Math.random() * 10;
    this.freqX = 10e-5;
    this.freqY = 29e-5;
    this.activeColors = [1, 1, 1, 1];

    // Theme observers
    this._mqDark = null;
    this._themeObserverDoc = null;
    this._themeObserverBody = null;

    // Bound methods
    this.resize = () => {
      this.width = window.innerWidth;
      this.minigl.setSize(this.width, this.height);
      this.minigl.setOrthographicCamera();
      this.xSegCount = Math.ceil(this.width * this.conf.density[0]);
      this.ySegCount = Math.ceil(this.height * this.conf.density[1]);
      this.mesh.geometry.setTopology(this.xSegCount, this.ySegCount);
      this.mesh.geometry.setSize(this.width, this.height);
      if (this.uniforms.u_shadow_power) {
        this.uniforms.u_shadow_power.value = this.width < 600 ? 5 : 6;
      }
    };

    this.animate = (e) => {
      this.t += Math.min(e - this.last, 1e3 / 15);
      this.last = e;

      if (this.uniforms.u_time) {
        this.uniforms.u_time.value = this.t * 3;
      }
      this.minigl.render();

      if (this.conf.playing) {
        requestAnimationFrame(this.animate);
      }
    };

    this.addIsLoadedClass = () => {
      if (!this.isLoadedClass) {
        this.isLoadedClass = true;
        this.el.classList.add("isLoaded");
        setTimeout(() => {
          this.el.parentElement.classList.add("isLoaded");
        }, 3e3);
      }
    };

    this.pause = () => {
      this.conf.playing = false;
    };

    this.play = () => {
      requestAnimationFrame(this.animate);
      this.conf.playing = true;
    };

    this.refreshColorsFromCss = () => {
      const sourceEl = document.querySelectorAll(".site-container div")[0];
      if (sourceEl) {
        this.computedCanvasStyle = getComputedStyle(sourceEl);
      }
      this.initGradientColors();
      this.refreshNoiseFromCss();
      if (this.uniforms && this.sectionColors && this.sectionColors.length >= 1) {
        if (this.shader.updateColors) {
          this.shader.updateColors(this.uniforms, this.sectionColors);
        }
        if (this.minigl) {
          this.minigl.render();
        }
      }
    };

    this.handleThemeChange = () => {
      this.refreshColorsFromCss();
    };

    this.attachThemeListeners = () => {
      try {
        this._mqDark =
          window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)");
        if (this._mqDark && this._mqDark.addEventListener) {
          this._mqDark.addEventListener("change", this.handleThemeChange);
        } else if (this._mqDark && this._mqDark.addListener) {
          this._mqDark.addListener(this.handleThemeChange);
        }
      } catch (err) { }

      try {
        const opts = { attributes: true, attributeFilter: ["class"] };
        this._themeObserverDoc = new MutationObserver(this.handleThemeChange);
        this._themeObserverDoc.observe(document.documentElement, opts);
        if (document.body) {
          this._themeObserverBody = new MutationObserver(this.handleThemeChange);
          this._themeObserverBody.observe(document.body, opts);
        }
      } catch (err) { }
    };

    this.initGradient = (selector) => {
      this.el = document.querySelector(selector);
      this.connect();
      return this;
    };
  }

  async connect() {
    this.conf = {
      presetName: "",
      wireframe: false,
      density: [0.06, 0.16],
      zoom: 1,
      rotation: 0,
      playing: true
    };

    if (document.querySelectorAll(".site-container").length < 1) {
      console.log("DID NOT LOAD CANVAS");
      return;
    }

    this.minigl = new MiniGl(this.el, null, null, true);

    requestAnimationFrame(() => {
      const sourceEl = document.querySelectorAll(".site-container div")[0];
      if (sourceEl) {
        this.computedCanvasStyle = getComputedStyle(sourceEl);
        this.waitForCssVars();
      }
    });
  }

  disconnect() {
    window.removeEventListener("resize", this.resize);

    try {
      if (this._mqDark && this._mqDark.removeEventListener) {
        this._mqDark.removeEventListener("change", this.handleThemeChange);
      } else if (this._mqDark && this._mqDark.removeListener) {
        this._mqDark.removeListener(this.handleThemeChange);
      }
    } catch (err) { }

    try {
      if (this._themeObserverDoc) this._themeObserverDoc.disconnect();
      if (this._themeObserverBody) this._themeObserverBody.disconnect();
    } catch (err) { }
  }

  initMaterial() {
    this.uniforms = this.shader.createUniforms(this.minigl, {
      colors: this.sectionColors,
      angle: this.angle,
      amp: this.amp,
      seed: this.seed,
      freqX: this.freqX,
      freqY: this.freqY,
      activeColors: this.activeColors,
      darkenTop: this.el.dataset.jsDarkenTop === ""
    });

    // Add noise overlay uniforms (always if noiseConfig exists)
    if (this.noiseConfig) {
      this.noiseUniforms = createNoiseOverlayUniforms(this.minigl, this.noiseConfig);
      Object.assign(this.uniforms, this.noiseUniforms);
    }

    // Get fragment shader, wrapping with noise if noiseConfig exists
    let fragmentShader = this.shader.getFragmentShader();
    if (this.noiseConfig) {
      fragmentShader = wrapFragmentShaderWithNoise(fragmentShader);
    }

    return new this.minigl.Material(
      this.shader.getVertexShader(),
      fragmentShader,
      this.uniforms
    );
  }

  initMesh() {
    this.material = this.initMaterial();
    this.geometry = new this.minigl.PlaneGeometry();
    this.mesh = new this.minigl.Mesh(this.geometry, this.material);
  }

  init() {
    this.refreshNoiseFromCss();
    this.initGradientColors();
    this.initMesh();
    this.resize();
    requestAnimationFrame(this.animate);
    window.addEventListener("resize", this.resize);
    this.attachThemeListeners();
  }

  waitForCssVars() {
    if (
      this.computedCanvasStyle &&
      this.computedCanvasStyle
        .getPropertyValue("--background-color-1")
        .indexOf("#") !== -1
    ) {
      this.init();
      this.addIsLoadedClass();
    } else {
      this.cssVarRetries += 1;
      if (this.cssVarRetries > this.maxCssVarRetries) {
        // Fallback colors
        this.sectionColors = [
          normalizeColor(0xff0000),
          normalizeColor(0xff0000),
          normalizeColor(0xff00ff),
          normalizeColor(0x00ff00)
        ];
        this.init();
        return;
      }
      requestAnimationFrame(() => this.waitForCssVars());
    }
  }

  initGradientColors() {
    this.sectionColors = [
      "--background-color-1",
      "--background-color-2",
      "--background-color-3",
      "--background-color-4"
    ]
      .map((cssPropertyName) => {
        let hex = this.computedCanvasStyle
          .getPropertyValue(cssPropertyName)
          .trim();
        // Handle shorthand hex values
        if (hex.length === 4) {
          const hexTemp = hex
            .substr(1)
            .split("")
            .map((c) => c + c)
            .join("");
          hex = `#${hexTemp}`;
        }
        return hex && `0x${hex.substr(1)}`;
      })
      .filter(Boolean)
      .map(normalizeColor);
  }

  getNoiseConfigFromCss() {
    if (!this.computedCanvasStyle) return null;

    const readVar = (name) =>
      this.computedCanvasStyle.getPropertyValue(name).trim();

    const parseNumber = (value) => {
      if (!value) return undefined;
      const parsed = parseFloat(value);
      return Number.isFinite(parsed) ? parsed : undefined;
    };

    const parseBool = (value) => {
      if (!value) return undefined;
      const normalized = value.toLowerCase();
      if (normalized === "1" || normalized === "true") return true;
      if (normalized === "0" || normalized === "false") return false;
      return undefined;
    };

    const parseBlendMode = (value) => {
      if (!value) return undefined;
      const trimmed = value.trim();
      const numeric = parseFloat(trimmed);
      if (Number.isFinite(numeric)) return numeric;
      const key = trimmed.toUpperCase().replace(/\s+/g, "_");
      if (Object.prototype.hasOwnProperty.call(BLEND_MODES, key)) {
        return BLEND_MODES[key];
      }
      return undefined;
    };

    const enabled = parseBool(readVar("--noise-enabled"));
    const intensity = parseNumber(readVar("--noise-intensity"));
    const scale = parseNumber(readVar("--noise-scale"));
    const speed = parseNumber(readVar("--noise-speed"));
    const blendMode = parseBlendMode(readVar("--noise-blend-mode"));
    const monochrome = parseBool(readVar("--noise-monochrome"));
    const low = parseNumber(readVar("--noise-low"));
    const high = parseNumber(readVar("--noise-high"));

    const config = {};
    if (enabled !== undefined) config.enabled = enabled;
    if (intensity !== undefined) config.intensity = intensity;
    if (scale !== undefined) config.scale = scale;
    if (speed !== undefined) config.speed = speed;
    if (blendMode !== undefined) config.blendMode = blendMode;
    if (monochrome !== undefined) config.monochrome = monochrome;
    if (low !== undefined) config.low = Math.max(0, Math.min(1, low));
    if (high !== undefined) config.high = Math.max(0, Math.min(1, high));

    return Object.keys(config).length ? config : null;
  }

  refreshNoiseFromCss() {
    const cssConfig = this.getNoiseConfigFromCss();
    if (!cssConfig) return;
    this.noiseConfig = { ...this.noiseConfig, ...cssConfig };
    if (this.uniforms) {
      this.updateNoiseConfig(this.noiseConfig);
    }
  }

  // Noise overlay control methods

  /**
   * Set noise overlay enabled state
   * @param {boolean} enabled
   */
  setNoiseEnabled(enabled) {
    if (this.uniforms && this.uniforms.u_noise_enabled) {
      this.uniforms.u_noise_enabled.value = enabled ? 1.0 : 0.0;
      if (this.minigl && !this.conf.playing) {
        this.minigl.render();
      }
    }
  }

  /**
   * Set noise overlay intensity (0-1, recommended: 0.02-0.15)
   * @param {number} intensity
   */
  setNoiseIntensity(intensity) {
    if (this.uniforms && this.uniforms.u_noise_intensity) {
      this.uniforms.u_noise_intensity.value = Math.max(0, Math.min(1, intensity));
      if (this.minigl && !this.conf.playing) {
        this.minigl.render();
      }
    }
  }

  /**
   * Set noise overlay scale (higher = finer grain)
   * @param {number} scale
   */
  setNoiseScale(scale) {
    if (this.uniforms && this.uniforms.u_noise_scale) {
      this.uniforms.u_noise_scale.value = scale;
      if (this.minigl && !this.conf.playing) {
        this.minigl.render();
      }
    }
  }

  /**
   * Set noise animation speed (0 = static, 0.0001 = very slow)
   * @param {number} speed
   */
  setNoiseSpeed(speed) {
    if (this.uniforms && this.uniforms.u_noise_speed) {
      this.uniforms.u_noise_speed.value = speed;
    }
  }

  /**
   * Set noise blend mode
   * @param {number} blendMode - Use BLEND_MODES constant
   */
  setNoiseBlendMode(blendMode) {
    if (this.uniforms && this.uniforms.u_noise_blend_mode) {
      this.uniforms.u_noise_blend_mode.value = blendMode;
      if (this.minigl && !this.conf.playing) {
        this.minigl.render();
      }
    }
  }

  /**
   * Set whether noise is monochrome or colored
   * @param {boolean} monochrome
   */
  setNoiseMonochrome(monochrome) {
    if (this.uniforms && this.uniforms.u_noise_monochrome) {
      this.uniforms.u_noise_monochrome.value = monochrome ? 1.0 : 0.0;
      if (this.minigl && !this.conf.playing) {
        this.minigl.render();
      }
    }
  }

  /**
   * Set noise black point (0-1)
   * @param {number} low
   */
  setNoiseLow(low) {
    if (this.uniforms && this.uniforms.u_noise_low) {
      this.uniforms.u_noise_low.value = Math.max(0, Math.min(1, low));
      if (this.minigl && !this.conf.playing) {
        this.minigl.render();
      }
    }
  }

  /**
   * Set noise white point (0-1)
   * @param {number} high
   */
  setNoiseHigh(high) {
    if (this.uniforms && this.uniforms.u_noise_high) {
      this.uniforms.u_noise_high.value = Math.max(0, Math.min(1, high));
      if (this.minigl && !this.conf.playing) {
        this.minigl.render();
      }
    }
  }

  /**
   * Update multiple noise settings at once
   * @param {Object} config - Noise configuration object
   */
  updateNoiseConfig(config) {
    if (config.enabled !== undefined) this.setNoiseEnabled(config.enabled);
    if (config.intensity !== undefined) this.setNoiseIntensity(config.intensity);
    if (config.scale !== undefined) this.setNoiseScale(config.scale);
    if (config.speed !== undefined) this.setNoiseSpeed(config.speed);
    if (config.blendMode !== undefined) this.setNoiseBlendMode(config.blendMode);
    if (config.monochrome !== undefined) this.setNoiseMonochrome(config.monochrome);
    if (config.low !== undefined) this.setNoiseLow(config.low);
    if (config.high !== undefined) this.setNoiseHigh(config.high);
  }
}

// Export for external use
export { Gradient, normalizeColor, BLEND_MODES, getDefaultNoiseConfig };
// export { WavesShader } from "./shaders/WavesShader.js";
export { WarpShader } from "./shaders/WarpShader.js";

// Auto-initialize when DOM is ready
(function () {
  // Default noise config: low contrast, slow animation, soft light blend
  var noiseConfig = {
    enabled: true,
    intensity: 1,
    scale: 2000,
    speed: 3,
    blendMode: BLEND_MODES.OVERLAY,
    monochrome: true,
    low: 0.0,
    high: 1.0
  };

  var gradient = new Gradient(WarpShader, noiseConfig);
  if (typeof window !== "undefined") {
    window.addEventListener("DOMContentLoaded", function () {
      gradient.initGradient("#artCanvas");
    });
    // Expose gradient instance for debugging/customization
    window.gradientInstance = gradient;
  }
})();
