import { UIControl } from './UIControl.js';
import { AudioControl } from './AudioControl.js';

export class ControlPanel {
    constructor(settings) {
        this.settings = settings;
        this.controlsContainer = this.createControlPanel();
        this.audioControl = new AudioControl(this.controlsContainer, settings.audioAnalyzer);
        this.setupControls();
    }

    createControlPanel() {
        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'control-container';
        document.querySelector('.container-content').appendChild(controlsContainer);
        
        const toggleButton = document.querySelector('.controls-toggle');
        toggleButton.addEventListener('click', () => {
            controlsContainer.style.display = controlsContainer.style.display === 'none' ? 'flex' : 'none';
        });
        
        return controlsContainer;
    }

    setupControls() {
        this.setupCheckboxContainer();
        this.setupSlidersContainer();
    }

    setupCheckboxContainer() {
        const checkboxContainer = document.createElement('div');
        checkboxContainer.className = 'checkbox-container';
        this.controlsContainer.appendChild(checkboxContainer);

        const checkboxes = [
            ['Animation', 'animationEnabled'],
            ['Mouse Control', 'mouseControlEnabled'],
            ['Particles', 'particlesEnabled'],
            ['Bloom Animation', 'bloomAnimationEnabled'],
            ['Audio Reactivity', 'audioReactivityEnabled']
        ];

        checkboxes.forEach(([label, property]) => {
            UIControl.createCheckbox(checkboxContainer, label, this.settings[property], (checked) => {
                this.settings[property] = checked;
                if (property === 'particlesEnabled' && this.settings.particleSystem) {
                    this.settings.particleSystem.setVisible(checked);
                }
            });
        });
    }

    setupSlidersContainer() {
        const slidersContainer = document.createElement('div');
        slidersContainer.className = 'sliders-container';
        this.controlsContainer.appendChild(slidersContainer);

        const sliders = [
            ['Bloom', 0, 3, 'baseBloomStrength', 0.1],
            ['Radius', 0, 1, 'radius', 0.1],
            ['Threshold', 0, 1, 'threshold', 0.1],
            ['Wind Force', 0, 0.01, 'windForce', 0.001],
            ['Particle Count', 0, 200, 'particleCount', 10],
            ['Rotation', 0, 0.05, 'rotationSpeed', 0.001],
            ['Kick Intensity', 0, 2, 'kickScaleFactor', 0.1],
            ['Snare Intensity', 0, 2, 'snareScaleFactor', 0.1],
            ['Response Smoothing', 0.01, 0.5, 'scaleSmoothing', 0.01]
        ];

        sliders.forEach(([label, min, max, property, step]) => {
            UIControl.createSlider(slidersContainer, label, min, max, this.settings[property], step, (value) => {
                this.settings[property] = value;
            });
        });
    }
}
