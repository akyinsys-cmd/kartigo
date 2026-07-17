import re

with open("src/components/Header.tsx", "r") as f:
    content = f.read()

mobile_pattern = r"        <div className=\"space-y-1 px-4 pt-3 pb-4\">\n"
mobile_new = """        <div className="space-y-1 px-4 pt-3 pb-4">
          <div className="flex justify-between items-center px-4 py-2 mb-2 bg-[#F1FEC8]/30 rounded-xl border border-[#E5F5B8]">
            <span className="text-xs font-bold text-[#8395A7]">Region:</span>
            <button className="flex items-center gap-1.5 text-xs font-bold text-[#3C1A47]">
              <Globe className="h-4 w-4 text-[#2B9348]" />
              India (EN)
            </button>
          </div>
"""

content = content.replace("        <div className=\"space-y-1 px-4 pt-3 pb-4\">\n", mobile_new)

with open("src/components/Header.tsx", "w") as f:
    f.write(content)
