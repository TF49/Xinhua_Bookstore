const STORAGE_KEY = "xinhua-bookstore-cart";

function readStorage() {
    try {
        return window.localStorage.getItem(STORAGE_KEY);
    } catch (error) {
        return null;
    }
}

function writeStorage(value) {
    try {
        window.localStorage.setItem(STORAGE_KEY, value);
        return true;
    } catch (error) {
        return false;
    }
}

function normalizeCartItems(rawItems) {
    if (!Array.isArray(rawItems)) return [];

    return rawItems
        .map((item, index) => {
            const title = String(item?.title || "").trim();
            const quantity = Math.max(1, Number(item?.quantity) || 1);
            const price = Number(item?.price);

            if (!title) return null;

            return {
                id: String(item?.id || `${title}-${index}`),
                title,
                price: Number.isFinite(price) ? price : null,
                category: String(item?.category || "").trim(),
                image: String(item?.image || "").trim(),
                quantity,
            };
        })
        .filter(Boolean);
}

function readCartItems() {
    const rawValue = readStorage();
    if (!rawValue) return [];

    try {
        const parsed = JSON.parse(rawValue);
        return normalizeCartItems(parsed);
    } catch (error) {
        const legacyCount = Number(rawValue);
        if (!Number.isFinite(legacyCount) || legacyCount <= 0) return [];

        return [{
            id: "legacy-cart-item",
            title: "已收藏图书",
            price: null,
            category: "历史数据",
            image: "",
            quantity: Math.max(1, Math.floor(legacyCount)),
        }];
    }
}

function readCartCount() {
    return readCartItems().reduce((total, item) => total + item.quantity, 0);
}

function writeCartItems(nextItems) {
    const safeItems = normalizeCartItems(nextItems);
    writeStorage(JSON.stringify(safeItems));
    syncCartCount();
    window.dispatchEvent(new CustomEvent("xinhua:cart-updated", {
        detail: { items: safeItems },
    }));
}

function writeCartCount(nextCount) {
    const safeCount = Math.max(0, Number(nextCount) || 0);
    if (!safeCount) {
        writeCartItems([]);
        return;
    }

    writeCartItems([{
        id: "manual-cart-count",
        title: "已收藏图书",
        price: null,
        category: "手动同步",
        image: "",
        quantity: safeCount,
    }]);
}

function addCartItem(item, quantity = 1) {
    const title = String(item?.title || "").trim();
    if (!title) return;

    const nextQuantity = Math.max(1, Number(quantity) || 1);
    const items = readCartItems();
    const itemId = String(item?.id || title);
    const existing = items.find((entry) => entry.id === itemId);

    if (existing) {
        existing.quantity += nextQuantity;
        if (item?.price != null) existing.price = Number(item.price);
        if (item?.category) existing.category = item.category;
        if (item?.image) existing.image = item.image;
    } else {
        items.push({
            id: itemId,
            title,
            price: item?.price != null ? Number(item.price) : null,
            category: String(item?.category || "").trim(),
            image: String(item?.image || "").trim(),
            quantity: nextQuantity,
        });
    }

    writeCartItems(items);
}

function updateCartItemQuantity(itemId, quantity) {
    const items = readCartItems();
    const nextItems = items
        .map((item) => item.id === itemId ? { ...item, quantity: Math.max(0, Number(quantity) || 0) } : item)
        .filter((item) => item.quantity > 0);
    writeCartItems(nextItems);
}

function removeCartItem(itemId) {
    writeCartItems(readCartItems().filter((item) => item.id !== itemId));
}

function clearCart() {
    writeCartItems([]);
}

function syncCartCount() {
    const count = readCartCount();
    document.querySelectorAll("[data-cart-count]").forEach((node) => {
        node.textContent = `${count} 件藏书`;
    });
}

function showToast(title, message) {
    const host = document.querySelector(".c-toast-stack");
    if (!host) return;

    const toast = document.createElement("div");
    toast.className = "c-toast";
    const strong = document.createElement("strong");
    strong.textContent = title;
    const span = document.createElement("span");
    span.textContent = message;
    toast.append(strong, span);
    host.appendChild(toast);

    window.setTimeout(() => {
        toast.classList.add("is-leaving");
        window.setTimeout(() => {
            toast.remove();
        }, 260);
    }, 2340);
}

function initScrollReveal() {
    const nodes = document.querySelectorAll("[data-reveal]");
    if (!nodes.length) return;

    if (!("IntersectionObserver" in window)) {
        nodes.forEach((node) => node.classList.add("is-revealed"));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-revealed");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.18 });

    nodes.forEach((node) => observer.observe(node));
}

function initToTopButton() {
    const button = document.querySelector("[data-to-top]");
    if (!button) return;

    function refresh() {
        button.classList.toggle("is-visible", window.scrollY > 220);
    }

    window.addEventListener("scroll", refresh, { passive: true });
    button.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
    refresh();
}

window.XinhuaUI = {
    addCartItem,
    clearCart,
    readCartCount,
    readCartItems,
    removeCartItem,
    writeCartCount,
    writeCartItems,
    showToast,
    syncCartCount,
    updateCartItemQuantity,
};

document.addEventListener("DOMContentLoaded", () => {
    document.body.classList.add("is-ready");
    syncCartCount();
    initScrollReveal();
    initToTopButton();
});
