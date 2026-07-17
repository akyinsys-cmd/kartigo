import re

with open("index.html", "r") as f:
    content = f.read()

content = content.replace('<meta name="theme-color" content="#2B9348">', '<meta name="theme-color" content="#FFFDF2">')
content = content.replace('class="bg-white text-gray-900 antialiased font-sans"', 'class="bg-[#FFFDF2] text-[#23212C] antialiased font-sans selection:bg-[#F1FEC8] selection:text-[#3C1A47]"')

with open("index.html", "w") as f:
    f.write(content)
