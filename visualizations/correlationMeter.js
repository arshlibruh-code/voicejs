// Professional Correlation Meter - Phase Analysis
import { Colors } from '../utils/colors.js';

export class CorrelationMeterVisualization {
    constructor(canvasManager) {
        this.canvas = canvasManager.getCanvas('correlationMeterCanvas');
        this.width = 0;
        this.height = 0;
        this.correlation = 0;
        this.correlationHistory = [];
        this.maxHistory = 200;
        this.peakCorrelation = 0;
        this.peakHoldTime = 1000;
        this.lastPeakUpdate = 0;
    }

    initialize() {
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.correlationHistory = Array(this.maxHistory).fill(0);
    }

    draw(audioLevel = 0, frequencyData = null) {
        if (!frequencyData) return;

        this.width = this.canvas.width;
        this.height = this.canvas.height;

        // Clear canvas
        this.canvas.ctx.fillStyle = '#000000';
        this.canvas.ctx.fillRect(0, 0, this.width, this.height);

        // Process correlation data
        this.processCorrelationData(frequencyData);
        
        // Update history
        this.updateCorrelationHistory();
        
        // Draw grid
        this.drawGrid();
        
        // Draw correlation meter
        this.drawCorrelationMeter();
        
        // Draw history graph
        this.drawHistoryGraph();
        
        // Draw labels
        this.drawLabels();
    }

    processCorrelationData(frequencyData) {
        // Split into left and right channels
        const midPoint = Math.floor(frequencyData.length / 2);
        const leftChannel = [];
        const rightChannel = [];
        
        for (let i = 0; i < midPoint; i++) {
            leftChannel.push(frequencyData[i] / 255);
            rightChannel.push(frequencyData[i + midPoint] / 255);
        }
        
        // Calculate correlation coefficient
        let leftSum = 0, rightSum = 0, leftSqSum = 0, rightSqSum = 0, productSum = 0;
        let count = 0;
        
        for (let i = 0; i < leftChannel.length; i++) {
            if (leftChannel[i] > 0.01 || rightChannel[i] > 0.01) {
                leftSum += leftChannel[i];
                rightSum += rightChannel[i];
                leftSqSum += leftChannel[i] * leftChannel[i];
                rightSqSum += rightChannel[i] * rightChannel[i];
                productSum += leftChannel[i] * rightChannel[i];
                count++;
            }
        }
        
        if (count > 0) {
            const leftMean = leftSum / count;
            const rightMean = rightSum / count;
            const leftVar = (leftSqSum / count) - (leftMean * leftMean);
            const rightVar = (rightSqSum / count) - (rightMean * rightMean);
            const covariance = (productSum / count) - (leftMean * rightMean);
            
            const denominator = Math.sqrt(leftVar * rightVar);
            this.correlation = denominator > 0 ? covariance / denominator : 0;
        } else {
            this.correlation = 0;
        }
        
        // Clamp correlation to [-1, 1]
        this.correlation = Math.max(-1, Math.min(1, this.correlation));
    }

    updateCorrelationHistory() {
        this.correlationHistory.push(this.correlation);
        if (this.correlationHistory.length > this.maxHistory) {
            this.correlationHistory.shift();
        }
        
        // Update peak correlation
        const now = Date.now();
        if (now - this.lastPeakUpdate > 16) {
            if (Math.abs(this.correlation) > Math.abs(this.peakCorrelation)) {
                this.peakCorrelation = this.correlation;
            } else {
                this.peakCorrelation *= 0.95; // Decay peak
            }
            this.lastPeakUpdate = now;
        }
    }

    drawGrid() {
        this.canvas.ctx.strokeStyle = '#333333';
        this.canvas.ctx.lineWidth = 0.5;
        
        // Horizontal grid lines
        for (let i = -1; i <= 1; i += 0.5) {
            const y = this.height / 2 - (i * this.height / 2);
            this.canvas.ctx.beginPath();
            this.canvas.ctx.moveTo(0, y);
            this.canvas.ctx.lineTo(this.width, y);
            this.canvas.ctx.stroke();
        }
        
        // Vertical grid lines
        for (let i = 0; i <= 10; i++) {
            const x = (i / 10) * this.width;
            this.canvas.ctx.beginPath();
            this.canvas.ctx.moveTo(x, 0);
            this.canvas.ctx.lineTo(x, this.height);
            this.canvas.ctx.stroke();
        }
        
        // Center line
        this.canvas.ctx.strokeStyle = '#666666';
        this.canvas.ctx.lineWidth = 1;
        this.canvas.ctx.beginPath();
        this.canvas.ctx.moveTo(0, this.height / 2);
        this.canvas.ctx.lineTo(this.width, this.height / 2);
        this.canvas.ctx.stroke();
    }

    drawCorrelationMeter() {
        const meterHeight = 40;
        const meterY = 20;
        const meterWidth = this.width - 40;
        const meterX = 20;
        
        // Background
        this.canvas.ctx.fillStyle = '#222222';
        this.canvas.ctx.fillRect(meterX, meterY, meterWidth, meterHeight);
        
        // Color zones
        const centerX = meterX + meterWidth / 2;
        
        // Positive correlation (green)
        this.canvas.ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
        this.canvas.ctx.fillRect(centerX, meterY, meterWidth / 2, meterHeight);
        
        // Negative correlation (red)
        this.canvas.ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
        this.canvas.ctx.fillRect(meterX, meterY, meterWidth / 2, meterHeight);
        
        // Current correlation
        const correlationWidth = (this.correlation + 1) / 2 * meterWidth;
        const correlationColor = this.correlation > 0 ? '#00ff00' : '#ff0000';
        
        this.canvas.ctx.fillStyle = correlationColor;
        this.canvas.ctx.fillRect(meterX, meterY, correlationWidth, meterHeight);
        
        // Peak correlation
        const peakWidth = (this.peakCorrelation + 1) / 2 * meterWidth;
        this.canvas.ctx.strokeStyle = '#ffff00';
        this.canvas.ctx.lineWidth = 2;
        this.canvas.ctx.setLineDash([5, 5]);
        this.canvas.ctx.beginPath();
        this.canvas.ctx.moveTo(meterX + peakWidth, meterY);
        this.canvas.ctx.lineTo(meterX + peakWidth, meterY + meterHeight);
        this.canvas.ctx.stroke();
        this.canvas.ctx.setLineDash([]);
        
        // Center line
        this.canvas.ctx.strokeStyle = '#ffffff';
        this.canvas.ctx.lineWidth = 1;
        this.canvas.ctx.beginPath();
        this.canvas.ctx.moveTo(centerX, meterY);
        this.canvas.ctx.lineTo(centerX, meterY + meterHeight);
        this.canvas.ctx.stroke();
    }

    drawHistoryGraph() {
        const graphHeight = this.height - 100;
        const graphY = 80;
        const graphWidth = this.width - 40;
        const graphX = 20;
        
        // Background
        this.canvas.ctx.fillStyle = '#111111';
        this.canvas.ctx.fillRect(graphX, graphY, graphWidth, graphHeight);
        
        // Draw history line
        this.canvas.ctx.strokeStyle = '#00ff00';
        this.canvas.ctx.lineWidth = 2;
        this.canvas.ctx.beginPath();
        
        for (let i = 0; i < this.correlationHistory.length; i++) {
            const x = graphX + (i / (this.correlationHistory.length - 1)) * graphWidth;
            const correlation = this.correlationHistory[i];
            const y = graphY + graphHeight / 2 - (correlation * graphHeight / 2);
            
            if (i === 0) {
                this.canvas.ctx.moveTo(x, y);
            } else {
                this.canvas.ctx.lineTo(x, y);
            }
        }
        this.canvas.ctx.stroke();
        
        // Draw filled area
        this.canvas.ctx.lineTo(graphX + graphWidth, graphY + graphHeight / 2);
        this.canvas.ctx.lineTo(graphX, graphY + graphHeight / 2);
        this.canvas.ctx.closePath();
        
        const gradient = this.canvas.ctx.createLinearGradient(0, graphY, 0, graphY + graphHeight);
        gradient.addColorStop(0, 'rgba(0, 255, 0, 0.3)');
        gradient.addColorStop(1, 'rgba(0, 255, 0, 0.05)');
        this.canvas.ctx.fillStyle = gradient;
        this.canvas.ctx.fill();
    }

    drawLabels() {
        this.canvas.ctx.fillStyle = '#ffffff';
        this.canvas.ctx.font = '14px monospace';
        this.canvas.ctx.textAlign = 'center';
        this.canvas.ctx.fillText('CORRELATION METER', this.width / 2, 15);
        
        // Correlation value
        this.canvas.ctx.fillStyle = this.correlation > 0 ? '#00ff00' : '#ff0000';
        this.canvas.ctx.font = '12px monospace';
        this.canvas.ctx.fillText(`${this.correlation.toFixed(3)}`, this.width / 2, 70);
        
        // Scale labels
        this.canvas.ctx.fillStyle = '#888888';
        this.canvas.ctx.font = '10px monospace';
        this.canvas.ctx.textAlign = 'left';
        this.canvas.ctx.fillText('-1', 5, this.height / 2 + 3);
        this.canvas.ctx.fillText('0', 5, this.height / 2 + 3);
        this.canvas.ctx.fillText('+1', 5, this.height / 2 + 3);
        
        // Peak value
        this.canvas.ctx.fillStyle = '#ffff00';
        this.canvas.ctx.textAlign = 'right';
        this.canvas.ctx.fillText(`Peak: ${this.peakCorrelation.toFixed(3)}`, this.width - 5, this.height - 5);
    }

    drawStatic() {
        this.canvas.ctx.fillStyle = '#000000';
        this.canvas.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.drawGrid();
        this.drawLabels();
        
        // Draw a flat line at zero
        this.canvas.ctx.strokeStyle = '#333333';
        this.canvas.ctx.lineWidth = 2;
        this.canvas.ctx.beginPath();
        this.canvas.ctx.moveTo(0, this.canvas.height / 2);
        this.canvas.ctx.lineTo(this.canvas.width, this.canvas.height / 2);
        this.canvas.ctx.stroke();
    }
}
