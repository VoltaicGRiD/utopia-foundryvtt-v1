import * as THREE from "../../three/build/three.module.js";

export function starsAnimation(options, sheet, element) {
  const canvas = THREE.createCanvasElement();
  canvas.width = options.position.width;
  canvas.height = options.position.height;
  canvas.style.position = "absolute";
  canvas.style.pointerEvents = "none"; // Prevent interaction with the canvas
  canvas.style.display = "block";
  canvas.style.top = 0;
  canvas.style.left = 0;

  sheet.appendChild(canvas);

  const renderer = new THREE.WebGLRenderer({ canvas });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setClearColor(0x000000, 1);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  const starsGeometry = new THREE.BufferGeometry();
  const starsCount = 10000;
  const positions = new Float32Array(starsCount * 3);
  const sizes = new Float32Array(starsCount);
  for (let i = 0; i < starsCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 1000;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 1000;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 1000;
    sizes[i] = Math.random() * 2.5 + 1.5; // random size between 0.5 and 2.5
  }
  starsGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
  );
  starsGeometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

  const mouse = { x: 0, y: 0 };
  const starsMaterial = new THREE.ShaderMaterial({
    uniforms: {
      color: { value: new THREE.Color(0x888888) },
      mouse: { value: new THREE.Vector2(0, 0) },
      resolution: {
        value: new THREE.Vector2(window.innerWidth, window.innerHeight),
      },
    },
    vertexShader: `
    attribute float size;
    varying float vSize;
    varying vec3 vPosition;
    varying float vRotation;
    float rand(vec2 co){
      return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
    }
    void main() {
      vSize = size;
      vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
      // Use position.xy as seed for random rotation
      vRotation = rand(position.xy) * 6.2831853; // 0 to 2*PI
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      float pointSize = size * (300.0 / -mvPosition.z);
      pointSize = clamp(pointSize, 1.0, 10.0); // Clamp to avoid huge stars
      gl_PointSize = pointSize;
      gl_Position = projectionMatrix * mvPosition;
    }
    `,
    fragmentShader: `
    uniform vec3 color;
    uniform vec2 mouse;
    uniform vec2 resolution;
    varying float vSize;
    varying vec3 vPosition;
    varying float vRotation;
    float rand(vec2 co){
      return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
    }
    float starShape(vec2 uv, float points, float inner, float outer) {
      float angle = atan(uv.y - 0.5, uv.x - 0.5);
      float radius = length(uv - vec2(0.5));
      float r = mix(outer, inner, step(0.5, mod(points * angle / 3.1415926, 2.0)));
      return smoothstep(r, r - 0.02, radius);
    }
    float starAngle(vec2 uv, float points) {
      float angle = atan(uv.y - 0.5, uv.x - 0.5);
      return mod(angle / (3.1415926 / points), 2.0);
    }
    void main() {
      // Rotate gl_PointCoord by vRotation
      vec2 uv = gl_PointCoord - vec2(0.5);
      float cosR = cos(vRotation);
      float sinR = sin(vRotation);
      mat2 rot = mat2(cosR, -sinR, sinR, cosR);
      uv = rot * uv;
      uv += vec2(0.5);

      float star = starShape(uv, 4.0, 0.25, 0.5); // 4-pointed star
      if (star < 0.5) discard;
      // Project star position to screen space
      vec2 mousePx = vec2(mouse.x * resolution.x, mouse.y * resolution.y);
      float dist = distance(gl_FragCoord.xy, mousePx) / min(resolution.x, resolution.y);
      float threshold = 0.3;
      float brightness;
      if (dist < threshold) {
      brightness = mix(4.0, 0.0, dist / threshold);
      } else {
      brightness = 1.0;
      }
      gl_FragColor = vec4(color * brightness, star);
    }
    `,
    transparent: true,
  });

  const stars = new THREE.Points(starsGeometry, starsMaterial);
  scene.add(stars);

  // Mouse move event
  const handleMouseMove = (event) => {
    // Get the bounding rect of the sheet element
    const rect = element.getBoundingClientRect();
    // Calculate mouse position relative to the sheet
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    // Normalize to [0,1] based on the canvas size
    starsMaterial.uniforms.mouse.value.x = x / canvas.width;
    starsMaterial.uniforms.mouse.value.y = 1.0 - y / canvas.height;
  };

  element.addEventListener("mousemove", handleMouseMove);

  // Add this inside your _onRender after setting up the scene
  function spawnShootingStar() {
    const geometry = new THREE.BufferGeometry();
    const start = new THREE.Vector3(
      (Math.random() - 0.5) * 800,
      (Math.random() - 0.5) * 800,
      -400 + Math.random() * 200
    );
    const end = start.clone().add(new THREE.Vector3(
      200 + Math.random() * 200,
      100 + Math.random() * 100,
      0
    ));
    geometry.setFromPoints([start, end]);
    const material = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2, transparent: true, opacity: 1 });
    const line = new THREE.Line(geometry, material);
    scene.add(line);

    gsap.to(material, {
      opacity: 0,
      duration: 4,
      ease: "power2.in",
      onComplete: () => scene.remove(line)
    });
  }

  // Randomly spawn shooting stars
  setInterval(() => {
    if (Math.random() < 0.3) spawnShootingStar();
  }, 1200);

  const animate = () => {
    requestAnimationFrame(animate);
    stars.rotation.x += 0.0001;
    stars.rotation.y += 0.0001;
    renderer.render(scene, camera);
  };

  animate();
}

export function gasCloudAnimation(options = {}, sheet, element) {
  // Use the same size as the stars canvas
  const width = options.position?.width || 1050;
  const height = options.position?.height || 750;

  // Create a transparent canvas overlay
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.style.position = "absolute";
  canvas.style.pointerEvents = "none";
  canvas.style.top = 0;
  canvas.style.left = 0;
  canvas.style.zIndex = 2; // Above stars, below UI
  sheet.appendChild(canvas);

  // Set up Three.js renderer
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
  renderer.setSize(width, height);
  renderer.setClearColor(0x000000, 0); // Fully transparent

  // Scene and camera
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(
    width / -2, width / 2,
    height / 2, height / -2,
    1, 1000
  );
  camera.position.z = 2;

  // Shader material for gas clouds
  const uniforms = {
    u_time: { value: 0 },
    u_resolution: { value: new THREE.Vector2(width, height) },
    u_colorA: { value: new THREE.Color(0x2d0036) }, // Deep purple
    u_colorB: { value: new THREE.Color(0xa726a7) }, // Vivid magenta
    u_colorC: { value: new THREE.Color(0x00eaff) }, // Electric blue
    u_alpha: { value: 0.33 },
    u_offset: { value: new THREE.Vector2(0, 0) },
    u_rotation: { value: 0 }
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec3 u_colorA;
      uniform vec3 u_colorB;
      uniform vec3 u_colorC;
      uniform float u_alpha;
      uniform vec2 u_offset;
      uniform float u_rotation;

      // Simplex noise implementation (GLSL)
      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
      float snoise(vec2 v){
        const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                            -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy) );
        vec2 x0 = v -   i + dot(i, C.xx);
        vec2 i1;
        i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        vec3 p = permute( permute(
                    vec3(i.y + vec3(0.0, i1.y, 1.0 ))
                  + i.x + vec3(0.0, i1.x, 1.0 )));
        vec3 m = max(0.5 - vec3(
          dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m ;
        m = m*m ;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }

      void main() {
        // Center and rotate UV for subtle parallax
        vec2 uv = vUv - 0.5;
        float c = cos(u_rotation);
        float s = sin(u_rotation);
        uv = mat2(c, -s, s, c) * uv;
        uv += 0.5 + u_offset;

        // Scale and animate the noise
        float scale = 1.5;
        float t = u_time * 0.04;
        float n = snoise((uv * scale + vec2(t, t*0.7)) * 2.0);
        float n2 = snoise((uv * scale * 1.7 - vec2(t*0.5, t*0.3)) * 2.0);
        float n3 = snoise((uv * scale * 2.3 + vec2(-t*0.2, t*0.4)) * 2.0);

        // Combine and normalize
        float cloud = smoothstep(0.3, 0.7, n * 0.6 + n2 * 0.3 + n3 * 0.2);

        // Color blend
        vec3 color = mix(u_colorA, u_colorB, n * 0.5 + 0.5);
        color = mix(color, u_colorC, n2 * 0.5 + 0.5);

        gl_FragColor = vec4(color, cloud * u_alpha);
      }
    `
  });

  // Fullscreen plane
  const geometry = new THREE.PlaneGeometry(width, height);
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  // Animate: drift and rotate clouds in sync with stars
  let t0 = performance.now();
  function animate() {
    const t = performance.now() / 1000;
    uniforms.u_time.value = t;
    // Subtle drifting and rotation for parallax effect
    uniforms.u_offset.value.x = Math.sin(t * 0.03) * 0.04;
    uniforms.u_offset.value.y = Math.cos(t * 0.025) * 0.04;
    uniforms.u_rotation.value = Math.sin(t * 0.01) * 0.08;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();
}

export function borderTrailAnimation(element) {
  setTimeout(() => {
    // Create the main moving element
    const windowBorder = document.createElement('div');
    windowBorder.style.width = '10px';
    windowBorder.style.height = '10px';
    windowBorder.style.display = 'block';
    windowBorder.style.position = 'absolute';
    windowBorder.style.left = 0;
    windowBorder.style.top = 0;
    windowBorder.style.backgroundColor = 'purple';
    windowBorder.style.borderRadius = '50%';
    windowBorder.style.zIndex = 10001;
    element.appendChild(windowBorder);

    // Motion blur trail logic
    const trailCount = 32;
    const trailElements = [];
    for (let i = 0; i < trailCount; i++) {
      const trail = document.createElement('div');
      // Scale size down for each trail element
      const scale = 1 - (i / trailCount) * 0.7; // from 1 to 0.3
      const size = 10 * scale;
      trail.style.width = `${size}px`;
      trail.style.height = `${size}px`;
      trail.style.position = 'absolute';
      trail.style.left = 0;
      trail.style.top = 0;
      trail.style.backgroundColor = 'purple';
      trail.style.borderRadius = '50%';
      trail.style.opacity = (0.15 + 0.1 * (trailCount - i - 1)).toString();
      trail.style.pointerEvents = 'none';
      trail.style.zIndex = 10000;
      element.appendChild(trail);
      trailElements.push(trail);
    }

    // Store previous positions for the trail
    let prevPositions = Array(trailCount).fill({ left: 0, top: 0 });

    // Helper to update trail positions
    function updateTrail(left, top) {
      // Shift previous positions
      prevPositions.pop();
      prevPositions.unshift({ left, top });
      // Update trail elements
      for (let i = 0; i < trailCount; i++) {
      trailElements[i].style.left = `${prevPositions[i].left}px`;
      trailElements[i].style.top = `${prevPositions[i].top}px`;
      }
    }

    // Animation function to loop indefinitely
    function animateBorderLoop() {
      const parentWidth = windowBorder.parentElement.offsetWidth;
      const parentHeight = windowBorder.parentElement.offsetHeight;
      gsap.to(windowBorder, {
        keyframes: [
          {
            left: 0,
            top: 0,
            duration: 1,
            ease: "power1.out",
            onUpdate: function () {
              const left = parseFloat(windowBorder.style.left) || 0;
              const top = parseFloat(windowBorder.style.top) || 0;
              updateTrail(left, top);
            }
          },
          {
            left: parentWidth - windowBorder.offsetWidth,
            top: 0,
            duration: 1,
            ease: "power1.out",
            onUpdate: function () {
              const left = parseFloat(windowBorder.style.left) || 0;
              const top = parseFloat(windowBorder.style.top) || 0;
              updateTrail(left, top);
            }
          },
          {
            left: parentWidth - windowBorder.offsetWidth,
            top: parentHeight - windowBorder.offsetHeight,
            duration: 1,
            ease: "power1.out",
            onUpdate: function () {
              const left = parseFloat(windowBorder.style.left) || 0;
              const top = parseFloat(windowBorder.style.top) || 0;
              updateTrail(left, top);
            }
          },
          {
            left: 0,
            top: parentHeight - windowBorder.offsetHeight,
            duration: 1,
            ease: "power1.out",
            onUpdate: function () {
              const left = parseFloat(windowBorder.style.left) || 0;
              const top = parseFloat(windowBorder.style.top) || 0;
              updateTrail(left, top);
            }
          }
        ],
        onComplete: animateBorderLoop // Loop the animation
      });
    }

    setTimeout(animateBorderLoop(), 1000);

  }, 1000);
}

export function characterBuilderAnimation(element) {
// Clean up existing background
  const existingCanvas = element.querySelector('.threejs-background canvas');
  if (existingCanvas) {
    // Dispose of existing Three.js resources
    if (threeScene) {
      threeScene.clear();
      if (this.threeRenderer) {
        this.threeRenderer.dispose();
      }
    }
    existingCanvas.parentElement.remove();
  }

  // Create container for ThreeJS canvas
  const container = document.createElement('div');
  container.className = 'threejs-background';
  container.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
    pointer-events: none;
    overflow: hidden;
  `;

  // Insert at the beginning of the sheet
  element.insertBefore(container, element.firstChild);

  // Use a small timeout to ensure the container is properly laid out
  setTimeout(() => {
    // Get the actual container dimensions after layout
    const containerRect = container.getBoundingClientRect();
    const width = containerRect.width || element.offsetWidth || window.innerWidth;
    const height = containerRect.height || element.offsetHeight || window.innerHeight;

    // Setup ThreeJS Scene
    const threeScene = new THREE.Scene();
    const threeCamera = new THREE.PerspectiveCamera(60, width / height, 0.1, 3000); // Wider FOV and far plane
    const threeRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    threeRenderer.setSize(width, height);
    threeRenderer.setClearColor(0x000000, 0.1);
    
    // Ensure canvas fills container
    const canvas = this.threeRenderer.domElement;
    canvas.style.cssText = `
      width: 100% !important;
      height: 100% !important;
      display: block;
    `;
    
    container.appendChild(canvas);

    // Setup mouse interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    
    // Enable pointer events for interactive layer
    canvas.style.pointerEvents = 'auto';
    canvas.addEventListener('mousemove', (event) => this._onMouseMove(event, container));
    canvas.addEventListener('click', (event) => this._onMouseClick(event, container));

    // Create particle field
    _createParticleField(threeScene);
    
    // Create floating geometric shapes
    _createFloatingGeometry(threeScene);
    
    // Create energy connections
    _createEnergyConnections();

    // Create interactive foreground layer
    _createInteractiveLayer();

    // Position camera further back and centered
    this.threeCamera.position.set(0, 0, 250); // Much further back
    this.threeCamera.lookAt(0, 0, 0); // Look at origin

    // Animation loop
    _startThreeJSAnimation();
  }, 10);

  // Handle resize
  window.addEventListener('resize', () => this._onThreeJSResize(container));
}

/**
 * Creates a 3D particle field similar to stars/nebulae
 * @private
 */
function _createParticleField(threeScene) {
  const particleCount = 500; // Increased for more density
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);

  // More varied sci-fi color palette with some fantasy elements
  const colorPalette = [
    new THREE.Color(0x00ffff), // Cyan (data)
    new THREE.Color(0x0080ff), // Blue (tech)
    new THREE.Color(0x4080ff), // Light blue
    new THREE.Color(0x80c0ff), // Pale blue
    new THREE.Color(0x00ff80), // Green-cyan (bio)
    new THREE.Color(0xffffff), // White (pure data)
    new THREE.Color(0xff6b35), // Orange (energy)
    new THREE.Color(0xf7931e), // Gold (magical)
    new THREE.Color(0x9d4edd), // Purple (mystical)
  ];

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    
    // Create clusters and streams for more organic feel
    const clusterType = Math.random();
    if (clusterType < 0.3) {
      // DNA data streams
      const streamX = (Math.random() - 0.5) * 200;
      positions[i3] = streamX + (Math.random() - 0.5) * 50;
      positions[i3 + 1] = (Math.random() - 0.5) * 1000;
      positions[i3 + 2] = (Math.random() - 0.5) * 600;
    } else if (clusterType < 0.6) {
      // Mystical energy clusters
      const centerX = (Math.random() - 0.5) * 800;
      const centerY = (Math.random() - 0.5) * 600;
      const centerZ = (Math.random() - 0.5) * 400;
      const radius = Math.random() * 100 + 50;
      const angle = Math.random() * Math.PI * 2;
      positions[i3] = centerX + Math.cos(angle) * radius;
      positions[i3 + 1] = centerY + Math.sin(angle) * radius;
      positions[i3 + 2] = centerZ + (Math.random() - 0.5) * 100;
    } else {
      // Random scattered data points
      positions[i3] = (Math.random() - 0.5) * 1000;
      positions[i3 + 1] = (Math.random() - 0.5) * 800;
      positions[i3 + 2] = (Math.random() - 0.5) * 600;
    }

    // Color based on position/type for more meaning
    let color;
    if (Math.abs(positions[i3]) < 100) {
      // Central DNA stream - green/cyan
      color = colorPalette[Math.floor(Math.random() * 3) + 2];
    } else if (positions[i3 + 2] < -200) {
      // Background tech - blue tones
      color = colorPalette[Math.floor(Math.random() * 4)];
    } else {
      // Magical/energy elements - warmer tones
      color = colorPalette[Math.floor(Math.random() * 3) + 6];
    }
    
    colors[i3] = color.r;
    colors[i3 + 1] = color.g;
    colors[i3 + 2] = color.b;

    // Varied sizes for more visual interest
    sizes[i] = Math.random() * 2.5 + 0.5;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  // Custom shader material for sci-fi glowing particles
  const material = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 }
    },
    vertexShader: `
      attribute float size;
      varying vec3 vColor;
      uniform float time;
      
      void main() {
        vColor = color;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        
        // Much slower, more subtle movement
        mvPosition.x += sin(time * 0.0002 + position.y * 0.005) * 1.0;
        mvPosition.y += cos(time * 0.0003 + position.x * 0.005) * 0.5;
        
        gl_PointSize = size * (200.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      
      void main() {
        float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
        float alpha = 1.0 - smoothstep(0.0, 0.5, distanceToCenter);
        
        // Sharper, more digital glow
        alpha = pow(alpha, 1.2);
        
        // Add subtle pulsing
        alpha *= 0.6 + 0.4 * sin(gl_FragCoord.x * 0.1 + gl_FragCoord.y * 0.1);
        
        gl_FragColor = vec4(vColor, alpha * 0.9);
      }
    `,
    blending: THREE.AdditiveBlending,
    transparent: true,
    vertexColors: true
  });

  const particleField = new THREE.Points(geometry, material);
  threeScene.add(particleField);
}

/**
 * Creates floating geometric shapes (background layer)
 * @private
 */
function _createFloatingGeometry() {
  const floatingShapes = [];
  const shapeCount = 10; // Reduced since we have interactive layer

  for (let i = 0; i < shapeCount; i++) {
    let geometry, material;
    
    const shapeType = Math.floor(Math.random() * 6); // Fewer types for background
    const color = new THREE.Color().setHSL(0.5 + Math.random() * 0.4, 0.5, 0.4); // Dimmer for background
    
    switch (shapeType) {
      case 0: // Bio-tech Capsule
        geometry = new THREE.CapsuleGeometry(Math.random() * 2 + 1, Math.random() * 6 + 4, 6, 12);
        break;
      case 1: // Data Crystal (octahedron)
        geometry = new THREE.OctahedronGeometry(Math.random() * 6 + 3);
        break;
      case 2: // Character Matrix (box with details)
        geometry = new THREE.BoxGeometry(
          Math.random() * 8 + 4,
          Math.random() * 8 + 4,
          Math.random() * 3 + 1
        );
        break;
      case 3: // Genetic Sphere
        geometry = new THREE.IcosahedronGeometry(Math.random() * 4 + 2, 1);
        break;
      case 4: // Energy Ring
        geometry = new THREE.TorusGeometry(Math.random() * 6 + 3, Math.random() * 1.5 + 0.5, 6, 12);
        break;
      case 5: // Simple Tetrahedron
        geometry = new THREE.TetrahedronGeometry(Math.random() * 5 + 2);
        break;
    }

    material = new THREE.MeshBasicMaterial({
      color: color,
      wireframe: true,
      transparent: true,
      opacity: 0.15 // Much dimmer for background
    });

    const mesh = new THREE.Mesh(geometry, material);
    
    // Position further back and more spread out
    mesh.position.set(
      (Math.random() - 0.5) * 1200, // Wider spread
      (Math.random() - 0.5) * 800,
      (Math.random() - 0.5) * 600 - 100 // Push further back
    );

    // Random rotation
    mesh.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );

    // Store animation properties
    mesh.userData = {
      rotationSpeed: {
        x: (Math.random() - 0.5) * 0.002, // Slower for background
        y: (Math.random() - 0.5) * 0.002,
        z: (Math.random() - 0.5) * 0.002
      },
      floatSpeed: Math.random() * 0.001 + 0.0005,
      floatOffset: Math.random() * Math.PI * 2,
      shapeType: shapeType
    };

    floatingShapes.push(mesh);
    threeScene.add(mesh);
  }

  // Add themed background elements
  _createScanningGrid();
  _createDataStreams();
}

/**
 * Creates energy connection lines between shapes
 * @private
 */
function _createEnergyConnections() {
  if (this.floatingShapes.length < 2) return;

  const connectionCount = Math.min(8, Math.floor(this.floatingShapes.length / 3)); // More connections
  this.energyConnections = [];

  for (let i = 0; i < connectionCount; i++) {
    const shape1 = this.floatingShapes[Math.floor(Math.random() * this.floatingShapes.length)];
    const shape2 = this.floatingShapes[Math.floor(Math.random() * this.floatingShapes.length)];
    
    if (shape1 !== shape2) {
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(6); // 2 points * 3 coordinates
      
      positions[0] = shape1.position.x;
      positions[1] = shape1.position.y;
      positions[2] = shape1.position.z;
      positions[3] = shape2.position.x;
      positions[4] = shape2.position.y;
      positions[5] = shape2.position.z;
      
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      
      // Different colors based on connection type
      let connectionColor;
      if (shape1.userData.shapeType === 0 || shape2.userData.shapeType === 0) {
        connectionColor = new THREE.Color(0x00ff88); // DNA connections are green
      } else if (shape1.userData.shapeType === 1 || shape2.userData.shapeType === 1) {
        connectionColor = new THREE.Color(0x9d4edd); // Runic connections are purple
      } else {
        connectionColor = new THREE.Color(0x00ffff); // Tech connections are cyan
      }
      
      const material = new THREE.LineBasicMaterial({
        color: connectionColor,
        transparent: true,
        opacity: 0.2
      });
      
      const line = new THREE.Line(geometry, material);
      line.userData = { shape1, shape2 };
      
      this.energyConnections.push(line);
      threeScene.add(line);
    }
  }
}

/**
 * Creates a DNA helix geometry with proper connected strands
 * @private
 */
function _createDNAHelix() {
  const group = new THREE.Group();
  const height = 30;
  const radius = 4;
  const turns = 2;
  const pointsPerTurn = 32;
  const totalPoints = turns * pointsPerTurn;

  // Create first strand
  const strand1Points = [];
  const strand2Points = [];
  
  for (let i = 0; i < totalPoints; i++) {
    const t = i / totalPoints;
    const angle = t * turns * Math.PI * 2;
    const y = (t - 0.5) * height;
    
    // First strand
    strand1Points.push(new THREE.Vector3(
      Math.cos(angle) * radius,
      y,
      Math.sin(angle) * radius
    ));
    
    // Second strand (180 degrees offset)
    strand2Points.push(new THREE.Vector3(
      Math.cos(angle + Math.PI) * radius,
      y,
      Math.sin(angle + Math.PI) * radius
    ));
  }

  // Create strand curves
  const strand1Curve = new THREE.CatmullRomCurve3(strand1Points);
  const strand2Curve = new THREE.CatmullRomCurve3(strand2Points);
  
  // Create strand geometries
  const strand1Geo = new THREE.TubeGeometry(strand1Curve, totalPoints * 2, 0.3, 8, false);
  const strand2Geo = new THREE.TubeGeometry(strand2Curve, totalPoints * 2, 0.3, 8, false);
  
  // Materials for strands
  const strand1Mat = new THREE.MeshBasicMaterial({ 
    color: 0x00ff88, 
    transparent: true, 
    opacity: 0.7 
  });
  const strand2Mat = new THREE.MeshBasicMaterial({ 
    color: 0x0088ff, 
    transparent: true, 
    opacity: 0.7 
  });

  const strand1Mesh = new THREE.Mesh(strand1Geo, strand1Mat);
  const strand2Mesh = new THREE.Mesh(strand2Geo, strand2Mat);
  
  group.add(strand1Mesh);
  group.add(strand2Mesh);

  // Add cross-connections (base pairs)
  const connectionGeo = new THREE.BufferGeometry();
  const connectionPositions = [];
  
  for (let i = 0; i < totalPoints; i += 4) { // Every 4th point
    const point1 = strand1Points[i];
    const point2 = strand2Points[i];
    
    connectionPositions.push(point1.x, point1.y, point1.z);
    connectionPositions.push(point2.x, point2.y, point2.z);
  }
  
  connectionGeo.setAttribute('position', new THREE.Float32BufferAttribute(connectionPositions, 3));
  const connectionMat = new THREE.LineBasicMaterial({ 
    color: 0xffff00, 
    transparent: true, 
    opacity: 0.6 
  });
  
  const connections = new THREE.LineSegments(connectionGeo, connectionMat);
  group.add(connections);

  return group;
}

/**
 * Creates an interactive foreground layer with prominent objects
 * @private
 */
function _createInteractiveLayer() {
  this.interactiveObjects = [];
  
  // Create 3-4 prominent interactive objects
  const objectCount = 4;
  const objectTypes = [
    { name: 'DNA Helix', color: 0x00ff88, tooltip: 'Genetic Structure Analysis' },
    { name: 'Runic Circle', color: 0x9d4edd, tooltip: 'Mystical Energy Matrix' },
    { name: 'Bio Scanner', color: 0x00ffff, tooltip: 'Biological Data Processor' },
    { name: 'Energy Core', color: 0xff6b35, tooltip: 'Power Distribution Node' }
  ];

  for (let i = 0; i < objectCount; i++) {
    const objType = objectTypes[i];
    let geometry, mesh;
    
    switch (i) {
      case 0: // DNA Helix - larger and more prominent
        geometry = this._createDNAHelix();
        mesh = geometry; // It's already a group
        mesh.scale.set(2, 2, 2); // Make it bigger
        break;
        
      case 1: // Runic Circle - also larger
        geometry = this._createRunicCircle();
        const runeMaterial = new THREE.LineBasicMaterial({
          color: objType.color,
          transparent: true,
          opacity: 0.8,
          linewidth: 3
        });
        mesh = new THREE.LineSegments(geometry, runeMaterial);
        mesh.scale.set(1.5, 1.5, 1.5);
        break;
        
      case 2: // Bio Scanner - custom geometry
        geometry = new THREE.ConeGeometry(6, 12, 8);
        const scannerMaterial = new THREE.MeshBasicMaterial({
          color: objType.color,
          transparent: true,
          opacity: 0.6,
          wireframe: true
        });
        mesh = new THREE.Mesh(geometry, scannerMaterial);
        break;
        
      case 3: // Energy Core - pulsing sphere
        geometry = new THREE.IcosahedronGeometry(8, 2);
        const coreMaterial = new THREE.MeshBasicMaterial({
          color: objType.color,
          transparent: true,
          opacity: 0.5,
          wireframe: true
        });
        mesh = new THREE.Mesh(geometry, coreMaterial);
        break;
    }

    // Position objects in visible area but not blocking UI
    const angle = (i / objectCount) * Math.PI * 2;
    const radius = 150 + Math.random() * 100;
    mesh.position.set(
      Math.cos(angle) * radius,
      (Math.random() - 0.5) * 200,
      -50 + Math.random() * 100
    );

    // Store metadata for interaction
    mesh.userData = {
      type: objType.name,
      tooltip: objType.tooltip,
      originalColor: objType.color,
      originalOpacity: mesh.material ? mesh.material.opacity : 0.5,
      isInteractive: true,
      rotationSpeed: {
        x: (Math.random() - 0.5) * 0.01,
        y: (Math.random() - 0.5) * 0.01,
        z: (Math.random() - 0.5) * 0.01
      }
    };

    this.interactiveObjects.push(mesh);
    threeScene.add(mesh);
  }
}

/**
 * Handle mouse movement for hover effects
 * @private
 */
function _onMouseMove(event, container) {
  const rect = container.getBoundingClientRect();
  this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  // Update raycaster
  this.raycaster.setFromCamera(this.mouse, this.threeCamera);
  
  // Check for intersections with interactive objects
  const intersects = this.raycaster.intersectObjects(this.interactiveObjects, true);
  
  // Reset all objects to normal state
  this.interactiveObjects.forEach(obj => {
    if (obj.material) {
      obj.material.opacity = obj.userData.originalOpacity;
      obj.scale.setScalar(obj.userData.type === 'DNA Helix' ? 2 : 1);
    } else if (obj.children) {
      // Handle groups like DNA Helix
      obj.children.forEach(child => {
        if (child.material) {
          child.material.opacity = obj.userData.originalOpacity;
        }
      });
      obj.scale.setScalar(2); // DNA Helix base scale
    }
  });

  // Highlight hovered object
  if (intersects.length > 0) {
    const hoveredObj = intersects[0].object.parent || intersects[0].object;
    if (hoveredObj.userData.isInteractive) {
      // Change cursor
      container.style.cursor = 'pointer';
      
      // Enhance the object
      if (hoveredObj.material) {
        hoveredObj.material.opacity = Math.min(1.0, hoveredObj.userData.originalOpacity + 0.3);
        hoveredObj.scale.setScalar(hoveredObj.userData.type === 'DNA Helix' ? 2.2 : 1.1);
      } else if (hoveredObj.children) {
        // Handle groups
        hoveredObj.children.forEach(child => {
          if (child.material) {
            child.material.opacity = Math.min(1.0, hoveredObj.userData.originalOpacity + 0.3);
          }
        });
        hoveredObj.scale.setScalar(2.2);
      }
      
      // Show tooltip (you could create an actual DOM tooltip here)
      console.log(`Hovering: ${hoveredObj.userData.tooltip}`);
    }
  } else {
    container.style.cursor = 'default';
  }
}

/**
 * Handle mouse clicks on interactive objects  
 * @private
 */
function _onMouseClick(event, container) {
  const rect = container.getBoundingClientRect();
  this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  this.raycaster.setFromCamera(this.mouse, this.threeCamera);
  const intersects = this.raycaster.intersectObjects(this.interactiveObjects, true);

  if (intersects.length > 0) {
    const clickedObj = intersects[0].object.parent || intersects[0].object;
    if (clickedObj.userData.isInteractive) {
      // Trigger interaction effect
      this._triggerObjectInteraction(clickedObj);
    }
  }
}

/**
 * Trigger special effects when an object is clicked
 * @private
 */
function _triggerObjectInteraction(obj) {
  console.log(`Clicked: ${obj.userData.type} - ${obj.userData.tooltip}`);
  
  // Create a pulse effect
  const originalScale = obj.scale.x;
  const pulseScale = originalScale * 1.5;
  
  // Animate pulse
  const startTime = performance.now();
  const pulseDuration = 500; // ms
  
  const animatePulse = () => {
    const elapsed = performance.now() - startTime;
    const progress = Math.min(elapsed / pulseDuration, 1);
    
    if (progress < 0.5) {
      // Expand
      const scale = originalScale + (pulseScale - originalScale) * (progress * 2);
      obj.scale.setScalar(scale);
    } else {
      // Contract
      const scale = pulseScale - (pulseScale - originalScale) * ((progress - 0.5) * 2);
      obj.scale.setScalar(scale);
    }
    
    if (progress < 1) {
      requestAnimationFrame(animatePulse);
    }
  };
  
  animatePulse();
  
  // Create particle burst effect
  _createParticleBurst(obj.position, threeScene);

  // You could also trigger game-specific effects here
  // For example, show character creation hints, play sounds, etc.
}

/**
 * Create a particle burst effect at a position
 * @private
 */
function _createParticleBurst(position, threeScene) {
  const burstCount = 20;
  const burstGeometry = new THREE.BufferGeometry();
  const burstPositions = new Float32Array(burstCount * 3);
  const burstVelocities = [];
  
  for (let i = 0; i < burstCount; i++) {
    const i3 = i * 3;
    burstPositions[i3] = position.x;
    burstPositions[i3 + 1] = position.y;
    burstPositions[i3 + 2] = position.z;
    
    // Random velocity
    burstVelocities.push(
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 10
    );
  }
  
  burstGeometry.setAttribute('position', new THREE.BufferAttribute(burstPositions, 3));
  
  const burstMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 3,
    transparent: true,
    opacity: 1.0,
    blending: THREE.AdditiveBlending
  });
  
  const burstParticles = new THREE.Points(burstGeometry, burstMaterial);
  threeScene.add(burstParticles);
  
  // Animate burst
  const startTime = performance.now();
  const burstDuration = 1000;
  
  const animateBurst = () => {
    const elapsed = performance.now() - startTime;
    const progress = elapsed / burstDuration;
    
    if (progress < 1) {
      const positions = burstParticles.geometry.attributes.position.array;
      
      for (let i = 0; i < burstCount; i++) {
        const i3 = i * 3;
        positions[i3] += burstVelocities[i3] * 0.1;
        positions[i3 + 1] += burstVelocities[i3 + 1] * 0.1;
        positions[i3 + 2] += burstVelocities[i3 + 2] * 0.1;
      }
      
      burstParticles.geometry.attributes.position.needsUpdate = true;
      burstMaterial.opacity = 1.0 - progress;
      
      requestAnimationFrame(animateBurst);
    } else {
      threeScene.remove(burstParticles);
      burstGeometry.dispose();
      burstMaterial.dispose();
    }
  };
  
  animateBurst();
}

/**
 * Creates a runic circle geometry
 * @private
 */
function _createRunicCircle(threeScene) {
  const geometry = new THREE.BufferGeometry();
  const positions = [];
  const radius = 8;
  const segments = 24;
  
  // Outer circle
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    positions.push(
      Math.cos(angle) * radius,
      0,
      Math.sin(angle) * radius
    );
  }
  
  // Inner runes/symbols
  const runeCount = 6;
  for (let i = 0; i < runeCount; i++) {
    const angle = (i / runeCount) * Math.PI * 2;
    const innerRadius = radius * 0.6;
    const outerRadius = radius * 0.9;
    
    // Radial lines
    positions.push(
      Math.cos(angle) * innerRadius, 0, Math.sin(angle) * innerRadius,
      Math.cos(angle) * outerRadius, 0, Math.sin(angle) * outerRadius
    );
    
    // Small symbols
    const symbolAngle = angle + 0.2;
    positions.push(
      Math.cos(angle) * innerRadius, -1, Math.sin(angle) * innerRadius,
      Math.cos(symbolAngle) * innerRadius, 1, Math.sin(symbolAngle) * innerRadius
    );
  }
  
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  return geometry;
}

/**
 * Creates a sci-fi scanning grid
 * @private
 */
function _createScanningGrid(threeScene) {
  // Horizontal grid lines - make it bigger
  const gridSize = 800; // Doubled size
  const divisions = 25; // More divisions for detail
  const gridGeometry = new THREE.BufferGeometry();
  const gridPositions = [];

  for (let i = 0; i <= divisions; i++) {
    const x = (i / divisions - 0.5) * gridSize;
    // Horizontal lines
    gridPositions.push(x, -gridSize/2, -150); // Moved further back
    gridPositions.push(x, gridSize/2, -150);
    // Vertical lines
    gridPositions.push(-gridSize/2, x, -150);
    gridPositions.push(gridSize/2, x, -150);
  }

  gridGeometry.setAttribute('position', new THREE.Float32BufferAttribute(gridPositions, 3));
  
  const gridMaterial = new THREE.LineBasicMaterial({
    color: 0x004080,
    transparent: true,
    opacity: 0.15 // Slightly more visible
  });

  const scanningGrid = new THREE.LineSegments(gridGeometry, gridMaterial);
  threeScene.add(scanningGrid);

  // Add scanning beam effect - make it bigger
  const beamGeometry = new THREE.PlaneGeometry(gridSize, 4); // Thicker beam
  const beamMaterial = new THREE.MeshBasicMaterial({
    color: 0x00ffff,
    transparent: true,
    opacity: 0.1,
    side: THREE.DoubleSide
  });

  const scanningBeam = new THREE.Mesh(beamGeometry, beamMaterial);
  scanningBeam.position.z = -149;
  scanningBeam.rotation.x = Math.PI / 2;
  threeScene.add(scanningBeam);
}

/**
 * Creates floating data streams
 * @private
 */
function _createDataStreams(threeScene) {
  const dataStreams = [];
  const streamCount = 6;

  for (let i = 0; i < streamCount; i++) {
    const streamGeometry = new THREE.BufferGeometry();
    const streamPositions = [];
    const streamColors = [];
    
    // Create a flowing line of data points - spread wider
    const pointCount = 25; // More points
    const startX = (Math.random() - 0.5) * 1000; // Wider spread
    const startY = (Math.random() - 0.5) * 800;  // Wider spread
    const startZ = (Math.random() - 0.5) * 400;  // Deeper spread
    
    for (let j = 0; j < pointCount; j++) {
      streamPositions.push(
        startX + j * 10,
        startY + Math.sin(j * 0.5) * 20,
        startZ + Math.cos(j * 0.3) * 10
      );
      
      // Fade along the stream
      const alpha = 1 - (j / pointCount);
      streamColors.push(0, 1, 1, alpha); // Cyan with fading alpha
    }
    
    streamGeometry.setAttribute('position', new THREE.Float32BufferAttribute(streamPositions, 3));
    streamGeometry.setAttribute('color', new THREE.Float32BufferAttribute(streamColors, 4));
    
    const streamMaterial = new THREE.PointsMaterial({
      size: 2,
      transparent: true,
      vertexColors: true,
      blending: THREE.AdditiveBlending
    });
    
    const stream = new THREE.Points(streamGeometry, streamMaterial);
    stream.userData = {
      speed: Math.random() * 0.5 + 0.2,
      direction: new THREE.Vector3(
        (Math.random() - 0.5) * 0.1,
        (Math.random() - 0.5) * 0.1,
        (Math.random() - 0.5) * 0.1
      )
    };
    
    dataStreams.push(stream);
    threeScene.add(stream);
  }
}

/**
 * Animation loop for ThreeJS scene
 * @private
 */
function _startThreeJSAnimation() {
  const animate = () => {
    if (!this.threeRenderer || !threeScene) return;

    const time = performance.now();

    // Animate particle field - much slower
    if (this.particleField) {
      this.particleField.material.uniforms.time.value = time;
      this.particleField.rotation.y += 0.0001; // 5x slower
    }

    // Animate floating shapes - slower and more monotone
    this.floatingShapes.forEach(shape => {
      shape.rotation.x += shape.userData.rotationSpeed.x;
      shape.rotation.y += shape.userData.rotationSpeed.y;
      shape.rotation.z += shape.userData.rotationSpeed.z;
      
      // Much gentler floating motion
      shape.position.y += Math.sin(time * shape.userData.floatSpeed + shape.userData.floatOffset) * 0.02;
    });

    // Animate interactive objects
    if (this.interactiveObjects) {
      this.interactiveObjects.forEach(obj => {
        obj.rotation.x += obj.userData.rotationSpeed.x;
        obj.rotation.y += obj.userData.rotationSpeed.y;
        obj.rotation.z += obj.userData.rotationSpeed.z;
        
        // Gentle bobbing motion
        obj.position.y += Math.sin(time * 0.001 + obj.position.x * 0.01) * 0.5;
        
        // Special animations for different types
        if (obj.userData.type === 'Energy Core') {
          // Pulsing opacity for energy core
          if (obj.material) {
            obj.material.opacity = obj.userData.originalOpacity + Math.sin(time * 0.003) * 0.2;
          }
        }
      });
    }

    // Update energy connections with slower pulsing
    this.energyConnections.forEach(connection => {
      const positions = connection.geometry.attributes.position.array;
      const { shape1, shape2 } = connection.userData;
      
      positions[0] = shape1.position.x;
      positions[1] = shape1.position.y;
      positions[2] = shape1.position.z;
      positions[3] = shape2.position.x;
      positions[4] = shape2.position.y;
      positions[5] = shape2.position.z;
      
      connection.geometry.attributes.position.needsUpdate = true;
      
      // Slower, more subtle pulsing
      connection.material.opacity = 0.1 + Math.sin(time * 0.0008) * 0.05;
    });

    // Animate scanning grid
    if (this.scanningGrid) {
      this.scanningGrid.material.opacity = 0.08 + Math.sin(time * 0.001) * 0.03;
    }

    // Animate scanning beam - adjust for new grid size
    if (this.scanningBeam) {
      this.scanningBeam.position.y = Math.sin(time * 0.0005) * 300; // Wider sweep
      this.scanningBeam.material.opacity = 0.05 + Math.sin(time * 0.002) * 0.03;
    }

    // Animate data streams
    this.dataStreams.forEach(stream => {
      const positions = stream.geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i] += stream.userData.direction.x;
        positions[i + 1] += stream.userData.direction.y;
        positions[i + 2] += stream.userData.direction.z;
        
        // Wrap around screen - adjust for larger space
        if (positions[i] > 500) positions[i] = -500;
        if (positions[i] < -500) positions[i] = 500;
        if (positions[i + 1] > 400) positions[i + 1] = -400;
        if (positions[i + 1] < -400) positions[i + 1] = 400;
      }
      stream.geometry.attributes.position.needsUpdate = true;
    });

    // Much slower, more subtle camera movement - keep it centered
    this.threeCamera.position.x = Math.sin(time * 0.00005) * 10;
    this.threeCamera.position.y = Math.cos(time * 0.00007) * 8;
    this.threeCamera.position.z = 250 + Math.sin(time * 0.00003) * 20; // Slight zoom variation

    this.threeRenderer.render(threeScene, this.threeCamera);
    requestAnimationFrame(animate);
  };

  animate();
}

/**
 * Handle ThreeJS canvas resize
 * @private
 */
function _onThreeJSResize(container) {
  if (!this.threeCamera || !this.threeRenderer) return;

  // Use the container's actual dimensions
  const containerRect = container.getBoundingClientRect();
  const width = containerRect.width || element.offsetWidth || window.innerWidth;
  const height = containerRect.height || element.offsetHeight || window.innerHeight;

  this.threeCamera.aspect = width / height;
  this.threeCamera.updateProjectionMatrix();
  this.threeRenderer.setSize(width, height);
  
  // Ensure canvas maintains full size
  const canvas = this.threeRenderer.domElement;
  canvas.style.width = '100%';
  canvas.style.height = '100%';
}

/**
 * Creates bio-tech readout displays
 * @private
 */
function _createBioReadouts() {
  const geometry = new THREE.PlaneGeometry(12, 8);
  
  // Create canvas texture for readout display
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  
  // Draw bio readout interface
  ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Grid lines
  ctx.strokeStyle = '#00ff88';
  ctx.lineWidth = 1;
  for (let i = 0; i < canvas.width; i += 20) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, canvas.height);
    ctx.stroke();
  }
  for (let i = 0; i < canvas.height; i += 15) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(canvas.width, i);
    ctx.stroke();
  }
  
  // Bio data text
  ctx.fillStyle = '#00ff88';
  ctx.font = '12px monospace';
  ctx.fillText('GENETIC SEQUENCE', 10, 20);
  ctx.fillText('DNA: ATCG-7429-XKIV', 10, 40);
  ctx.fillText('STABILITY: 97.3%', 10, 60);
  ctx.fillText('MUTATIONS: 0.02%', 10, 80);
  ctx.fillText('COMPATIBILITY: HIGH', 10, 100);
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    opacity: 0.7,
    side: THREE.DoubleSide
  });
  
  return { geometry, material };
}

/**
 * Creates mystical rune overlays
 * @private
 */
function _createMysticalRunes() {
  const geometry = new THREE.BufferGeometry();
  const positions = [];
  
  // Ancient rune patterns
  const runePatterns = [
    // Triangular rune
    [0, 5, 0, -4, -3, 0, 4, -3, 0, 0, 5, 0],
    // Cross rune with branches
    [0, 6, 0, 0, -6, 0, -5, 0, 0, 5, 0, 0, -3, 3, 0, 3, 3, 0, -3, -3, 0, 3, -3, 0],
    // Spiral rune
    []
  ];
  
  // Create spiral pattern
  const spiralPoints = 20;
  for (let i = 0; i < spiralPoints; i++) {
    const t = i / spiralPoints;
    const angle = t * Math.PI * 4;
    const radius = t * 6;
    runePatterns[2].push(
      Math.cos(angle) * radius,
      Math.sin(angle) * radius * 0.5 + t * 8 - 4,
      0
    );
  }
  
  // Add all rune patterns
  runePatterns.forEach(pattern => {
    for (let i = 0; i < pattern.length; i += 3) {
      positions.push(pattern[i], pattern[i + 1], pattern[i + 2]);
    }
  });
  
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  return geometry;
}