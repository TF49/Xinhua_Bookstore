function initHeroBanner() {
    const slides = Array.from(document.querySelectorAll("[data-slide]"));
    const dotsHost = document.querySelector("[data-hero-dots]");
    const prevButton = document.querySelector("[data-hero-prev]");
    const nextButton = document.querySelector("[data-hero-next]");
    const rail = document.querySelector("[data-hero-rail]");

    if (!slides.length || !dotsHost || !prevButton || !nextButton || !rail) return;

    let activeIndex = 0;
    let timerId = 0;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dots = slides.map((_, index) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.setAttribute("aria-label", `切换到第 ${index + 1} 张`);
        dot.setAttribute("aria-selected", "false");
        dot.addEventListener("click", () => {
            setActive(index);
            restart();
        });
        dotsHost.appendChild(dot);
        return dot;
    });

    function setActive(index) {
        activeIndex = (index + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
            const isActive = slideIndex === activeIndex;
            slide.classList.toggle("is-active", isActive);
            slide.setAttribute("aria-hidden", String(!isActive));
        });
        dots.forEach((dot, dotIndex) => {
            const isActive = dotIndex === activeIndex;
            dot.classList.toggle("is-active", isActive);
            dot.setAttribute("aria-selected", String(isActive));
        });
    }

    function next() {
        setActive(activeIndex + 1);
    }

    function restart() {
        window.clearInterval(timerId);
        if (!reduceMotion) {
            timerId = window.setInterval(next, 4200);
        }
    }

    prevButton.addEventListener("click", () => {
        setActive(activeIndex - 1);
        restart();
    });

    nextButton.addEventListener("click", () => {
        next();
        restart();
    });

    rail.addEventListener("mouseenter", () => window.clearInterval(timerId));
    rail.addEventListener("mouseleave", restart);
    rail.addEventListener("focusin", () => window.clearInterval(timerId));
    rail.addEventListener("focusout", restart);
    rail.addEventListener("keydown", (event) => {
        if (event.key === "ArrowLeft") {
            setActive(activeIndex - 1);
            restart();
        }
        if (event.key === "ArrowRight") {
            next();
            restart();
        }
    });

    setActive(0);
    restart();
}

function initCategoryTabs() {
    const tabButtons = Array.from(document.querySelectorAll("[data-tab-target]"));
    const panels = Array.from(document.querySelectorAll("[data-tab-panel]"));

    if (!tabButtons.length || !panels.length) return;

    function activateTab(button) {
        const target = button.getAttribute("data-tab-target");
        tabButtons.forEach((node, index) => {
            const selected = node === button;
            node.classList.toggle("is-active", selected);
            node.setAttribute("aria-selected", String(selected));
            node.setAttribute("tabindex", selected ? "0" : "-1");
            panels[index]?.setAttribute("aria-hidden", String(!selected));
        });

        panels.forEach((panel) => {
            panel.classList.toggle("is-active", panel.getAttribute("data-tab-panel") === target);
        });
    }

    tabButtons.forEach((button, index) => {
        button.addEventListener("click", () => activateTab(button));
        button.addEventListener("keydown", (event) => {
            if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;

            event.preventDefault();
            const offset = event.key === "ArrowRight" ? 1 : -1;
            const nextButton = tabButtons[(index + offset + tabButtons.length) % tabButtons.length];
            nextButton.focus();
            activateTab(nextButton);
        });
    });

    activateTab(tabButtons[0]);
}

function initShelfCardSpotlight() {
    const grids = document.querySelectorAll(".c-book-grid");
    if (!grids.length) return;

    const canHover = window.matchMedia("(hover: hover)").matches;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    grids.forEach((grid) => {
        const cards = Array.from(grid.querySelectorAll(".c-book-card"));
        if (!cards.length) return;

        cards.forEach((card) => {
            const body = card.querySelector(".c-book-card__body");
            if (!body) return;

            const title = body.querySelector("h3")?.textContent?.trim() || "精选图书";
            const existingActions = body.querySelector(".c-book-card__actions");
            const existingSecondary = existingActions?.querySelector("button, a:last-child");
            const secondaryText = existingSecondary?.textContent?.trim() || "加入书单";

            if (existingActions) {
                existingActions.innerHTML = `
                    <a href="./index2.html" class="c-button c-button--primary">查看详情</a>
                    <button type="button" class="c-chip-button" data-save-book>${secondaryText}</button>
                `;
            } else {
                const actions = document.createElement("div");
                actions.className = "c-book-card__actions";
                actions.innerHTML = `
                    <a href="./index2.html" class="c-button c-button--primary">查看详情</a>
                    <button type="button" class="c-chip-button" data-save-book>${secondaryText}</button>
                `;
                body.appendChild(actions);
            }

            const hasDescription = body.querySelector("p");
            if (!hasDescription) {
                const meta = body.querySelector(".c-book-card__meta")?.textContent?.trim() || "主题书架精选";
                const price = body.querySelector(".c-price-row strong")?.textContent?.trim() || "";
                const description = document.createElement("p");
                description.textContent = `${meta} · ${title}${price ? `，当前活动价 ${price}` : ""}。`;
                const priceRow = body.querySelector(".c-price-row");
                if (priceRow) {
                    body.insertBefore(description, priceRow);
                } else {
                    body.appendChild(description);
                }
            }
        });

        function animateLayoutChange() {
            if (reduceMotion) return;

            const firstRects = new Map(cards.map((card) => [card, card.getBoundingClientRect()]));

            return () => {
                cards.forEach((card) => {
                    const firstRect = firstRects.get(card);
                    const lastRect = card.getBoundingClientRect();
                    if (!firstRect || !lastRect.width || !lastRect.height) return;

                    const deltaX = firstRect.left - lastRect.left;
                    const deltaY = firstRect.top - lastRect.top;
                    const scaleX = firstRect.width / lastRect.width;
                    const scaleY = firstRect.height / lastRect.height;

                    card.getAnimations().forEach((animation) => animation.cancel());
                    card.animate([
                        {
                            transform: `translate(${deltaX}px, ${deltaY}px) scale(${scaleX}, ${scaleY})`,
                            transformOrigin: "top left",
                        },
                        {
                            transform: "translate(0, 0) scale(1, 1)",
                            transformOrigin: "top left",
                        },
                    ], {
                        duration: 360,
                        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
                    });
                });
            };
        }

        function setSpotlight(targetCard = null) {
            const playAnimation = animateLayoutChange();
            cards.forEach((card) => {
                card.classList.toggle("is-spotlight", card === targetCard);
            });
            playAnimation?.();
        }

        setSpotlight(null);

        if (!canHover) return;

        cards.forEach((card) => {
            card.addEventListener("mouseenter", () => setSpotlight(card));
            card.addEventListener("focusin", () => setSpotlight(card));
        });

        grid.addEventListener("mouseleave", () => setSpotlight(null));
        grid.addEventListener("focusout", (event) => {
            if (!grid.contains(event.relatedTarget)) {
                setSpotlight(null);
            }
        });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    initHeroBanner();
    initCategoryTabs();
    initShelfCardSpotlight();
});
