"""
带登录状态的爬虫工具
支持保存和复用浏览器登录状态，用于爬取需要登录的页面
"""

from playwright.sync_api import sync_playwright
import json
import os
from pathlib import Path
from site_crawler import SiteCrawler
import time


class AuthenticatedCrawler:
    """支持登录状态的爬虫"""

    def __init__(self, auth_file="auth_state.json"):
        """
        初始化认证爬虫

        Args:
            auth_file: 保存认证状态的文件路径
        """
        self.auth_file = auth_file
        self.auth_data = None

    def manual_login(
        self, login_url="https://kyfw.12306.cn/otn/resources/login.html", wait_time=120
    ):
        """
        打开浏览器让用户手动登录，并保存登录状态

        Args:
            login_url: 登录页面的URL
            wait_time: 等待用户登录的最长时间（秒）

        流程:
            1. 打开浏览器到登录页面
            2. 等待用户手动完成登录
            3. 检测登录成功后自动保存状态
        """
        print("=" * 60)
        print("🔐 手动登录向导")
        print("=" * 60)
        print(f"\n📌 即将打开浏览器，请在 {wait_time} 秒内完成登录操作")
        print("\n操作步骤：")
        print("  1. 浏览器会自动打开登录页面")
        print("  2. 请手动输入用户名、密码并完成验证码")
        print("  3. 登录成功后，请在浏览器中导航到任意需要登录的页面")
        print("  4. 看到页面正常显示后，在终端按 Enter 键继续")
        print("\n⚠️  提示：不要关闭浏览器窗口！")
        print("=" * 60)

        input("\n按 Enter 键开始打开浏览器...")

        with sync_playwright() as p:
            # 启动浏览器（非无头模式，让用户可以看到）
            browser = p.chromium.launch(headless=False)
            context = browser.new_context(
                viewport={"width": 1920, "height": 1080},
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            )

            page = context.new_page()

            try:
                # 打开登录页面
                print(f"\n🌐 正在打开登录页面: {login_url}")
                page.goto(login_url, wait_until="networkidle")

                print("\n✅ 浏览器已打开，请在浏览器中完成以下操作：")
                print("   1️⃣  输入用户名和密码")
                print("   2️⃣  完成验证码验证")
                print("   3️⃣  点击登录按钮")
                print("   4️⃣  确认登录成功（页面跳转或显示用户信息）")
                print("   5️⃣  可选：访问一个需要登录的页面测试")

                # 等待用户手动登录
                input("\n✋ 登录完成后，按 Enter 键保存登录状态...")

                # 保存认证状态（包括cookies和localStorage）
                print("\n💾 正在保存登录状态...")

                # 保存cookies
                cookies = context.cookies()

                # 保存localStorage（可能包含token等）
                local_storage = page.evaluate(
                    """() => {
                    let items = {};
                    for (let i = 0; i < localStorage.length; i++) {
                        let key = localStorage.key(i);
                        items[key] = localStorage.getItem(key);
                    }
                    return items;
                }"""
                )

                # 保存sessionStorage
                session_storage = page.evaluate(
                    """() => {
                    let items = {};
                    for (let i = 0; i < sessionStorage.length; i++) {
                        let key = sessionStorage.key(i);
                        items[key] = sessionStorage.getItem(key);
                    }
                    return items;
                }"""
                )

                # 组合所有认证数据
                auth_data = {
                    "cookies": cookies,
                    "local_storage": local_storage,
                    "session_storage": session_storage,
                    "timestamp": time.time(),
                }

                # 保存到文件
                with open(self.auth_file, "w", encoding="utf-8") as f:
                    json.dump(auth_data, f, indent=2, ensure_ascii=False)

                print(f"✅ 登录状态已保存到: {self.auth_file}")
                print(f"   - Cookies: {len(cookies)} 个")
                print(f"   - LocalStorage: {len(local_storage)} 项")
                print(f"   - SessionStorage: {len(session_storage)} 项")

                # 验证登录状态
                print("\n🔍 正在验证登录状态...")
                test_url = input(
                    "请输入一个需要登录的页面URL进行测试（按Enter跳过）: "
                ).strip()

                if test_url:
                    page.goto(test_url, wait_until="networkidle")
                    print("✅ 请在浏览器中检查页面是否正常显示")
                    input("确认无误后按 Enter 关闭浏览器...")

                print(
                    "\n✅ 登录状态保存成功！现在可以使用 crawl_with_auth() 方法爬取需要登录的页面了。"
                )

            except Exception as e:
                print(f"\n❌ 保存登录状态时出错: {e}")
                raise
            finally:
                browser.close()

    def load_auth_state(self):
        """
        加载保存的认证状态

        Returns:
            bool: 是否成功加载
        """
        if not os.path.exists(self.auth_file):
            print(f"❌ 认证文件不存在: {self.auth_file}")
            print("💡 请先运行 manual_login() 方法进行登录")
            return False

        try:
            with open(self.auth_file, "r", encoding="utf-8") as f:
                self.auth_data = json.load(f)

            # 检查是否过期（例如7天）
            saved_time = self.auth_data.get("timestamp", 0)
            if time.time() - saved_time > 7 * 24 * 3600:
                print("⚠️  警告：登录状态可能已过期（超过7天），建议重新登录")

            print(
                f"✅ 已加载登录状态: {len(self.auth_data.get('cookies', []))} 个cookies"
            )
            return True
        except Exception as e:
            print(f"❌ 加载认证状态失败: {e}")
            return False

    def crawl_with_auth(self, urls, output_dir="deconstructed_site"):
        """
        使用保存的登录状态爬取页面

        Args:
            urls: 要爬取的URL列表（字符串或列表）
            output_dir: 输出目录
        """
        # 确保加载了认证状态
        if not self.auth_data:
            if not self.load_auth_state():
                print("\n❌ 无法加载登录状态，请先运行 manual_login() 方法")
                return

        # 如果是单个URL，转换为列表
        if isinstance(urls, str):
            urls = [urls]

        print(f"\n🚀 开始爬取 {len(urls)} 个需要登录的页面...")

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)

            # 创建新的上下文
            context = browser.new_context(
                viewport={"width": 1920, "height": 1080},
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            )

            try:
                # 注入cookies
                context.add_cookies(self.auth_data.get("cookies", []))
                print(f"✅ 已注入 {len(self.auth_data.get('cookies', []))} 个cookies")

                page = context.new_page()

                # 注入localStorage和sessionStorage
                if self.auth_data.get("local_storage"):
                    page.evaluate(
                        f"""(items) => {{
                        for (let key in items) {{
                            localStorage.setItem(key, items[key]);
                        }}
                    }}""",
                        self.auth_data["local_storage"],
                    )
                    print(f"✅ 已注入 LocalStorage")

                if self.auth_data.get("session_storage"):
                    page.evaluate(
                        f"""(items) => {{
                        for (let key in items) {{
                            sessionStorage.setItem(key, items[key]);
                        }}
                    }}""",
                        self.auth_data["session_storage"],
                    )
                    print(f"✅ 已注入 SessionStorage")

                # 使用 SiteCrawler 的逻辑爬取页面
                for i, url in enumerate(urls, 1):
                    print(f"\n[{i}/{len(urls)}] 正在爬取: {url}")
                    try:
                        page.goto(url, wait_until="networkidle", timeout=60000)

                        # 等待页面加载
                        page.wait_for_timeout(3000)

                        # 检查是否仍然登录（可选）
                        # 这里可以添加检查逻辑，例如查找登录状态标识元素

                        # 为每个URL创建独立的爬虫实例来处理
                        crawler = SiteCrawler(url, output_dir, max_pages=1)

                        # 生成页面目录
                        page_dir_name = crawler._get_page_dir_name(url)
                        page_dir = os.path.join(output_dir, page_dir_name)

                        # 解构页面（使用 SiteCrawler 的方法）
                        result, _ = crawler._deconstruct_single_page(
                            page, url, page_dir
                        )

                        if result:
                            print(f"✅ 成功保存页面到: {page_dir}")
                        else:
                            print(f"⚠️  页面保存失败")

                    except Exception as e:
                        print(f"❌ 爬取失败: {e}")
                        continue

                print(f"\n✅ 爬取完成！输出目录: {output_dir}")

            except Exception as e:
                print(f"\n❌ 爬取过程出错: {e}")
                raise
            finally:
                browser.close()


def main():
    """示例用法"""
    print(
        """
╔══════════════════════════════════════════════════════════════╗
║          12306 认证爬虫工具 - 使用说明                        ║
╚══════════════════════════════════════════════════════════════╝

📌 使用流程：

第一步：保存登录状态
    crawler = AuthenticatedCrawler()
    crawler.manual_login()
    # 按照提示在浏览器中手动登录

第二步：使用登录状态爬取页面
    crawler.crawl_with_auth([
        "https://kyfw.12306.cn/otn/leftTicket/init",  # 车票查询页
        "https://kyfw.12306.cn/otn/view/passengers.html",  # 常用联系人
        "https://kyfw.12306.cn/otn/queryOrder/initNoComplete",  # 未完成订单
    ])

💡 提示：
  - 登录状态会保存在 auth_state.json 文件中
  - 一次登录，可以重复使用（直到cookie过期）
  - 如果爬取时遇到需要重新登录，再次运行 manual_login()
"""
    )

    # 交互式菜单
    crawler = AuthenticatedCrawler()

    while True:
        print("\n" + "=" * 60)
        print("请选择操作：")
        print("  1. 手动登录并保存状态")
        print("  2. 爬取需要登录的页面")
        print("  3. 测试登录状态")
        print("  4. 退出")
        print("=" * 60)

        choice = input("\n请输入选项 (1-4): ").strip()

        if choice == "1":
            # 手动登录
            crawler.manual_login()

        elif choice == "2":
            # 爬取页面
            print("\n请输入要爬取的URL（一行一个，输入空行结束）：")
            print("示例：")
            print("  https://kyfw.12306.cn/otn/leftTicket/init")
            print("  https://kyfw.12306.cn/otn/view/passengers.html")
            print()

            urls = []
            while True:
                url = input("URL: ").strip()
                if not url:
                    break
                urls.append(url)

            if urls:
                output_dir = (
                    input("\n输出目录 (默认: deconstructed_site): ").strip()
                    or "deconstructed_site"
                )
                crawler.crawl_with_auth(urls, output_dir)
            else:
                print("❌ 未输入任何URL")

        elif choice == "3":
            # 测试登录状态
            if crawler.load_auth_state():
                print("\n✅ 登录状态有效")
                print(
                    f"   保存时间: {time.ctime(crawler.auth_data.get('timestamp', 0))}"
                )
            else:
                print("\n❌ 登录状态无效或不存在")

        elif choice == "4":
            print("\n👋 再见！")
            break

        else:
            print("\n❌ 无效的选项，请重新输入")


if __name__ == "__main__":
    main()
