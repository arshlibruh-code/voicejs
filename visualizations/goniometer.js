// Professional Goniometer - Stereo Field Analyzer
import { Colors } from '../utils/colors.js';

export class GoniometerVisualization {
    constructor(canvasManager) {
        this.canvas = canvasManager.getCanvas('goniometerCanvas');
        this.width = 0;
        this.height = 0;
        this.centerX = 0;
        this.centerY = 0;
        this.radius = 0;
        this.points = [];
        this.maxPoints = 500;
        this.fadeTime = 3000;
        this.correlation = 0;
        this.stereoWidth = 0;
    }

    initialize() {
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;
        this.radius = Math.min(this.width, this.height) / 2 - 30;
        this.points = [];
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
        
        // Update points
        this.updatePoints();
        
        // Draw grid
        this.drawGrid();
        
        // Draw points
        this.drawPoints();
        
        // Draw correlation meter
        this.drawCorrelationMeter();
        
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
        
        // Calculate correlation
        let correlationSum = 0;
        let count = 0;
        
        for (let i = 0; i < leftChannel.length; i++) {
            if (leftChannel[i] > 0.1 || rightChannel[i] > 0.1) {
                correlationSum += leftChannel[i] * rightChannel[i];
                count++;
            }
        }
        
        this.correlation = count > 0 ? correlationSum / count : 0;
        
        // Calculate stereo width
        let leftSum = 0, rightSum = 0;
        for (let i = 0; i < leftChannel.length; i++) {
            leftSum += leftChannel[i];
            rightSum += rightChannel[i];
        }
        
        this.stereoWidth = Math.abs(leftSum - rightSum) / (leftSum + rightSum + 0.001);
        
        // Add points to goniometer
        for (let i = 0; i < 5; i++) {
            const left = leftChannel[Math.floor(Math.random() * leftChannel.length)];
            const right = rightChannel[Math.floor(Math.random() * rightChannel.length)];
            
            this.points.push({
                x: (left - right) * this.radius,
                y: (left + right) * this.radius,
                age: 0,
                intensity: Math.random() * 0.8 + 0.2,
                color: this.getColorFromPosition(left, right)
            });
        }
        
        if (this.points.length > this.maxPoints) {
            this.points = this.points.slice(-this.maxPoints);
        }
    }

    updatePoints() {
        this.points = this.points.filter(point => {
            point.age += 16;
            return point.age < this.fadeTime;
        });
    }

    getColorFromPosition(left, right) {
        const angle = Math.atan2(left - right, left + right);
        const distance = Math.sqrt(left * left + right * right);
        
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
        
        // Draw diagonal lines
        this.canvas.ctx.strokeStyle = '#666666';
        this.canvas.ctx.lineWidth = 1;
        
        // Main diagonal lines
        this.canvas.ctx.beginPath();
        this.canvas.ctx.moveTo(this.centerX - this.radius, this.centerY - this.radius);
        this.canvas.ctx.lineTo(this.centerX + this.radius, this.centerY + this.radius);
        this.canvas.ctx.stroke();
        
        this.canvas.ctx.beginPath();
        this.canvas.ctx.moveTo(this.centerX + this.radius, this.centerY - this.radius);
        this.canvas.ctx.lineTo(this.centerX - this.radius, this.centerY + this.radius);
        this.canvas.ctx.stroke();
        
        // Center cross
        this.canvas.ctx.beginPath();
        this.canvas.ctx.moveTo(this.centerX - this.radius, this.centerY);
        this.canvas.ctx.lineTo(this.centerX + this.radius, this.centerY);
        this.canvas.ctx.stroke();
        
        this.canvas.ctx.beginPath();
        this.canvas.ctx.moveTo(this.centerX, this.centerY - this.radius);
        this.canvas.ctx.lineTo(this.centerX, this.centerY + this.radius);
        this.canvas.ctx.stroke();
    }

    drawPoints() {
        for (const point of this.points) {
            const alpha = 1 - (point.age / this.fadeTime);
            const size = 2 * alpha * point.intensity;
            
            this.canvas.ctx.fillStyle = point.color;
            this.canvas.ctx.globalAlpha = alpha;
            
            this.canvas.ctx.beginPath();
            this.canvas.ctx.arc(
                this.centerX + point.x,
                this.centerY + point.y,
                size,
                0,
                Math.PI * 2
            );
            this.canvas.ctx.fill();
        }
        
        this.canvas.ctx.globalAlpha = 1;
    }

    drawCorrelationMeter() {
        const meterWidth = 100;
        const meterHeight = 20;
        const meterX = this.width - meterWidth - 10;
        const meterY = 10;
        
        // Background
        this.canvas.ctx.fillStyle = '#333333';
        this.canvas.ctx.fillRect(meterX, meterY, meterWidth, meterHeight);
        
        // Correlation bar
        const correlationWidth = (this.correlation + 1) / 2 * meterWidth;
        const correlationColor = this.correlation > 0 ? '#00ff00' : '#ff0000';
        
        this.canvas.ctx.fillStyle = correlationColor;
        this.canvas.ctx.fillRect(meterX, meterY, correlationWidth, meterHeight);
        
        // Center line
        this.canvas.ctx.strokeStyle = '#ffffff';
        this.canvas.ctx.lineWidth = 1;
        this.canvas.ctx.beginPath();
        this.canvas.ctx.moveTo(meterX + meterWidth / 2, meterY);
        this.canvas.ctx.lineTo(meterX + meterWidth / 2, meterY + meterHeight);
        this.canvas.ctx.stroke();
        
        // Labels
        this.canvas.ctx.fillStyle = '#ffffff';
        this.canvas.ctx.font = '10px monospace';
        this.canvas.ctx.textAlign = 'center';
        this.canvas.ctx.fillText('Correlation', meterX + meterWidth / 2, meterY - 5);
        this.canvas.ctx.fillText(`${this.correlation.toFixed(2)}`, meterX + meterWidth / 2, meterY + meterHeight + 15);
    }

    drawLabels() {
        this.canvas.ctx.fillStyle = '#888888';
        this.canvas.ctx.font = '12px monospace';
        this.canvas.ctx.textAlign = 'center';
        
        // Channel labels
        this.canvas.ctx.fillText('L', this.centerX - this.radius - 20, this.centerY + 3);
        this.canvas.ctx.fillText('R', this.centerX + this.radius + 20, this.centerY + 3);
        this.canvas.ctx.fillText('L', this.centerX - 3, this.centerY - this.radius - 10);
        this.canvas.ctx.fillText('R', this.centerX - 3, this.centerY + this.radius + 20);
        
        // Title
        this.canvas.ctx.fillStyle = '#ffffff';
        this.canvas.ctx.font = '14px monospace';
        this.canvas.ctx.fillText('GONOMETER', this.centerX, 20);
        
        // Stereo width
        this.canvas.ctx.fillStyle = '#00ff00';
        this.canvas.ctx.font = '10px monospace';
        this.canvas.ctx.fillText(`Width: ${(this.stereoWidth * 100).toFixed(1)}%`, this.centerX, this.height - 10);
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
