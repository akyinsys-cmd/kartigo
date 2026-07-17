python3 -c '
with open("src/components/admin/AdminSecurityManager.tsx", "r") as f:
    content = f.read()

content = content.replace("""                  </div>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#2B9348] transition-colors">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                    </button>
                  </div>""", "                  </div>")

with open("src/components/admin/AdminSecurityManager.tsx", "w") as f:
    f.write(content)
'
