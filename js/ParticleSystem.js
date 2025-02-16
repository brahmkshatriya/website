import * as THREE from 'three';

export class ParticleSystem {
    constructor(scene, isDarkTheme) {
        this.scene = scene;
        this.particles = new THREE.Group();
        this.particleCount = 40;
        this.windForce = 0.002;
        this.isDarkTheme = isDarkTheme;
        
        this.createParticles();
        scene.add(this.particles);
    }

    createParticles() {
        for (let i = 0; i < this.particleCount; i++) {
            const geometry = new THREE.SphereGeometry(0.02, 8, 8);
            
            // Generate random hue but keep saturation and lightness constant
            const hue = Math.random();
            const color = new THREE.Color().setHSL(hue, this.isDarkTheme ? 0.5 : 0.8, 0.5);
            
            const material = new THREE.MeshStandardMaterial({
                color: color,
                emissive: color,
                emissiveIntensity: 2.0,
                transparent: true,
                opacity: 1,
                metalness: 0.8,
                roughness: 0.2
            });

            const particle = new THREE.Mesh(geometry, material);
            this.resetParticle(particle);
            this.particles.add(particle);
        }
    }

    resetParticle(particle) {
        // Generate points on a sphere
        const phi = Math.acos(-1 + (2 * Math.random()));
        const theta = 2 * Math.PI * Math.random();
        const radius = 3 + Math.random() * 4; // Radius between 3 and 7

        particle.position.x = radius * Math.sin(phi) * Math.cos(theta);
        particle.position.y = radius * Math.sin(phi) * Math.sin(theta);
        particle.position.z = radius * Math.cos(phi);
        
        particle.userData.orbit = {
            radius: radius,
            theta: theta,
            phi: phi,
            speed: (Math.random() * 0.0005 + 0.0002), // Reduced speed
            verticalSpeed: (Math.random() * 0.0002 - 0.0001) // Very slow vertical motion
        };
    }

    update() {
        const time = Date.now() * 0.001; // Current time in seconds
        
        this.particles.children.forEach(particle => {
            const orbit = particle.userData.orbit;
            
            // Update angles
            orbit.theta += orbit.speed;
            orbit.phi += orbit.verticalSpeed;
            
            // Keep phi within bounds
            orbit.phi = Math.max(0.1, Math.min(Math.PI - 0.1, orbit.phi));
            
            // Update position with smooth orbital motion
            particle.position.x = orbit.radius * Math.sin(orbit.phi) * Math.cos(orbit.theta);
            particle.position.y = orbit.radius * Math.sin(orbit.phi) * Math.sin(orbit.theta);
            particle.position.z = orbit.radius * Math.cos(orbit.phi);
            
            // Add very subtle wave motion
            particle.position.x += Math.sin(time + orbit.theta) * 0.02;
            particle.position.y += Math.cos(time + orbit.theta) * 0.02;
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
