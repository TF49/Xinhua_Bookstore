const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function initAurora() {
    if (document.querySelector(".rb-aurora")) return;
    const aurora = document.createElement("div");
    aurora.className = "rb-aurora";
    aurora.setAttribute("aria-hidden", "true");
    document.body.prepend(aurora);
}

function initSplitText() {
    document.querySelectorAll("[data-rb-split]").forEach((node) => {
        if (node.dataset.rbReady === "true") return;
        const text = node.textContent || "";
        node.textContent = "";
        node.classList.add("rb-split");

        Array.from(text).forEach((char, index) => {
            const span = document.createElement("span");
            span.className = "rb-char";
            span.style.setProperty("--rb-i", index);
            span.textContent = char === " " ? "\u00a0" : char;
            node.appendChild(span);
        });

        node.dataset.rbReady = "true";
    });
}

function initRotatingText() {
    document.querySelectorAll("[data-rb-rotate]").forEach((node) => {
        if (node.dataset.rbReady === "true") return;
        const words = node.getAttribute("data-rb-rotate").split("|").map((word) => word.trim()).filter(Boolean);
        if (!words.length) return;

        node.classList.add("rb-rotating-text");
        node.textContent = "";
        const spans = words.map((word, index) => {
            const span = document.createElement("span");
            span.textContent = word;
            span.classList.toggle("is-active", index === 0);
            node.appendChild(span);
            return span;
        });

        let activeIndex = 0;
        if (!reduceMotion) {
            window.setInterval(() => {
                spans[activeIndex].classList.remove("is-active");
                activeIndex = (activeIndex + 1) % spans.length;
                spans[activeIndex].classList.add("is-active");
            }, Number(node.getAttribute("data-rb-rotate-speed")) || 2100);
        }

        node.dataset.rbReady = "true";
    });
}

function initCountUp() {
    const nodes = document.querySelectorAll("[data-rb-count]");
    if (!nodes.length) return;

    const formatNumber = (value, decimals) => Number(value).toLocaleString("zh-CN", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });

    const run = (node) => {
        if (node.dataset.rbDone === "true") return;
        node.dataset.rbDone = "true";

        const target = Number(node.getAttribute("data-rb-count")) || 0;
        const prefix = node.getAttribute("data-rb-prefix") || "";
        const suffix = node.getAttribute("data-rb-suffix") || "";
        const decimals = Number(node.getAttribute("data-rb-decimals")) || 0;

        if (reduceMotion) {
            node.textContent = `${prefix}${formatNumber(target, decimals)}${suffix}`;
            return;
        }

        const start = performance.now();
        const duration = Number(node.getAttribute("data-rb-duration")) || 1200;

        function tick(now) {
            const progress = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - progress, 3);
            node.textContent = `${prefix}${formatNumber(target * eased, decimals)}${suffix}`;
            if (progress < 1) requestAnimationFrame(tick);
        }

        requestAnimationFrame(tick);
    };

    nodes.forEach((node) => {
        if (!node.textContent.trim()) node.textContent = "0";
    });

    if (!("IntersectionObserver" in window)) {
        nodes.forEach(run);
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const node = entry.target.matches("[data-rb-count]")
                    ? entry.target
                    : entry.target.querySelector("[data-rb-count]");
                if (node) run(node);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.35 });

    nodes.forEach((node) => observer.observe(node.getBoundingClientRect().height ? node : node.parentElement || node));
}

function initDecryptedText() {
    const chars = "新华书店READING0123456789";

    document.querySelectorAll("[data-rb-decrypt]").forEach((node) => {
        if (node.dataset.rbReady === "true") return;
        const original = node.textContent.trim();
        node.dataset.rbReady = "true";

        const decrypt = () => {
            if (reduceMotion) return;
            let frame = 0;
            const timer = window.setInterval(() => {
                node.textContent = Array.from(original).map((char, index) => {
                    if (char === " ") return " ";
                    return index < frame / 2 ? char : chars[Math.floor(Math.random() * chars.length)];
                }).join("");
                frame += 1;
                if (frame > original.length * 2 + 8) {
                    window.clearInterval(timer);
                    node.textContent = original;
                }
            }, 34);
        };

        node.addEventListener("mouseenter", decrypt);
        node.addEventListener("focus", decrypt);
    });
}

function initSpotlightCards() {
    document.querySelectorAll(".rb-spotlight-card").forEach((card) => {
        card.addEventListener("pointermove", (event) => {
            const rect = card.getBoundingClientRect();
            card.style.setProperty("--rb-mx", `${event.clientX - rect.left}px`);
            card.style.setProperty("--rb-my", `${event.clientY - rect.top}px`);
            card.style.setProperty("--rb-spot-opacity", "1");
        });
        card.addEventListener("pointerleave", () => {
            card.style.setProperty("--rb-spot-opacity", "0");
        });
    });
}

function initTiltedCards() {
    document.querySelectorAll(".rb-tilted-card").forEach((card) => {
        card.addEventListener("pointermove", (event) => {
            if (reduceMotion) return;
            const rect = card.getBoundingClientRect();
            const x = (event.clientX - rect.left) / rect.width - 0.5;
            const y = (event.clientY - rect.top) / rect.height - 0.5;
            card.style.setProperty("--rb-tilt-x", `${x * 8}deg`);
            card.style.setProperty("--rb-tilt-y", `${y * -8}deg`);
            card.style.setProperty("--rb-lift", "-4px");
        });
        card.addEventListener("pointerleave", () => {
            card.style.setProperty("--rb-tilt-x", "0deg");
            card.style.setProperty("--rb-tilt-y", "0deg");
            card.style.setProperty("--rb-lift", "0");
        });
    });
}

function initMagnet() {
    document.querySelectorAll(".rb-magnet").forEach((node) => {
        node.addEventListener("pointermove", (event) => {
            if (reduceMotion) return;
            const rect = node.getBoundingClientRect();
            const x = event.clientX - rect.left - rect.width / 2;
            const y = event.clientY - rect.top - rect.height / 2;
            node.style.transform = `translate(${x * 0.16}px, ${y * 0.16}px)`;
        });
        node.addEventListener("pointerleave", () => {
            node.style.transform = "";
        });
    });
}

function initAnimatedLists() {
    const lists = document.querySelectorAll(".rb-animated-list");
    lists.forEach((list) => {
        Array.from(list.children).forEach((child, index) => {
            child.style.setProperty("--rb-i", index);
        });
    });

    if (!("IntersectionObserver" in window)) {
        lists.forEach((list) => list.classList.add("is-revealed"));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-revealed");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    lists.forEach((list) => observer.observe(list));
}

function initClickSpark() {
    if (reduceMotion) return;

    document.addEventListener("click", (event) => {
        const spark = document.createElement("span");
        spark.className = "rb-click-spark";
        spark.style.left = `${event.clientX}px`;
        spark.style.top = `${event.clientY}px`;

        for (let index = 0; index < 8; index += 1) {
            const ray = document.createElement("i");
            ray.style.setProperty("--rb-rotate", `${index * 45}deg`);
            spark.appendChild(ray);
        }

        document.body.appendChild(spark);
        window.setTimeout(() => spark.remove(), 620);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    initAurora();
    initSplitText();
    initRotatingText();
    initCountUp();
    initDecryptedText();
    initSpotlightCards();
    initTiltedCards();
    initMagnet();
    initAnimatedLists();
    initClickSpark();
});
