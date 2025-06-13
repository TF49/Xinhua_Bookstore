function banner() {
    let Banner = document.querySelector(".banner");
    let BannerWraperList = document.querySelector(".banner_wraper_list");
    let BannerWraperListItem = document.querySelectorAll(".banner_wraper_list_item");
    let BannerWraperLeftBtn = document.querySelector(".banner_wraper_left_btn");
    let BannerWraperRightBtn = document.querySelector(".banner_wraper_right_btn");
    let BannerWraperBtnBoxSpan = document.querySelectorAll(".banner_wraper_btn_box span");

    let index = 0;

    // 点击下方按钮切换轮播图
    for (let i = 0; i < BannerWraperBtnBoxSpan.length; i++) {
        BannerWraperBtnBoxSpan[i].onclick = function () {
            index = i;
            move();
        }
    }

    function move() {
        // 清空所有按钮的 active 类
        for (let j = 0; j < BannerWraperBtnBoxSpan.length; j++) {
            BannerWraperBtnBoxSpan[j].className = "";
        }
        // 给当前按钮添加 active 类
        BannerWraperBtnBoxSpan[index].className = "active";

        // 计算 BannerWraperList 的 left 值
        let itemWidth = BannerWraperListItem[0].offsetWidth;
        BannerWraperList.style.left = -index * itemWidth + "px";
    }

    // 自动播放
    let timer = "";
    timer = setInterval(autoPlay, 3000);

    function autoPlay() {
        index++;
        if (index >= BannerWraperBtnBoxSpan.length) {
            index = 0;
        }
        move();
    }

    // 鼠标悬停时停止自动播放
    Banner.onmouseover = function () {
        clearInterval(timer);
    };

    // 鼠标离开后恢复自动播放
    Banner.onmouseout = function () {
        timer = setInterval(autoPlay, 3000);
    };

    // 右侧按钮点击事件
    BannerWraperRightBtn.onclick = function () {
        autoPlay();
    };

    // 左侧按钮点击事件
    BannerWraperLeftBtn.onclick = function () {
        index--;
        if (index < 0) {
            index = BannerWraperBtnBoxSpan.length - 1;
        }
        move();
    }
}
banner();