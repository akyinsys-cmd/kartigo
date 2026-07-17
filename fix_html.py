import os

with open('index.html', 'r') as f:
    content = f.read()

content = content.replace('Kartigo Docs', 'Kartigo Draft')

with open('index.html', 'w') as f:
    f.write(content)

with open('public/manifest.json', 'r') as f:
    content = f.read()

content = content.replace('Kartigo Docs', 'Kartigo Draft')

with open('public/manifest.json', 'w') as f:
    f.write(content)

with open('DOCUMENTATION.md', 'r') as f:
    content = f.read()

content = content.replace('Kartigo Docs', 'Kartigo Draft')
content = content.replace('Document Agent', 'Manaz')
content = content.replace('support@kartigodocs.com', 'support@kartigo.com')

with open('DOCUMENTATION.md', 'w') as f:
    f.write(content)

