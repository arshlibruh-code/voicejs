// Phyllotaxis (Fibonacci Spirals) Visualization
import { Colors } from '../utils/colors.js';

export class PhyllotaxisVisualization {
    constructor(canvasManager) {
        this.canvas = canvasManager.getCanvas('phyllotaxisCanvas');
        this.goldenAngle = Math.PI * (3 - Math.sqrt(5)); // Golden angle
    }

    draw(audioLevel = 0, frequencyData = null) {
        this.canvas.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const maxRadius = Math.min(centerX, centerY) - 20;
        
        // Audio controls how many dots to show - 2x more dots!
        const maxDots = 400 + Math.floor(audioLevel * 600);
        
        for (let i = 0; i < maxDots; i++) {
            const angle = i * this.goldenAngle;
            const radius = Math.sqrt(i) * 4; // 2x bigger radius
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            
            // Alternate colors
            this.canvas.ctx.fillStyle = i % 2 === 0 ? Colors.BLUE : Colors.GREEN;
            this.canvas.ctx.beginPath();
            this.canvas.ctx.arc(x, y, 3, 0, Math.PI * 2); // Slightly bigger dots
            this.canvas.ctx.fill();
        }
        
        // Draw title
        this.canvas.ctx.fillStyle = '#ffffff';
        this.canvas.ctx.font = '14px monospace';
        this.canvas.ctx.textAlign = 'center';
        this.canvas.ctx.fillText('PHYLLOTAXIS', this.canvas.width / 2, 20);
    }

    drawStatic() {
        this.draw(0, null);
    }
}
