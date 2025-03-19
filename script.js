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
    window.addEventListener("resize", () => this.onWindowResize());
  }

  initScene() {
    this.container = document.getElementById("webgl-container");
    if (!this.container) {
      console.error("WebGL container not found!");
      return;
    }

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

    // Load images with a promise-based approach
    const loadTexture = (url) => {
      return new Promise((resolve) => {
        loader.load(url, (texture) => resolve(texture));
      });
    };

    this.texture1 = await loadTexture("image1.png");
    this.texture2 = await loadTexture("image2.png");
    this.displacement = await loadTexture("displacement.png");

    // Ensure textures maintain aspect ratio and cover the plane
    this.texture1.wrapS = this.texture1.wrapT = THREE.ClampToEdgeWrapping;
    this.texture2.wrapS = this.texture2.wrapT = THREE.ClampToEdgeWrapping;

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

    // Adjust plane size to maintain image aspect ratio and cover the right half
    const width = window.innerWidth / 2;
    const height = window.innerHeight;
    const imageAspect = this.texture1.image.width / this.texture1.image.height;
    const screenAspect = width / height;
    this.geometry = new THREE.PlaneGeometry(2, 2);

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);
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
    requestAnimationFrame(() => this.animate());
    this.renderer.render(this.scene, this.camera);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("webgl-container");
  if (container) {
    new DistortionEffect(container);
  } else {
    console.error("WebGL container not found in DOM!");
  }
});
