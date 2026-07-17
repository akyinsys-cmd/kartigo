import re

with open("index.html", "r") as f:
    content = f.read()

if '<link rel="manifest"' not in content:
    content = content.replace("</head>", '  <link rel="manifest" href="/manifest.json">\n  </head>')
    
with open("index.html", "w") as f:
    f.write(content)
