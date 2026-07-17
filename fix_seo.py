import re

with open("index.html", "r") as f:
    content = f.read()

new_meta = """    <meta name="description" content="Create expert-grade business and legal documents in minutes. Answer simple questions and download professional, fully customizable documents." />
    <meta name="keywords" content="legal documents, business templates, contracts, automated forms, expert legal docs" />
    <meta name="robots" content="index, follow" />
    <meta property="og:title" content="Kartigo Docs | Expert-Grade Business & Legal Documents" />
    <meta property="og:description" content="Create expert-grade business and legal documents in minutes." />
    <meta property="og:type" content="website" />
    <link rel="canonical" href="https://kartigo.com" />"""

content = re.sub(r'<meta name="description".*?/>', new_meta, content)

with open("index.html", "w") as f:
    f.write(content)
