// Frequency Spectrum Visualizations
import { Colors } from '../utils/colors.js';

export class BassSpectrumVisualization {
    constructor(canvasManager) {
        this.canvas = canvasManager.getCanvas('bassSpectrumCanvas');
    }

    draw(audioLevel = 0, frequencyData = null) {
        this.canvas.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (!frequencyData) return;
        
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const maxRadius = Math.min(centerX, centerY) - 20;
        
        // Sub-bass (20-60 Hz) - Blue circle
        const subBassLevel = this.getFrequencyBand(frequencyData, 20, 60);
        const subBassRadius = 20 + subBassLevel * 60;
        
        this.canvas.ctx.strokeStyle = Colors.BLUE;
        this.canvas.ctx.lineWidth = 3;
        this.canvas.ctx.beginPath();
        this.canvas.ctx.arc(centerX, centerY, subBassRadius, 0, Math.PI * 2);
        this.canvas.ctx.stroke();
        
        // Bass (60-250 Hz) - Green circle
        const bassLevel = this.getFrequencyBand(frequencyData, 60, 250);
        const bassRadius = 30 + bassLevel * 50;
        
        this.canvas.ctx.strokeStyle = Colors.GREEN;
        this.canvas.ctx.lineWidth = 3;
        this.canvas.ctx.beginPath();
        this.canvas.ctx.arc(centerX, centerY, bassRadius, 0, Math.PI * 2);
        this.canvas.ctx.stroke();
        
        // Draw title
        this.canvas.ctx.fillStyle = '#ffffff';
        this.canvas.ctx.font = '14px monospace';
        this.canvas.ctx.textAlign = 'center';
        this.canvas.ctx.fillText('BASS SPECTRUM', this.canvas.width / 2, 20);
    }

    getFrequencyBand(frequencyData, startFreq, endFreq) {
        const sampleRate = 44100;
        const fftSize = 2048;
        const binSize = sampleRate / fftSize;
        
        const startBin = Math.floor(startFreq / binSize);
        const endBin = Math.floor(endFreq / binSize);
        
        let sum = 0;
        let count = 0;
        for (let i = startBin; i <= endBin && i < frequencyData.length; i++) {
            sum += frequencyData[i];
            count++;
        }
        
        return count > 0 ? (sum / count) / 255 : 0;
    }

    drawStatic() {
        this.draw(0, null);
    }
}

export class MidSpectrumVisualization {
    constructor(canvasManager) {
        this.canvas = canvasManager.getCanvas('midSpectrumCanvas');
    }

    draw(audioLevel = 0, frequencyData = null) {
        this.canvas.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (!frequencyData) return;
        
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const maxRadius = Math.min(centerX, centerY) - 20;
        
        // Low Mids (250-500 Hz) - Blue
        const lowMidLevel = this.getFrequencyBand(frequencyData, 250, 500);
        const lowMidRadius = 20 + lowMidLevel * 60;
        
        this.canvas.ctx.strokeStyle = Colors.BLUE;
        this.canvas.ctx.lineWidth = 3;
        this.canvas.ctx.beginPath();
        this.canvas.ctx.arc(centerX, centerY, lowMidRadius, 0, Math.PI * 2);
        this.canvas.ctx.stroke();
        
        // Mids (500-2000 Hz) - Green
        const midLevel = this.getFrequencyBand(frequencyData, 500, 2000);
        const midRadius = 30 + midLevel * 50;
        
        this.canvas.ctx.strokeStyle = Colors.GREEN;
        this.canvas.ctx.lineWidth = 3;
        this.canvas.ctx.beginPath();
        this.canvas.ctx.arc(centerX, centerY, midRadius, 0, Math.PI * 2);
        this.canvas.ctx.stroke();
        
        // High Mids (2000-4000 Hz) - Yellow
        const highMidLevel = this.getFrequencyBand(frequencyData, 2000, 4000);
        const highMidRadius = 40 + highMidLevel * 40;
        
        this.canvas.ctx.strokeStyle = 'hsl(60, 70%, 60%)';
        this.canvas.ctx.lineWidth = 3;
        this.canvas.ctx.beginPath();
        this.canvas.ctx.arc(centerX, centerY, highMidRadius, 0, Math.PI * 2);
        this.canvas.ctx.stroke();
        
        // Draw title
        this.canvas.ctx.fillStyle = '#ffffff';
        this.canvas.ctx.font = '14px monospace';
        this.canvas.ctx.textAlign = 'center';
        this.canvas.ctx.fillText('MID SPECTRUM', this.canvas.width / 2, 20);
    }

    getFrequencyBand(frequencyData, startFreq, endFreq) {
        const sampleRate = 44100;
        const fftSize = 2048;
        const binSize = sampleRate / fftSize;
        
        const startBin = Math.floor(startFreq / binSize);
        const endBin = Math.floor(endFreq / binSize);
        
        let sum = 0;
        let count = 0;
        for (let i = startBin; i <= endBin && i < frequencyData.length; i++) {
            sum += frequencyData[i];
            count++;
        }
        
        return count > 0 ? (sum / count) / 255 : 0;
    }

    drawStatic() {
        this.draw(0, null);
    }
}

export class TrebleSpectrumVisualization {
    constructor(canvasManager) {
        this.canvas = canvasManager.getCanvas('trebleSpectrumCanvas');
    }

    draw(audioLevel = 0, frequencyData = null) {
        this.canvas.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (!frequencyData) return;
        
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const maxRadius = Math.min(centerX, centerY) - 20;
        
        // Treble (4000-8000 Hz) - Blue
        const trebleLevel = this.getFrequencyBand(frequencyData, 4000, 8000);
        const trebleRadius = 20 + trebleLevel * 60;
        
        this.canvas.ctx.strokeStyle = Colors.BLUE;
        this.canvas.ctx.lineWidth = 3;
        this.canvas.ctx.beginPath();
        this.canvas.ctx.arc(centerX, centerY, trebleRadius, 0, Math.PI * 2);
        this.canvas.ctx.stroke();
        
        // High Treble (8000+ Hz) - Green
        const highTrebleLevel = this.getFrequencyBand(frequencyData, 8000, 20000);
        const highTrebleRadius = 30 + highTrebleLevel * 50;
        
        this.canvas.ctx.strokeStyle = Colors.GREEN;
        this.canvas.ctx.lineWidth = 3;
        this.canvas.ctx.beginPath();
        this.canvas.ctx.arc(centerX, centerY, highTrebleRadius, 0, Math.PI * 2);
        this.canvas.ctx.stroke();
        
        // Draw title
        this.canvas.ctx.fillStyle = '#ffffff';
        this.canvas.ctx.font = '14px monospace';
        this.canvas.ctx.textAlign = 'center';
        this.canvas.ctx.fillText('TREBLE SPECTRUM', this.canvas.width / 2, 20);
    }

    getFrequencyBand(frequencyData, startFreq, endFreq) {
        const sampleRate = 44100;
        const fftSize = 2048;
        const binSize = sampleRate / fftSize;
        
        const startBin = Math.floor(startFreq / binSize);
        const endBin = Math.floor(endFreq / binSize);
        
        let sum = 0;
        let count = 0;
        for (let i = startBin; i <= endBin && i < frequencyData.length; i++) {
            sum += frequencyData[i];
            count++;
        }
        
        return count > 0 ? (sum / count) / 255 : 0;
    }

    drawStatic() {
        this.draw(0, null);
    }
}

export class FullAudioVisualization {
    constructor(canvasManager) {
        this.canvas = canvasManager.getCanvas('fullAudioCanvas');
    }

    draw(audioLevel = 0, frequencyData = null) {
        this.canvas.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (!frequencyData) return;
        
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const maxRadius = Math.min(centerX, centerY) - 30;
        
        // Draw spikes based on full audio spectrum
        this.canvas.ctx.strokeStyle = 'hsl(60, 70%, 60%)';
        this.canvas.ctx.lineWidth = 2;
        
        for (let i = 0; i < frequencyData.length; i += 4) {
            const angle = (i / frequencyData.length) * Math.PI * 2;
            const intensity = frequencyData[i] / 255;
            const spikeLength = intensity * maxRadius * 0.8;
            
            const x1 = centerX + Math.cos(angle) * 20;
            const y1 = centerY + Math.sin(angle) * 20;
            const x2 = centerX + Math.cos(angle) * (20 + spikeLength);
            const y2 = centerY + Math.sin(angle) * (20 + spikeLength);
            
            this.canvas.ctx.beginPath();
            this.canvas.ctx.moveTo(x1, y1);
            this.canvas.ctx.lineTo(x2, y2);
            this.canvas.ctx.stroke();
        }
        
        // Draw title
        this.canvas.ctx.fillStyle = '#ffffff';
        this.canvas.ctx.font = '14px monospace';
        this.canvas.ctx.textAlign = 'center';
        this.canvas.ctx.fillText('FULL AUDIO', this.canvas.width / 2, 20);
    }

    drawStatic() {
        this.draw(0, null);
    }
}
