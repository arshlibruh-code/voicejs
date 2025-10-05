// Connected Points Visualization
import { Colors } from '../utils/colors.js';

export class ConnectedVisualization {
    constructor(canvasManager) {
        this.canvas = canvasManager.getCanvas('connectedCanvas');
        this.points = [];
        this.initializePoints();
    }

    initializePoints() {
        this.points = [];
        for (let i = 0; i < 20; i++) {
            this.points.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5
            });
        }
    }

    draw(audioLevel = 0, frequencyData = null) {
        this.canvas.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update point positions
        this.points.forEach(point => {
            point.x += point.vx;
            point.y += point.vy;
            
            // Bounce off edges
            if (point.x < 0 || point.x > this.canvas.width) point.vx *= -1;
            if (point.y < 0 || point.y > this.canvas.height) point.vy *= -1;
            
            // Keep points in bounds
            point.x = Math.max(0, Math.min(this.canvas.width, point.x));
            point.y = Math.max(0, Math.min(this.canvas.height, point.y));
        });
        
        // Draw connections when audio is detected
        if (audioLevel > 0.1) {
            this.canvas.ctx.strokeStyle = Colors.GREEN;
            this.canvas.ctx.lineWidth = 1;
            
            for (let i = 0; i < this.points.length; i++) {
                for (let j = i + 1; j < this.points.length; j++) {
                    const distance = Math.sqrt(
                        (this.points[i].x - this.points[j].x) ** 2 + 
                        (this.points[i].y - this.points[j].y) ** 2
                    );
                    
                    if (distance < 100) {
                        this.canvas.ctx.beginPath();
                        this.canvas.ctx.moveTo(this.points[i].x, this.points[i].y);
                        this.canvas.ctx.lineTo(this.points[j].x, this.points[j].y);
                        this.canvas.ctx.stroke();
                    }
                }
            }
        }
        
        // Draw points
        this.points.forEach(point => {
            this.canvas.ctx.fillStyle = Colors.BLUE;
            this.canvas.ctx.beginPath();
            this.canvas.ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
            this.canvas.ctx.fill();
        });
        
        // Draw title
        this.canvas.ctx.fillStyle = '#ffffff';
        this.canvas.ctx.font = '14px monospace';
        this.canvas.ctx.textAlign = 'center';
        this.canvas.ctx.fillText('CONNECTED POINTS', this.canvas.width / 2, 20);
    }

    drawStatic() {
        this.draw(0, null);
    }
}
