// Voronoi Cells Visualization
import { Colors } from '../utils/colors.js';

export class VoronoiVisualization {
    constructor(canvasManager) {
        this.canvas = canvasManager.getCanvas('voronoiCanvas');
        this.points = [];
        this.initializePoints();
    }

    initializePoints() {
        // Create initial seed points
        this.points = [];
        const numPoints = 15;
        
        for (let i = 0; i < numPoints; i++) {
            this.points.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                color: Math.random() > 0.5 ? Colors.BLUE : Colors.GREEN
            });
        }
    }

    draw(audioLevel = 0, frequencyData = null) {
        this.canvas.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Simple audio influence - just push points around
        this.points.forEach((point, index) => {
            if (audioLevel > 0.1) {
                // Simple push based on audio
                const push = audioLevel * 2;
                point.vx += (Math.random() - 0.5) * push;
                point.vy += (Math.random() - 0.5) * push;
            }
            
            // Update position
            point.x += point.vx;
            point.y += point.vy;
            
            // Keep points in bounds
            point.x = Math.max(10, Math.min(this.canvas.width - 10, point.x));
            point.y = Math.max(10, Math.min(this.canvas.height - 10, point.y));
            
            // Simple damping
            point.vx *= 0.95;
            point.vy *= 0.95;
        });
        
        // Draw simple Voronoi cells
        this.drawSimpleVoronoi();
    }

    drawSimpleVoronoi() {
        // Draw simple Voronoi cells using circles around each point
        this.points.forEach((point, index) => {
            // Find the radius to the nearest other point
            let minRadius = Infinity;
            for (let i = 0; i < this.points.length; i++) {
                if (i !== index) {
                    const dist = this.distance(point.x, point.y, this.points[i].x, this.points[i].y);
                    minRadius = Math.min(minRadius, dist / 2);
                }
            }
            
            // Draw cell as a circle
            this.canvas.ctx.fillStyle = point.color;
            this.canvas.ctx.beginPath();
            this.canvas.ctx.arc(point.x, point.y, minRadius, 0, Math.PI * 2);
            this.canvas.ctx.fill();
            
            // Draw point
            this.canvas.ctx.fillStyle = 'white';
            this.canvas.ctx.beginPath();
            this.canvas.ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
            this.canvas.ctx.fill();
        });
        
        // Draw title
        this.canvas.ctx.fillStyle = '#ffffff';
        this.canvas.ctx.font = '14px monospace';
        this.canvas.ctx.textAlign = 'center';
        this.canvas.ctx.fillText('VORONOI CELLS', this.canvas.width / 2, 20);
    }

    distance(x1, y1, x2, y2) {
        return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
    }

    drawStatic() {
        this.draw(0, null);
    }
}
