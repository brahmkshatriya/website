export class UIControl {
    static createCheckbox(container, label, initialState, onChange) {
        const control = document.createElement('label');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = initialState;
        control.appendChild(checkbox);
        control.appendChild(document.createTextNode(label));
        container.appendChild(control);
        
        checkbox.addEventListener('change', () => onChange(checkbox.checked));
    }

    static createSlider(container, label, min, max, value, step, onChange) {
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
}
