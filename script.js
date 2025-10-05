// Main Audio Visualization Coordinator
import { AudioContextManager } from './audio/audioContext.js';
import { AudioAnalyzer } from './audio/audioAnalysis.js';
import { CanvasManager } from './utils/canvas.js';
import { Colors } from './utils/colors.js';

// Import all visualizations
import { OrbVisualization } from './visualizations/orb.js';
import { WaveformVisualization } from './visualizations/waveform.js';
import { HexagonVisualization } from './visualizations/hexagon.js';
import { ParticlesVisualization } from './visualizations/particles.js';
import { CircularVisualization } from './visualizations/circular.js';
import { LissajousVisualization } from './visualizations/lissajous.js';
import { ConnectedVisualization } from './visualizations/connected.js';
import { ICUVisualization } from './visualizations/icu.js';
import { BassSpectrumVisualization, MidSpectrumVisualization, TrebleSpectrumVisualization, FullAudioVisualization } from './visualizations/spectrum.js';
import { PixelVisualization } from './visualizations/pixel.js';
import { StudioVisualization } from './visualizations/studio.js';
import { TerrainVisualization } from './visualizations/terrain.js';
import { RoseVisualization } from './visualizations/rose.js';
import { VoronoiVisualization } from './visualizations/voronoi.js';
import { CardioidVisualization } from './visualizations/cardioid.js';
import { FourierVisualization } from './visualizations/fourier.js';
import { PhyllotaxisVisualization } from './visualizations/phyllotaxis.js';
import { ParametricVisualization } from './visualizations/parametric.js';
import { SpectrogramVisualization } from './visualizations/spectrogram.js';
import { FFTAnalyzerVisualization } from './visualizations/fftAnalyzer.js';
import { OscilloscopeVisualization } from './visualizations/oscilloscope.js';
import { PhaseScopeVisualization } from './visualizations/phaseScope.js';
import { GoniometerVisualization } from './visualizations/goniometer.js';
import { CorrelationMeterVisualization } from './visualizations/correlationMeter.js';
import { VUMeterVisualization } from './visualizations/vuMeter.js';
import { Sonogram3DVisualization } from './visualizations/sonogram3d.js';
import { LissajousOscilloscopeVisualization } from './visualizations/lissajousOscilloscope.js';
import { EQAnalyzerVisualization } from './visualizations/eqAnalyzer.js';
import { HarmonicAnalyzerVisualization } from './visualizations/harmonicAnalyzer.js';
import { BeatDetectionVisualization } from './visualizations/beatDetection.js';
import { SpectralCentroidVisualization } from './visualizations/spectralCentroid.js';
import { DynamicRangeVisualization } from './visualizations/dynamicRange.js';

class AudioVisualizationApp {
    constructor() {
        this.audioContext = new AudioContextManager();
        this.audioAnalyzer = new AudioAnalyzer(this.audioContext);
        this.canvasManager = new CanvasManager();
        this.visualizations = new Map();
        this.isActive = false;
        this.animationId = null;
        
        this.initialize();
    }

    async initialize() {
        // Setup canvas elements
        this.setupCanvases();
        
        // Initialize audio context
        const audioReady = await this.audioContext.initialize();
        if (!audioReady) {
            console.error('Failed to initialize audio context');
            return;
        }
        
        // Initialize visualizations
        this.initializeVisualizations();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Try to start audio immediately, but handle browser restrictions
        this.attemptAutoStart();
    }

    setupCanvases() {
        // Get all canvas elements and add them to the manager
        const canvasIds = [
            'canvas', 'waveformCanvas', 'hexCanvas', 'particleCanvas',
            'circularCanvas', 'lissajousCanvas', 'connectedCanvas', 'icuCanvas',
            'bassSpectrumCanvas', 'midSpectrumCanvas', 'trebleSpectrumCanvas', 
            'fullAudioCanvas', 'pixelCanvas', 'studioCanvas', 'roseCanvas', 'voronoiCanvas',
            'cardioidCanvas', 'fourierCanvas', 'phyllotaxisCanvas', 
            'parametricCanvas', 'spectrogramCanvas', 'fftAnalyzerCanvas',
            'oscilloscopeCanvas', 'phaseScopeCanvas', 'goniometerCanvas',
            'correlationMeterCanvas', 'vuMeterCanvas', 'sonogram3dCanvas',
            'lissajousOscilloscopeCanvas', 'eqAnalyzerCanvas', 'harmonicAnalyzerCanvas',
            'beatDetectionCanvas', 'spectralCentroidCanvas', 'dynamicRangeCanvas'
        ];
        
        canvasIds.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                this.canvasManager.addCanvas(id, element);
            }
        });
        
        // Setup canvas dimensions
        this.canvasManager.setupDimensions(400);
    }

    initializeVisualizations() {
        // Initialize all visualizations
        this.visualizations.set('orb', new OrbVisualization(this.canvasManager));
        this.visualizations.set('waveform', new WaveformVisualization(this.canvasManager));
        this.visualizations.set('hexagon', new HexagonVisualization(this.canvasManager));
        this.visualizations.set('particles', new ParticlesVisualization(this.canvasManager));
        this.visualizations.set('circular', new CircularVisualization(this.canvasManager));
        this.visualizations.set('lissajous', new LissajousVisualization(this.canvasManager));
        this.visualizations.set('connected', new ConnectedVisualization(this.canvasManager));
        this.visualizations.set('icu', new ICUVisualization(this.canvasManager));
        this.visualizations.set('bassSpectrum', new BassSpectrumVisualization(this.canvasManager));
        this.visualizations.set('midSpectrum', new MidSpectrumVisualization(this.canvasManager));
        this.visualizations.set('trebleSpectrum', new TrebleSpectrumVisualization(this.canvasManager));
        this.visualizations.set('fullAudio', new FullAudioVisualization(this.canvasManager));
        this.visualizations.set('pixel', new PixelVisualization(this.canvasManager));
        this.visualizations.set('studio', new StudioVisualization(this.canvasManager));
        this.visualizations.set('terrain', new TerrainVisualization(this.canvasManager));
        this.visualizations.set('rose', new RoseVisualization(this.canvasManager));
        this.visualizations.set('voronoi', new VoronoiVisualization(this.canvasManager));
        this.visualizations.set('cardioid', new CardioidVisualization(this.canvasManager));
        this.visualizations.set('fourier', new FourierVisualization(this.canvasManager));
        this.visualizations.set('phyllotaxis', new PhyllotaxisVisualization(this.canvasManager));
        this.visualizations.set('parametric', new ParametricVisualization(this.canvasManager));
        this.visualizations.set('spectrogram', new SpectrogramVisualization(this.canvasManager));
        this.visualizations.set('fftAnalyzer', new FFTAnalyzerVisualization(this.canvasManager));
        this.visualizations.set('oscilloscope', new OscilloscopeVisualization(this.canvasManager));
        this.visualizations.set('phaseScope', new PhaseScopeVisualization(this.canvasManager));
        this.visualizations.set('goniometer', new GoniometerVisualization(this.canvasManager));
        this.visualizations.set('correlationMeter', new CorrelationMeterVisualization(this.canvasManager));
        this.visualizations.set('vuMeter', new VUMeterVisualization(this.canvasManager));
        this.visualizations.set('sonogram3d', new Sonogram3DVisualization(this.canvasManager));
        this.visualizations.set('lissajousOscilloscope', new LissajousOscilloscopeVisualization(this.canvasManager));
        this.visualizations.set('eqAnalyzer', new EQAnalyzerVisualization(this.canvasManager));
        this.visualizations.set('harmonicAnalyzer', new HarmonicAnalyzerVisualization(this.canvasManager));
        this.visualizations.set('beatDetection', new BeatDetectionVisualization(this.canvasManager));
        this.visualizations.set('spectralCentroid', new SpectralCentroidVisualization(this.canvasManager));
        this.visualizations.set('dynamicRange', new DynamicRangeVisualization(this.canvasManager));
        
        // Initialize each visualization
        this.visualizations.forEach(viz => {
            if (viz.initialize) {
                viz.initialize();
            }
        });
    }

    async attemptAutoStart() {
        try {
            await this.startAudio();
        } catch (error) {
            // If auto-start fails, show message to user
            this.updateStatus('Click anywhere to start listening');
        }
    }

    setupEventListeners() {
        const toggleBtn = document.getElementById('toggleBtn');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                if (this.isActive) {
                    this.stopAudio();
                } else {
                    this.startAudio();
                }
            });
        }
        
        // Add click listener to the entire page to start audio on first interaction
        document.addEventListener('click', () => {
            if (!this.isActive) {
                this.startAudio();
            }
        }, { once: true });
    }

    async startAudio() {
        const success = await this.audioContext.startMicrophone();
        if (success) {
            this.isActive = true;
            this.updateButton('Stop Listening');
            this.updateStatus('Listening...');
            this.animate();
        } else {
            this.updateStatus('Microphone access denied');
        }
    }

    stopAudio() {
        this.audioContext.stop();
        this.isActive = false;
        this.updateButton('Start Listening');
        this.updateStatus('Stopped. Click "Start Listening" to begin');
        
        // Draw static versions of all visualizations
        this.visualizations.forEach(viz => {
            if (viz.drawStatic) {
                viz.drawStatic();
            }
        });
    }

    animate() {
        if (!this.isActive) return;
        
        const audioLevel = this.audioContext.getAudioLevel();
        const frequencyData = this.audioContext.getFrequencyData();
        
        // Debug audio levels (remove this after testing)
        if (audioLevel > 0) {
            console.log('Audio level:', audioLevel);
        }
        
        // Update all visualizations
        this.visualizations.forEach(viz => {
            if (viz.draw) {
                viz.draw(audioLevel, frequencyData);
            }
        });
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    updateButton(text) {
        const toggleBtn = document.getElementById('toggleBtn');
        if (toggleBtn) {
            toggleBtn.textContent = text;
        }
    }

    updateStatus(text) {
        const status = document.getElementById('status');
        if (status) {
            status.textContent = text;
        }
    }
}

// Initialize the app when the page loads
window.addEventListener('load', () => {
    new AudioVisualizationApp();
});
