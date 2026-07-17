import re

with open("src/components/CustomerWorkspacePlaceholders.tsx", "r") as f:
    content = f.read()

content = content.replace(
    'className="p-2 transition-transform hover:scale-110 cursor-pointer focus:outline-hidden"',
    'className="p-2 transition-transform hover:scale-110 cursor-pointer focus:outline-hidden"\n                      aria-label={`Rate ${star} out of 5 stars`}'
)

with open("src/components/CustomerWorkspacePlaceholders.tsx", "w") as f:
    f.write(content)
