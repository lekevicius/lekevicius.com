import { useEffect, useState } from "react"

export default () => {
  class MiniGl {
    canvas: HTMLCanvasElement
    gl: WebGLRenderingContext
    meshes: Mesh[]
    width: number = 0
    height: number = 0
    commonUniforms: { [key: string]: Uniform }
    debug: (...args: any[]) => void
    lastDebugMsg: Date

    constructor(canvas: HTMLCanvasElement, width?: number, height?: number, debug: boolean = false) {
      const debugOutput = document.location.search.toLowerCase().indexOf('debug=webgl') !== -1

      this.canvas = canvas
      this.gl = this.canvas.getContext('webgl', { antialias: true })!
      this.meshes = []

      if (width && height) {
        this.setSize(width, height)
      }

      this.lastDebugMsg = new Date()
      this.debug = debug && debugOutput ? this.logDebug : () => { }

      const identityMatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
      this.commonUniforms = {
        projectionMatrix: new Uniform({ type: 'mat4', value: identityMatrix }, this.gl),
        modelViewMatrix: new Uniform({ type: 'mat4', value: identityMatrix }, this.gl),
        resolution: new Uniform({ type: 'vec2', value: [1, 1] }, this.gl),
        aspectRatio: new Uniform({ type: 'float', value: 1 }, this.gl),
      }
    }

    setSize(width: number = 640, height: number = 480) {
      this.width = width
      this.height = height
      this.canvas.width = width
      this.canvas.height = height
      this.gl.viewport(0, 0, width, height)

      this.commonUniforms.resolution.value = [width, height]
      this.commonUniforms.aspectRatio.value = width / height
      this.debug('MiniGL.setSize', { width, height })
    }

    setOrthographicCamera(e: number = 0, t: number = 0, n: number = 0, i: number = -2000, s: number = 2000) {
      // prettier-ignore
      this.commonUniforms.projectionMatrix.value = [
        2 / this.width, 0, 0, 0,
        0, 2 / this.height, 0, 0,
        0, 0, 2 / (i - s), 0,
        e, t, n, 1,
      ]
      this.debug('setOrthographicCamera', this.commonUniforms.projectionMatrix.value)
    }

    render() {
      this.gl.clearColor(0, 0, 0, 0)
      this.gl.clearDepth(1)
      this.meshes.forEach(mesh => mesh.draw())
    }

    private logDebug(message: string, ...args: any[]) {
      const t = new Date()
      if (t.getTime() - this.lastDebugMsg.getTime() > 1000) {
        console.log('---')
      }
      console.log(t.toLocaleTimeString() + Array(Math.max(0, 32 - message.length)).join(' ') + message + ': ', ...args)
      this.lastDebugMsg = t
    }
  }

  class Material {
    program: WebGLProgram
    uniforms: { [key: string]: Uniform }
    uniformInstances: { uniform: Uniform; location: WebGLUniformLocation }[]
    vertexSource: string
    fragmentSource: string
    vertexShader: WebGLShader
    fragmentShader: WebGLShader

    constructor(
      vertexShaders: string,
      fragments: string,
      uniforms: { [key: string]: Uniform } = {},
      private gl: WebGLRenderingContext,
      private miniGl: MiniGl
    ) {
      function getShaderByType(type: number, source: string): WebGLShader {
        const shader = gl.createShader(type)!
        gl.shaderSource(shader, source)
        gl.compileShader(shader)

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
          console.error(gl.getShaderInfoLog(shader))
        }

        miniGl.debug('Material.compileShaderSource', { source })
        return shader
      }

      function getUniformVariableDeclarations(uniforms: { [key: string]: Uniform }, type: string): string {
        return Object.entries(uniforms)
          .map(([uniform, value]) => value.getDeclaration(uniform, type))
          .join('\n')
      }

      this.uniforms = uniforms
      this.uniformInstances = []

      const prefix = `
      precision highp float;
    `
      this.vertexSource = `
      ${prefix}
      attribute vec4 position;
      attribute vec2 uv;
      attribute vec2 uvNorm;
      ${getUniformVariableDeclarations(miniGl.commonUniforms, 'vertex')}
      ${getUniformVariableDeclarations(uniforms, 'vertex')}
      ${vertexShaders}
    `
      this.fragmentSource = `
      ${prefix}
      ${getUniformVariableDeclarations(miniGl.commonUniforms, 'fragment')}
      ${getUniformVariableDeclarations(uniforms, 'fragment')}
      ${fragments}
    `

      this.vertexShader = getShaderByType(gl.VERTEX_SHADER, this.vertexSource)
      this.fragmentShader = getShaderByType(gl.FRAGMENT_SHADER, this.fragmentSource)

      this.program = gl.createProgram()!
      gl.attachShader(this.program, this.vertexShader)
      gl.attachShader(this.program, this.fragmentShader)
      gl.linkProgram(this.program)

      if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(this.program))
      }

      gl.useProgram(this.program)
      this.attachUniforms(undefined, miniGl.commonUniforms)
      this.attachUniforms(undefined, this.uniforms)
    }

    attachUniforms(name: string | undefined, uniforms: any) {
      if (name === undefined) {
        Object.entries(uniforms).forEach(([name, uniform]) => {
          this.attachUniforms(name, uniform)
        })
      } else if (uniforms.type === 'array') {
        uniforms.value.forEach((uniform: any, i: any) => this.attachUniforms(`${name}[${i}]`, uniform))
      } else if (uniforms.type === 'struct') {
        Object.entries(uniforms.value).forEach(([uniform, i]) => this.attachUniforms(`${name}.${uniform}`, i))
      } else {
        this.miniGl.debug('Material.attachUniforms', { name, uniform: uniforms })
        this.uniformInstances.push({
          uniform: uniforms,
          location: this.gl.getUniformLocation(this.program, name)!,
        })
      }
    }
  }

  class Uniform {
    type: string
    typeFn: string
    value: any
    transpose: boolean = false
    excludeFrom?: string

    private gl: WebGLRenderingContext

    constructor(
      options: { type?: string; value?: any; transpose?: boolean; excludeFrom?: string },
      gl: WebGLRenderingContext
    ) {
      this.gl = gl
      this.type = options.type || 'float'
      Object.assign(this, options)
      this.typeFn =
        {
          float: '1f',
          int: '1i',
          vec2: '2fv',
          vec3: '3fv',
          vec4: '4fv',
          mat4: 'Matrix4fv',
        }[this.type] || '1f'
      this.update()
    }

    update(value?: any) {
      if (this.value !== undefined) {
        if (this.typeFn.indexOf('Matrix') === 0) {
          this.gl[`uniform${this.typeFn as 'Matrix4fv'}`](value, this.transpose, this.value)
        } else {
          // @ts-ignore
          this.gl[`uniform${this.typeFn as '1f' | '1i' | '2fv' | '3fv' | '4fv'}`](value, this.value, null)
        }
      }
    }

    getDeclaration(name: string, type: string, length?: number): string {
      if (this.excludeFrom === type) {
        return ''
      }

      if (this.type === 'array') {
        return (
          this.value[0].getDeclaration(name, type, this.value.length) +
          `\nconst int ${name}_length = ${this.value.length};`
        )
      }

      if (this.type === 'struct') {
        let nameWithoutPrefix = name.replace('u_', '')
        nameWithoutPrefix = nameWithoutPrefix.charAt(0).toUpperCase() + nameWithoutPrefix.slice(1)
        return (
          `uniform struct ${nameWithoutPrefix}  {` +
          Object.entries(this.value)
            .map(([n, uniform]) => (uniform as Uniform).getDeclaration(n, type).replace(/^uniform/, ''))
            .join('') +
          `} ${name}${length || 0 > 0 ? `[${length}]` : ''};`
        )
      }

      return `uniform ${this.type} ${name}${(length || 0) > 0 ? `[${length}]` : ''};`
    }
  }

  class PlaneGeometry {
    attributes: { [key: string]: Attribute }
    width: number = 0
    height: number = 0
    orientation?: string
    xSegCount: number = 1
    ySegCount: number = 1
    vertexCount: number = 0
    quadCount: number = 0

    constructor(
      private gl: WebGLRenderingContext,
      width: number = 1,
      height: number = 1,
      n: number = 1,
      i: number = 1,
      orientation: string = 'xz'
    ) {
      this.gl.createBuffer()
      this.attributes = {
        position: new Attribute({ target: this.gl.ARRAY_BUFFER, size: 3 }, this.gl),
        uv: new Attribute({ target: this.gl.ARRAY_BUFFER, size: 2 }, this.gl),
        uvNorm: new Attribute({ target: this.gl.ARRAY_BUFFER, size: 2 }, this.gl),
        index: new Attribute(
          {
            target: this.gl.ELEMENT_ARRAY_BUFFER,
            size: 3,
            type: this.gl.UNSIGNED_SHORT,
          },
          this.gl
        ),
      }

      this.setTopology(n, i)
      this.setSize(width, height, orientation)
    }

    setTopology(e: number = 1, t: number = 1) {
      this.xSegCount = e
      this.ySegCount = t
      this.vertexCount = (this.xSegCount + 1) * (this.ySegCount + 1)
      this.quadCount = this.xSegCount * this.ySegCount * 2

      this.attributes.uv.values = new Float32Array(2 * this.vertexCount)
      this.attributes.uvNorm.values = new Float32Array(2 * this.vertexCount)
      this.attributes.index.values = new Uint16Array(3 * this.quadCount)

      for (let e = 0; e <= this.ySegCount; e++) {
        for (let t = 0; t <= this.xSegCount; t++) {
          const i = e * (this.xSegCount + 1) + t

          this.attributes.uv.values[2 * i] = t / this.xSegCount
          this.attributes.uv.values[2 * i + 1] = 1 - e / this.ySegCount

          this.attributes.uvNorm.values[2 * i] = (t / this.xSegCount) * 2 - 1
          this.attributes.uvNorm.values[2 * i + 1] = 1 - (e / this.ySegCount) * 2

          if (t < this.xSegCount && e < this.ySegCount) {
            const s = e * this.xSegCount + t
            this.attributes.index.values[6 * s] = i
            this.attributes.index.values[6 * s + 1] = i + 1 + this.xSegCount
            this.attributes.index.values[6 * s + 2] = i + 1
            this.attributes.index.values[6 * s + 3] = i + 1
            this.attributes.index.values[6 * s + 4] = i + 1 + this.xSegCount
            this.attributes.index.values[6 * s + 5] = i + 2 + this.xSegCount
          }
        }
      }

      this.attributes.uv.update()
      this.attributes.uvNorm.update()
      this.attributes.index.update()
      // _miniGl.debug('Geometry.setTopology', {
      //   uv: this.attributes.uv,
      //   uvNorm: this.attributes.uvNorm,
      //   index: this.attributes.index,
      // });
    }

    setSize(width: number = 1, height: number = 1, orientation: string = 'xz') {
      this.width = width
      this.height = height
      this.orientation = orientation

      if (!this.attributes.position.values || this.attributes.position.values.length !== 3 * this.vertexCount) {
        this.attributes.position.values = new Float32Array(3 * this.vertexCount)
      }

      const o = width / -2
      const r = height / -2
      const segmentWidth = width / this.xSegCount
      const segmentHeight = height / this.ySegCount

      for (let yIndex = 0; yIndex <= this.ySegCount; yIndex++) {
        const t = r + yIndex * segmentHeight
        for (let xIndex = 0; xIndex <= this.xSegCount; xIndex++) {
          const r = o + xIndex * segmentWidth
          const l = yIndex * (this.xSegCount + 1) + xIndex
          this.attributes.position.values[3 * l + 'xyz'.indexOf(orientation[0])] = r
          this.attributes.position.values[3 * l + 'xyz'.indexOf(orientation[1])] = -t
        }
      }

      this.attributes.position.update()
      // _miniGl.debug('Geometry.setSize', {
      //   position: this.attributes.position,
      // });
    }
  }

  class Mesh {
    geometry: PlaneGeometry
    material: Material
    wireframe: boolean
    attributeInstances: { attribute: Attribute; location: number }[]

    constructor(
      geometry: PlaneGeometry,
      material: Material,
      private gl: WebGLRenderingContext,
      private miniGl: MiniGl
    ) {
      this.geometry = geometry
      this.material = material
      this.wireframe = false
      this.attributeInstances = []
      Object.entries(this.geometry.attributes).forEach(([e, attribute]) => {
        this.attributeInstances.push({
          attribute: attribute,
          location: attribute.attach(e, this.material.program),
        })
      })

      miniGl.meshes.push(this)
      // _miniGl.debug('Mesh.constructor', { mesh: this });
    }
    draw() {
      this.gl.useProgram(this.material.program)
      this.material.uniformInstances.forEach(({ uniform, location }) => uniform.update(location))
      this.attributeInstances.forEach(({ attribute, location }) => attribute.use(location))
      this.gl.drawElements(
        this.wireframe ? this.gl.LINES : this.gl.TRIANGLES,
        this.geometry.attributes.index.values!.length,
        this.gl.UNSIGNED_SHORT,
        0
      )
    }
    remove() {
      this.miniGl.meshes = this.miniGl.meshes.filter(e => e != this)
    }
  }

  class Attribute {
    type: number
    normalized: boolean
    buffer: WebGLBuffer
    target: number
    values?: Float32Array | Uint16Array
    size: number
    constructor(
      options: {
        target: number
        size: number
        values?: Float32Array | Uint16Array
        type?: any
      },
      private gl: WebGLRenderingContext
    ) {
      this.type = options.type || this.gl.FLOAT
      this.normalized = false
      this.buffer = this.gl.createBuffer()!
      this.target = options.target
      this.values = options.values || undefined
      this.size = options.size
      this.update()
    }
    update() {
      if (this.values !== undefined) {
        this.gl.bindBuffer(this.target, this.buffer)
        this.gl.bufferData(this.target, this.values, this.gl.STATIC_DRAW)
      }
    }
    attach(e: string, t: WebGLProgram) {
      const n = this.gl.getAttribLocation(t, e)
      if (this.target === this.gl.ARRAY_BUFFER) {
        this.gl.enableVertexAttribArray(n)
        this.gl.vertexAttribPointer(n, this.size, this.type, this.normalized, 0, 0)
      }
      return n
    }
    use(e: number) {
      this.gl.bindBuffer(this.target, this.buffer)
      if (this.target === this.gl.ARRAY_BUFFER) {
        this.gl.enableVertexAttribArray(e)
        this.gl.vertexAttribPointer(e, this.size, this.type, this.normalized, 0, 0)
      }
    }
  }

  const vertexShader = `
  varying vec3 v_color;

  vec3 blendNormal(vec3 base, vec3 blend, float opacity) {
    return (blend * opacity + base * (1.0 - opacity));
  }
  
  void main() {
    float time = u_time * u_global.noiseSpeed;
    vec2 noiseCoord = resolution * uvNorm * u_global.noiseFreq;
    vec2 st = 1. - uvNorm.xy;

    // Tilting the plane
    float tilt = resolution.y / 2.0 * uvNorm.y; // Front-to-back tilt
    float incline = resolution.x * uvNorm.x / 2.0 * u_vertDeform.incline; // Left-to-right angle
    // Up-down shift to offset incline
    float offset = resolution.x / 2.0 * u_vertDeform.incline * mix(u_vertDeform.offsetBottom, u_vertDeform.offsetTop, uv.y);

    // Vertex noise
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

    // Vertex color, to be passed to fragment shader
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

    // Finish
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}`

  const noiseShader = `
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

    // First corner
    vec3 i  = floor(v + dot(v, C.yyy) );
    vec3 x0 =   v - i + dot(i, C.xxx) ;

    // Other corners
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy; // 2.0 * C.x = 1/3 = C.y
    vec3 x3 = x0 - D.yyy;      // -1.0 + 3.0 * C.x = -0.5 = -D.y

    // Permutations
    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0 )) +
      i.y + vec4(0.0, i1.y, i2.y, 1.0 )) +
      i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

    // Gradients: 7x7 points over a square, mapped onto an octahedron.
    // The ring size 17 * 17 = 289 is close to a multiple of 49 (49 * 6 = 294)
    float n_ = 0.142857142857; // 1.0 / 7.0
    vec3  ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z); // mod(p, 7 * 7)
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_ ); // mod(j, N)
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);

    // Normalise gradients
    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    
    // Mix final noise value
    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
  }`

  const fragmentShader = `
  varying vec3 v_color;
  void main() {
    vec3 color = v_color;
    if (u_darken_top == 1.0) {
      vec2 st = gl_FragCoord.xy / resolution.xy;
      color.g -= pow(st.y + sin(-12.0) * st.x, u_shadow_power) * 0.4;
    }
    gl_FragColor = vec4(color, 1.0);
  }`

  class Gradient {
    private el: HTMLElement
    private cssVarRetries = 0
    private maxCssVarRetries = 200
    private angle = 0
    private isLoadedClass = false
    private shaderFiles: { [key: string]: string } = {}
    private vertexShader?: string
    private sectionColors: number[][] = []
    private computedCanvasStyle?: CSSStyleDeclaration
    private conf: { [key: string]: any } = {}
    private uniforms: { [key: string]: any } = {}
    private t = 0
    private last = 0
    private width?: number
    private height = 600
    private xSegCount?: number
    private ySegCount?: number

    private mesh?: Mesh
    private material?: Material
    private geometry?: PlaneGeometry
    private minigl?: MiniGl

    private amp = 200
    private seed = 11
    private freqX = 12e-5
    private freqY = 30e-5

    constructor(selector: string) {
      this.el = document.querySelector(selector) as HTMLElement
      this.connect()
    }

    private async connect() {
      this.shaderFiles = {
        vertex: vertexShader,
        noise: noiseShader,
        fragment: fragmentShader,
      }

      this.conf = {
        presetName: '',
        wireframe: false,
        density: [0.06, 0.16],
        zoom: 1,
        rotation: 0,
      }

      if (document.querySelectorAll('canvas').length < 1 || !this.el) {
        return
      }

      this.minigl = new MiniGl(this.el as HTMLCanvasElement)
      requestAnimationFrame(() => {
        if (this.el) {
          this.computedCanvasStyle = getComputedStyle(this.el)
          this.waitForCssVars()
        }
      })
    }

    public updateColors() {
      this.initGradientColors()
      this.uniforms.u_baseColor.value = this.sectionColors[0]
      for (let i = 1; i < this.sectionColors.length; i += 1) {
        this.uniforms.u_waveLayers.value[i - 1].value.color.value = this.sectionColors[i]
      }
    }

    private initMaterial() {
      if (!this.minigl) {
        return
      }
      this.uniforms = {
        u_time: new Uniform({ value: 0 }, this.minigl.gl),
        u_shadow_power: new Uniform({ value: 5 }, this.minigl.gl),
        u_darken_top: new Uniform(
          {
            value: this.el.dataset.jsDarkenTop === '' ? 1 : 0,
          },
          this.minigl.gl
        ),
        u_active_colors: new Uniform(
          {
            value: [1, 1, 1, 1],
            type: 'vec4',
          },
          this.minigl.gl
        ),
        u_global: new Uniform(
          {
            value: {
              noiseFreq: new Uniform(
                {
                  value: [this.freqX, this.freqY],
                  type: 'vec2',
                },
                this.minigl.gl
              ),
              noiseSpeed: new Uniform({ value: 5e-6 }, this.minigl.gl),
            },
            type: 'struct',
          },
          this.minigl.gl
        ),
        u_vertDeform: new Uniform(
          {
            value: {
              incline: new Uniform(
                {
                  value: Math.sin(this.angle) / Math.cos(this.angle),
                },
                this.minigl.gl
              ),
              offsetTop: new Uniform({ value: -0.5 }, this.minigl.gl),
              offsetBottom: new Uniform({ value: -0.5 }, this.minigl.gl),
              noiseFreq: new Uniform({ value: [3, 4], type: 'vec2' }, this.minigl.gl),
              noiseAmp: new Uniform({ value: this.amp }, this.minigl.gl),
              noiseSpeed: new Uniform({ value: 10 }, this.minigl.gl),
              noiseFlow: new Uniform({ value: 3 }, this.minigl.gl),
              noiseSeed: new Uniform({ value: this.seed }, this.minigl.gl),
            },
            type: 'struct',
            excludeFrom: 'fragment',
          },
          this.minigl.gl
        ),
        u_baseColor: new Uniform(
          {
            value: this.sectionColors[0],
            type: 'vec3',
            excludeFrom: 'fragment',
          },
          this.minigl.gl
        ),
        u_waveLayers: new Uniform(
          {
            value: [],
            excludeFrom: 'fragment',
            type: 'array',
          },
          this.minigl.gl
        ),
      }

      for (let i = 1; i < this.sectionColors.length; i += 1) {
        this.uniforms.u_waveLayers.value.push(
          new Uniform(
            {
              value: {
                color: new Uniform(
                  {
                    value: this.sectionColors[i],
                    type: 'vec3',
                  },
                  this.minigl.gl
                ),
                noiseFreq: new Uniform(
                  {
                    value: [2 + i / this.sectionColors.length, 3 + i / this.sectionColors.length],
                    type: 'vec2',
                  },
                  this.minigl.gl
                ),
                noiseSpeed: new Uniform({ value: 11 + 0.3 * i }, this.minigl.gl),
                noiseFlow: new Uniform({ value: 6.5 + 0.3 * i }, this.minigl.gl),
                noiseSeed: new Uniform({ value: this.seed + 10 * i }, this.minigl.gl),
                noiseFloor: new Uniform({ value: 0.1 }, this.minigl.gl),
                noiseCeil: new Uniform({ value: 0.63 + 0.07 * i }, this.minigl.gl),
              },
              type: 'struct',
            },
            this.minigl.gl
          )
        )
      }

      this.vertexShader = [this.shaderFiles.noise, this.shaderFiles.blend, this.shaderFiles.vertex].join('\n\n')

      return new Material(this.vertexShader, this.shaderFiles.fragment, this.uniforms, this.minigl.gl, this.minigl)
    }

    private initMesh() {
      this.material = this.initMaterial()
      this.geometry = new PlaneGeometry(this.minigl!.gl)
      this.mesh = new Mesh(this.geometry, this.material!, this.minigl!.gl, this.minigl!)
    }

    private shouldSkipFrame(frame: number) {
      return window.document.hidden || frame % 2 === 0 || frame === undefined
    }

    private init() {
      this.initGradientColors()
      this.initMesh()
      this.resize()
      requestAnimationFrame(e => this.animate(e))
      window.addEventListener('resize', () => this.resize())
    }

    private waitForCssVars() {
      if (
        this.computedCanvasStyle &&
        this.computedCanvasStyle.getPropertyValue('--gradient-color-1').indexOf('#') !== -1
      ) {
        this.init()
        this.addIsLoadedClass()
      } else {
        this.cssVarRetries += 1
        if (this.cssVarRetries > this.maxCssVarRetries) {
          this.sectionColors = [
            [0.8823529411764706, 0.8235294117647058, 0.9098039215686274],
            [0.9764705882352941, 0.9294117647058824, 0.9372549019607843],
            [0.9529411764705882, 0.9294117647058824, 0.9882352941176471],
            [0.8470588235294118, 0.8156862745098039, 0.9686274509803922],
          ]
          this.init()
          return
        }
        requestAnimationFrame(() => this.waitForCssVars())
      }
    }

    private initGradientColors() {
      this.sectionColors = ['--gradient-color-1', '--gradient-color-2', '--gradient-color-3', '--gradient-color-4']
        .map(cssPropertyName => {
          let hex = this.computedCanvasStyle?.getPropertyValue(cssPropertyName).trim() || '#000'
          if (hex.length === 4) {
            const hexTemp = hex
              .substr(1)
              .split('')
              .map(hexTemp => hexTemp + hexTemp)
              .join('')
            hex = `#${hexTemp}`
          }
          return hex && `0x${hex.substr(1)}`
        })
        .filter(Boolean)
        .map(i => this.normalizeColor(parseInt(i)))
    }

    private resize() {
      this.width = window.innerWidth
      this.minigl?.setSize(this.width, this.height)
      this.minigl?.setOrthographicCamera()

      this.xSegCount = Math.ceil(this.width * this.conf.density[0])
      this.ySegCount = Math.ceil(this.height * this.conf.density[1])

      this.mesh?.geometry.setTopology(this.xSegCount, this.ySegCount)
      this.mesh?.geometry.setSize(this.width, this.height)

      if (this.mesh) {
        this.mesh.material.uniforms.u_shadow_power.value = this.width < 600 ? 5 : 6
      }
    }

    private animate(e: number) {
      if (!this.shouldSkipFrame(e)) {
        if (this.t === undefined) {
          this.t = 0
        }
        this.t += Math.min(e - this.last, 1000 / 15) * 3
        this.last = e

        if (this.mesh) {
          this.mesh.material.uniforms.u_time.value = this.t
        }
        this.minigl?.render()
      }

      requestAnimationFrame(e => this.animate(e))
    }

    private addIsLoadedClass() {
      if (!this.isLoadedClass) {
        this.isLoadedClass = true
        this.el.classList.add('isLoaded')
        setTimeout(() => {
          if (this.el.parentElement) {
            this.el.parentElement.classList.add('isLoaded')
          }
        }, 3000)
      }
    }

    private normalizeColor(hexCode: number) {
      return [((hexCode >> 16) & 255) / 255, ((hexCode >> 8) & 255) / 255, (255 & hexCode) / 255]
    }
  }

  const [gradient, setGradient] = useState<Gradient | null>(null)

  useEffect(() => {
    setGradient(new Gradient('#artCanvas'))
  }, [])

  useEffect(() => {
    window.matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', () => {
        gradient?.updateColors()
      })
  }, [gradient])




  return (
    <section id="art">
      <canvas id="artCanvas" className="fixed top-0 left-0 w-full h-full"></canvas>
    </section>
  )
}
