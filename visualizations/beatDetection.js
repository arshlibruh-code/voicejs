// Professional Beat Detection Scope - Rhythm and Tempo Analysis
import { Colors } from '../utils/colors.js';

export class BeatDetectionVisualization {
    constructor(canvasManager) {
        this.canvas = canvasManager.getCanvas('beatDetectionCanvas');
        this.width = 0;
        this.height = 0;
        this.beatHistory = [];
        this.maxHistory = 200;
        this.tempo = 0;
        this.beatStrength = 0;
        this.lastBeat = 0;
        this.beatThreshold = 0.3;
        this.energyHistory = [];
        this.energyWindow = 43; // ~1 second at 44.1kHz
        this.tempoHistory = [];
        this.maxTempoHistory = 50;
    }

    initialize() {
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.beatHistory = Array(this.maxHistory).fill(0);
        this.energyHistory = Array(this.energyWindow).fill(0);
        this.tempoHistory = [];
    }

    draw(audioLevel = 0, frequencyData = null) {
        if (!frequencyData) return;

        this.width = this.canvas.width;
        this.height = this.canvas.height;

        // Clear canvas
        this.canvas.ctx.fillStyle = '#000000';
        this.canvas.ctx.fillRect(0, 0, this.width, this.height);

        // Process beat detection
        this.processBeatDetection(frequencyData);
        
        // Update beat history
        this.updateBeatHistory();
        
        // Draw grid
        this.drawGrid();
        
        // Draw beat visualization
        this.drawBeatVisualization();
        
        // Draw tempo indicator
        this.drawTempoIndicator();
        
        // Draw labels
        this.drawLabels();
    }

    processBeatDetection(frequencyData) {
        // Calculate energy in different frequency bands
        const bassEnergy = this.calculateBandEnergy(frequencyData, 0, 0.1);
        const midEnergy = this.calculateBandEnergy(frequencyData, 0.1, 0.3);
        const trebleEnergy = this.calculateBandEnergy(frequencyData, 0.3, 1.0);
        
        // Total energy
        const totalEnergy = bassEnergy + midEnergy + trebleEnergy;
        
        // Update energy history
        this.energyHistory.push(totalEnergy);
        if (this.energyHistory.length > this.energyWindow) {
            this.energyHistory.shift();
        }
        
        // Calculate energy variance (beat strength)
        const meanEnergy = this.energyHistory.reduce((sum, e) => sum + e, 0) / this.energyHistory.length;
        const variance = this.energyHistory.reduce((sum, e) => sum + Math.pow(e - meanEnergy, 2), 0) / this.energyHistory.length;
        this.beatStrength = Math.sqrt(variance);
        
        // Beat detection
        const now = Date.now();
        const timeSinceLastBeat = now - this.lastBeat;
        
        if (this.beatStrength > this.beatThreshold && timeSinceLastBeat > 200) {
            this.lastBeat = now;
            this.beatHistory.push(1);
            
            // Calculate tempo
            if (this.tempoHistory.length > 0) {
                const timeDiff = now - this.tempoHistory[this.tempoHistory.length - 1];
                const bpm = 60000 / timeDiff; // Convert ms to BPM
                
                if (bpm > 60 && bpm < 200) { // Reasonable tempo range
                    this.tempoHistory.push(now);
                    if (this.tempoHistory.length > this.maxTempoHistory) {
                        this.tempoHistory.shift();
                    }
                    
                    // Calculate average tempo
                    if (this.tempoHistory.length > 1) {
                        const tempos = [];
                        for (let i = 1; i < this.tempoHistory.length; i++) {
                            const diff = this.tempoHistory[i] - this.tempoHistory[i - 1];
                            tempos.push(60000 / diff);
                        }
                        this.tempo = tempos.reduce((sum, t) => sum + t, 0) / tempos.length;
                    }
                }
            } else {
                this.tempoHistory.push(now);
            }
        } else {
            this.beatHistory.push(0);
        }
        
        if (this.beatHistory.length > this.maxHistory) {
            this.beatHistory.shift();
        }
    }

    calculateBandEnergy(frequencyData, startFreq, endFreq) {
        const startIndex = Math.floor(startFreq * frequencyData.length);
        const endIndex = Math.floor(endFreq * frequencyData.length);
        
        let energy = 0;
        for (let i = startIndex; i < endIndex; i++) {
            energy += frequencyData[i] * frequencyData[i];
        }
        
        return energy / (endIndex - startIndex);
    }

    updateBeatHistory() {
        // Smooth beat history
        for (let i = 1; i < this.beatHistory.length; i++) {
            this.beatHistory[i] = this.beatHistory[i] * 0.9 + this.beatHistory[i - 1] * 0.1;
        }
    }

    drawGrid() {
        this.canvas.ctx.strokeStyle = '#333333';
        this.canvas.ctx.lineWidth = 0.5;
        
        // Horizontal grid lines
        for (let i = 0; i <= 4; i++) {
            const y = (i / 4) * this.height;
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
    }

    drawBeatVisualization() {
        // Draw beat strength meter
        const meterHeight = 40;
        const meterY = 20;
        const meterWidth = this.width - 40;
        const meterX = 20;
        
        // Background
        this.canvas.ctx.fillStyle = '#222222';
        this.canvas.ctx.fillRect(meterX, meterY, meterWidth, meterHeight);
        
        // Beat strength bar
        const strengthWidth = Math.min(this.beatStrength * meterWidth, meterWidth);
        const strengthColor = this.beatStrength > this.beatThreshold ? '#ff0000' : '#00ff00';
        
        this.canvas.ctx.fillStyle = strengthColor;
        this.canvas.ctx.fillRect(meterX, meterY, strengthWidth, meterHeight);
        
        // Threshold line
        this.canvas.ctx.strokeStyle = '#ffff00';
        this.canvas.ctx.lineWidth = 2;
        this.canvas.ctx.setLineDash([5, 5]);
        const thresholdX = meterX + this.beatThreshold * meterWidth;
        this.canvas.ctx.beginPath();
        this.canvas.ctx.moveTo(thresholdX, meterY);
        this.canvas.ctx.lineTo(thresholdX, meterY + meterHeight);
        this.canvas.ctx.stroke();
        this.canvas.ctx.setLineDash([]);
        
        // Draw beat history
        this.canvas.ctx.strokeStyle = '#00ff00';
        this.canvas.ctx.lineWidth = 2;
        this.canvas.ctx.beginPath();
        
        for (let i = 0; i < this.beatHistory.length; i++) {
            const x = (i / (this.beatHistory.length - 1)) * this.width;
            const y = this.height - (this.beatHistory[i] * this.height);
            
            if (i === 0) {
                this.canvas.ctx.moveTo(x, y);
            } else {
                this.canvas.ctx.lineTo(x, y);
            }
        }
        this.canvas.ctx.stroke();
    }

    drawTempoIndicator() {
        const tempoY = this.height - 60;
        const tempoHeight = 40;
        const tempoWidth = this.width - 40;
        const tempoX = 20;
        
        // Background
        this.canvas.ctx.fillStyle = '#222222';
        this.canvas.ctx.fillRect(tempoX, tempoY, tempoWidth, tempoHeight);
        
        // Tempo bar
        const tempoRatio = Math.min(this.tempo / 200, 1); // Normalize to 200 BPM max
        const tempoBarWidth = tempoRatio * tempoWidth;
        
        this.canvas.ctx.fillStyle = '#0088ff';
        this.canvas.ctx.fillRect(tempoX, tempoY, tempoBarWidth, tempoHeight);
        
        // Tempo markers
        this.canvas.ctx.strokeStyle = '#ffffff';
        this.canvas.ctx.lineWidth = 1;
        
        const tempoMarkers = [60, 80, 100, 120, 140, 160, 180, 200];
        tempoMarkers.forEach(bpm => {
            const x = tempoX + (bpm / 200) * tempoWidth;
            this.canvas.ctx.beginPath();
            this.canvas.ctx.moveTo(x, tempoY);
            this.canvas.ctx.lineTo(x, tempoY + tempoHeight);
            this.canvas.ctx.stroke();
        });
    }

    drawLabels() {
        this.canvas.ctx.fillStyle = '#ffffff';
        this.canvas.ctx.font = '14px monospace';
        this.canvas.ctx.textAlign = 'center';
        this.canvas.ctx.fillText('BEAT DETECTION SCOPE', this.width / 2, 15);
        
        // Beat strength value
        this.canvas.ctx.fillStyle = this.beatStrength > this.beatThreshold ? '#ff0000' : '#00ff00';
        this.canvas.ctx.font = '12px monospace';
        this.canvas.ctx.fillText(`Strength: ${this.beatStrength.toFixed(3)}`, this.width / 2, 65);
        
        // Tempo value
        this.canvas.ctx.fillStyle = '#0088ff';
        this.canvas.ctx.fillText(`Tempo: ${this.tempo.toFixed(1)} BPM`, this.width / 2, this.height - 15);
        
        // Threshold value
        this.canvas.ctx.fillStyle = '#ffff00';
        this.canvas.ctx.font = '10px monospace';
        this.canvas.ctx.textAlign = 'left';
        this.canvas.ctx.fillText(`Threshold: ${this.beatThreshold.toFixed(2)}`, 10, 30);
        
        // Beat status
        const beatStatus = this.beatStrength > this.beatThreshold ? 'BEAT!' : 'No Beat';
        this.canvas.ctx.fillStyle = this.beatStrength > this.beatThreshold ? '#ff0000' : '#888888';
        this.canvas.ctx.fillText(beatStatus, 10, 45);
    }

    drawStatic() {
        this.canvas.ctx.fillStyle = '#000000';
        this.canvas.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.drawGrid();
        this.drawLabels();
        
        // Draw a flat line
        this.canvas.ctx.strokeStyle = '#333333';
        this.canvas.ctx.lineWidth = 2;
        this.canvas.ctx.beginPath();
        this.canvas.ctx.moveTo(0, this.canvas.height);
        this.canvas.ctx.lineTo(this.canvas.width, this.canvas.height);
        this.canvas.ctx.stroke();
    }
}
