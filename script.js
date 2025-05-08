// 等待整个HTML文档被完全加载和解析（不等待样式表、图片、子框架加载完成）
// 使用DOMContentLoaded确保脚本在DOM结构可用时执行
document.addEventListener('DOMContentLoaded', function() {

    // --- 全局元素获取 ---
    // 获取加载动画元素
    const preloader = document.querySelector('.preloader');
    // 获取顶部导航栏元素
    const topbar = document.getElementById('topbar');
    // 获取移动端菜单切换按钮
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    // 获取主菜单列表（包含所有菜单项）
    const mainMenu = document.querySelector('.menu');
    // 获取所有包含下拉菜单的菜单项
    const dropdownMenuItems = document.querySelectorAll('.dropdown');

    // --- 页面加载动画控制 ---
    // 页面完全加载（包括所有资源，如图片、样式表等）后触发
    window.addEventListener('load', function() {
        // 确保preloader元素存在
        if (preloader) {
            // 设置一个短暂的延迟，让加载动画显示一会儿
            setTimeout(() => {
                // 添加 'hidden' 类，触发 CSS 淡出和隐藏动画
                preloader.classList.add('hidden');
                // 给body添加 'loaded' 类，触发 body 的淡入效果
                document.body.classList.add('loaded');
                // 可选：在动画结束后移除preloader元素，释放DOM资源
                 setTimeout(() => preloader.remove(), 600); // 动画时间+一点缓冲
            }, 300); // 延迟时间：300毫秒
        } else {
             // 如果没有preloader元素，直接给body添加 'loaded' 类
             document.body.classList.add('loaded');
        }

         // 初始化 AOS 动画库
        initAOS();
        // 激活当前页面导航项
        setActiveNavItem();
        // 检查并执行技能进度条动画 (如果当前页面是 about.html 且技能区域可见)
        // 这个逻辑现在通过 IntersectionObserver 或直接在 about 页面加载时触发
        // animateSkillBars(); // 移除这里的全局调用，由下面的逻辑或about页面的特定逻辑触发
        // 检查并执行图片懒加载
        setupLazyLoading();

        // 触发作品集默认筛选（如果存在）
        triggerInitialPortfolioFilter();
    });


    // --- 导航栏滚动效果 (隐藏/显示) ---
    let lastScrollTop = 0; // 记录上次滚动的位置
    // 滚动隐藏阈值：向下滚动超过这个距离才开始隐藏导航栏
    const scrollHideThreshold = 100;
    // 滚动显示阈值：向上滚动超过这个距离才开始显示导航栏
    const scrollShowThreshold = 50;

    // 检查导航栏元素是否存在
    if (topbar) {
        // 确保导航栏在页面加载时是可见的，并设置默认的transform状态
        topbar.style.transform = 'translateY(0)';

        window.addEventListener('scroll', function() {
            // 获取当前滚动条的垂直位置
            const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
            // 获取导航栏的高度
            const topbarHeight = topbar.offsetHeight;

            // --- 导航栏隐藏/显示逻辑 ---
            // 只有当移动端菜单未展开时才执行隐藏/显示逻辑
            // 确保 mainMenu 和 its classList are accessible
            if (mainMenu && !mainMenu.classList.contains('active')) {
                 // 如果当前向下滚动 (当前位置 > 上次位置) 并且滚动距离超过隐藏阈值
                 if (currentScroll > lastScrollTop && currentScroll > topbarHeight + scrollHideThreshold) {
                     // 向下滚动，隐藏导航栏
                     topbar.classList.add('hidden-bar');
                 }
                 // 如果当前向上滚动 (当前位置 < 上次位置) 并且向上滚动的距离超过显示阈值
                 // 同时确保当前位置不是在页面最顶部附近，避免顶部抖动
                 else if (currentScroll < lastScrollTop && currentScroll > topbarHeight && (lastScrollTop - currentScroll) > scrollShowThreshold) {
                     // 向上滚动，显示导航栏
                     topbar.classList.remove('hidden-bar');
                 }
            } else {
                 // 如果移动端菜单已展开，始终显示导航栏，并确保其位置在顶部
                 topbar.classList.remove('hidden-bar');
                 // topbar.style.transform = 'translateY(0)'; // No need to force reset, CSS handles it
            }

             // 当滚动到页面最顶部时，始终显示导航栏
             if (currentScroll <= 0) {
                  topbar.classList.remove('hidden-bar');
                  // topbar.style.transform = 'translateY(0)'; // No need to force reset
             }


            // --- 导航栏样式变化逻辑 (缩小/背景变深) ---
            // 当向下滚动超过一定距离时，给导航栏添加 'scrolled' 类
            if (currentScroll > 100) {
                topbar.classList.add('scrolled');
            } else {
                 // 否则移除 'scrolled' 类，恢复原始样式
                topbar.classList.remove('scrolled');
            }

            // 更新上次滚动的位置，防止负值出现
            lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
        });
    }

    // --- 判断当前是否为移动设备视图 ---
    // Helper function to check if current window width is <= 992px (based on CSS media query)
    const isMobileView = () => window.innerWidth <= 992;

    // --- 移动端菜单切换 ---
    // 检查菜单切换按钮和菜单元素是否存在
    if (mobileMenuToggle && mainMenu) {
        // 为切换按钮添加点击事件监听器
        mobileMenuToggle.addEventListener('click', function() {
            // 切换菜单的 'active' 类，控制其显示/隐藏
            mainMenu.classList.toggle('active');
            // 切换 body 的 'no-scroll' 类，防止在菜单展开时主体内容滚动
            document.body.classList.toggle('no-scroll');

            // 如果菜单被关闭，则关闭所有打开的下拉菜单
            if (!mainMenu.classList.contains('active')) {
                 dropdownMenuItems.forEach(dropdown => {
                     dropdown.classList.remove('active');
                 });
            }
            // 确保在移动端菜单激活时导航栏可见且在顶部
             if (topbar) {
                topbar.classList.remove('hidden-bar');
                // topbar.style.transform = 'translateY(0)'; // No need to force reset
             }
        });
    }

    // --- 移动端下拉菜单切换 ---
     // 检查下拉菜单项是否存在
     if (dropdownMenuItems.length > 0) {
         dropdownMenuItems.forEach(dropdown => {
             const dropdownLink = dropdown.querySelector('a'); // 获取下拉菜单的父链接

             // 为下拉菜单的父链接添加点击事件监听器
             dropdownLink.addEventListener('click', function(e) {
                 // 只在移动设备视图下处理点击事件
                 if (isMobileView()) {
                      // 阻止默认的链接跳转行为（对于作为下拉菜单父级的链接）
                      // 这样点击时只会展开/收起下拉菜单
                       e.preventDefault();

                      // 关闭其他已打开的移动端下拉菜单
                       dropdownMenuItems.forEach(otherDropdown => {
                          // 确保是另一个下拉菜单且当前是打开状态
                           if (otherDropdown !== dropdown && otherDropdown.classList.contains('active')) {
                               otherDropdown.classList.remove('active');
                           }
                       });

                      // 切换当前点击的下拉菜单的 'active' 类
                       dropdown.classList.toggle('active');
                 }
                 // 在桌面视图下，CSS 的 :hover 会处理下拉菜单的显示，JS不干预
             });

              // 为下拉菜单内的子链接添加点击事件监听，点击后关闭整个移动菜单
              dropdown.querySelectorAll('.dropdown-menu a').forEach(subLink => {
                  subLink.addEventListener('click', function() {
                      if (isMobileView()) {
                          // 关闭主菜单
                          if (mainMenu && mainMenu.classList.contains('active')) {
                              mainMenu.classList.remove('active');
                              document.body.classList.remove('no-scroll');
                          }
                          // 关闭所有下拉菜单
                           dropdownMenuItems.forEach(d => d.classList.remove('active'));
                      }
                  });
              });
         });
     }


     // --- 窗口大小改变时处理 ---
     window.addEventListener('resize', function() {
         // 如果从移动视图切换到桌面视图
         if (!isMobileView()) {
             // 确保移动端菜单关闭
             if (mainMenu && mainMenu.classList.contains('active')) {
                 mainMenu.classList.remove('active'); // 移除 active 类
                 document.body.classList.remove('no-scroll'); // 恢复 body 滚动
             }
             // 确保所有下拉菜单关闭，并移除移动端相关的内联样式（由CSS max-height: 0 控制）
             dropdownMenuItems.forEach(dropdown => {
                  dropdown.classList.remove('active'); // 移除 active 类
             });
             // 确保导航栏在桌面视图下始终可见（除非页面顶部，由scroll处理）
             if (topbar) {
                  topbar.classList.remove('hidden-bar');
                  // topbar.style.transform = 'translateY(0)'; // No need to force reset
             }
         }
     });


    // --- 移除语言切换功能相关的代码 ---
    // 删除了所有与 data-translate 相关的变量、函数和逻辑
    // 删除了 isEnglish 变量和 localStorage 的使用
    // 删除了 translateToEnglish, translateToChinese, translatePageMeta 函数
    // 删除了 langSwitchButton 及其事件监听

    // --- 作品集筛选功能 ---
     // 获取作品筛选按钮容器
    const portfolioFilterContainer = document.querySelector('.portfolio-filter');

    if (portfolioFilterContainer) { // 确保在存在作品筛选按钮的页面才执行此代码
        const portfolioFilters = portfolioFilterContainer.querySelectorAll('button');
        const portfolioItems = document.querySelectorAll('.portfolio-grid .portfolio-item');

         if (portfolioFilters.length > 0 && portfolioItems.length > 0) {
             portfolioFilters.forEach(filterButton => {
                 // 为每个筛选按钮添加点击事件监听器
                 filterButton.addEventListener('click', function() {
                     // 移除所有按钮的 'active' 类
                     portfolioFilters.forEach(btn => btn.classList.remove('active'));
                     // 给当前点击的按钮添加 'active' 类
                     this.classList.add('active');

                     // 获取按钮的 data-filter 属性值
                     const filterValue = this.getAttribute('data-filter');

                     // 遍历所有作品项
                     portfolioItems.forEach(item => {
                         // 如果 filterValue 是 'all' 或作品项包含对应的 filterValue 类
                         if (filterValue === 'all' || item.classList.contains(filterValue)) {
                             // 显示作品项
                             item.style.display = 'block';
                         } else {
                             // 隐藏作品项
                             item.style.display = 'none';
                         }
                     });

                     // 在筛选后刷新 AOS，确保可见的元素能触发动画
                     // 使用 setTimeout 延迟刷新，给 display 样式应用时间
                     setTimeout(() => {
                         if (typeof AOS !== 'undefined') {
                             AOS.refreshHard(); // 使用 refreshHard 重新计算所有元素的位置
                         }
                     }, 50); // 短暂延迟
                 });
             });
             // 页面加载后，触发默认的 '全部' 按钮点击，以显示所有作品 (这个逻辑现在在 window.load 中调用 triggerInitialPortfolioFilter)
         }
    }

    // 在页面加载后触发默认筛选按钮点击
    function triggerInitialPortfolioFilter() {
        const portfolioFilterContainer = document.querySelector('.portfolio-filter');
        if (portfolioFilterContainer) {
             const initialFilterButton = portfolioFilterContainer.querySelector('button.active') || portfolioFilterContainer.querySelector('button[data-filter="all"]');
             if(initialFilterButton) {
                 initialFilterButton.click();
             } else {
                 // Fallback: if no active or all button, click the first one
                 const firstButton = portfolioFilterContainer.querySelector('button');
                 if (firstButton) {
                      firstButton.click();
                 }
             }
        }
    }


    // --- 平滑滚动到锚点 ---
     // 为所有以 # 开头的链接添加点击事件监听器
     document.querySelectorAll('a[href^="#"]').forEach(anchor => {
         anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href'); // 获取链接的 href 属性

            // 确保 href 不仅仅是 # 或空字符串
            if (href !== '#' && href !== '') {
                 e.preventDefault(); // 阻止默认的跳转行为

                 const targetId = href; // 锚点 ID (例如 #section-id)
                 const targetElement = document.querySelector(targetId); // 获取目标元素

                 if (targetElement) {
                     // 计算滚动偏移量
                     const headerOffset = topbar ? topbar.offsetHeight : 0; // 导航栏高度，用于偏移
                     const elementPosition = targetElement.getBoundingClientRect().top; // 目标元素相对于视口顶部的位置
                     const offsetPosition = elementPosition + window.pageYOffset - headerOffset - 20; // 最终滚动到的位置 (元素位置 + 当前滚动位置 - 导航栏高度 - 微调偏移量)

                     // 使用 window.scrollTo 进行平滑滚动
                     window.scrollTo({
                         top: offsetPosition, // 目标位置
                         behavior: 'smooth' // 平滑滚动效果
                     });

                      // 可选：如果菜单是打开状态，在点击锚点后关闭菜单
                      if (isMobileView() && mainMenu && mainMenu.classList.contains('active')) {
                           mainMenu.classList.remove('active');
                           document.body.classList.remove('no-scroll');
                           dropdownMenuItems.forEach(d => d.classList.remove('active'));
                      }
                 }
            }
         });
     });


    // --- 设置当前页面导航高亮 ---
    function setActiveNavItem() {
        // 获取当前页面的文件名 (例如 index.html, about.html)
        // 如果是根目录，path.split('/').pop() 可能是空字符串，所以默认为 'index.html'
        const currentPath = window.location.pathname.split('/').pop() || 'index.html';
        // 获取所有导航菜单链接
        const navLinks = document.querySelectorAll('.menu a');

        navLinks.forEach(link => {
            // 获取链接的 href 属性中的文件名
             const linkPath = link.getAttribute('href') ? link.getAttribute('href').split('/').pop() || '' : ''; // Allow empty string for parent dropdown link href="#"

             // 移除链接和其父级下拉菜单链接的 'active' 类
             link.classList.remove('active');
             const parentDropdown = link.closest('.dropdown');
             if (parentDropdown) {
                 const parentLink = parentDropdown.querySelector('a');
                  // 检查父链接是否存在，并且其 href 不是当前页面，以避免导航到当前页面时父链接也被高亮
                  // 如果父链接本身就是当前页面，它会在下面的逻辑中被高亮
                 if (parentLink && parentLink.getAttribute('href') !== link.getAttribute('href')) {
                      parentLink.classList.remove('active');
                 }
             }


            // 如果链接的文件名与当前页面的文件名匹配
            if (linkPath && linkPath === currentPath) { // Ensure linkPath is not empty (for dropdown parent href="#")
                 // 给当前页面对应的链接添加 'active' 类
                 link.classList.add('active');
                 // 如果这个链接是下拉菜单中的子项
                 if (parentDropdown) {
                     // 给下拉菜单的父链接也添加 'active' 类
                     const parentLink = parentDropdown.querySelector('a');
                     if (parentLink) {
                         parentLink.classList.add('active');
                     }
                 }
            }
        });
    }
     // 在 window.load 中调用 setActiveNavItem，确保所有链接都已加载


    // --- 技能进度条动画 (仅在关于我页面) ---
    const skillBars = document.querySelectorAll('.skill-level');
    const skillsSection = document.querySelector('.skills-section'); // 获取技能区域

    // 检查是否存在技能条和技能区域
    if (skillBars.length > 0 && skillsSection) {
        // 定义动画函数
        const animateSkillBars = () => {
            skillBars.forEach(skillBar => {
                // 获取 data-level 属性值（例如 "95%"）
                const percentage = skillBar.getAttribute('data-level');
                 // 使用 setTimeout 增加一点延迟，让动画更平滑
                 setTimeout(() => {
                     // 设置进度条的宽度，触发 CSS 过渡动画
                     skillBar.style.width = percentage;
                 }, 100); // 延迟 100毫秒
            });
        };

         // 使用 IntersectionObserver 来检测技能区域何时进入视口
         if ('IntersectionObserver' in window) {
             const observer = new IntersectionObserver((entries) => {
                 entries.forEach(entry => {
                     // 如果技能区域进入了视口
                     if (entry.isIntersecting) {
                         // 执行动画
                         animateSkillBars();
                         // 停止观察该元素，动画只触发一次
                         observer.unobserve(entry.target);
                     }
                 });
             }, { threshold: 0.3 }); // 当元素的 30% 进入视口时触发

             // 观察技能区域元素
             observer.observe(skillsSection);
         } else {
             // 如果浏览器不支持 IntersectionObserver，直接执行动画 (可能在 about 页面加载时触发)
             // Check if the page is about.html before animating directly
             const currentPath = window.location.pathname.split('/').pop() || 'index.html';
             if (currentPath === 'about.html' && document.body.classList.contains('loaded')) {
                  animateSkillBars();
             }
         }

    } else if (skillBars.length > 0 && document.body.classList.contains('loaded')) {
          // Fallback for pages with skill bars but no dedicated section class, or if IntersectionObserver is not supported/needed
          // Ensure DOM is loaded before trying to set width
           skillBars.forEach(skillBar => {
                const percentage = skillBar.getAttribute('data-level');
                 skillBar.style.width = percentage;
          });
    }


    // --- 图片懒加载 (使用 data-src 属性) ---
    // Function to set up lazy loading
    function setupLazyLoading() {
         // 获取所有带有 data-src 属性的图片元素
         const lazyImages = document.querySelectorAll('img[data-src]');

         // 检查是否存在需要懒加载的图片
         if (lazyImages.length > 0) {
             // 检查浏览器是否支持 IntersectionObserver
             if ('IntersectionObserver' in window) {
                 // 创建 IntersectionObserver 实例
                 const imageObserver = new IntersectionObserver((entries, observer) => {
                     entries.forEach(entry => {
                         // 如果图片进入了视口
                         if (entry.isIntersecting) {
                             const img = entry.target; // 获取目标图片元素
                             const src = img.getAttribute('data-src'); // 获取 data-src 的值
                             if (src) { // 确保 data-src 存在
                                 img.src = src; // 将 data-src 的值赋给 src 属性，开始加载图片
                                 img.removeAttribute('data-src'); // 移除 data-src 属性
                                 observer.unobserve(img); // 停止观察该图片
                             }
                         }
                     });
                 }, { threshold: 0.1, rootMargin: '0px 0px 50px 0px' }); // threshold: 10%可见时触发, rootMargin: 在视口底部增加50px的提前加载区域

                 // 观察所有需要懒加载的图片
                 lazyImages.forEach(img => {
                     imageObserver.observe(img);
                 });
             } else {
                 // 如果浏览器不支持 IntersectionObserver，直接加载所有图片（无懒加载效果）
                 lazyImages.forEach(img => {
                      const src = img.getAttribute('data-src');
                      if (src) {
                          img.src = src;
                          img.removeAttribute('data-src');
                      }
                 });
             }
         }
    }


    // --- Lightbox 初始化 (在相应的 HTML 文件中已经引入和配置) ---
    // 如果页面使用了 Lightbox，它的初始化代码应该在页面底部的 <script> 标签中
    // 这里不再需要额外的全局 Lightbox 初始化代码


    // --- AOS 初始化 ---
    function initAOS() {
        // 检查 AOS 库是否已加载
        if (typeof AOS !== 'undefined') {
             // 初始化 AOS
            AOS.init({
                duration: 800, // 动画持续时间
                easing: 'ease-in-out', // 缓动函数
                once: true, // 动画只播放一次
                mirror: false // 不重复播放动画（向下滚动出现，向上滚动隐藏再向下滚动不会再次触发）
                // offset: 50 // 触发动画的偏移量 (px)
                // disable: 'mobile' // 在移动设备上禁用动画 (可以根据需要启用)
            });
             // 可以在初始化后立即刷新，确保所有元素都被考虑
             AOS.refresh();
        } else {
            console.error("AOS library not loaded."); // 如果 AOS 未加载，输出错误信息
        }
    }
     // 注意：AOS 初始化现在在 window.load 事件中触发，以确保所有元素都已加载

}); // DOMContentLoaded 结束