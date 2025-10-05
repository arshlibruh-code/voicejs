// Parametric Equations Visualization
import { Colors } from '../utils/colors.js';

export class ParametricVisualization {
    constructor(canvasManager) {
        this.canvas = canvasManager.getCanvas('parametricCanvas');
        this.time = 0;
    }

    draw(audioLevel = 0, frequencyData = null) {
        this.canvas.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const baseScale = 30;
        
        // Audio controls time speed and creates dynamic changes
        this.time += 0.03 + (audioLevel * 0.05);
        
        // Draw multiple dynamic parametric curves
        for (let curve = 0; curve < 4; curve++) {
            this.canvas.ctx.beginPath();
            const curveOffset = curve * Math.PI / 2;
            const audioScale = 0.5 + (audioLevel * 1.5);
            const rotationSpeed = 0.01 + (audioLevel * 0.02);
            const rotation = this.time * rotationSpeed + curveOffset;
            
            for (let t = 0; t < Math.PI * 6; t += 0.05) {
                let x, y;
                
                // Different dynamic parametric equations
                if (curve === 0) {
                    // Dynamic butterfly with rotation
                    const r = Math.exp(Math.cos(t)) - 2 * Math.cos(4 * t + this.time) - Math.pow(Math.sin(t / 12 + this.time), 5);
                    x = centerX + Math.sin(t + rotation) * r * baseScale * audioScale;
                    y = centerY + Math.cos(t + rotation) * r * baseScale * audioScale;
                } else if (curve === 1) {
                    // Rotating lemniscate
                    const r = 1 / (1 + Math.sin(t + this.time) * Math.sin(t + this.time));
                    x = centerX + Math.cos(t + rotation) * r * baseScale * audioScale;
                    y = centerY + Math.sin(t + rotation) * Math.cos(t + this.time) * r * baseScale * audioScale;
                } else if (curve === 2) {
                    // Audio-reactive rose curve
                    const petals = 3 + Math.floor(audioLevel * 5);
                    const r = Math.cos(petals * t + this.time);
                    x = centerX + Math.cos(t + rotation) * r * baseScale * audioScale;
                    y = centerY + Math.sin(t + rotation) * r * baseScale * audioScale;
                } else {
                    // Spiral with audio influence
                    const spiral = t * (0.5 + audioLevel);
                    const r = spiral * (1 + Math.sin(t * 2 + this.time));
                    x = centerX + Math.cos(t + rotation) * r * baseScale * audioScale;
                    y = centerY + Math.sin(t + rotation) * r * baseScale * audioScale;
                }
                
                if (t === 0) {
                    this.canvas.ctx.moveTo(x, y);
                } else {
                    this.canvas.ctx.lineTo(x, y);
                }
            }
            
            // Dynamic colors based on audio
            const hue = (curve * 90 + this.time * 50) % 360;
            this.canvas.ctx.strokeStyle = curve % 2 === 0 ? Colors.BLUE : Colors.GREEN;
            this.canvas.ctx.lineWidth = 2 + audioLevel * 2;
            this.canvas.ctx.stroke();
        }
        
        // Add center point that pulses with audio
        const pulseSize = 3 + audioLevel * 5;
        this.canvas.ctx.fillStyle = Colors.BLUE;
        this.canvas.ctx.beginPath();
        this.canvas.ctx.arc(centerX, centerY, pulseSize, 0, Math.PI * 2);
        this.canvas.ctx.fill();
        
        // Draw title
        this.canvas.ctx.fillStyle = '#ffffff';
        this.canvas.ctx.font = '14px monospace';
        this.canvas.ctx.textAlign = 'center';
        this.canvas.ctx.fillText('PARAMETRIC', this.canvas.width / 2, 20);
    }

    drawStatic() {
        this.draw(0, null);
    }
}
