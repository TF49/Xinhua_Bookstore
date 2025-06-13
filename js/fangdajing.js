const img = document.getElementById('main-img');
const lens = document.getElementById('lens');
const result = document.getElementById('result');
const zoom = 2;

img.addEventListener('mousemove', moveLens);
img.addEventListener('mouseenter', showZoom);
img.addEventListener('mouseleave', hideZoom);

function showZoom() {
    lens.style.display = 'block';
    result.style.display = 'block';
    result.style.backgroundImage = `url('${img.src}')`;
}

function hideZoom() {
    lens.style.display = 'none';
    result.style.display = 'none';
}

function moveLens(e) {
    e.preventDefault();
    const pos = getCursorPos(e);
    let x = pos.x - lens.offsetWidth / 2;
    let y = pos.y - lens.offsetHeight / 2;

    if (x > img.width - lens.offsetWidth) x = img.width - lens.offsetWidth;
    if (x < 0) x = 0;
    if (y > img.height - lens.offsetHeight) y = img.height - lens.offsetHeight;
    if (y < 0) y = 0;

    lens.style.left = x + 'px';
    lens.style.top = y + 'px';

    result.style.backgroundPosition = `-${x * zoom}px -${y * zoom}px`;
    result.style.backgroundSize = `${img.width * zoom}px ${img.height * zoom}px`;
}

function getCursorPos(e) {
    const rect = img.getBoundingClientRect();
    const x = e.pageX - rect.left - window.pageXOffset;
    const y = e.pageY - rect.top - window.pageYOffset;
    return { x, y };
}