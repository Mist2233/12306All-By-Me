"""
整站爬虫解构器 - 支持多页面爬取和用户交互模拟
功能：智能发现链接、队列管理、同源策略、交互模拟
"""

from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup
import os
import json
import re
from urllib.parse import urljoin, urlparse
from resource_downloader import ResourceDownloader
from config import Config
import hashlib
import time


class SiteCrawler:
    """整站爬虫解构器"""

    def __init__(self, base_url, output_dir="deconstructed_site", max_pages=50):
        """
        初始化整站爬虫

        Args:
            base_url: 起始URL（基础URL）
            output_dir: 输出目录
            max_pages: 最大爬取页面数
        """
        self.base_url = base_url
        self.output_dir = output_dir
        self.max_pages = max_pages

        # URL管理
        self.visited_urls = set()  # 已访问的URL集合
        self.urls_to_visit = [base_url]  # 待访问的URL队列
        self.base_domain = urlparse(base_url).netloc  # 目标域名

        # 结果存储
        self.all_results = []  # 所有页面的解构结果

        # 创建主输出目录
        os.makedirs(self.output_dir, exist_ok=True)

    def _get_page_dir_name(self, url):
        """
        根据URL生成页面目录名（改进版 - 支持标准目录结构）

        将 /login 保存为 login/index.html
        将 /user/profile 保存为 user/profile/index.html
        将 /login.html 保存为 login.html

        Args:
            url: 页面URL

        Returns:
            目录名称
        """
        parsed = urlparse(url)
        parsed_path = parsed.path.strip("/")

        # 如果路径为空，返回 "index"
        if not parsed_path:
            return "index"

        # 如果路径以 / 结尾，移除尾部斜杠
        if parsed_path.endswith("/"):
            parsed_path = parsed_path.rstrip("/")

        # 获取路径的最后一部分
        base_name = os.path.basename(parsed_path)

        # 如果最后一部分没有扩展名（不是文件），说明是目录路径
        if "." not in base_name:
            # 例如: /login -> login/index.html
            # 例如: /user/profile -> user/profile/index.html
            dir_path = parsed_path
        else:
            # 如果有扩展名（是文件），使用父目录
            # 例如: /login.html -> . (当前目录)
            # 例如: /user/profile.html -> user
            dir_path = os.path.dirname(parsed_path)
            if not dir_path:
                # 根目录下的文件，使用文件名（不含扩展名）作为目录
                dir_path = os.path.splitext(base_name)[0]

        # 如果路径太长或包含查询参数，添加哈希值
        if len(dir_path) > 50 or parsed.query:
            url_hash = hashlib.md5(url.encode()).hexdigest()[:8]
            dir_path = f"{dir_path[:30]}_{url_hash}" if dir_path else url_hash

        # 清理文件名中的非法字符
        invalid_chars = '<>:"|?*'
        for char in invalid_chars:
            dir_path = dir_path.replace(char, "_")

        return dir_path

    def _is_same_origin(self, url):
        """
        检查URL是否与基础URL同源

        Args:
            url: 要检查的URL

        Returns:
            是否同源
        """
        return urlparse(url).netloc == self.base_domain

    def _extract_resources_from_css(self, css_content, css_url, page_dir, downloader):
        """
        从 CSS 内容中提取并下载所有资源（图片、字体等）

        Args:
            css_content: CSS文件内容
            css_url: CSS文件的URL（用于解析相对路径）
            page_dir: 页面输出目录
            downloader: 资源下载器实例

        Returns:
            更新后的CSS内容
        """
        # 匹配 url() 格式，排除 data: URL
        # 这个正则会匹配 url("...") url('...') url(...)
        url_pattern = re.compile(
            r'url\s*\((?!["\']?data:)["\']?([^)"\'\']+?)["\']?\s*\)', re.IGNORECASE
        )

        matches = url_pattern.findall(css_content)
        resources_downloaded = []

        for resource_path in matches:
            # 清理资源路径
            resource_path = resource_path.strip()

            # 跳过空路径和data URL
            if not resource_path or resource_path.startswith("data:"):
                continue

            # 拼接成完整的 URL
            resource_url = urljoin(css_url, resource_path)

            try:
                # 判断资源类型
                parsed_url = urlparse(resource_url)
                file_ext = os.path.splitext(parsed_url.path)[1].lower()

                saved_path = None

                # 根据扩展名决定使用哪个下载方法
                if file_ext in [".woff", ".woff2", ".ttf", ".eot", ".otf"]:
                    # 字体文件
                    saved_path = downloader.download_font(resource_url)
                elif file_ext in [
                    ".png",
                    ".jpg",
                    ".jpeg",
                    ".gif",
                    ".svg",
                    ".webp",
                    ".ico",
                    ".bmp",
                ]:
                    # 图片文件
                    saved_path = downloader.download_image(resource_url)
                else:
                    # 其他资源，尝试作为图片下载
                    saved_path = downloader.download_generic(resource_url, "other")

                if saved_path:
                    resources_downloaded.append(saved_path)

                    # 计算相对路径（从 CSS 文件所在位置到资源文件）
                    # CSS 文件通常在 page_dir/css/ 中
                    css_dir = os.path.join(page_dir, Config.CSS_DIR)
                    relative_path = os.path.relpath(saved_path, css_dir).replace(
                        "\\", "/"
                    )

                    # 替换 CSS 中的路径
                    # 需要处理各种可能的引号格式
                    old_pattern = f"url({resource_path})"
                    new_pattern = f"url({relative_path})"
                    css_content = css_content.replace(old_pattern, new_pattern)

                    old_pattern = f'url("{resource_path}")'
                    new_pattern = f'url("{relative_path}")'
                    css_content = css_content.replace(old_pattern, new_pattern)

                    old_pattern = f"url('{resource_path}')"
                    new_pattern = f"url('{relative_path}')"
                    css_content = css_content.replace(old_pattern, new_pattern)

            except Exception as e:
                print(f"⚠️ 从 CSS 中下载资源失败: {resource_url} - {e}")

        if resources_downloaded:
            print(f"✅ 从 CSS 中提取了 {len(resources_downloaded)} 个资源")

        return css_content

    def _discover_links(self, soup, current_url):
        """
        从页面中发现新的链接

        Args:
            soup: BeautifulSoup对象
            current_url: 当前页面URL

        Returns:
            新发现的链接集合
        """
        found_links = set()

        for a_tag in soup.find_all("a", href=True):
            link = urljoin(current_url, a_tag["href"])

            # 移除URL片段标识符（#）
            link = link.split("#")[0]

            # 检查是否同源且未访问
            if self._is_same_origin(link) and link not in self.visited_urls:
                found_links.add(link)

        return found_links

    def _simulate_user_interaction(self, page, url):
        """
        模拟用户交互（登录、表单填写等）

        Args:
            page: Playwright page对象
            url: 当前URL

        Returns:
            是否执行了交互
        """
        # 检测登录页面
        if "login" in url.lower() or "signin" in url.lower():
            print("⚠️ 检测到登录页面，需要配置登录信息")
            # 这里可以添加登录逻辑
            # page.fill('input#username', 'your_username')
            # page.fill('input#password', 'your_password')
            # page.click('button[type="submit"]')
            # page.wait_for_navigation(wait_until="networkidle")
            return True

        return False

    def _deconstruct_single_page(self, page, url, page_dir):
        """
        解构单个页面

        Args:
            page: Playwright page对象
            url: 页面URL
            page_dir: 页面输出目录

        Returns:
            页面解构结果
        """
        print(f"\n--- 正在解构页面: {url} ---")

        # 创建页面目录结构
        directories = [
            page_dir,
            os.path.join(page_dir, Config.CSS_DIR),
            os.path.join(page_dir, Config.JS_DIR),
            os.path.join(page_dir, Config.IMAGES_DIR),
            os.path.join(page_dir, Config.FONTS_DIR),
        ]

        for directory in directories:
            os.makedirs(directory, exist_ok=True)

        # 初始化结果
        result = {
            "url": url,
            "page_dir": page_dir,
            "html_file": None,
            "css_files": [],
            "js_files": [],
            "images": [],
            "fonts": [],
        }

        # 创建资源下载器
        downloader = ResourceDownloader(page_dir)

        # 提取HTML
        html_content = page.content()
        soup = BeautifulSoup(html_content, "html.parser")

        # 提取CSS
        for link_tag in soup.find_all("link", rel="stylesheet"):
            css_url = link_tag.get("href")
            if css_url:
                full_url = urljoin(url, css_url)
                saved_path = downloader.download_css(full_url)
                if saved_path:
                    result["css_files"].append(saved_path)
                    link_tag["href"] = os.path.relpath(saved_path, page_dir).replace(
                        "\\", "/"
                    )

                    # 【增强功能】从CSS中提取并下载资源
                    try:
                        with open(saved_path, "r", encoding="utf-8") as f:
                            css_content = f.read()

                        # 处理CSS内部的资源引用
                        modified_css = self._extract_resources_from_css(
                            css_content, full_url, page_dir, downloader
                        )

                        # 保存更新后的CSS
                        with open(saved_path, "w", encoding="utf-8") as f:
                            f.write(modified_css)
                    except Exception as e:
                        print(f"⚠️ 处理CSS文件失败: {saved_path} - {e}")

        # 提取内联样式
        for idx, style_tag in enumerate(soup.find_all("style")):
            if style_tag.string:
                css_filename = f"inline_style_{idx + 1}.css"
                css_path = os.path.join(page_dir, Config.CSS_DIR, css_filename)

                # 处理内联样式中的资源引用
                inline_css = style_tag.string
                modified_css = self._extract_resources_from_css(
                    inline_css, url, page_dir, downloader
                )

                with open(css_path, "w", encoding="utf-8") as f:
                    f.write(modified_css)
                result["css_files"].append(css_path)

        # 提取JavaScript
        for script_tag in soup.find_all("script", src=True):
            js_url = script_tag.get("src")
            if js_url:
                full_url = urljoin(url, js_url)
                saved_path = downloader.download_js(full_url)
                if saved_path:
                    result["js_files"].append(saved_path)
                    script_tag["src"] = os.path.relpath(saved_path, page_dir).replace(
                        "\\", "/"
                    )

        # 提取内联脚本
        for idx, script_tag in enumerate(soup.find_all("script", src=False)):
            if script_tag.string and script_tag.string.strip():
                js_filename = f"inline_script_{idx + 1}.js"
                js_path = os.path.join(page_dir, Config.JS_DIR, js_filename)
                with open(js_path, "w", encoding="utf-8") as f:
                    f.write(script_tag.string)
                result["js_files"].append(js_path)

        # 提取图片
        for img_tag in soup.find_all("img"):
            img_url = img_tag.get("src") or img_tag.get("data-src")
            if img_url and not img_url.startswith("data:"):
                full_url = urljoin(url, img_url)
                saved_path = downloader.download_image(full_url)
                if saved_path:
                    result["images"].append(saved_path)
                    relative_path = os.path.relpath(saved_path, page_dir).replace(
                        "\\", "/"
                    )
                    if img_tag.get("src"):
                        img_tag["src"] = relative_path
                    if img_tag.get("data-src"):
                        img_tag["data-src"] = relative_path

        # 【新增】提取SVG资源
        # 处理 <object> 标签引用的SVG
        for obj_tag in soup.find_all("object", attrs={"data": True}):
            obj_url = obj_tag.get("data")
            if obj_url and obj_url.lower().endswith(".svg"):
                full_url = urljoin(url, obj_url)
                saved_path = downloader.download_image(full_url)
                if saved_path:
                    result["images"].append(saved_path)
                    obj_tag["data"] = os.path.relpath(saved_path, page_dir).replace(
                        "\\", "/"
                    )

        # 处理 <embed> 标签引用的SVG
        for embed_tag in soup.find_all("embed", attrs={"src": True}):
            embed_url = embed_tag.get("src")
            if embed_url and embed_url.lower().endswith(".svg"):
                full_url = urljoin(url, embed_url)
                saved_path = downloader.download_image(full_url)
                if saved_path:
                    result["images"].append(saved_path)
                    embed_tag["src"] = os.path.relpath(saved_path, page_dir).replace(
                        "\\", "/"
                    )

        # 处理 <svg><use> 引用的外部SVG文件
        for use_tag in soup.find_all("use"):
            href = use_tag.get("href") or use_tag.get("xlink:href")
            if href and "#" in href:
                # 提取SVG文件路径（#前面的部分）
                svg_file = href.split("#")[0]
                if svg_file:
                    full_url = urljoin(url, svg_file)
                    saved_path = downloader.download_image(full_url)
                    if saved_path:
                        result["images"].append(saved_path)
                        relative_path = os.path.relpath(saved_path, page_dir).replace(
                            "\\", "/"
                        )
                        # 更新href，保留锚点
                        icon_id = href.split("#")[1]
                        new_href = f"{relative_path}#{icon_id}"
                        if use_tag.get("href"):
                            use_tag["href"] = new_href
                        if use_tag.get("xlink:href"):
                            use_tag["xlink:href"] = new_href
                    if img_tag.get("data-src"):
                        img_tag["data-src"] = relative_path

        # 保存HTML
        html_path = os.path.join(page_dir, "index.html")
        with open(html_path, "w", encoding="utf-8") as f:
            f.write(soup.prettify())
        result["html_file"] = html_path

        # 保存页面元数据
        metadata_path = os.path.join(page_dir, "metadata.json")
        with open(metadata_path, "w", encoding="utf-8") as f:
            json.dump(result, f, ensure_ascii=False, indent=2)

        print(f"✅ 页面解构完成: {url}")
        print(
            f"   HTML: 1 | CSS: {len(result['css_files'])} | JS: {len(result['js_files'])} | Images: {len(result['images'])}"
        )

        # 发现新链接
        new_links = self._discover_links(soup, url)

        return result, new_links

    def crawl(self):
        """执行整站爬取"""
        print(f"=== 开始整站爬取 ===")
        print(f"起始URL: {self.base_url}")
        print(f"目标域名: {self.base_domain}")
        print(f"最大页面数: {self.max_pages}")
        print(f"输出目录: {self.output_dir}\n")

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=Config.HEADLESS)
            context = browser.new_context()
            page = context.new_page()

            page_count = 0

            while self.urls_to_visit and page_count < self.max_pages:
                current_url = self.urls_to_visit.pop(0)

                # 跳过已访问的URL
                if current_url in self.visited_urls:
                    continue

                try:
                    print(f"\n[{page_count + 1}/{self.max_pages}] 访问: {current_url}")

                    # 访问页面
                    page.goto(
                        current_url,
                        wait_until="networkidle",
                        timeout=Config.PAGE_TIMEOUT,
                    )

                    # 模拟用户交互
                    self._simulate_user_interaction(page, current_url)

                    # 标记为已访问
                    self.visited_urls.add(current_url)
                    page_count += 1

                    # 生成页面目录
                    page_dir_name = self._get_page_dir_name(current_url)
                    page_dir = os.path.join(self.output_dir, page_dir_name)

                    # 解构页面
                    result, new_links = self._deconstruct_single_page(
                        page, current_url, page_dir
                    )
                    self.all_results.append(result)

                    # 将新链接加入队列
                    for link in new_links:
                        if (
                            link not in self.urls_to_visit
                            and link not in self.visited_urls
                        ):
                            self.urls_to_visit.append(link)

                    print(f"   发现新链接: {len(new_links)} 个")
                    print(f"   待访问队列: {len(self.urls_to_visit)} 个")

                    # 避免请求过快
                    time.sleep(1)

                except Exception as e:
                    print(f"❌ 处理页面失败: {current_url}")
                    print(f"   错误: {str(e)}")

            browser.close()

        # 保存整站元数据
        self._save_site_metadata()

        # 生成站点地图
        self._generate_sitemap()

        print(f"\n=== 整站爬取完成 ===")
        print(f"成功爬取: {page_count} 个页面")
        print(f"总发现链接: {len(self.visited_urls)} 个")

        return self.all_results

    def _save_site_metadata(self):
        """保存整站元数据"""
        metadata = {
            "base_url": self.base_url,
            "base_domain": self.base_domain,
            "total_pages": len(self.all_results),
            "visited_urls": list(self.visited_urls),
            "pages": self.all_results,
        }

        metadata_path = os.path.join(self.output_dir, "site_metadata.json")
        with open(metadata_path, "w", encoding="utf-8") as f:
            json.dump(metadata, f, ensure_ascii=False, indent=2)

        print(f"\n✅ 整站元数据已保存: {metadata_path}")

    def _generate_sitemap(self):
        """生成站点地图HTML"""
        sitemap_html = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>站点地图 - {self.base_domain}</title>
    <style>
        body {{
            font-family: Arial, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }}
        h1 {{
            color: #333;
            border-bottom: 3px solid #007bff;
            padding-bottom: 10px;
        }}
        .stats {{
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }}
        .page-list {{
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }}
        .page-item {{
            padding: 15px;
            margin: 10px 0;
            border-left: 4px solid #007bff;
            background: #f8f9fa;
        }}
        .page-item a {{
            color: #007bff;
            text-decoration: none;
            font-weight: bold;
        }}
        .page-item a:hover {{
            text-decoration: underline;
        }}
        .page-stats {{
            color: #666;
            font-size: 0.9em;
            margin-top: 5px;
        }}
    </style>
</head>
<body>
    <h1>站点地图 - {self.base_domain}</h1>
    
    <div class="stats">
        <h2>统计信息</h2>
        <p><strong>基础URL:</strong> {self.base_url}</p>
        <p><strong>爬取页面数:</strong> {len(self.all_results)}</p>
        <p><strong>总发现链接:</strong> {len(self.visited_urls)}</p>
    </div>
    
    <div class="page-list">
        <h2>页面列表</h2>
"""

        for idx, result in enumerate(self.all_results, 1):
            # 获取相对于输出目录的页面目录路径
            page_dir_rel = os.path.relpath(result["page_dir"], self.output_dir).replace(
                "\\", "/"
            )
            sitemap_html += f"""
        <div class="page-item">
            <div><strong>[{idx}]</strong> <a href="{page_dir_rel}/index.html" target="_blank">{result['url']}</a></div>
            <div class="page-stats">
                CSS: {len(result['css_files'])} | 
                JS: {len(result['js_files'])} | 
                Images: {len(result['images'])}
            </div>
        </div>
"""

        sitemap_html += """
    </div>
</body>
</html>
"""

        sitemap_path = os.path.join(self.output_dir, "sitemap.html")
        with open(sitemap_path, "w", encoding="utf-8") as f:
            f.write(sitemap_html)

        print(f"✅ 站点地图已生成: {sitemap_path}")


def main():
    """主函数"""
    import argparse

    parser = argparse.ArgumentParser(description="整站爬虫解构工具")
    parser.add_argument("url", help="起始URL")
    parser.add_argument("-o", "--output", help="输出目录", default="deconstructed_site")
    parser.add_argument(
        "-m", "--max-pages", type=int, help="最大爬取页面数", default=50
    )
    parser.add_argument("--headless", action="store_true", help="使用无头浏览器模式")

    args = parser.parse_args()

    if args.headless:
        Config.HEADLESS = True

    crawler = SiteCrawler(args.url, args.output, args.max_pages)
    results = crawler.crawl()

    print(f"\n✅ 整站解构完成！")
    print(f"请查看输出目录: {crawler.output_dir}")
    print(f"站点地图: {os.path.join(crawler.output_dir, 'sitemap.html')}")


if __name__ == "__main__":
    # 示例用法
    base_url = "https://www.12306.cn/index/"
    crawler = SiteCrawler(base_url, max_pages=10)
    results = crawler.crawl()
