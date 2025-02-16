export async function updateVisitorCount() {
    try {
        const response = await fetch('https://api.visitorbadge.io/api/visitors?path=brahmkshatriya.dev');
        const svgText = await response.text();
        
        // Extract the visitor count from the SVG text element
        const textMatch = svgText.match(/<text[^>]*>(\d+)<\/text>/);
        const count = textMatch ? textMatch[1] : '0';
        
        const visitorElement = document.querySelector('.visitor-count');
        if (visitorElement) {
            visitorElement.textContent = `visitors: ${count}`;
        }
    } catch (error) {
        console.error('Failed to fetch visitor count:', error);
        const visitorElement = document.querySelector('.visitor-count');
        if (visitorElement) {
            visitorElement.textContent = 'visitors: --';
        }
    }
}
