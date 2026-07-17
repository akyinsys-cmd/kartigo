import os
import glob

def replace_in_file(filepath, old, new):
    with open(filepath, 'r') as f:
        content = f.read()
    if old in content:
        content = content.replace(old, new)
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Updated {filepath}")

for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            filepath = os.path.join(root, file)
            replace_in_file(filepath, 'Kartigo Docs', 'Kartigo Draft')
            replace_in_file(filepath, 'Kartigo.Docs', 'Kartigo.Draft')
            replace_in_file(filepath, 'kartigodocs.com', 'kartigo.com')

