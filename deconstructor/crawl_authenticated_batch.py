"""
批量爬取需要登录的受保护页面
前提：必须先运行 auth_crawler.py 手动登录并保存状态到 auth_state.json
"""

from auth_crawler import AuthenticatedCrawler
import sys
import os


def main():
    """批量爬取受保护页面"""

    # 检查是否已经保存了登录状态
    if not os.path.exists("auth_state.json"):
        print("=" * 80)
        print("❌ 错误：未找到登录状态文件 auth_state.json")
        print("=" * 80)
        print("\n请先运行以下命令保存登录状态：")
        print("  python auth_crawler.py")
        print("  然后选择 '1. 手动登录并保存状态'")
        print("\n登录成功后，再次运行本脚本进行批量爬取。")
        print("=" * 80)
        sys.exit(1)

    print("=" * 80)
    print("🔐 批量爬取需要登录的受保护页面")
    print("=" * 80)

    # 定义需要登录的URL列表
    authenticated_urls = [
        "https://kyfw.12306.cn/otn/confirmPassenger/initDc",  # 订单填写页
        "https://kyfw.12306.cn/otn/view/information.html",  # 个人信息页
        "https://kyfw.12306.cn/otn/view/passengers.html",  # 乘客管理页
        "https://kyfw.12306.cn/otn/view/train_order.html",  # 订单管理页
    ]

    print(f"\n📋 待爬取受保护页面数量: {len(authenticated_urls)}")
    for i, url in enumerate(authenticated_urls, 1):
        print(f"   {i}. {url}")

    # 输出目录
    output_dir = sys.argv[1] if len(sys.argv) > 1 else "deconstructed_site"
    print(f"\n📁 输出目录: {output_dir}")
    print("=" * 80 + "\n")

    # 创建认证爬虫实例
    crawler = AuthenticatedCrawler()

    # 使用保存的登录状态爬取
    try:
        crawler.crawl_with_auth(authenticated_urls, output_dir)
        print("\n" + "=" * 80)
        print("✅ 所有受保护页面爬取完成！")
        print("=" * 80)
    except Exception as e:
        print("\n" + "=" * 80)
        print(f"❌ 爬取过程出错: {e}")
        print("=" * 80)
        print("\n可能的原因：")
        print("  1. 登录状态已过期（需要重新登录）")
        print("  2. 网络连接问题")
        print("  3. 页面URL已变更")
        print("\n解决方法：")
        print("  重新运行 'python auth_crawler.py' 并选择选项1重新登录")
        sys.exit(1)


if __name__ == "__main__":
    main()
