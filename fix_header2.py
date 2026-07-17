import re

with open("src/components/Header.tsx", "r") as f:
    content = f.read()

# Find the Desktop Actions container
actions_pattern = r"          {/\* Desktop Actions \*/}\n          <div id=\"desktop-actions-container\" className=\"hidden md:flex items-center gap-4\">"
new_actions = """          {/* Desktop Actions */}
          <div id="desktop-actions-container" className="hidden md:flex items-center gap-4">
            
            <button className="flex items-center gap-1.5 text-sm font-semibold text-text-secondary hover:text-brand-primary transition-colors cursor-pointer group px-2 border-r border-[#E5F5B8] pr-4">
              <Globe className="h-4 w-4 text-text-light group-hover:text-brand-primary transition-colors" />
              <span>IN (EN)</span>
            </button>"""

if "<span>IN (EN)</span>" not in content:
    content = content.replace('          {/* Desktop Actions */}\n          <div id="desktop-actions-container" className="hidden md:flex items-center gap-4">', new_actions)

with open("src/components/Header.tsx", "w") as f:
    f.write(content)
