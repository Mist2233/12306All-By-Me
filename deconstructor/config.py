"""
配置文件
定义解构工具的所有配置参数和常量
"""


class Config:
    """配置类 - 包含所有可配置的参数"""

    # ==================== 目录配置 ====================
    DEFAULT_OUTPUT_DIR = "deconstructed_site"
    CSS_DIR = "css"
    JS_DIR = "js"
    IMAGES_DIR = "images"
    FONTS_DIR = "fonts"

    # ==================== 浏览器配置 ====================
    HEADLESS = True  # 是否使用无头模式
    PAGE_TIMEOUT = 60000  # 页面加载超时时间（毫秒）

    # ==================== 下载配置 ====================
    DOWNLOAD_TIMEOUT = 30  # 资源下载超时时间（秒）
    MAX_RETRIES = 3  # 最大重试次数
    RETRY_DELAY = 1  # 重试延迟（秒）

    # ==================== 请求头配置 ====================
    USER_AGENT = (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    )

    # ==================== 文件类型配置 ====================
    IMAGE_EXTENSIONS = [
        ".png",
        ".jpg",
        ".jpeg",
        ".gif",
        ".svg",
        ".webp",
        ".ico",
        ".bmp",
    ]
    FONT_EXTENSIONS = [".woff", ".woff2", ".ttf", ".eot", ".otf"]
    CSS_EXTENSIONS = [".css"]
    JS_EXTENSIONS = [".js"]

    # ==================== 高级配置 ====================
    ENABLE_CSS_IMAGE_EXTRACTION = True  # 是否从CSS中提取图片
    ENABLE_CSS_FONT_EXTRACTION = True  # 是否从CSS中提取字体
    ENABLE_INLINE_SCRIPTS = True  # 是否提取内联脚本
    ENABLE_INLINE_STYLES = True  # 是否提取内联样式

    # ==================== 日志配置 ====================
    VERBOSE = True  # 是否显示详细日志

    @classmethod
    def get_all_settings(cls):
        """获取所有配置项"""
        settings = {}
        for attr in dir(cls):
            if not attr.startswith("_") and attr.isupper():
                settings[attr] = getattr(cls, attr)
        return settings

    @classmethod
    def print_settings(cls):
        """打印所有配置项"""
        print("\n" + "=" * 60)
        print("当前配置")
        print("=" * 60)
        for key, value in cls.get_all_settings().items():
            print(f"{key}: {value}")
        print("=" * 60 + "\n")


# 预定义配置方案
class ConfigPresets:
    """预定义的配置方案"""

    @staticmethod
    def development():
        """开发模式 - 显示浏览器，详细日志"""
        Config.HEADLESS = False
        Config.VERBOSE = True
        Config.PAGE_TIMEOUT = 120000
        print("✅ 已切换到开发模式")

    @staticmethod
    def production():
        """生产模式 - 无头浏览器，快速执行"""
        Config.HEADLESS = True
        Config.VERBOSE = False
        Config.PAGE_TIMEOUT = 60000
        print("✅ 已切换到生产模式")

    @staticmethod
    def fast():
        """快速模式 - 跳过一些耗时的提取"""
        Config.ENABLE_CSS_IMAGE_EXTRACTION = False
        Config.ENABLE_CSS_FONT_EXTRACTION = False
        Config.ENABLE_INLINE_SCRIPTS = False
        print("✅ 已切换到快速模式")

    @staticmethod
    def complete():
        """完整模式 - 提取所有资源"""
        Config.ENABLE_CSS_IMAGE_EXTRACTION = True
        Config.ENABLE_CSS_FONT_EXTRACTION = True
        Config.ENABLE_INLINE_SCRIPTS = True
        Config.ENABLE_INLINE_STYLES = True
        print("✅ 已切换到完整模式")
