function getBookData(button) {
    const source = button.closest("[data-book-id]") || button.closest("[data-book-title]");
    const stepper = document.querySelector("[data-stepper-input]");
    const quantity = button.hasAttribute("data-cart-action")
        ? Math.max(1, Number(stepper?.value) || 1)
        : 1;

    return {
        item: {
            id: source?.getAttribute("data-book-id") || source?.getAttribute("data-book-title") || "untitled-book",
            title: source?.getAttribute("data-book-title") || "未命名图书",
            category: source?.getAttribute("data-book-category") || "",
            image: source?.getAttribute("data-book-image") || "",
            price: Number(source?.getAttribute("data-book-price")),
        },
        quantity,
    };
}

function bindAddButton(button, title) {
    const { item, quantity } = getBookData(button);
    window.XinhuaUI.addCartItem(item, quantity);
    window.XinhuaUI.showToast(title, `${item.title} 已加入书袋，共 ${quantity} 件。`);
}

function initSaveBookButtons() {
    document.addEventListener("click", (event) => {
        const target = event.target;
        if (!(target instanceof Element)) return;

        const saveButton = target.closest("[data-save-book]");
        if (saveButton) {
            bindAddButton(saveButton, "已加入书单");
            return;
        }

        const cartButton = target.closest("[data-cart-action]");
        if (cartButton) {
            bindAddButton(cartButton, "已加入购物车");
        }
    });
}

function formatPrice(price) {
    return Number.isFinite(price) ? `￥${price.toFixed(2)}` : "待定价";
}

function renderCartPage() {
    const emptyState = document.querySelector("[data-cart-empty]");
    const filledState = document.querySelector("[data-cart-filled]");
    const list = document.querySelector("[data-cart-list]");
    const totalNode = document.querySelector("[data-cart-total]");
    const summaryNode = document.querySelector("[data-cart-summary]");
    const clearButton = document.querySelector("[data-cart-clear]");

    if (!emptyState || !filledState || !list || !totalNode || !summaryNode || !clearButton) return;

    const items = window.XinhuaUI.readCartItems();
    const hasItems = items.length > 0;

    emptyState.hidden = hasItems;
    filledState.hidden = !hasItems;

    if (!hasItems) {
        list.innerHTML = "";
        totalNode.textContent = "￥0.00";
        summaryNode.textContent = "0 本图书";
        return;
    }

    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce((sum, item) => {
        return sum + (Number.isFinite(item.price) ? item.price * item.quantity : 0);
    }, 0);

    list.innerHTML = items.map((item) => `
        <article class="c-cart-item">
            <div class="c-cart-item__cover">
                ${item.image ? `<img src="${item.image}" alt="${item.title}">` : "<span>书</span>"}
            </div>
            <div class="c-cart-item__body">
                <div class="c-cart-item__meta">${item.category || "精选图书"}</div>
                <h3>${item.title}</h3>
                <div class="c-cart-item__price">${formatPrice(item.price)}</div>
            </div>
            <div class="c-cart-item__actions">
                <label>
                    <span class="u-sr-only">调整 ${item.title} 数量</span>
                    <input type="number" min="1" value="${item.quantity}" data-cart-qty="${item.id}">
                </label>
                <button type="button" class="c-chip-button" data-cart-remove="${item.id}">移除</button>
            </div>
        </article>
    `).join("");

    totalNode.textContent = `￥${totalPrice.toFixed(2)}`;
    summaryNode.textContent = `${totalQuantity} 本图书`;

    list.querySelectorAll("[data-cart-qty]").forEach((input) => {
        input.addEventListener("change", () => {
            const value = Math.max(1, Number(input.value) || 1);
            input.value = String(value);
            window.XinhuaUI.updateCartItemQuantity(input.getAttribute("data-cart-qty"), value);
        });
    });

    list.querySelectorAll("[data-cart-remove]").forEach((button) => {
        button.addEventListener("click", () => {
            window.XinhuaUI.removeCartItem(button.getAttribute("data-cart-remove"));
            window.XinhuaUI.showToast("已移出书袋", "这本书已经从当前清单中移除。");
        });
    });

    clearButton.onclick = () => {
        window.XinhuaUI.clearCart();
        window.XinhuaUI.showToast("书袋已清空", "你可以重新慢慢挑选下一本书。");
    };
}

document.addEventListener("DOMContentLoaded", () => {
    initSaveBookButtons();
    renderCartPage();
    window.addEventListener("xinhua:cart-updated", renderCartPage);
});
