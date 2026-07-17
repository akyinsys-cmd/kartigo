with open("src/App.tsx", "r") as f:
    content = f.read()

loading_block = """  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFDF2] flex flex-col items-center justify-center">
        <div className="relative">
          <div className="h-16 w-16 border-4 border-[#F1FEC8] rounded-full"></div>
          <div className="h-16 w-16 border-4 border-[#FD1843] rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
        </div>
        <h2 className="mt-6 text-sm font-bold text-[#3C1A47] tracking-widest uppercase animate-pulse">Starting Workspace...</h2>
      </div>
    );
  }
"""

if loading_block in content:
    content = content.replace(loading_block, "")
    content = content.replace("  if (currentView === 'admin_login') {", loading_block + "  if (currentView === 'admin_login') {")

with open("src/App.tsx", "w") as f:
    f.write(content)
