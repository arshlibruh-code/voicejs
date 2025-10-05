// Professional Harmonic Analyzer - Fundamental and Harmonics Analysis
import { Colors } from '../utils/colors.js';

export class HarmonicAnalyzerVisualization {
    constructor(canvasManager) {
        this.canvas = canvasManager.getCanvas('harmonicAnalyzerCanvas');
        this.width = 0;
        this.height = 0;
        this.harmonics = [];
        this.maxHarmonics = 16;
        this.fundamentalFreq = 0;
        this.harmonicData = [];
        this.peakData = [];
        this.smoothingFactor = 0.7;
        this.peakHoldTime = 1000;
        this.lastPeakUpdate = 0;
    }

    initialize() {
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.harmonicData = Array(this.maxHarmonics).fill(0);
        this.peakData = Array(this.maxHarmonics).fill(0);
    }

    draw(audioLevel = 0, frequencyData = null) {
        if (!frequencyData) return;

        this.width = this.canvas.width;
        this.height = this.canvas.height;

        // Clear canvas
        this.canvas.ctx.fillStyle = '#000000';
        this.canvas.ctx.fillRect(0, 0, this.width, this.height);

        // Process harmonic data
        this.processHarmonicData(frequencyData);
        
        // Update smoothed data
        this.updateSmoothedData();
        
        // Update peak data
        this.updatePeakData();
        
        // Draw grid
        this.drawGrid();
        
        // Draw harmonic bars
        this.drawHarmonicBars();
        
        // Draw peak hold
        this.drawPeakHold();
        
        // Draw labels
        this.drawLabels();
    }

    processHarmonicData(frequencyData) {
        // Find fundamental frequency (peak detection)
        let maxAmplitude = 0;
        let fundamentalIndex = 0;
        
        for (let i = 1; i < frequencyData.length / 2; i++) {
            if (frequencyData[i] > maxAmplitude) {
                maxAmplitude = frequencyData[i];
                fundamentalIndex = i;
            }
        }
        
        // Calculate fundamental frequency
        const sampleRate = 44100;
        const nyquist = sampleRate / 2;
        this.fundamentalFreq = (fundamentalIndex / frequencyData.length) * nyquist;
        
        // Analyze harmonics
        for (let harmonic = 1; harmonic <= this.maxHarmonics; harmonic++) {
            const harmonicFreq = this.fundamentalFreq * harmonic;
            const harmonicIndex = Math.floor((harmonicFreq / nyquist) * frequencyData.length);
            
            if (harmonicIndex < frequencyData.length) {
                const amplitude = frequencyData[harmonicIndex] / 255;
                const dbAmplitude = 20 * Math.log10(amplitude + 0.001);
                this.harmonicData[harmonic - 1] = Math.max(dbAmplitude, -80);
            } else {
                this.harmonicData[harmonic - 1] = -80;
            }
        }
    }

    updateSmoothedData() {
        for (let i = 0; i < this.harmonicData.length; i++) {
            this.harmonicData[i] = this.harmonicData[i] * this.smoothingFactor + 
                                 this.harmonicData[i] * (1 - this.smoothingFactor);
        }
    }

    updatePeakData() {
        const now = Date.now();
        if (now - this.lastPeakUpdate > 16) {
            for (let i = 0; i < this.harmonicData.length; i++) {
                if (this.harmonicData[i] > this.peakData[i]) {
                    this.peakData[i] = this.harmonicData[i];
                } else {
                    this.peakData[i] *= 0.95; // Decay peaks
                }
            }
            this.lastPeakUpdate = now;
        }
    }

    drawGrid() {
        this.canvas.ctx.strokeStyle = '#333333';
        this.canvas.ctx.lineWidth = 0.5;
        
        // Horizontal grid lines (dB scale)
        for (let db = -80; db <= 0; db += 10) {
            const y = this.height - ((db + 80) / 80) * this.height;
            this.canvas.ctx.beginPath();
            this.canvas.ctx.moveTo(0, y);
            this.canvas.ctx.lineTo(this.width, y);
            this.canvas.ctx.stroke();
        }
        
        // Vertical grid lines (harmonics)
        for (let i = 0; i <= this.maxHarmonics; i++) {
            const x = (i / this.maxHarmonics) * this.width;
            this.canvas.ctx.beginPath();
            this.canvas.ctx.moveTo(x, 0);
            this.canvas.ctx.lineTo(x, this.height);
            this.canvas.ctx.stroke();
        }
    }

    drawHarmonicBars() {
        const barWidth = this.width / this.maxHarmonics;
        
        for (let i = 0; i < this.harmonicData.length; i++) {
            const x = i * barWidth;
            const db = this.harmonicData[i];
            const barHeight = ((db + 80) / 80) * this.height;
            const y = this.height - barHeight;
            
            // Color based on harmonic number
            let color;
            if (i === 0) {
                color = '#ff0000'; // Fundamental - red
            } else if (i < 4) {
                color = '#ff8800'; // First few harmonics - orange
            } else if (i < 8) {
                color = '#ffff00'; // Mid harmonics - yellow
            } else {
                color = '#00ff00'; // Higher harmonics - green
            }
            
            this.canvas.ctx.fillStyle = color;
            this.canvas.ctx.fillRect(x, y, barWidth - 2, barHeight);
            
            // Draw border
            this.canvas.ctx.strokeStyle = '#ffffff';
            this.canvas.ctx.lineWidth = 1;
            this.canvas.ctx.strokeRect(x, y, barWidth - 2, barHeight);
        }
    }

    drawPeakHold() {
        const barWidth = this.width / this.maxHarmonics;
        
        this.canvas.ctx.strokeStyle = '#ffffff';
        this.canvas.ctx.lineWidth = 2;
        this.canvas.ctx.setLineDash([5, 5]);
        
        for (let i = 0; i < this.peakData.length; i++) {
            const x = i * barWidth + barWidth / 2;
            const db = this.peakData[i];
            const y = this.height - ((db + 80) / 80) * this.height;
            
            this.canvas.ctx.beginPath();
            this.canvas.ctx.moveTo(x, y);
            this.canvas.ctx.lineTo(x, y);
            this.canvas.ctx.stroke();
        }
        
        this.canvas.ctx.setLineDash([]);
    }

    drawLabels() {
        this.canvas.ctx.fillStyle = '#ffffff';
        this.canvas.ctx.font = '14px monospace';
        this.canvas.ctx.textAlign = 'center';
        this.canvas.ctx.fillText('HARMONIC ANALYZER', this.width / 2, 20);
        
        // Harmonic labels
        this.canvas.ctx.fillStyle = '#888888';
        this.canvas.ctx.font = '10px monospace';
        this.canvas.ctx.textAlign = 'center';
        
        for (let i = 0; i < this.maxHarmonics; i++) {
            const x = (i / this.maxHarmonics) * this.width + (this.width / this.maxHarmonics) / 2;
            this.canvas.ctx.fillText(`${i + 1}`, x, this.height - 5);
        }
        
        // dB scale labels
        this.canvas.ctx.textAlign = 'right';
        for (let db = -80; db <= 0; db += 20) {
            const y = this.height - ((db + 80) / 80) * this.height;
            this.canvas.ctx.fillText(`${db}dB`, 5, y + 3);
        }
        
        // Fundamental frequency
        this.canvas.ctx.fillStyle = '#ff0000';
        this.canvas.ctx.font = '12px monospace';
        this.canvas.ctx.textAlign = 'left';
        this.canvas.ctx.fillText(`Fundamental: ${this.fundamentalFreq.toFixed(1)}Hz`, 10, 30);
        
        // Harmonic series info
        this.canvas.ctx.fillStyle = '#00ff00';
        this.canvas.ctx.font = '10px monospace';
        this.canvas.ctx.fillText(`Harmonic Series: ${this.fundamentalFreq.toFixed(1)}Hz`, 10, 45);
        
        // Color legend
        this.canvas.ctx.fillStyle = '#ffffff';
        this.canvas.ctx.font = '8px monospace';
        this.canvas.ctx.textAlign = 'right';
        this.canvas.ctx.fillText('Red: Fundamental', this.width - 10, this.height - 30);
        this.canvas.ctx.fillText('Orange: 2nd-4th', this.width - 10, this.height - 20);
        this.canvas.ctx.fillText('Yellow: 5th-8th', this.width - 10, this.height - 10);
        this.canvas.ctx.fillText('Green: 9th+', this.width - 10, this.height - 0);
    }

    drawStatic() {
        this.canvas.ctx.fillStyle = '#000000';
        this.canvas.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.drawGrid();
        this.drawLabels();
        
        // Draw flat bars at -80dB
        const barWidth = this.width / this.maxHarmonics;
        this.canvas.ctx.fillStyle = '#333333';
        for (let i = 0; i < this.maxHarmonics; i++) {
            const x = i * barWidth;
            this.canvas.ctx.fillRect(x, this.canvas.height - 10, barWidth - 2, 10);
        }
    }
}
