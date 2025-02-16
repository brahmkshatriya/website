import { AudioAnalyzer } from './AudioAnalyzer.js';
import { ControlPanel } from './controls/ControlPanel.js';

export class Controls {
    constructor(camera, group, scene, bloomPass) {
        this.settings = {
            camera,
            group,
            scene,
            bloomPass,
            mouseControlEnabled: true,
            animationEnabled: true,
            mouseX: 0,
            mouseY: 0,
            isTouching: false,
            particlesEnabled: true,
            bloomAnimationEnabled: true,
            baseBloomStrength: bloomPass.strength,
            rotationSpeed: 0.025,
            audioAnalyzer: new AudioAnalyzer(),
            audioReactivityEnabled: true,
            kickScaleFactor: 0.5,
            snareScaleFactor: 0.3,
            baseScale: 1.0,
            currentScale: 1.0,
            scaleSmoothing: 0.1,
            particleSystem: null
        };

        this.controlPanel = new ControlPanel(this.settings);
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.addEventListener('mousemove', this.onMouseMove.bind(this));
        document.addEventListener('touchstart', this.onTouchStart.bind(this));
        document.addEventListener('touchmove', this.onTouchMove.bind(this));
        document.addEventListener('touchend', this.onTouchEnd.bind(this));
    }

    onMouseMove(event) {
        if (this.settings.mouseControlEnabled && !this.settings.isTouching) {
            this.settings.mouseX = (event.clientX / window.innerWidth) * 2 - 1;
            this.settings.mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
        }
    }

    onTouchStart(event) {
        event.preventDefault();
        this.settings.isTouching = true;
        const touch = event.touches[0];
        this.settings.mouseX = (touch.clientX / window.innerWidth) * 2 - 1;
        this.settings.mouseY = -(touch.clientY / window.innerHeight) * 2 + 1;
    }

    onTouchMove(event) {
        event.preventDefault();
        if (!this.settings.mouseControlEnabled || !this.settings.isTouching) return;
        
        const touch = event.touches[0];
        this.settings.mouseX = (touch.clientX / window.innerWidth) * 2 - 1;
        this.settings.mouseY = -(touch.clientY / window.innerHeight) * 2 + 1;
    }

    onTouchEnd() {
        this.settings.isTouching = false;
    }

    setParticleSystem(particleSystem) {
        this.settings.particleSystem = particleSystem;
        particleSystem.setVisible(this.settings.particlesEnabled);
    }

    updateBloomAnimation() {
        if (!this.settings.bloomAnimationEnabled) return;
        
        const time = Date.now() * 0.001;
        const intensity = this.settings.baseBloomStrength + (Math.sin(time * 0.5) * 0.2);
        this.settings.bloomPass.strength = intensity;
    }

    update() {
        const s = this.settings;

        if (s.mouseControlEnabled) {
            s.camera.position.x += (s.mouseX * 5 - s.camera.position.x) * 0.05;
            s.camera.position.y += (s.mouseY * 5 - s.camera.position.y) * 0.05;
        }

        if (s.animationEnabled) {
            s.group.rotation.y += s.rotationSpeed;
        }

        s.camera.lookAt(s.scene.position);
        this.updateBloomAnimation();

        if (s.particleSystem && s.particlesEnabled) {
            s.particleSystem.update();
        }

        if (s.audioReactivityEnabled) {
            const kickLevel = s.audioAnalyzer.getKickLevel();
            const snareLevel = s.audioAnalyzer.getSnareLevel();
            
            const targetScale = s.baseScale + 
                (kickLevel * s.kickScaleFactor) + 
                (snareLevel * s.snareScaleFactor);
            
            s.currentScale += (targetScale - s.currentScale) * s.scaleSmoothing;
            s.group.scale.set(s.currentScale, s.currentScale, s.currentScale);
        }
    }
}