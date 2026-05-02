function initImageZoom() {
    const img = document.getElementById("main-img");
    const lens = document.getElementById("lens");
    const result = document.getElementById("result");

    if (!img || !lens || !result) return;

    const zoom = 2.2;
    const canHover = window.matchMedia("(hover: hover)").matches;
    if (!canHover) return;

    function showZoom() {
        lens.classList.add("is-visible");
        result.classList.add("is-visible");
        result.style.backgroundImage = `url('${img.src}')`;
        result.style.backgroundSize = `${img.width * zoom}px ${img.height * zoom}px`;
    }

    function hideZoom() {
        lens.classList.remove("is-visible");
        result.classList.remove("is-visible");
    }

    function getCursorPos(event) {
        const rect = img.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
        };
    }

    function moveLens(event) {
        event.preventDefault();
        const position = getCursorPos(event);
        let x = position.x - lens.offsetWidth / 2;
        let y = position.y - lens.offsetHeight / 2;

        x = Math.max(0, Math.min(x, img.width - lens.offsetWidth));
        y = Math.max(0, Math.min(y, img.height - lens.offsetHeight));

        lens.style.left = `${x}px`;
        lens.style.top = `${y}px`;
        result.style.backgroundPosition = `-${x * zoom}px -${y * zoom}px`;
    }

    img.addEventListener("mouseenter", showZoom);
    img.addEventListener("mouseleave", hideZoom);
    img.addEventListener("mousemove", moveLens);
}

function initStepper() {
    const stepper = document.querySelector("[data-stepper]");
    if (!stepper) return;

    const input = stepper.querySelector("[data-stepper-input]");
    const plus = stepper.querySelector("[data-stepper-plus]");
    const minus = stepper.querySelector("[data-stepper-minus]");
    if (!input || !plus || !minus) return;

    function update(delta) {
        const next = Math.max(1, Number(input.value) + delta);
        input.value = String(next);
    }

    plus.addEventListener("click", () => update(1));
    minus.addEventListener("click", () => update(-1));
}

function initThumbnails() {
    const image = document.getElementById("main-img");
    const thumbs = document.querySelectorAll("[data-thumb]");
    if (!image || !thumbs.length) return;

    thumbs.forEach((thumb) => {
        thumb.addEventListener("click", () => {
            const src = thumb.getAttribute("data-thumb");
            if (!src) return;
            image.src = src;
            image.alt = thumb.querySelector("img")?.alt || image.alt;
            thumbs.forEach((node) => node.classList.toggle("is-active", node === thumb));
        });
    });
}

function initBuyNowButton() {
    const button = document.querySelector("[data-buy-action]");
    if (!button) return;

    button.addEventListener("click", () => {
        window.XinhuaUI.showToast("作业演示", "当前页面保留静态展示，不接入真实结算流程。");
    });
}

document.addEventListener("DOMContentLoaded", () => {
    initImageZoom();
    initStepper();
    initThumbnails();
    initBuyNowButton();
});
