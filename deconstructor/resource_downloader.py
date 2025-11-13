"""
资源下载器模块
负责下载各类静态资源（CSS, JS, 图片, 字体等）
"""

import requests
import os
from urllib.parse import urlparse, unquote
import hashlib
from config import Config


class ResourceDownloader:
    """资源下载器类"""

    def __init__(self, base_dir):
        """
        初始化资源下载器

        Args:
            base_dir: 基础输出目录
        """
        self.base_dir = base_dir
        self.downloaded_urls = set()  # 避免重复下载
        self.session = requests.Session()
        self.session.headers.update({"User-Agent": Config.USER_AGENT})

    def _get_filename_from_url(self, url):
        """
        从URL中提取文件名

        Args:
            url: 资源URL

        Returns:
            文件名
        """
        parsed = urlparse(url)
        path = unquote(parsed.path)
        filename = os.path.basename(path)

        # 如果文件名为空或没有扩展名，使用URL的哈希值
        if not filename or "." not in filename:
            url_hash = hashlib.md5(url.encode()).hexdigest()[:8]
            filename = f"resource_{url_hash}"

        # 移除查询参数
        filename = filename.split("?")[0]

        return filename

    def _sanitize_filename(self, filename):
        """
        清理文件名，移除非法字符

        Args:
            filename: 原始文件名

        Returns:
            清理后的文件名
        """
        # 移除或替换Windows不允许的字符
        invalid_chars = '<>:"|?*'
        for char in invalid_chars:
            filename = filename.replace(char, "_")

        return filename

    def _download_file(self, url, save_dir, default_ext=None):
        """
        通用文件下载方法

        Args:
            url: 资源URL
            save_dir: 保存目录
            default_ext: 默认扩展名（如果URL中没有扩展名）

        Returns:
            保存的文件路径，失败返回None
        """
        # 检查是否已下载
        if url in self.downloaded_urls:
            return None

        try:
            response = self.session.get(
                url, timeout=Config.DOWNLOAD_TIMEOUT, stream=True
            )
            response.raise_for_status()

            # 获取文件名
            filename = self._get_filename_from_url(url)

            # 如果没有扩展名且提供了默认扩展名
            if "." not in filename and default_ext:
                filename += default_ext

            filename = self._sanitize_filename(filename)

            # 处理文件名冲突
            save_path = os.path.join(save_dir, filename)
            counter = 1
            base_name, ext = os.path.splitext(filename)
            while os.path.exists(save_path):
                filename = f"{base_name}_{counter}{ext}"
                save_path = os.path.join(save_dir, filename)
                counter += 1

            # 保存文件
            with open(save_path, "wb") as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)

            self.downloaded_urls.add(url)
            return save_path

        except requests.exceptions.RequestException as e:
            print(f"❌ 下载失败: {url}")
            print(f"   错误: {str(e)}")
            return None
        except Exception as e:
            print(f"❌ 保存文件时出错: {url}")
            print(f"   错误: {str(e)}")
            return None

    def download_css(self, url):
        """
        下载CSS文件

        Args:
            url: CSS文件URL

        Returns:
            保存的文件路径
        """
        css_dir = os.path.join(self.base_dir, Config.CSS_DIR)
        save_path = self._download_file(url, css_dir, ".css")

        if save_path:
            print(f"✅ CSS 已下载: {os.path.basename(save_path)}")

        return save_path

    def download_js(self, url):
        """
        下载JavaScript文件

        Args:
            url: JS文件URL

        Returns:
            保存的文件路径
        """
        js_dir = os.path.join(self.base_dir, Config.JS_DIR)
        save_path = self._download_file(url, js_dir, ".js")

        if save_path:
            print(f"✅ JavaScript 已下载: {os.path.basename(save_path)}")

        return save_path

    def download_image(self, url):
        """
        下载图片文件

        Args:
            url: 图片URL

        Returns:
            保存的文件路径
        """
        images_dir = os.path.join(self.base_dir, Config.IMAGES_DIR)

        # 跳过 data URL
        if url.startswith("data:"):
            return None

        save_path = self._download_file(url, images_dir)

        if save_path:
            print(f"✅ 图片已下载: {os.path.basename(save_path)}")

        return save_path

    def download_font(self, url):
        """
        下载字体文件

        Args:
            url: 字体文件URL

        Returns:
            保存的文件路径
        """
        fonts_dir = os.path.join(self.base_dir, Config.FONTS_DIR)
        save_path = self._download_file(url, fonts_dir)

        if save_path:
            print(f"✅ 字体已下载: {os.path.basename(save_path)}")

        return save_path

    def download_generic(self, url, subdir="other"):
        """
        下载其他类型的资源

        Args:
            url: 资源URL
            subdir: 子目录名称

        Returns:
            保存的文件路径
        """
        resource_dir = os.path.join(self.base_dir, subdir)
        os.makedirs(resource_dir, exist_ok=True)

        save_path = self._download_file(url, resource_dir)

        if save_path:
            print(f"✅ 资源已下载: {os.path.basename(save_path)}")

        return save_path

    def get_statistics(self):
        """
        获取下载统计信息

        Returns:
            下载的资源数量
        """
        return len(self.downloaded_urls)

    def reset(self):
        """重置下载记录"""
        self.downloaded_urls.clear()
