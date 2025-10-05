// Cardioid (Heart-shaped) Visualization
import { Colors } from '../utils/colors.js';

export class CardioidVisualization {
    constructor(canvasManager) {
        this.canvas = canvasManager.getCanvas('cardioidCanvas');
        this.angle = 0;
    }

    draw(audioLevel = 0, frequencyData = null) {
        this.canvas.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const baseRadius = 60;
        const audioRadius = baseRadius + (audioLevel * 40);
        
        // Audio controls rotation
        this.angle += 0.01 + (audioLevel * 0.03);
        
        // Draw cardioid
        this.canvas.ctx.beginPath();
        for (let t = 0; t < Math.PI * 2; t += 0.1) {
            const r = audioRadius * (1 + Math.cos(t + this.angle));
            const x = centerX + r * Math.cos(t);
            const y = centerY + r * Math.sin(t);
            
            if (t === 0) {
                this.canvas.ctx.moveTo(x, y);
            } else {
                this.canvas.ctx.lineTo(x, y);
            }
        }
        
        this.canvas.ctx.strokeStyle = Colors.BLUE;
        this.canvas.ctx.lineWidth = 3;
        this.canvas.ctx.stroke();
        
        // Draw center circle
        this.canvas.ctx.fillStyle = Colors.GREEN;
        this.canvas.ctx.beginPath();
        this.canvas.ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
        this.canvas.ctx.fill();
        
        // Draw title
        this.canvas.ctx.fillStyle = '#ffffff';
        this.canvas.ctx.font = '14px monospace';
        this.canvas.ctx.textAlign = 'center';
        this.canvas.ctx.fillText('CARDIOID', this.canvas.width / 2, 20);
    }

    drawStatic() {
        this.draw(0, null);
    }
}
