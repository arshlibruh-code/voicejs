// Particle System Visualization
import { Colors } from '../utils/colors.js';

export class ParticlesVisualization {
    constructor(canvasManager) {
        this.canvas = canvasManager.getCanvas('particleCanvas');
    }

    draw(audioLevel = 0, frequencyData = null) {
        this.canvas.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (!frequencyData) return;
        
        for (let i = 0; i < frequencyData.length; i += 4) {
            const x = (i / frequencyData.length) * this.canvas.width;
            const y = this.canvas.height / 2 + (frequencyData[i] / 255 - 0.5) * 100;
            const size = (frequencyData[i] / 255) * 10;
            const lightness = 40 + (frequencyData[i] / 255) * 40; // Vary lightness based on audio intensity
            
            this.canvas.ctx.fillStyle = `hsl(120, 70%, ${lightness}%)`;
            this.canvas.ctx.beginPath();
            this.canvas.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.canvas.ctx.fill();
        }
        
        // Draw title
        this.canvas.ctx.fillStyle = '#ffffff';
        this.canvas.ctx.font = '14px monospace';
        this.canvas.ctx.textAlign = 'center';
        this.canvas.ctx.fillText('PARTICLE SYSTEM', this.canvas.width / 2, 20);
    }

    drawStatic() {
        this.draw(0, null);
    }
}
