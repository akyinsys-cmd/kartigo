with open("src/App.tsx", "r") as f:
    content = f.read()

import_loader = """import { Loader2 } from 'lucide-react';
"""

if "import { Loader2" not in content:
    content = content.replace("import { useAuth } from './context/AuthContext';", "import { useAuth } from './context/AuthContext';\n" + import_loader)

loading_block = """  if (useAuth().loading) {
    return (
      <div className="min-h-screen bg-[#FFFDF2] flex flex-col items-center justify-center">
        <div className="relative">
          <div className="h-16 w-16 border-4 border-[#F1FEC8] rounded-full"></div>
          <div className="h-16 w-16 border-4 border-[#FD1843] rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
        </div>
        <h2 className="mt-6 text-sm font-bold text-[#3C1A47] tracking-widest uppercase animate-pulse">Starting Workspace...</h2>
      </div>
    );
  }"""

if "if (useAuth().loading)" not in content:
    content = content.replace("  const { user } = useAuth();\n", "  const { user, loading } = useAuth();\n" + loading_block + "\n")
    content = content.replace("  if (useAuth().loading)", "  if (loading)")

with open("src/App.tsx", "w") as f:
    f.write(content)

