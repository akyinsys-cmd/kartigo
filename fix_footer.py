import re

with open("src/components/Footer.tsx", "r") as f:
    content = f.read()

pattern = r"        <div className=\"flex flex-col sm:flex-row items-center justify-between gap-4 text-\[11px\] text-white/50 text-center sm:text-left\">\n          <span>\n            &copy; 2026 Kartigo Docs. All rights reserved. Vetted by Global Legal & HR partners.\n          </span>\n          <div className=\"flex items-center gap-1\.5 font-medium\">\n            <Globe className=\"h-3\.5 w-3\.5 text-white/30\" />\n            <span>Hosting: Cloud Run Sandbox</span>\n          </div>\n        </div>"

new_content = """        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-white/50 text-center sm:text-left">
          <span>
            &copy; 2026 Kartigo Docs. All rights reserved. Vetted by Global Legal & HR partners.
          </span>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-1.5 font-medium hover:text-white transition-colors">
              <Globe className="h-3.5 w-3.5" />
              <span>India (English - INR)</span>
            </button>
            <span className="w-px h-3 bg-white/20"></span>
            <div className="flex items-center gap-1.5 font-medium">
              <span className="text-white/30">Status: All Systems Operational</span>
            </div>
          </div>
        </div>"""

content = re.sub(pattern, new_content, content)

with open("src/components/Footer.tsx", "w") as f:
    f.write(content)
