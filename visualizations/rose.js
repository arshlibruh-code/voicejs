// Rose Curves Visualization
import { Colors } from '../utils/colors.js';

export class RoseVisualization {
    constructor(canvasManager) {
        this.canvas = canvasManager.getCanvas('roseCanvas');
    }

    draw(audioLevel = 0, frequencyData = null) {
        this.canvas.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (!frequencyData) return;
        
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const amplitude = 50 + (audioLevel * 80);
        const petalCount = 3 + Math.floor(audioLevel * 8);
        
        // Draw multiple rose curves
        for (let curve = 0; curve < 3; curve++) {
            this.canvas.ctx.beginPath();
            const curveAmplitude = amplitude * (0.5 + curve * 0.3);
            const curvePetalCount = petalCount + curve;
            const curveOffset = curve * 0.3;
            
            for (let angle = 0; angle < Math.PI * 4; angle += 0.1) {
                const radius = curveAmplitude * Math.cos(curvePetalCount * angle + curveOffset);
                const x = centerX + radius * Math.cos(angle);
                const y = centerY + radius * Math.sin(angle);
                
                if (angle === 0) {
                    this.canvas.ctx.moveTo(x, y);
                } else {
                    this.canvas.ctx.lineTo(x, y);
                }
            }
            
            this.canvas.ctx.closePath();
            
            // Alternate colors
            if (curve === 0 || curve === 2) {
                this.canvas.ctx.strokeStyle = Colors.BLUE;
            } else {
                this.canvas.ctx.strokeStyle = Colors.GREEN;
            }
            
            this.canvas.ctx.lineWidth = 2;
            this.canvas.ctx.stroke();
        }
        
        // Draw center point
        this.canvas.ctx.fillStyle = Colors.GREEN;
        this.canvas.ctx.beginPath();
        this.canvas.ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
        this.canvas.ctx.fill();
        
        // Draw title
        this.canvas.ctx.fillStyle = '#ffffff';
        this.canvas.ctx.font = '14px monospace';
        this.canvas.ctx.textAlign = 'center';
        this.canvas.ctx.fillText('ROSE CURVES', this.canvas.width / 2, 20);
    }

    drawStatic() {
        this.draw(0, null);
    }
}
