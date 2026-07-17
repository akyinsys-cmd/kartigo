import re

with open("src/components/Header.tsx", "r") as f:
    content = f.read()

# Add Globe import
if "Globe" not in content:
    content = content.replace("import { ", "import { Globe, ")

# Add Country/Language Dropdown
# Let's find the Desktop Navigation area
nav_pattern = r"          <nav className=\"hidden md:flex items-center gap-8\">\n([\s\S]*?)          </nav>"
nav_match = re.search(nav_pattern, content)

if nav_match:
    nav_inner = nav_match.group(1)
    
    country_selector = """            <button className="flex items-center gap-1.5 text-sm font-semibold text-text-secondary hover:text-brand-primary transition-colors cursor-pointer group px-2">
              <Globe className="h-4 w-4 text-text-light group-hover:text-brand-primary transition-colors" />
              <span className="hidden lg:inline">India (EN)</span>
              <span className="lg:hidden">IN (EN)</span>
            </button>
"""
    
    new_nav = f'          <nav className="hidden md:flex items-center gap-6 lg:gap-8">\n{country_selector}{nav_inner}          </nav>'
    content = content.replace(nav_match.group(0), new_nav)

with open("src/components/Header.tsx", "w") as f:
    f.write(content)
