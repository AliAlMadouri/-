// app.js
const uploadBtn = document.getElementById('upload-btn');
const fileInput = document.getElementById('file-input');
const previewImage = document.getElementById('preview-image');
const widthSlider = document.getElementById('width');
const heightSlider = document.getElementById('height');
const widthInput = document.getElementById('width-input');
const heightInput = document.getElementById('height-input');
const lockAspect = document.getElementById('lock-aspect');
const brightnessSlider = document.getElementById('brightness');
const contrastSlider = document.getElementById('contrast');
const saturationSlider = document.getElementById('saturation');
const formatSelect = document.getElementById('format-select');
const saveBtn = document.getElementById('save-btn');

let currentFilters = {
    brightness: 100,
    contrast: 100,
    saturation: 100
};

let originalWidth = 0;
let originalHeight = 0;
let aspectRatio = 1;

// حدث رفع الصورة
uploadBtn.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', function() {
    const file = this.files[0];
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        previewImage.src = e.target.result;
        previewImage.style.display = 'block';
        
        previewImage.onload = () => {
            originalWidth = previewImage.naturalWidth;
            originalHeight = previewImage.naturalHeight;
            aspectRatio = originalWidth / originalHeight;
            
            widthSlider.value = originalWidth;
            heightSlider.value = originalHeight;
            widthInput.value = originalWidth;
            heightInput.value = originalHeight;
            
            enableControls();
        }
    }
    reader.readAsDataURL(file);
});

// تفعيل عناصر التحكم
function enableControls() {
    [
        widthSlider, heightSlider, widthInput, heightInput, lockAspect,
        brightnessSlider, contrastSlider, saturationSlider, 
        formatSelect, saveBtn
    ].forEach(el => el.disabled = false);
}

// تحديث المرشحات
function updateFilters() {
    currentFilters = {
        brightness: brightnessSlider.value,
        contrast: contrastSlider.value,
        saturation: saturationSlider.value
    };

    previewImage.style.filter = `
        brightness(${currentFilters.brightness}%)
        contrast(${currentFilters.contrast}%)
        saturate(${currentFilters.saturation}%)
    `;
}

// تحديث الحجم
function updateSize() {
    previewImage.style.width = `${widthSlider.value}px`;
    previewImage.style.height = `${heightSlider.value}px`;
}

// أحداث السلايدرات
brightnessSlider.addEventListener('input', function() {
    document.getElementById('brightness-value').textContent = `${this.value}%`;
    updateFilters();
});

contrastSlider.addEventListener('input', function() {
    document.getElementById('contrast-value').textContent = `${this.value}%`;
    updateFilters();
});

saturationSlider.addEventListener('input', function() {
    document.getElementById('saturation-value').textContent = `${this.value}%`;
    updateFilters();
});

widthSlider.addEventListener('input', function() {
    widthInput.value = this.value;
    if(lockAspect.checked) {
        heightSlider.value = Math.round(this.value / aspectRatio);
        heightInput.value = heightSlider.value;
    }
    updateSize();
});

heightSlider.addEventListener('input', function() {
    heightInput.value = this.value;
    if(lockAspect.checked) {
        widthSlider.value = Math.round(this.value * aspectRatio);
        widthInput.value = widthSlider.value;
    }
    updateSize();
});

widthInput.addEventListener('change', function() {
    widthSlider.value = this.value;
    updateSize();
});

heightInput.addEventListener('change', function() {
    heightSlider.value = this.value;
    updateSize();
});

// حفظ الصورة
saveBtn.addEventListener('click', () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const image = new Image();
    
    image.onload = () => {
        const targetWidth = parseInt(widthSlider.value);
        const targetHeight = parseInt(heightSlider.value);
        
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        
        ctx.filter = `
            brightness(${currentFilters.brightness}%)
            contrast(${currentFilters.contrast}%)
            saturate(${currentFilters.saturation}%)
        `;
        
        ctx.drawImage(image, 0, 0, targetWidth, targetHeight);
        
        const mimeType = formatSelect.value;
        const quality = mimeType === 'image/jpeg' ? 0.92 : 1;
        const ext = mimeType.split('/')[1].replace('jpeg', 'jpg');
        
        canvas.toBlob(blob => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `edited-image.${ext}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, mimeType, quality);
    };
    
    image.src = previewImage.src;
});
