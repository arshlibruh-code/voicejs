// Lissajous Curves Visualization
import { Colors } from '../utils/colors.js';

export class LissajousVisualization {
    constructor(canvasManager) {
        this.canvas = canvasManager.getCanvas('lissajousCanvas');
        this.time = 0;
    }

    draw(audioLevel = 0, frequencyData = null) {
        this.canvas.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const amplitude = 80;
        
        // Audio-reactive frequency ratios
        const freqX = 2 + audioLevel * 3;
        const freqY = 3 + audioLevel * 2;
        
        this.time += 0.02 + audioLevel * 0.03;
        
        // Draw multiple Lissajous curves
        for (let curve = 0; curve < 3; curve++) {
            this.canvas.ctx.beginPath();
            const curveAmplitude = amplitude * (0.6 + curve * 0.2);
            const curveFreqX = freqX + curve * 0.5;
            const curveFreqY = freqY + curve * 0.3;
            const curveOffset = curve * Math.PI / 3;
            
            for (let t = 0; t < Math.PI * 4; t += 0.1) {
                const x = centerX + curveAmplitude * Math.sin(curveFreqX * t + this.time + curveOffset);
                const y = centerY + curveAmplitude * Math.sin(curveFreqY * t + this.time + curveOffset);
                
                if (t === 0) this.canvas.ctx.moveTo(x, y);
                else this.canvas.ctx.lineTo(x, y);
            }
            
            this.canvas.ctx.strokeStyle = curve % 2 === 0 ? Colors.BLUE : Colors.GREEN;
            this.canvas.ctx.lineWidth = 2;
            this.canvas.ctx.stroke();
        }
        
        // Draw title
        this.canvas.ctx.fillStyle = '#ffffff';
        this.canvas.ctx.font = '14px monospace';
        this.canvas.ctx.textAlign = 'center';
        this.canvas.ctx.fillText('LISSAJOUS CURVES', this.canvas.width / 2, 20);
    }

    drawStatic() {
        this.draw(0, null);
    }
}
