"""
异步本地HTTP服务器工具 - 使用aiohttp
用于预览解构后的静态网站，支持快速响应和优雅关闭
"""

import asyncio
from aiohttp import web
import os
import sys
import webbrowser
from threading import Timer
import mimetypes


# 确保mimetypes初始化
mimetypes.init()


class AsyncPreviewServer:
    """异步本地预览服务器（基于aiohttp）"""

    def __init__(self, directory, port=8000):
        """
        初始化服务器

        Args:
            directory: 要服务的目录
            port: 端口号
        """
        self.directory = os.path.abspath(directory)
        self.port = port
        self.runner = None

    async def file_handler(self, request):
        """
        自定义文件处理器 - 正确处理目录和index.html
        使用直接读取方式确保最佳兼容性

        Args:
            request: aiohttp请求对象

        Returns:
            文件响应或404
        """
        # 获取请求的路径
        path = request.path
        print(f"[请求] {request.method} {path}")  # 添加日志

        if path.startswith("/"):
            path = path[1:]

        # 解码 URL 编码的路径
        from urllib.parse import unquote

        path = unquote(path)

        # 构建完整的文件路径
        file_path = os.path.join(self.directory, path)
        print(f"[路径] 解析后: {file_path}")  # 添加日志

        # 安全检查：防止路径遍历攻击
        file_path = os.path.abspath(file_path)
        print(f"[路径] 绝对路径: {file_path}")  # 添加日志
        print(f"[路径] 目录根: {self.directory}")  # 添加日志

        if not file_path.startswith(self.directory):
            print(f"[错误] 403 - 路径遍历攻击")  # 添加日志
            return web.Response(text="403 Forbidden", status=403)

        # 如果路径是目录，尝试返回 index.html 或生成目录列表
        if os.path.isdir(file_path):
            print(f"[目录] 检测到目录: {file_path}")  # 添加日志
            # 首先尝试 index.html
            index_path = os.path.join(file_path, "index.html")
            if os.path.exists(index_path):
                print(f"[目录] 找到 index.html: {index_path}")  # 添加日志
                file_path = index_path
            # 如果是根目录且有 sitemap.html，优先使用它
            elif file_path == self.directory:
                print(f"[目录] 根目录，检查 sitemap.html")  # 添加日志
                sitemap_path = os.path.join(file_path, "sitemap.html")
                if os.path.exists(sitemap_path):
                    print(f"[目录] 找到 sitemap.html: {sitemap_path}")  # 添加日志
                    file_path = sitemap_path
                else:
                    # 生成目录列表页面
                    print(f"[目录] 生成根目录列表")  # 添加日志
                    return self._generate_directory_listing(file_path, request.path)
            else:
                # 其他目录生成目录列表
                print(f"[目录] 生成子目录列表")  # 添加日志
                return self._generate_directory_listing(file_path, request.path)

        # 如果是文件，读取并返回
        if os.path.isfile(file_path):
            print(f"[文件] 返回文件: {file_path}")  # 添加日志
            try:
                # 猜测 MIME 类型
                content_type, _ = mimetypes.guess_type(file_path)
                if content_type is None:
                    content_type = "application/octet-stream"

                # 读取文件内容
                with open(file_path, "rb") as f:
                    content = f.read()

                # 创建响应，明确设置所有必要的头部
                response = web.Response(
                    body=content,
                    content_type=content_type,
                    headers={
                        "Cache-Control": "no-cache, no-store, must-revalidate",
                        "Pragma": "no-cache",
                        "Expires": "0",
                    },
                )
                return response

            except Exception as e:
                print(f"[错误] 读取文件失败: {e}")  # 添加日志
                return web.Response(text="500 Internal Server Error", status=500)

        # 文件不存在，返回404
        print(f"[错误] 404 - 文件不存在: {file_path}")  # 添加日志
        return web.Response(text=f"404 Not Found: {request.path}", status=404)

    def _generate_directory_listing(self, dir_path, request_path):
        """
        生成目录列表HTML页面

        Args:
            dir_path: 目录的绝对路径
            request_path: 请求的URL路径

        Returns:
            目录列表HTML响应
        """
        try:
            items = os.listdir(dir_path)
            items.sort()

            # 分离目录和文件
            dirs = [
                item for item in items if os.path.isdir(os.path.join(dir_path, item))
            ]
            files = [
                item for item in items if os.path.isfile(os.path.join(dir_path, item))
            ]

            # 构建HTML
            html = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>目录列表 - {request_path}</title>
    <style>
        body {{
            font-family: Arial, 'Microsoft YaHei', sans-serif;
            max-width: 1200px;
            margin: 50px auto;
            padding: 20px;
            background: #f5f5f5;
        }}
        h1 {{
            color: #333;
            border-bottom: 2px solid #4CAF50;
            padding-bottom: 10px;
        }}
        .container {{
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }}
        ul {{
            list-style: none;
            padding: 0;
        }}
        li {{
            padding: 10px;
            border-bottom: 1px solid #eee;
            transition: background 0.2s;
        }}
        li:hover {{
            background: #f9f9f9;
        }}
        a {{
            text-decoration: none;
            color: #2196F3;
            display: flex;
            align-items: center;
        }}
        a:hover {{
            color: #0d47a1;
        }}
        .icon {{
            margin-right: 10px;
            font-size: 20px;
        }}
        .dir {{ color: #FF9800; }}
        .file {{ color: #4CAF50; }}
        .parent {{
            background: #e3f2fd;
            margin-bottom: 10px;
            border-radius: 4px;
        }}
        .info {{
            background: #fff3cd;
            padding: 15px;
            border-radius: 4px;
            border-left: 4px solid #ffc107;
            margin-bottom: 20px;
        }}
    </style>
</head>
<body>
    <div class="container">
        <h1>📁 目录列表</h1>
        <p><strong>当前路径：</strong> {request_path or '/'}</p>
        
        <div class="info">
            💡 <strong>提示：</strong>点击 <a href="/sitemap.html" style="display: inline;">sitemap.html</a> 查看站点地图
        </div>
        
        <ul>
"""
            # 添加返回上级目录的链接
            if request_path and request_path != "/":
                parent_path = "/".join(request_path.rstrip("/").split("/")[:-1])
                if not parent_path:
                    parent_path = "/"
                html += f"""
            <li class="parent">
                <a href="{parent_path}">
                    <span class="icon">⬆️</span>
                    <strong>返回上级目录</strong>
                </a>
            </li>
"""

            # 添加目录
            for dir_name in dirs:
                path = f"{request_path.rstrip('/')}/{dir_name}/"
                html += f"""
            <li>
                <a href="{path}">
                    <span class="icon dir">📁</span>
                    {dir_name}/
                </a>
            </li>
"""

            # 添加文件
            for file_name in files:
                path = f"{request_path.rstrip('/')}/{file_name}"
                # 获取文件大小
                file_path = os.path.join(dir_path, file_name)
                size = os.path.getsize(file_path)
                size_str = self._format_size(size)

                html += f"""
            <li>
                <a href="{path}">
                    <span class="icon file">📄</span>
                    {file_name} <span style="color: #999; margin-left: 10px;">({size_str})</span>
                </a>
            </li>
"""

            html += """
        </ul>
    </div>
</body>
</html>
"""
            return web.Response(text=html, content_type="text/html", charset="utf-8")

        except Exception as e:
            print(f"❌ 生成目录列表错误: {e}")
            return web.Response(text="500 Internal Server Error", status=500)

    def _format_size(self, size):
        """格式化文件大小"""
        for unit in ["B", "KB", "MB", "GB"]:
            if size < 1024.0:
                return f"{size:.1f} {unit}"
            size /= 1024.0
        return f"{size:.1f} TB"

    async def start(self, open_browser=True):
        """
        启动异步服务器

        Args:
            open_browser: 是否自动打开浏览器
        """
        if not os.path.exists(self.directory):
            print(f"❌ 错误: 目录不存在: {self.directory}")
            return

        # 创建 aiohttp 应用
        app = web.Application()

        # 添加通配符路由处理所有请求（包括静态文件、目录等）
        app.router.add_route("*", "/{path:.*}", self.file_handler)

        # 启动服务器
        self.runner = web.AppRunner(app)
        await self.runner.setup()
        site = web.TCPSite(self.runner, "localhost", self.port)

        url = f"http://localhost:{self.port}"

        print("\n" + "=" * 60)
        print("🚀 异步本地预览服务器已启动")
        print("=" * 60)
        print(f"📂 服务目录: {self.directory}")
        print(f"🌐 访问地址: {url}")
        print(f"📄 站点地图: {url}/sitemap.html")
        print("\n✨ 特性:")
        print("   ✅ 异步处理 - 高性能并发请求")
        print("   ✅ 快速响应 - Ctrl+C 立即停止")
        print("   ✅ 优雅关闭 - 自动清理资源")
        print("\n按 Ctrl+C 即可立即停止服务器")
        print("=" * 60 + "\n")

        await site.start()

        # 自动打开浏览器
        if open_browser:
            # 检查是否有sitemap.html
            if os.path.exists(os.path.join(self.directory, "sitemap.html")):
                open_url = f"{url}/sitemap.html"
            else:
                open_url = url

            Timer(1.5, lambda: webbrowser.open(open_url)).start()

        # 保持服务器运行
        try:
            while True:
                await asyncio.sleep(3600)
        except KeyboardInterrupt:
            print("\n\n--- 收到停止信号，正在关闭服务器... ---")
        finally:
            await self.runner.cleanup()
            print("✅ 服务器已成功关闭\n")


async def main_async():
    """异步主函数"""
    import argparse

    parser = argparse.ArgumentParser(
        description="异步HTTP服务器 - 用于预览解构后的网站（支持快速关闭）",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例用法:
  python server_async.py                              # 在当前目录启动服务器
  python server_async.py -d deconstructed_site        # 指定目录
  python server_async.py -p 8080                      # 使用8080端口
  python server_async.py -d output --no-browser       # 不自动打开浏览器

特性:
  ✅ 异步处理 - 高性能并发请求
  ✅ 快速响应 - Ctrl+C 立即停止（不再需要等待1-2分钟）
  ✅ 优雅关闭 - 自动清理资源
  ✅ 完整路径支持 - 正确处理 /login, /profile 等路径
        """,
    )

    parser.add_argument(
        "-d", "--directory", default=".", help="要服务的目录路径（默认: 当前目录）"
    )

    parser.add_argument(
        "-p", "--port", type=int, default=8000, help="端口号（默认: 8000）"
    )

    parser.add_argument("--no-browser", action="store_true", help="不自动打开浏览器")

    args = parser.parse_args()

    # 检查目录是否存在
    if not os.path.isdir(args.directory):
        print(f"❌ 错误: 目录 '{args.directory}' 不存在。")
        sys.exit(1)

    server = AsyncPreviewServer(args.directory, args.port)
    await server.start(open_browser=not args.no_browser)


def main():
    """主函数 - 运行异步服务器"""
    try:
        asyncio.run(main_async())
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
