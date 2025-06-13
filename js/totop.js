function ToTop() {
    // 获取按钮
    let button = document.querySelector('.top_btn');
    // 初始化按钮状态
    function initButton() {
        // 根据页面是否已滚动来显示或隐藏按钮
        if (window.pageYOffset > 100) {
            button.style.display = "block";
        } else {
            button.style.display = "none";
        }
    }
    // 设置滚动事件监听器以更新按钮状态
    window.addEventListener('scroll', initButton);
    // 设置按钮点击事件监听器以实现回到顶部功能
    button.addEventListener('click', function () {
        // 禁⽤按钮以防⽌重复点击
        button.disabled = true;
        button.style.cursor = 'not-allowed'; // 可选：改变光标样式以指示按钮不可用
        // 使⽤ setInterval 实现平滑滚动
        let scrollStep = -window.pageYOffset / (window.pageYOffset / 15 || 1);
        // 计算每步滚动的距离，15是调整滚动速度的系数
        let scrollInterval = setInterval(function () {
            if (window.pageYOffset !== 0) {
                window.scrollTo(0, window.pageYOffset + scrollStep);
            } else {
                clearInterval(scrollInterval); // 到达顶部时清除定时器
                button.disabled = false; // 重新启用按钮
                button.style.cursor = 'pointer'; // 恢复光标样式
            }
        }, 10); // 设置定时器的时间间隔（毫秒）
    });
    // 初始化按钮状态（在页面加载时调用⼀次）
    initButton();
}
ToTop();