import re

with open("index.html", "r") as f:
    content = f.read()

new_tags = """    <link rel="apple-touch-icon" href="/icon-192x192.png">
    <meta name="theme-color" content="#2B9348">"""

content = content.replace('<link rel="manifest" href="/manifest.json">', '<link rel="manifest" href="/manifest.json">\n' + new_tags)

with open("index.html", "w") as f:
    f.write(content)
