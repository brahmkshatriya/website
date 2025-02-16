import * as THREE from 'three';

export class Triangle {
    static TOTAL_DEPTH = 0.2;
    static CENTER_Z = 0;
    static TUBE_RADIUS = 0.005;  // Thickness of the lines

    static createEdgeTubes(vertices, isDarkTheme) {
        const tubes = new THREE.Group();
        const tubeMaterial = new THREE.MeshStandardMaterial({
            color: isDarkTheme ? 0x000000 : 0xffffff,
            transparent: true,
            opacity: 0.8,
            emissive: isDarkTheme ? 0x000000 : 0xffffff,
            emissiveIntensity: 2,
            metalness: 0.5,
            roughness: 0.1
        });

        // Helper function to create a tube between two points
        const createTube = (start, end) => {
            const path = new THREE.LineCurve3(
                new THREE.Vector3(start.x, start.y, start.z),
                new THREE.Vector3(end.x, end.y, end.z)
            );
            const tubeGeometry = new THREE.TubeGeometry(
                path,
                1,
                this.TUBE_RADIUS * (isDarkTheme ? 1 : 0),
                8,
                false
            );
            return new THREE.Mesh(tubeGeometry, tubeMaterial);
        };

        // Create tubes for front face
        for (let i = 0; i < 9; i += 3) {
            const start = { x: vertices[i], y: vertices[i + 1], z: vertices[i + 2] };
            const end = {
                x: vertices[(i + 3) % 9],
                y: vertices[(i + 4) % 9],
                z: vertices[(i + 5) % 9]
            };
            tubes.add(createTube(start, end));
        }

        // Create tubes for back face
        const offset = vertices.length / 2;
        for (let i = 0; i < 9; i += 3) {
            const start = {
                x: vertices[i + offset],
                y: vertices[i + 1 + offset],
                z: vertices[i + 2 + offset]
            };
            const end = {
                x: vertices[(i + 3) % 9 + offset],
                y: vertices[(i + 4) % 9 + offset],
                z: vertices[(i + 5) % 9 + offset]
            };
            tubes.add(createTube(start, end));
        }

        // Create connecting tubes
        for (let i = 0; i < 9; i += 3) {
            const start = { x: vertices[i], y: vertices[i + 1], z: vertices[i + 2] };
            const end = {
                x: vertices[i + offset],
                y: vertices[i + 1 + offset],
                z: vertices[i + 2 + offset]
            };
            tubes.add(createTube(start, end));
        }

        return tubes;
    }

    static create(vectors, colors, bottomToTop = false, isDarkTheme = true) {
        const geometry = new THREE.BufferGeometry();
        const vertices = [];
        const vertexColors = [];
        const maxY = Math.max(...vectors.map(v => v.y));
        const minY = Math.min(...vectors.map(v => v.y));
        const yRange = maxY - minY;

        // Front face vertices
        vectors.forEach((v, i) => {
            const depthRatio = bottomToTop ?
                (v.y - minY) / yRange :
                (maxY - v.y) / yRange;
            const frontZ = -Triangle.TOTAL_DEPTH * depthRatio;
            vertices.push(v.x, v.y, frontZ);

            // Use black in light theme, original colors in dark theme
            if (isDarkTheme) {
                const color = new THREE.Color(colors[i]);
                vertexColors.push(color.r, color.g, color.b);
            } else {
                vertexColors.push(0, 0, 0); // Black color
            }
        });

        // Back face vertices
        vectors.forEach((v, i) => {
            const depthRatio = bottomToTop ?
                (v.y - minY) / yRange :
                (maxY - v.y) / yRange;
            const backZ = Triangle.TOTAL_DEPTH * depthRatio;
            vertices.push(v.x, v.y, backZ);

            // Use black in light theme, original colors in dark theme
            if (isDarkTheme) {
                const color = new THREE.Color(colors[i]);
                vertexColors.push(color.r, color.g, color.b);
            } else {
                vertexColors.push(0, 0, 0); // Black color
            }
        });

        const indices = [
            0, 1, 2, // front face
            3, 4, 5, // back face
            0, 2, 5, 0, 5, 3, // right side
            1, 4, 5, 1, 5, 2, // left side
            0, 3, 4, 0, 4, 1  // bottom
        ];

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(vertexColors, 3));
        geometry.setIndex(indices);
        geometry.computeVertexNormals();

        const material = new THREE.MeshStandardMaterial({
            vertexColors: true,
            side: THREE.DoubleSide,
            shadowSide: THREE.DoubleSide,
            emissive: 0xffffff,
            emissiveIntensity: isDarkTheme ? 0.5 : 0,
            metalness: 0.5,
            roughness: 0.1
        });

        const mesh = new THREE.Mesh(geometry, material);

        // Create tubes with theme awareness
        const tubes = this.createEdgeTubes(vertices, isDarkTheme);

        // Create group and add both mesh and tubes
        const group = new THREE.Group();
        group.add(mesh);
        group.add(tubes);

        return group;
    }
}