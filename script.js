async function loadShader(url) {
  const response = await fetch(url);
  return await response.text();
}

class DistortionEffect {
  constructor(container) {
    this.container = container;
    this.initScene();
    this.loadTexturesAndShaders();
    this.addEventListeners();
    this.animate();
  }

  initScene() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      45,
      this.container.offsetWidth / this.container.offsetHeight,
      0.1,
      100
    );
    this.camera.position.z = 2;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(
      this.container.offsetWidth,
      this.container.offsetHeight
    );
    this.container.appendChild(this.renderer.domElement);
  }

  async loadTexturesAndShaders() {
    const loader = new THREE.TextureLoader();

    // Load images
    this.texture1 = loader.load("image1.png");
    this.texture2 = loader.load("image2.png");
    this.displacement = loader.load("displacement.png"); // Load noise texture

    // Load shaders
    const vertexShader = await loadShader("vertexShader.glsl");
    const fragmentShader = await loadShader("fragmentShader.glsl");

    // Create shader material
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uTexture1: { value: this.texture1 },
        uTexture2: { value: this.texture2 },
        uDisplacement: { value: this.displacement },
        uProgress: { value: 0.0 },
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
    });

    // Create and add mesh
    this.geometry = new THREE.PlaneGeometry(1.5, 1);
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);

    this.animate();
  }

  addEventListeners() {
    this.container.addEventListener("mouseenter", () => {
      gsap.to(this.material.uniforms.uProgress, {
        value: 1,
        duration: 1,
        ease: "power2.out",
      });
    });
    this.container.addEventListener("mouseleave", () => {
      gsap.to(this.material.uniforms.uProgress, {
        value: 0,
        duration: 1,
        ease: "power2.out",
      });
    });
  }

  animate() {
    if (!this.material) return; // Prevent crashing if shaders didn’t load
    requestAnimationFrame(() => this.animate());
    this.renderer.render(this.scene, this.camera);
  }
}

const container = document.querySelector(".webgl-container");
new DistortionEffect(container);
