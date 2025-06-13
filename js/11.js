window.onload = function() {
    // 获取所有导航项和内容区域
    let navItems = document.querySelectorAll(".nav_item");
    let contentAreas = document.querySelectorAll(".content");

    // 默认显示第一个内容区域
    navItems[0].classList.add("active");
    contentAreas[0].classList.add("show");

    // 为每个导航项添加鼠标悬停事件
    for(let i = 0; i < navItems.length; i++) {
        navItems[i].onmouseover = function() {
            // 移除所有active和show类
            for(let j = 0; j < navItems.length; j++) {
                navItems[j].classList.remove("active");
                contentAreas[j].classList.remove("show");
            }
            
            // 为当前项添加active类，显示对应的内容
            navItems[i].classList.add("active");
            contentAreas[i].classList.add("show");
        }
    }
}