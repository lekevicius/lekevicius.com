import { MiniGl, normalizeColor } from "./MiniGL.js";
// import WavesShader from "./shaders/WavesShader.js";
import WarpShader from "./shaders/WarpShader.js";

/**
 * Gradient class - manages the animated background
 */
class Gradient {
  constructor(shader = WarpShader) {
    // Shader configuration
    this.shader = shader;

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

    return new this.minigl.Material(
      this.shader.getVertexShader(),
      this.shader.getFragmentShader(),
      this.uniforms
    );
  }

  initMesh() {
    this.material = this.initMaterial();
    this.geometry = new this.minigl.PlaneGeometry();
    this.mesh = new this.minigl.Mesh(this.geometry, this.material);
  }

  init() {
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
}

// Export for external use
export { Gradient, normalizeColor };
// export { WavesShader } from "./shaders/WavesShader.js";
export { WarpShader } from "./shaders/WarpShader.js";

// Auto-initialize when DOM is ready
(function () {
  var gradient = new Gradient();
  if (typeof window !== "undefined") {
    window.addEventListener("DOMContentLoaded", function () {
      gradient.initGradient("#artCanvas");
    });
  }
})();
