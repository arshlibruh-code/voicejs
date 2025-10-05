// Professional Lissajous Oscilloscope - Stereo Waveform Analysis
import { Colors } from '../utils/colors.js';

export class LissajousOscilloscopeVisualization {
    constructor(canvasManager) {
        this.canvas = canvasManager.getCanvas('lissajousOscilloscopeCanvas');
        this.width = 0;
        this.height = 0;
        this.centerX = 0;
        this.centerY = 0;
        this.radius = 0;
        this.traces = [];
        this.maxTraces = 1000;
        this.traceFade = 0.98;
        this.frequency = 0;
        this.phase = 0;
        this.amplitude = 0;
    }

    initialize() {
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;
        this.radius = Math.min(this.width, this.height) / 2 - 30;
        this.traces = [];
    }

    draw(audioLevel = 0, frequencyData = null) {
        if (!frequencyData) return;

        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;
        this.radius = Math.min(this.width, this.height) / 2 - 30;

        // Clear canvas
        this.canvas.ctx.fillStyle = '#000000';
        this.canvas.ctx.fillRect(0, 0, this.width, this.height);

        // Process stereo data
        this.processStereoData(frequencyData);
        
        // Update traces
        this.updateTraces();
        
        // Draw grid
        this.drawGrid();
        
        // Draw traces
        this.drawTraces();
        
        // Draw labels
        this.drawLabels();
    }

    processStereoData(frequencyData) {
        // Split into left and right channels
        const midPoint = Math.floor(frequencyData.length / 2);
        const leftChannel = [];
        const rightChannel = [];
        
        for (let i = 0; i < midPoint; i++) {
            leftChannel.push(frequencyData[i] / 255);
            rightChannel.push(frequencyData[i + midPoint] / 255);
        }
        
        // Calculate Lissajous parameters
        let leftSum = 0, rightSum = 0;
        let leftSqSum = 0, rightSqSum = 0;
        let productSum = 0;
        
        for (let i = 0; i < leftChannel.length; i++) {
            leftSum += leftChannel[i];
            rightSum += rightChannel[i];
            leftSqSum += leftChannel[i] * leftChannel[i];
            rightSqSum += rightChannel[i] * rightChannel[i];
            productSum += leftChannel[i] * rightChannel[i];
        }
        
        const leftMean = leftSum / leftChannel.length;
        const rightMean = rightSum / rightChannel.length;
        
        // Calculate correlation and phase
        const leftVar = (leftSqSum / leftChannel.length) - (leftMean * leftMean);
        const rightVar = (rightSqSum / rightChannel.length) - (rightMean * rightMean);
        const covariance = (productSum / leftChannel.length) - (leftMean * rightMean);
        
        const correlation = Math.sqrt(leftVar * rightVar) > 0 ? 
            covariance / Math.sqrt(leftVar * rightVar) : 0;
        
        this.phase = Math.acos(Math.max(-1, Math.min(1, correlation)));
        this.amplitude = Math.sqrt(leftVar + rightVar);
        
        // Add new trace points
        for (let i = 0; i < 5; i++) {
            const left = leftChannel[Math.floor(Math.random() * leftChannel.length)];
            const right = rightChannel[Math.floor(Math.random() * rightChannel.length)];
            
            this.traces.push({
                x: (left - 0.5) * this.radius * 2,
                y: (right - 0.5) * this.radius * 2,
                age: 0,
                intensity: Math.random() * 0.8 + 0.2,
                color: this.getColorFromPosition(left, right)
            });
        }
        
        if (this.traces.length > this.maxTraces) {
            this.traces = this.traces.slice(-this.maxTraces);
        }
    }

    updateTraces() {
        this.traces = this.traces.filter(trace => {
            trace.age++;
            return trace.age < 200;
        });
    }

    getColorFromPosition(left, right) {
        const angle = Math.atan2(right - 0.5, left - 0.5);
        const distance = Math.sqrt((left - 0.5) ** 2 + (right - 0.5) ** 2);
        
        let hue = (angle + Math.PI) * 180 / Math.PI;
        const saturation = Math.min(distance * 2, 100);
        const lightness = 50 + (distance * 25);
        
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    }

    drawGrid() {
        this.canvas.ctx.strokeStyle = '#333333';
        this.canvas.ctx.lineWidth = 0.5;
        
        // Draw circular grid
        for (let i = 1; i <= 4; i++) {
            const radius = (this.radius / 4) * i;
            this.canvas.ctx.beginPath();
            this.canvas.ctx.arc(this.centerX, this.centerY, radius, 0, Math.PI * 2);
            this.canvas.ctx.stroke();
        }
        
        // Draw crosshairs
        this.canvas.ctx.strokeStyle = '#666666';
        this.canvas.ctx.lineWidth = 1;
        
        // Horizontal line
        this.canvas.ctx.beginPath();
        this.canvas.ctx.moveTo(this.centerX - this.radius, this.centerY);
        this.canvas.ctx.lineTo(this.centerX + this.radius, this.centerY);
        this.canvas.ctx.stroke();
        
        // Vertical line
        this.canvas.ctx.beginPath();
        this.canvas.ctx.moveTo(this.centerX, this.centerY - this.radius);
        this.canvas.ctx.lineTo(this.centerX, this.centerY + this.radius);
        this.canvas.ctx.stroke();
        
        // Diagonal lines
        this.canvas.ctx.strokeStyle = '#444444';
        this.canvas.ctx.lineWidth = 0.5;
        
        const diagonal = this.radius * 0.707;
        this.canvas.ctx.beginPath();
        this.canvas.ctx.moveTo(this.centerX - diagonal, this.centerY - diagonal);
        this.canvas.ctx.lineTo(this.centerX + diagonal, this.centerY + diagonal);
        this.canvas.ctx.stroke();
        
        this.canvas.ctx.beginPath();
        this.canvas.ctx.moveTo(this.centerX + diagonal, this.centerY - diagonal);
        this.canvas.ctx.lineTo(this.centerX - diagonal, this.centerY + diagonal);
        this.canvas.ctx.stroke();
    }

    drawTraces() {
        // Draw trace lines
        this.canvas.ctx.strokeStyle = '#00ff00';
        this.canvas.ctx.lineWidth = 1;
        this.canvas.ctx.beginPath();
        
        for (let i = 0; i < this.traces.length - 1; i++) {
            const trace1 = this.traces[i];
            const trace2 = this.traces[i + 1];
            
            const alpha1 = 1 - (trace1.age / 200);
            const alpha2 = 1 - (trace2.age / 200);
            
            if (alpha1 > 0 && alpha2 > 0) {
                this.canvas.ctx.globalAlpha = (alpha1 + alpha2) / 2;
                this.canvas.ctx.moveTo(
                    this.centerX + trace1.x,
                    this.centerY + trace1.y
                );
                this.canvas.ctx.lineTo(
                    this.centerX + trace2.x,
                    this.centerY + trace2.y
                );
            }
        }
        this.canvas.ctx.stroke();
        this.canvas.ctx.globalAlpha = 1;
        
        // Draw trace points
        for (const trace of this.traces) {
            const alpha = 1 - (trace.age / 200);
            const size = 2 * alpha * trace.intensity;
            
            this.canvas.ctx.fillStyle = trace.color;
            this.canvas.ctx.globalAlpha = alpha;
            
            this.canvas.ctx.beginPath();
            this.canvas.ctx.arc(
                this.centerX + trace.x,
                this.centerY + trace.y,
                size,
                0,
                Math.PI * 2
            );
            this.canvas.ctx.fill();
        }
        
        this.canvas.ctx.globalAlpha = 1;
    }

    drawLabels() {
        this.canvas.ctx.fillStyle = '#ffffff';
        this.canvas.ctx.font = '14px monospace';
        this.canvas.ctx.textAlign = 'center';
        this.canvas.ctx.fillText('LISSAJOUS OSCILLOSCOPE', this.width / 2, 20);
        
        // Channel labels
        this.canvas.ctx.fillStyle = '#888888';
        this.canvas.ctx.font = '12px monospace';
        this.canvas.ctx.fillText('L', this.centerX - this.radius - 20, this.centerY + 3);
        this.canvas.ctx.fillText('R', this.centerX + this.radius + 20, this.centerY + 3);
        this.canvas.ctx.fillText('L', this.centerX - 3, this.centerY - this.radius - 10);
        this.canvas.ctx.fillText('R', this.centerX - 3, this.centerY + this.radius + 20);
        
        // Phase and amplitude info
        this.canvas.ctx.fillStyle = '#00ff00';
        this.canvas.ctx.font = '10px monospace';
        this.canvas.ctx.textAlign = 'left';
        this.canvas.ctx.fillText(`Phase: ${(this.phase * 180 / Math.PI).toFixed(1)}°`, 10, this.height - 30);
        this.canvas.ctx.fillText(`Amplitude: ${this.amplitude.toFixed(3)}`, 10, this.height - 15);
        
        // Pattern type
        let patternType = 'Random';
        if (this.phase < Math.PI / 4) patternType = 'Linear';
        else if (this.phase < Math.PI / 2) patternType = 'Elliptical';
        else if (this.phase < 3 * Math.PI / 4) patternType = 'Circular';
        else patternType = 'Figure-8';
        
        this.canvas.ctx.fillText(`Pattern: ${patternType}`, 10, this.height - 45);
    }

    drawStatic() {
        this.canvas.ctx.fillStyle = '#000000';
        this.canvas.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.drawGrid();
        this.drawLabels();
        
        // Draw a single point in the center
        this.canvas.ctx.fillStyle = '#333333';
        this.canvas.ctx.beginPath();
        this.canvas.ctx.arc(this.centerX, this.centerY, 2, 0, Math.PI * 2);
        this.canvas.ctx.fill();
    }
}
