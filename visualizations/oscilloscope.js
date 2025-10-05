// Professional Oscilloscope Visualization
import { Colors } from '../utils/colors.js';

export class OscilloscopeVisualization {
    constructor(canvasManager) {
        this.canvas = canvasManager.getCanvas('oscilloscopeCanvas');
        this.width = 0;
        this.height = 0;
        this.waveformData = [];
        this.maxSamples = 512;
        this.timeScale = 0;
        this.voltageScale = 0;
        this.triggerLevel = 0;
        this.triggered = false;
        this.sampleRate = 44100;
        this.timePerDiv = 0.001; // 1ms per division
        this.voltagePerDiv = 0.1; // 0.1V per division
    }

    initialize() {
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.waveformData = Array(this.maxSamples).fill(0);
        this.timeScale = this.width / 10; // 10 divisions
        this.voltageScale = this.height / 8; // 8 divisions
    }

    draw(audioLevel = 0, frequencyData = null) {
        if (!frequencyData) return;

        this.width = this.canvas.width;
        this.height = this.canvas.height;

        // Clear canvas with dark background
        this.canvas.ctx.fillStyle = '#000000';
        this.canvas.ctx.fillRect(0, 0, this.width, this.height);

        // Process audio data for oscilloscope
        this.processAudioData(frequencyData);

        // Draw grid
        this.drawGrid();
        
        // Draw waveform
        this.drawWaveform();
        
        // Draw trigger level
        this.drawTriggerLevel();
        
        // Draw labels
        this.drawLabels();
    }

    processAudioData(frequencyData) {
        // Convert frequency data to time domain representation
        // This is a simplified approach - in a real oscilloscope, you'd use IFFT
        const sampleRate = 44100;
        const timeStep = 1 / sampleRate;
        
        for (let i = 0; i < this.maxSamples; i++) {
            const time = i * timeStep;
            let amplitude = 0;
            
            // Sum up frequency components to create waveform
            for (let j = 0; j < Math.min(frequencyData.length, 256); j++) {
                const freq = (j / frequencyData.length) * (sampleRate / 2);
                const phase = 2 * Math.PI * freq * time;
                const magnitude = frequencyData[j] / 255;
                amplitude += magnitude * Math.sin(phase);
            }
            
            // Normalize and apply some filtering
            amplitude = amplitude / 256;
            amplitude = Math.tanh(amplitude * 3); // Soft clipping
            
            this.waveformData[i] = amplitude;
        }
    }

    drawGrid() {
        this.canvas.ctx.strokeStyle = '#333333';
        this.canvas.ctx.lineWidth = 0.5;
        
        // Horizontal grid lines (voltage)
        for (let i = 0; i <= 8; i++) {
            const y = (i / 8) * this.height;
            this.canvas.ctx.beginPath();
            this.canvas.ctx.moveTo(0, y);
            this.canvas.ctx.lineTo(this.width, y);
            this.canvas.ctx.stroke();
        }
        
        // Vertical grid lines (time)
        for (let i = 0; i <= 10; i++) {
            const x = (i / 10) * this.width;
            this.canvas.ctx.beginPath();
            this.canvas.ctx.moveTo(x, 0);
            this.canvas.ctx.lineTo(x, this.height);
            this.canvas.ctx.stroke();
        }
        
        // Center lines (thicker)
        this.canvas.ctx.strokeStyle = '#666666';
        this.canvas.ctx.lineWidth = 1;
        
        // Horizontal center line
        this.canvas.ctx.beginPath();
        this.canvas.ctx.moveTo(0, this.height / 2);
        this.canvas.ctx.lineTo(this.width, this.height / 2);
        this.canvas.ctx.stroke();
        
        // Vertical center line
        this.canvas.ctx.beginPath();
        this.canvas.ctx.moveTo(this.width / 2, 0);
        this.canvas.ctx.lineTo(this.width / 2, this.height);
        this.canvas.ctx.stroke();
    }

    drawWaveform() {
        this.canvas.ctx.strokeStyle = '#00ff00';
        this.canvas.ctx.lineWidth = 2;
        this.canvas.ctx.beginPath();
        
        for (let i = 0; i < this.waveformData.length; i++) {
            const x = (i / (this.waveformData.length - 1)) * this.width;
            const y = this.height / 2 - (this.waveformData[i] * this.height / 2);
            
            if (i === 0) {
                this.canvas.ctx.moveTo(x, y);
            } else {
                this.canvas.ctx.lineTo(x, y);
            }
        }
        this.canvas.ctx.stroke();
        
        // Add some glow effect
        this.canvas.ctx.shadowColor = '#00ff00';
        this.canvas.ctx.shadowBlur = 3;
        this.canvas.ctx.stroke();
        this.canvas.ctx.shadowBlur = 0;
    }

    drawTriggerLevel() {
        const triggerY = this.height / 2 - (this.triggerLevel * this.height / 2);
        
        this.canvas.ctx.strokeStyle = '#ff0000';
        this.canvas.ctx.lineWidth = 1;
        this.canvas.ctx.setLineDash([5, 5]);
        
        this.canvas.ctx.beginPath();
        this.canvas.ctx.moveTo(0, triggerY);
        this.canvas.ctx.lineTo(this.width, triggerY);
        this.canvas.ctx.stroke();
        this.canvas.ctx.setLineDash([]);
        
        // Trigger level label
        this.canvas.ctx.fillStyle = '#ff0000';
        this.canvas.ctx.font = '10px monospace';
        this.canvas.ctx.textAlign = 'left';
        this.canvas.ctx.fillText('Trigger', 5, triggerY - 5);
    }

    drawLabels() {
        this.canvas.ctx.fillStyle = '#888888';
        this.canvas.ctx.font = '10px monospace';
        this.canvas.ctx.textAlign = 'center';
        
        // Time labels
        for (let i = 0; i <= 10; i++) {
            const x = (i / 10) * this.width;
            const time = i * this.timePerDiv;
            this.canvas.ctx.fillText(`${time.toFixed(1)}ms`, x, this.height - 5);
        }
        
        // Voltage labels
        this.canvas.ctx.textAlign = 'right';
        for (let i = 0; i <= 8; i++) {
            const y = (i / 8) * this.height;
            const voltage = (4 - i) * this.voltagePerDiv;
            this.canvas.ctx.fillText(`${voltage.toFixed(1)}V`, 5, y + 3);
        }
        
        // Title
        this.canvas.ctx.fillStyle = '#ffffff';
        this.canvas.ctx.font = '12px monospace';
        this.canvas.ctx.textAlign = 'center';
        this.canvas.ctx.fillText('OSCILLOSCOPE', this.width / 2, 15);
    }

    drawStatic() {
        this.canvas.ctx.fillStyle = '#000000';
        this.canvas.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw static grid
        this.drawGrid();
        this.drawLabels();
        
        // Draw a flat line
        this.canvas.ctx.strokeStyle = '#333333';
        this.canvas.ctx.lineWidth = 2;
        this.canvas.ctx.beginPath();
        this.canvas.ctx.moveTo(0, this.canvas.height / 2);
        this.canvas.ctx.lineTo(this.canvas.width, this.canvas.height / 2);
        this.canvas.ctx.stroke();
    }
}
