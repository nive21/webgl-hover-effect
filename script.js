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

    this.texture1 = await loadTexture("images/reflection-right.webp");
    this.texture2 = this.texture1;
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
    const points = document.querySelectorAll(".hover-point");

    points.forEach((point) => {
      point.addEventListener("mouseenter", () => {
        if (this.material) {
          gsap.to(this.material.uniforms.uProgress, {
            value: 1,
            duration: 1,
            ease: "power2.out",
          });
        } else {
          console.error("Shader material is not initialized yet.");
        }
      });

      point.addEventListener("mouseleave", () => {
        if (this.material) {
          gsap.to(this.material.uniforms.uProgress, {
            value: 0,
            duration: 1,
            ease: "power2.out",
          });
        }
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
  let distortionEffect;

  if (container) {
    distortionEffect = new DistortionEffect(container);

    // Add hover functionality for specific points
    const points = [
      { x: "25%", y: "30%", texture: "images/memory1.webp" },
      { x: "85%", y: "50%", texture: "images/memory2.webp" },
      { x: "60%", y: "80%", texture: "images/memory3.webp" },
    ];

    container.addEventListener("mousemove", (event) => {
      const rect = container.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      let isHovering = false;

      points.forEach((point) => {
        const pointX = (parseFloat(point.x) / 100) * rect.width;
        const pointY = (parseFloat(point.y) / 100) * rect.height;

        const distance = Math.sqrt(
          Math.pow(mouseX - pointX, 2) + Math.pow(mouseY - pointY, 2)
        );

        if (distance < 20) {
          isHovering = true;

          // Change the texture dynamically
          if (distortionEffect && distortionEffect.material) {
            const loader = new THREE.TextureLoader();
            loader.load(point.texture, (newTexture) => {
              distortionEffect.material.uniforms.uTexture2.value = newTexture;
            });
          }
        }
      });

      if (distortionEffect && distortionEffect.material) {
        if (isHovering) {
          gsap.to(distortionEffect.material.uniforms.uProgress, {
            value: 1,
            duration: 1,
            ease: "power2.out",
          });
        } else {
          gsap.to(distortionEffect.material.uniforms.uProgress, {
            value: 0,
            duration: 1,
            ease: "power2.out",
          });
        }
      }
    });
  } else {
    console.error("WebGL container not found in DOM!");
  }
});
