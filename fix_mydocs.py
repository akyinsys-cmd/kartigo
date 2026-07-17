import re

with open("src/components/MyDocumentsView.tsx", "r") as f:
    content = f.read()

content = content.replace("aVal = aVal.getTime();", "aVal = new Date(aVal as string).getTime();")
content = content.replace("bVal = bVal.getTime();", "bVal = new Date(bVal as string).getTime();")

with open("src/components/MyDocumentsView.tsx", "w") as f:
    f.write(content)
