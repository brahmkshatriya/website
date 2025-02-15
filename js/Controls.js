export class Controls {
    constructor(camera, group, scene, bloomPass) {
        this.camera = camera;
        this.group = group;
        this.scene = scene;
        this.bloomPass = bloomPass;
        this.mouseControlEnabled = true;
        this.animationEnabled = true;
        this.mouseX = 0;
        this.mouseY = 0;
        this.isTouching = false;
        this.particlesEnabled = false;
        this.bloomAnimationEnabled = true;
        this.baseBloomStrength = 0.9;
        this.bloomPass.strength = this.baseBloomStrength;
        
        this.setupEventListeners();
        this.createControlPanel();
    }

    setupEventListeners() {
        document.addEventListener('mousemove', this.onMouseMove.bind(this));
        document.addEventListener('touchstart', this.onTouchStart.bind(this));
        document.addEventListener('touchmove', this.onTouchMove.bind(this));
        document.addEventListener('touchend', this.onTouchEnd.bind(this));
    }

    onMouseMove(event) {
        if (this.mouseControlEnabled && !this.isTouching) {
            this.mouseX = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
        }
    }

    onTouchStart(event) {
        event.preventDefault();
        this.isTouching = true;
        const touch = event.touches[0];
        this.mouseX = (touch.clientX / window.innerWidth) * 2 - 1;
        this.mouseY = -(touch.clientY / window.innerHeight) * 2 + 1;
    }

    onTouchMove(event) {
        event.preventDefault();
        if (!this.mouseControlEnabled || !this.isTouching) return;
        
        const touch = event.touches[0];
        this.mouseX = (touch.clientX / window.innerWidth) * 2 - 1;
        this.mouseY = -(touch.clientY / window.innerHeight) * 2 + 1;
    }

    onTouchEnd() {
        this.isTouching = false;
    }

    createControlPanel() {
        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'control-container';
        document.body.appendChild(controlsContainer);

        // Add checkbox controls
        const checkboxContainer = document.createElement('div');
        checkboxContainer.className = 'checkbox-container';
        controlsContainer.appendChild(checkboxContainer);

        this.createCheckbox(checkboxContainer, 'Animation', this.animationEnabled, (checked) => {
            this.animationEnabled = checked;
            // if (!checked) this.group.rotation.y = 0;
        });

        this.createCheckbox(checkboxContainer, 'Mouse Control', this.mouseControlEnabled, (checked) => {
            this.mouseControlEnabled = checked;
            if (!checked) {
                this.camera.position.set(0, 0, 5);
                this.camera.lookAt(this.scene.position);
            }
        });

        this.createCheckbox(checkboxContainer, 'Particles', this.particlesEnabled, (checked) => {
            this.particlesEnabled = checked;
            if (this.particleSystem) {
                this.particleSystem.setVisible(checked);
            }
        });

        this.createCheckbox(checkboxContainer, 'Bloom Animation', this.bloomAnimationEnabled, (checked) => {
            this.bloomAnimationEnabled = checked;
            if (!checked) {
                this.bloomPass.strength = this.baseBloomStrength;
            }
        });

        // Add slider controls
        const slidersContainer = document.createElement('div');
        slidersContainer.className = 'sliders-container';
        controlsContainer.appendChild(slidersContainer);

        this.createSlider(slidersContainer, 'Bloom', 0, 3, this.baseBloomStrength, 0.1, (value) => {
            this.baseBloomStrength = value;
            this.bloomPass.strength = value;
        });

        this.createSlider(slidersContainer, 'Radius', 0, 1, 0.5, 0.1, (value) => {
            this.bloomPass.radius = value;
        });

        this.createSlider(slidersContainer, 'Threshold', 0, 1, 0.0, 0.1, (value) => {
            this.bloomPass.threshold = value;
        });

        // Add particle system controls
        this.createSlider(slidersContainer, 'Wind Force', 0, 0.01, 0.002, 0.001, (value) => {
            if (this.particleSystem) {
                this.particleSystem.setWindForce(value);
            }
        });

        this.createSlider(slidersContainer, 'Particle Count', 0, 200, 100, 10, (value) => {
            if (this.particleSystem) {
                this.particleSystem.setParticleCount(value);
            }
        });
    }

    createCheckbox(container, label, initialState, onChange) {
        const control = document.createElement('label');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = initialState;
        control.appendChild(checkbox);
        control.appendChild(document.createTextNode(label));
        container.appendChild(control);
        
        checkbox.addEventListener('change', () => onChange(checkbox.checked));
    }

    createSlider(container, label, min, max, value, step, onChange) {
        const control = document.createElement('div');
        control.className = 'slider-control';
        
        const labelElement = document.createElement('label');
        labelElement.textContent = label;
        
        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = min;
        slider.max = max;
        slider.value = value;
        slider.step = step;
        
        const valueDisplay = document.createElement('span');
        valueDisplay.textContent = value;
        
        control.appendChild(labelElement);
        control.appendChild(slider);
        control.appendChild(valueDisplay);
        container.appendChild(control);
        
        slider.addEventListener('input', () => {
            valueDisplay.textContent = slider.value;
            onChange(Number(slider.value));
        });
    }

    setParticleSystem(particleSystem) {
        this.particleSystem = particleSystem;
        particleSystem.setVisible(this.particlesEnabled);
    }

    updateBloomAnimation() {
        if (!this.bloomAnimationEnabled) return;
        
        const time = Date.now() * 0.001; // Convert to seconds
        const intensity = this.baseBloomStrength + (Math.sin(time * 0.5) * 0.2);
        this.bloomPass.strength = intensity;
    }

    update() {
        if (this.mouseControlEnabled) {
            this.camera.position.x += (this.mouseX * 5 - this.camera.position.x) * 0.05;
            this.camera.position.y += (this.mouseY * 5 - this.camera.position.y) * 0.05;
        }

        if (this.animationEnabled) {
            this.group.rotation.y += 0.01;
        }

        this.camera.lookAt(this.scene.position);

        this.updateBloomAnimation();

        if (this.particleSystem && this.particlesEnabled) {
            this.particleSystem.update();
        }
    }
}