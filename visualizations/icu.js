// ICU Monitor Visualization
import { Colors } from '../utils/colors.js';

export class ICUVisualization {
    constructor(canvasManager) {
        this.canvas = canvasManager.getCanvas('icuCanvas');
        this.history = [];
        this.maxHistory = 200;
    }

    draw(audioLevel = 0, frequencyData = null) {
        this.canvas.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Add current audio level to history
        this.history.push(audioLevel);
        if (this.history.length > this.maxHistory) {
            this.history.shift();
        }
        
        // Draw grid lines
        this.canvas.ctx.strokeStyle = 'rgba(0, 255, 0, 0.1)';
        this.canvas.ctx.lineWidth = 1;
        
        // Horizontal grid lines
        for (let i = 0; i <= 10; i++) {
            const y = (this.canvas.height / 10) * i;
            this.canvas.ctx.beginPath();
            this.canvas.ctx.moveTo(0, y);
            this.canvas.ctx.lineTo(this.canvas.width, y);
            this.canvas.ctx.stroke();
        }
        
        // Vertical grid lines
        for (let i = 0; i <= 20; i++) {
            const x = (this.canvas.width / 20) * i;
            this.canvas.ctx.beginPath();
            this.canvas.ctx.moveTo(x, 0);
            this.canvas.ctx.lineTo(x, this.canvas.height);
            this.canvas.ctx.stroke();
        }
        
        // Draw current level indicator (horizontal line) in blue behind the graph
        const currentY = this.canvas.height - (audioLevel * this.canvas.height);
        this.canvas.ctx.strokeStyle = 'rgba(8, 155, 223, 0.5)'; // Blue with 50% opacity
        this.canvas.ctx.lineWidth = 3;
        this.canvas.ctx.beginPath();
        this.canvas.ctx.moveTo(0, currentY);
        this.canvas.ctx.lineTo(this.canvas.width, currentY);
        this.canvas.ctx.stroke();
        
        // Draw waveform on top
        if (this.history.length > 1) {
            this.canvas.ctx.strokeStyle = Colors.GREEN;
            this.canvas.ctx.lineWidth = 2;
            this.canvas.ctx.beginPath();
            
            for (let i = 0; i < this.history.length; i++) {
                const x = (i / (this.history.length - 1)) * this.canvas.width;
                const y = this.canvas.height - (this.history[i] * this.canvas.height);
                
                if (i === 0) this.canvas.ctx.moveTo(x, y);
                else this.canvas.ctx.lineTo(x, y);
            }
            
            this.canvas.ctx.stroke();
        }
        
        // Draw title
        this.canvas.ctx.fillStyle = '#ffffff';
        this.canvas.ctx.font = '14px monospace';
        this.canvas.ctx.textAlign = 'center';
        this.canvas.ctx.fillText('ICU MONITOR', this.canvas.width / 2, 20);
    }

    drawStatic() {
        this.draw(0, null);
    }
}
