import * as THREE from 'three';

export class ParticleSystem {
    constructor(scene, isDarkTheme) {
        this.scene = scene;
        this.particles = new THREE.Group();
        this.particleCount = 200;
        this.windForce = 0.002;
        this.particleSpeed = 0.01;
        this.isDarkTheme = isDarkTheme;
        
        this.createParticles();
        scene.add(this.particles);
    }

    createParticles() {
        for (let i = 0; i < this.particleCount; i++) {
            const geometry = new THREE.SphereGeometry(0.02, 8, 8);
            const material = new THREE.MeshStandardMaterial({
                color: this.isDarkTheme ? 0xffffff : 0x000000,
                emissive: this.isDarkTheme ? 0xffffff : 0x000000,
                emissiveIntensity: 2.0, // Increased from 0.5
                transparent: true,
                opacity: 1, // Increased from 0.6
                metalness: 0.8,
                roughness: 0.2
            });

            const particle = new THREE.Mesh(geometry, material);
            this.resetParticle(particle);
            this.particles.add(particle);
        }
    }

    resetParticle(particle) {
        particle.position.x = Math.random() * 30 - 10;
        particle.position.y = Math.random() * 30 - 10;
        particle.position.z = Math.random() * 10 - 5;
        particle.userData.speed = Math.random() * 0.01 + 0.005;
    }

    update() {
        this.particles.children.forEach(particle => {
            // Apply wind force
            particle.position.x += this.windForce;
            particle.position.y += Math.sin(Date.now() * 0.001 + particle.position.x) * 0.002;
            particle.position.z += (Math.random() - 0.5) * 0.001;

            // Reset particle if it goes out of bounds
            if (particle.position.x > 5) {
                particle.position.x = -5;
            }
        });
    }

    setWindForce(value) {
        this.windForce = value;
    }

    setParticleCount(count) {
        const difference = count - this.particles.children.length;
        
        if (difference > 0) {
            // Add more particles
            for (let i = 0; i < difference; i++) {
                const geometry = new THREE.SphereGeometry(0.02, 8, 8);
                const material = new THREE.MeshStandardMaterial({
                    color: this.isDarkTheme ? 0xffffff : 0x000000,
                    emissive: this.isDarkTheme ? 0xffffff : 0x000000,
                    emissiveIntensity: 1, // Increased from 0.5
                    transparent: true,
                    opacity: 0.1,
                    metalness: 0.3,
                    roughness: 0.1
                });
                const particle = new THREE.Mesh(geometry, material);
                this.resetParticle(particle);
                this.particles.add(particle);
            }
        } else if (difference < 0) {
            // Remove excess particles
            for (let i = 0; i < -difference; i++) {
                this.particles.remove(this.particles.children[0]);
            }
        }
    }

    setVisible(visible) {
        this.particles.visible = visible;
    }
}
