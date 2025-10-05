// Professional VU Meter with Peak Hold
import { Colors } from '../utils/colors.js';

export class VUMeterVisualization {
    constructor(canvasManager) {
        this.canvas = canvasManager.getCanvas('vuMeterCanvas');
        this.width = 0;
        this.height = 0;
        this.vuLevel = 0;
        this.peakLevel = 0;
        this.peakHoldTime = 2000;
        this.lastPeakUpdate = 0;
        this.overload = false;
        this.overloadTime = 0;
        this.ballistics = 0.3; // VU meter ballistics
        this.smoothedLevel = 0;
    }

    initialize() {
        this.width = this.canvas.width;
        this.height = this.canvas.height;
    }

    draw(audioLevel = 0, frequencyData = null) {
        if (!frequencyData) return;

        this.width = this.canvas.width;
        this.height = this.canvas.height;

        // Clear canvas
        this.canvas.ctx.fillStyle = '#000000';
        this.canvas.ctx.fillRect(0, 0, this.width, this.height);

        // Process VU level
        this.processVULevel(frequencyData);
        
        // Update peak hold
        this.updatePeakHold();
        
        // Draw VU meter
        this.drawVUMeter();
        
        // Draw peak meter
        this.drawPeakMeter();
        
        // Draw labels
        this.drawLabels();
    }

    processVULevel(frequencyData) {
        // Calculate RMS level
        let sum = 0;
        let count = 0;
        
        for (let i = 0; i < frequencyData.length; i++) {
            const sample = frequencyData[i] / 255;
            sum += sample * sample;
            count++;
        }
        
        const rms = Math.sqrt(sum / count);
        
        // Convert to VU scale (-20dB to +3dB)
        const vuDb = 20 * Math.log10(rms + 0.001);
        const vuLevel = Math.max(-20, Math.min(3, vuDb));
        
        // Apply VU meter ballistics (slow attack, fast decay)
        const targetLevel = (vuLevel + 20) / 23; // Normalize to 0-1
        this.smoothedLevel = this.smoothedLevel * this.ballistics + targetLevel * (1 - this.ballistics);
        
        this.vuLevel = this.smoothedLevel;
        
        // Check for overload
        if (vuLevel > 0) {
            this.overload = true;
            this.overloadTime = Date.now();
        } else if (Date.now() - this.overloadTime > 100) {
            this.overload = false;
        }
    }

    updatePeakHold() {
        const now = Date.now();
        if (now - this.lastPeakUpdate > 16) {
            if (this.vuLevel > this.peakLevel) {
                this.peakLevel = this.vuLevel;
            } else {
                this.peakLevel *= 0.98; // Slow decay
            }
            this.lastPeakUpdate = now;
        }
    }

    drawVUMeter() {
        const meterWidth = this.width - 40;
        const meterHeight = 30;
        const meterX = 20;
        const meterY = 50;
        
        // Background
        this.canvas.ctx.fillStyle = '#222222';
        this.canvas.ctx.fillRect(meterX, meterY, meterWidth, meterHeight);
        
        // Color zones
        const greenZone = 0.7; // 70% of meter
        const yellowZone = 0.9; // 90% of meter
        
        // Green zone
        this.canvas.ctx.fillStyle = '#00ff00';
        this.canvas.ctx.fillRect(meterX, meterY, meterWidth * greenZone, meterHeight);
        
        // Yellow zone
        this.canvas.ctx.fillStyle = '#ffff00';
        this.canvas.ctx.fillRect(meterX + meterWidth * greenZone, meterY, 
                                meterWidth * (yellowZone - greenZone), meterHeight);
        
        // Red zone
        this.canvas.ctx.fillStyle = '#ff0000';
        this.canvas.ctx.fillRect(meterX + meterWidth * yellowZone, meterY, 
                                meterWidth * (1 - yellowZone), meterHeight);
        
        // Current VU level
        const vuWidth = this.vuLevel * meterWidth;
        this.canvas.ctx.fillStyle = this.overload ? '#ff00ff' : '#ffffff';
        this.canvas.ctx.fillRect(meterX, meterY, vuWidth, meterHeight);
        
        // VU scale marks
        this.canvas.ctx.strokeStyle = '#000000';
        this.canvas.ctx.lineWidth = 1;
        
        const marks = [-20, -10, -5, -3, -1, 0, 1, 3];
        marks.forEach(mark => {
            const x = meterX + ((mark + 20) / 23) * meterWidth;
            this.canvas.ctx.beginPath();
            this.canvas.ctx.moveTo(x, meterY);
            this.canvas.ctx.lineTo(x, meterY + meterHeight);
            this.canvas.ctx.stroke();
        });
    }

    drawPeakMeter() {
        const meterWidth = this.width - 40;
        const meterHeight = 20;
        const meterX = 20;
        const meterY = 100;
        
        // Background
        this.canvas.ctx.fillStyle = '#222222';
        this.canvas.ctx.fillRect(meterX, meterY, meterWidth, meterHeight);
        
        // Peak level
        const peakWidth = this.peakLevel * meterWidth;
        this.canvas.ctx.fillStyle = '#ff8800';
        this.canvas.ctx.fillRect(meterX, meterY, peakWidth, meterHeight);
        
        // Peak hold line
        this.canvas.ctx.strokeStyle = '#ffff00';
        this.canvas.ctx.lineWidth = 2;
        this.canvas.ctx.setLineDash([5, 5]);
        this.canvas.ctx.beginPath();
        this.canvas.ctx.moveTo(meterX + peakWidth, meterY);
        this.canvas.ctx.lineTo(meterX + peakWidth, meterY + meterHeight);
        this.canvas.ctx.stroke();
        this.canvas.ctx.setLineDash([]);
    }

    drawLabels() {
        this.canvas.ctx.fillStyle = '#ffffff';
        this.canvas.ctx.font = '16px monospace';
        this.canvas.ctx.textAlign = 'center';
        this.canvas.ctx.fillText('VU METER', this.width / 2, 25);
        
        // VU level value
        const vuDb = (this.vuLevel * 23) - 20;
        this.canvas.ctx.fillStyle = this.overload ? '#ff00ff' : '#ffffff';
        this.canvas.ctx.font = '14px monospace';
        this.canvas.ctx.fillText(`${vuDb.toFixed(1)} dB`, this.width / 2, 45);
        
        // Peak level value
        const peakDb = (this.peakLevel * 23) - 20;
        this.canvas.ctx.fillStyle = '#ff8800';
        this.canvas.ctx.fillText(`Peak: ${peakDb.toFixed(1)} dB`, this.width / 2, 95);
        
        // Scale labels
        this.canvas.ctx.fillStyle = '#888888';
        this.canvas.ctx.font = '10px monospace';
        this.canvas.ctx.textAlign = 'left';
        
        const scaleLabels = ['-20', '-10', '-5', '-3', '-1', '0', '+1', '+3'];
        const meterX = 20;
        const meterWidth = this.width - 40;
        
        scaleLabels.forEach((label, index) => {
            const x = meterX + (index / (scaleLabels.length - 1)) * meterWidth;
            this.canvas.ctx.fillText(label, x - 5, 140);
        });
        
        // Overload indicator
        if (this.overload) {
            this.canvas.ctx.fillStyle = '#ff0000';
            this.canvas.ctx.font = '12px monospace';
            this.canvas.ctx.textAlign = 'center';
            this.canvas.ctx.fillText('OVERLOAD', this.width / 2, this.height - 10);
        }
    }

    drawStatic() {
        this.canvas.ctx.fillStyle = '#000000';
        this.canvas.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw static VU meter
        const meterWidth = this.width - 40;
        const meterHeight = 30;
        const meterX = 20;
        const meterY = 50;
        
        // Background
        this.canvas.ctx.fillStyle = '#222222';
        this.canvas.ctx.fillRect(meterX, meterY, meterWidth, meterHeight);
        
        // Color zones
        const greenZone = 0.7;
        const yellowZone = 0.9;
        
        this.canvas.ctx.fillStyle = '#00ff00';
        this.canvas.ctx.fillRect(meterX, meterY, meterWidth * greenZone, meterHeight);
        
        this.canvas.ctx.fillStyle = '#ffff00';
        this.canvas.ctx.fillRect(meterX + meterWidth * greenZone, meterY, 
                                meterWidth * (yellowZone - greenZone), meterHeight);
        
        this.canvas.ctx.fillStyle = '#ff0000';
        this.canvas.ctx.fillRect(meterX + meterWidth * yellowZone, meterY, 
                                meterWidth * (1 - yellowZone), meterHeight);
        
        this.drawLabels();
    }
}
