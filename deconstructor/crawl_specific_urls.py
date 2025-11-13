"""
批量爬取指定的URL列表
使用原有的 SiteCrawler 单页爬取功能
"""

from playwright.sync_api import sync_playwright
from site_crawler import SiteCrawler
import sys
import os


def crawl_specific_urls(urls, output_dir="deconstructed_site"):
    """
    爬取指定的URL列表

    Args:
        urls: 要爬取的URL列表
        output_dir: 输出目录
    """
    print("=" * 80)
    print("批量爬取指定URL")
    print("=" * 80)
    print(f"\n📋 待爬取URL数量: {len(urls)}")
    for i, url in enumerate(urls, 1):
        print(f"   {i}. {url}")
    print(f"\n📁 输出目录: {output_dir}")
    print("=" * 80 + "\n")

    # 使用第一个URL作为base_url初始化爬虫
    crawler = SiteCrawler(urls[0], output_dir, max_pages=len(urls))

    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,  # 使用无头模式
            args=["--disable-blink-features=AutomationControlled"],  # 避免被检测
        )
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        )
        page = context.new_page()

        successful = 0
        failed = 0

        for i, url in enumerate(urls, 1):
            print("\n" + "▶" * 40)
            print(f"🌐 [{i}/{len(urls)}] 正在爬取: {url}")
            print("▶" * 40 + "\n")

            try:
                # 访问页面
                page.goto(url, wait_until="networkidle", timeout=30000)
                print(f"✅ 页面加载完成: {page.url}")

                # 等待一下确保资源加载
                page.wait_for_timeout(2000)

                # 生成页面目录名
                page_dir = crawler._get_page_dir_name(page.url)
                page_output_dir = os.path.join(crawler.output_dir, page_dir)

                # 使用爬虫的单页解构功能
                result, new_links = crawler._deconstruct_single_page(
                    page, page.url, page_output_dir
                )

                if result:
                    print("\n✅ 页面解构成功!")
                    print(f"   📄 HTML: {result['html_file']}")
                    print(f"   🎨 CSS: {len(result['css_files'])} 个文件")
                    print(f"   📜 JS: {len(result['js_files'])} 个文件")
                    print(f"   🖼️  图片: {len(result['images'])} 个文件")
                    print(f"   🔤 字体: {len(result['fonts'])} 个文件")

                    # 添加到已访问URL和结果列表
                    crawler.visited_urls.add(page.url)
                    crawler.all_results.append(result)
                    successful += 1
                else:
                    print("\n⚠️  页面解构返回空结果")
                    failed += 1

            except Exception as e:
                print(f"\n❌ 爬取失败: {e}")
                failed += 1

        browser.close()

    # 生成sitemap
    print("\n" + "=" * 80)
    print("📊 生成站点地图...")
    crawler._generate_sitemap()

    # 打印总结
    print("\n" + "=" * 80)
    print("🎉 批量爬取完成!")
    print("=" * 80)
    print(f"✅ 成功: {successful}/{len(urls)}")
    print(f"❌ 失败: {failed}/{len(urls)}")
    print(f"📁 输出目录: {os.path.abspath(output_dir)}")
    print("=" * 80 + "\n")


def main():
    """主函数"""
    # 定义要爬取的URL列表
    urls = [
        "https://www.12306.cn/index/",
        "https://kyfw.12306.cn/otn/resources/login.html",
        "https://kyfw.12306.cn/otn/regist/init",
    ]

    # 从命令行参数获取输出目录（可选）
    output_dir = sys.argv[1] if len(sys.argv) > 1 else "deconstructed_site"

    # 执行爬取
    crawl_specific_urls(urls, output_dir)


if __name__ == "__main__":
    main()
