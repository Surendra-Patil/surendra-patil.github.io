// Enhanced AI-themed Particle System
class ParticleSystem {
    constructor(options) {
        this.container = options.container;
        this.particleCount = options.particleCount || 1500;
        this.particleSize = options.particleSize || 0.05;
        this.connectionDistance = options.connectionDistance || 1.5;
        this.baseColor = options.baseColor || 0x6e57e0;
        this.highlightColor = options.highlightColor || 0x00eeff;
        
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.particles = null;
        this.particlePositions = [];
        this.lines = [];
        this.linePositions = [];
        this.lineColors = [];
        
        this.mousePosition = { x: 0, y: 0 };
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.clock = new THREE.Clock();
        
        this.init();
    }
    
    init() {
        // Create Scene
        this.scene = new THREE.Scene();
        
        // Add fog for depth
        this.scene.fog = new THREE.FogExp2(0x0a0a16, 0.035);
        
        // Create Camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            this.container.offsetWidth / this.container.offsetHeight,
            0.1,
            1000
        );
        this.camera.position.z = 15;
        
        // Create Renderer with post-processing support
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit to 2x for performance
        this.renderer.setClearColor(0x000000, 0);
        this.container.appendChild(this.renderer.domElement);
        
        // Handle Resize
        window.addEventListener('resize', this.onWindowResize.bind(this));
        
        // Handle Mouse Movement
        window.addEventListener('mousemove', this.onMouseMove.bind(this));
        
        // Create Particle System
        this.createParticles();
        
        // Create Connection Lines
        this.createConnections();
        
        // Start Animation Loop
        this.animate();
    }
    
    createParticles() {
        // Create custom shader material for better-looking particles
        const shaderMaterial = new THREE.ShaderMaterial({
            uniforms: {
                color: { value: new THREE.Color(this.baseColor) },
                pointTexture: { value: this.generateParticleTexture() },
                time: { value: 0 }
            },
            vertexShader: `
                uniform float time;
                attribute float size;
                attribute float speed;
                attribute vec3 customColor;
                varying vec3 vColor;
                
                void main() {
                    vColor = customColor;
                    vec3 pos = position;
                    pos.y += sin(time * speed + position.x) * 0.1;
                    pos.x += cos(time * speed + position.z) * 0.1;
                    
                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                    gl_PointSize = size * (300.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                uniform vec3 color;
                uniform sampler2D pointTexture;
                varying vec3 vColor;
                
                void main() {
                    gl_FragColor = vec4(color * vColor, 1.0);
                    gl_FragColor = gl_FragColor * texture2D(pointTexture, gl_PointCoord);
                    if (gl_FragColor.a < 0.3) discard;
                }
            `,
            blending: THREE.AdditiveBlending,
            depthTest: false,
            transparent: true,
        });
        
        const geometry = new THREE.BufferGeometry();
        const vertices = [];
        const colors = [];
        const sizes = [];
        const speeds = [];
        
        const color = new THREE.Color();
        
        // Create particles in more sophisticated patterns
        for (let i = 0; i < this.particleCount; i++) {
            // Use a mix of spherical and neural network-like positions
            // Some particles in organized layers, some random
            
            let x, y, z;
            
            if (i % 5 === 0) {
                // Neural network layer arrangement
                const layerIndex = Math.floor(Math.random() * 5);
                const nodeIndex = Math.random() * 10 - 5;
                const layerOffset = Math.random() * 2 - 1;
                
                x = (layerIndex * 2) - 5 + layerOffset;
                y = nodeIndex;
                z = Math.random() * 4 - 2;
                
                // Set colors for these nodes to be more blue
                color.setHSL(0.6 + Math.random() * 0.1, 0.9, 0.6);
            } else if (i % 5 === 1) {
                // Data flow streams
                const streamLength = 15;
                const streamPosition = i % streamLength;
                const streamAngle = Math.random() * Math.PI * 2;
                
                x = Math.cos(streamAngle) * 8 * (streamPosition / streamLength);
                y = (Math.random() * 2 - 1) * 5;
                z = Math.sin(streamAngle) * 8 * (streamPosition / streamLength);
                
                // Set colors for data streams to be more purple
                color.setHSL(0.75 + Math.random() * 0.1, 0.9, 0.6);
            } else {
                // Random positions within bounds
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos(Math.random() * 2 - 1);
                const radius = 3 + Math.random() * 7;
                
                x = radius * Math.sin(phi) * Math.cos(theta);
                y = radius * Math.sin(phi) * Math.sin(theta);
                z = radius * Math.cos(phi);
                
                // Random colors for background particles
                color.setHSL(0.5 + Math.random() * 0.3, 0.7, 0.5);
            }
            
            vertices.push(x, y, z);
            colors.push(color.r, color.g, color.b);
            
            // Store positions for connection calculations
            this.particlePositions.push(new THREE.Vector3(x, y, z));
            
            // Add varied sizes and animation speeds
            sizes.push(Math.random() * 4 + 0.5);
            speeds.push(Math.random() * 0.5 + 0.1);
        }
        
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setAttribute('customColor', new THREE.Float32BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
        geometry.setAttribute('speed', new THREE.Float32BufferAttribute(speeds, 1));
        
        // Create particle system
        this.particles = new THREE.Points(geometry, shaderMaterial);
        this.scene.add(this.particles);
    }
    
    generateParticleTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        
        const context = canvas.getContext('2d');
        const gradient = context.createRadialGradient(
            canvas.width / 2, 
            canvas.height / 2, 
            0, 
            canvas.width / 2, 
            canvas.height / 2, 
            canvas.width / 2
        );
        
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.2, 'rgba(240, 240, 255, 0.8)');
        gradient.addColorStop(0.4, 'rgba(200, 220, 255, 0.5)');
        gradient.addColorStop(1, 'rgba(0, 0, 64, 0)');
        
        context.fillStyle = gradient;
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        const texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;
        return texture;
    }
    
    createConnections() {
        const lineGeometry = new THREE.BufferGeometry();
        
        // Custom shader material for lines
        const lineMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                baseColor: { value: new THREE.Color(this.baseColor) },
                highlightColor: { value: new THREE.Color(this.highlightColor) }
            },
            vertexShader: `
                uniform float time;
                attribute float connection;
                varying float vConnection;
                
                void main() {
                    vConnection = connection;
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                uniform vec3 baseColor;
                uniform vec3 highlightColor;
                uniform float time;
                varying float vConnection;
                
                void main() {
                    float alpha = 0.3 + 0.2 * sin(time * 3.0 + vConnection * 10.0);
                    vec3 finalColor = mix(baseColor, highlightColor, vConnection);
                    gl_FragColor = vec4(finalColor, alpha * vConnection);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthTest: false
        });
        
        // Pre-allocate arrays for line positions and colors
        this.linePositions = new Float32Array(this.particleCount * this.particleCount * 6);
        this.connections = new Float32Array(this.particleCount * this.particleCount * 2);
        
        lineGeometry.setAttribute('position', new THREE.BufferAttribute(this.linePositions, 3));
        lineGeometry.setAttribute('connection', new THREE.BufferAttribute(this.connections, 1));
        
        // Create lines
        this.lines = new THREE.LineSegments(lineGeometry, lineMaterial);
        this.scene.add(this.lines);
    }
    
    updateConnections() {
        let vertexIndex = 0;
        let connectionIndex = 0;
        let linksCount = 0;
        
        // Update line positions and connection strengths
        for (let i = 0; i < this.particleCount; i++) {
            const particleA = this.particlePositions[i];
            
            for (let j = i + 1; j < this.particleCount; j++) {
                const particleB = this.particlePositions[j];
                
                // Calculate distance between particles
                const dx = particleA.x - particleB.x;
                const dy = particleA.y - particleB.y;
                const dz = particleA.z - particleB.z;
                const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
                
                // Check if particles are close enough to connect
                if (distance < this.connectionDistance) {
                    // Calculate connection strength (1 = strong, 0 = weak)
                    const connectionStrength = 1.0 - (distance / this.connectionDistance);
                    
                    // Update positions
                    this.linePositions[vertexIndex++] = particleA.x;
                    this.linePositions[vertexIndex++] = particleA.y;
                    this.linePositions[vertexIndex++] = particleA.z;
                    
                    this.linePositions[vertexIndex++] = particleB.x;
                    this.linePositions[vertexIndex++] = particleB.y;
                    this.linePositions[vertexIndex++] = particleB.z;
                    
                    // Update connection strength
                    this.connections[connectionIndex++] = connectionStrength;
                    this.connections[connectionIndex++] = connectionStrength;
                    
                    linksCount++;
                } else {
                    // If not connected, move positions off-screen
                    this.linePositions[vertexIndex++] = 0;
                    this.linePositions[vertexIndex++] = 0;
                    this.linePositions[vertexIndex++] = 0;
                    
                    this.linePositions[vertexIndex++] = 0;
                    this.linePositions[vertexIndex++] = 0;
                    this.linePositions[vertexIndex++] = 0;
                    
                    // Update connection strength to 0
                    this.connections[connectionIndex++] = 0;
                    this.connections[connectionIndex++] = 0;
                }
            }
        }
        
        // Update the buffer attributes
        this.lines.geometry.attributes.position.needsUpdate = true;
        this.lines.geometry.attributes.connection.needsUpdate = true;
        
        // Update the uniforms
        this.lines.material.uniforms.time.value = this.clock.getElapsedTime();
        this.particles.material.uniforms.time.value = this.clock.getElapsedTime();
    }
    
    onWindowResize() {
        // Update camera aspect ratio
        this.camera.aspect = this.container.offsetWidth / this.container.offsetHeight;
        this.camera.updateProjectionMatrix();
        
        // Update renderer size
        this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
    }
    
    onMouseMove(event) {
        // Calculate mouse position in normalized device coordinates
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        // Update mouse position for particle animation
        this.mousePosition.x = this.mouse.x;
        this.mousePosition.y = this.mouse.y;
    }
    
    animate() {
        requestAnimationFrame(this.animate.bind(this));
        
        // Rotate particle system
        this.particles.rotation.x += 0.0005;
        this.particles.rotation.y += 0.001;
        
        // Update particle positions
        const positions = this.particles.geometry.attributes.position.array;
        
        for (let i = 0; i < this.particleCount; i++) {
            const ix = i * 3;
            
            // Extract position
            this.particlePositions[i].x = positions[ix];
            this.particlePositions[i].y = positions[ix + 1];
            this.particlePositions[i].z = positions[ix + 2];
            
            // Mouse proximity effect
            const mouseInfluence = 0.12;
            if (Math.abs(this.mousePosition.x) > 0.1) {
                const distanceFromMouse = Math.sqrt(
                    Math.pow(positions[ix] - this.mousePosition.x * 10, 2) + 
                    Math.pow(positions[ix + 1] - this.mousePosition.y * 5, 2)
                );
                
                if (distanceFromMouse < 3) {
                    positions[ix] += (this.mousePosition.x * 10 - positions[ix]) * mouseInfluence * (3 / distanceFromMouse);
                    positions[ix + 1] += (this.mousePosition.y * 5 - positions[ix + 1]) * mouseInfluence * (3 / distanceFromMouse);
                }
            }
        }
        
        this.particles.geometry.attributes.position.needsUpdate = true;
        
        // Update connections
        this.updateConnections();
        
        // Render
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize after DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const canvasContainer = document.querySelector('.canvas-container');
    
    if (canvasContainer) {
        // Adjust particle count based on device capabilities
        const isMobile = window.innerWidth < 768;
        const isLowPower = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        
        let particleCount = 1500;
        if (isMobile) particleCount = 800;
        if (isLowPower) particleCount = 600;
        
        const particleSystem = new ParticleSystem({
            container: canvasContainer,
            particleCount: particleCount,
            particleSize: window.innerWidth < 768 ? 0.08 : 0.05,
            connectionDistance: window.innerWidth < 768 ? 2 : 1.5,
            baseColor: 0x6e57e0,
            highlightColor: 0x00eeff
        });
    }
}); 