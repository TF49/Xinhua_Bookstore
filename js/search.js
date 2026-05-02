function initSearchEnhancement() {
    const input = document.querySelector(".c-search-panel__input");
    const button = document.querySelector("[data-search-trigger]");

    if (!input || !button) return;

    const runSearch = () => {
        const keyword = input.value.trim() || input.placeholder;
        window.XinhuaUI?.showToast("搜索演示", `当前为静态作业站点，已记录关键词：“${keyword}”`);
        input.focus();
        input.select();
    };

    button.addEventListener("click", runSearch);
    input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            runSearch();
        }
    });
}

document.addEventListener("DOMContentLoaded", initSearchEnhancement);
