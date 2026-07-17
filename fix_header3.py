import re

with open("src/components/Header.tsx", "r") as f:
    content = f.read()

pattern = r"          \{/\* Authentication Action Buttons \(Right side\) \*/\}\n          <div id=\"auth-actions\" className=\"hidden md:flex items-center gap-3 relative\">"
new_content = """          {/* Authentication Action Buttons (Right side) */}
          <div id="auth-actions" className="hidden md:flex items-center gap-3 relative">
            <button className="flex items-center gap-1.5 text-xs font-bold text-text-secondary hover:text-brand-primary transition-colors cursor-pointer group px-2 border-r border-[#E5F5B8] pr-4">
              <Globe className="h-4 w-4 text-brand-secondary group-hover:text-brand-primary transition-colors" />
              <span>India (EN)</span>
            </button>"""

content = re.sub(pattern, new_content, content)

with open("src/components/Header.tsx", "w") as f:
    f.write(content)
