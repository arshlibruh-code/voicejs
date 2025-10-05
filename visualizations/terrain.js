// 3D Terrain Visualization
export class TerrainVisualization {
    constructor(canvasManager) {
        this.canvas = null; // Terrain uses a div, not canvas
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.mesh = null;
        this.rotation = 0;
        this.initialized = false;
    }

    initialize() {
        if (this.initialized) return;
        
        // Get the terrain container
        const container = document.getElementById('terrainContainer');
        if (!container) return;
        
        // Initialize Three.js
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(400, 400);
        this.renderer.setClearColor(0x000000);
        container.appendChild(this.renderer.domElement);
        
        // Create terrain geometry with proper initialization
        const geometry = new THREE.PlaneGeometry(100, 100, 20, 20);
        
        // Initialize vertices with proper values to avoid NaN
        const vertices = geometry.attributes.position.array;
        for (let i = 0; i < vertices.length; i += 3) {
            vertices[i + 2] = 0; // Initialize z (height) to 0
        }
        geometry.attributes.position.needsUpdate = true;
        
        const material = new THREE.MeshBasicMaterial({
            wireframe: true,
            color: 0x089BDF
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.scene.add(this.mesh);
        
        // Position camera
        this.camera.position.set(20, 10, 100);
        this.camera.lookAt(0, 0, 0);
        
        // Add lighting
        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(0, 100, 50);
        this.scene.add(light);
        
        this.initialized = true;
    }

    draw(audioLevel = 0, frequencyData = null) {
        if (!this.initialized) {
            this.initialize();
            return;
        }
        
        if (!this.mesh) return;
        
        // Rotate the terrain
        this.rotation += 0.005;
        this.mesh.rotation.y = this.rotation;
        this.mesh.rotation.x = 0.1 + (audioLevel * 0.3);
        this.mesh.rotation.z = audioLevel * 0.2;
        
        // Modify terrain based on audio
        if (frequencyData && frequencyData.length > 0) {
            const vertices = this.mesh.geometry.attributes.position.array;
            for (let i = 0; i < vertices.length; i += 3) {
                const x = vertices[i];
                const y = vertices[i + 1];
                
                // Base terrain using sine/cosine
                let height = Math.sin(x * 0.1) * Math.cos(y * 0.1) * 10;
                
                // Add audio influence safely
                const audioIndex = Math.floor(Math.abs((x + y + 50) / 5)) % frequencyData.length;
                const audioValue = frequencyData[audioIndex] || 0;
                const audioInfluence = (audioValue / 255) * audioLevel * 20;
                height += audioInfluence;
                
                // Add time-based animation
                const time = Date.now() * 0.001;
                height += Math.sin(time + x * 0.1) * 2;
                
                // Ensure height is a valid number
                vertices[i + 2] = isNaN(height) ? 0 : height;
            }
            
            this.mesh.geometry.attributes.position.needsUpdate = true;
        }
        
        this.renderer.render(this.scene, this.camera);
    }

    drawStatic() {
        if (!this.initialized) {
            this.initialize();
            return;
        }
        
        if (!this.mesh) return;
        
        // Static rotation
        this.rotation += 0.005;
        this.mesh.rotation.y = this.rotation;
        this.mesh.rotation.x = 0.1;
        this.mesh.rotation.z = 0;
        
        this.renderer.render(this.scene, this.camera);
        
        // Draw title (2D overlay)
        const canvas = this.canvas.canvas;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('3D TERRAIN', canvas.width / 2, 20);
    }
}
