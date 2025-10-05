// Circular Wave Visualization
import { Colors } from '../utils/colors.js';

export class CircularVisualization {
    constructor(canvasManager) {
        this.canvas = canvasManager.getCanvas('circularCanvas');
    }

    draw(audioLevel = 0, frequencyData = null) {
        this.canvas.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (!frequencyData) return;
        
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const maxRadius = Math.min(centerX, centerY) - 30;
        
        // Create single circular wave with blue stroke
        this.canvas.ctx.beginPath();
        const ringRadius = maxRadius * 0.5;
        const ringIntensity = audioLevel;
        
        for (let i = 0; i < frequencyData.length; i++) {
            const angle = (i / frequencyData.length) * Math.PI * 2;
            const frequencyIntensity = frequencyData[i] / 255;
            const radius = ringRadius + (frequencyIntensity * ringIntensity * 40);
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            
            if (i === 0) this.canvas.ctx.moveTo(x, y);
            else this.canvas.ctx.lineTo(x, y);
        }
        
        this.canvas.ctx.closePath();
        this.canvas.ctx.strokeStyle = Colors.BLUE;
        this.canvas.ctx.lineWidth = 2 + ringIntensity * 3;
        this.canvas.ctx.stroke();
        
        // Draw title
        this.canvas.ctx.fillStyle = '#ffffff';
        this.canvas.ctx.font = '14px monospace';
        this.canvas.ctx.textAlign = 'center';
        this.canvas.ctx.fillText('CIRCULAR WAVE', this.canvas.width / 2, 20);
    }

    drawStatic() {
        this.draw(0, null);
    }
}
