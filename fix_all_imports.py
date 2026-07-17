import re
import glob

def ensure_import(file_path, imports, package):
    with open(file_path, "r") as f:
        content = f.read()

    # Find the import block for the package
    match = re.search(r'import\s+{([^}]*)}\s+from\s+[\'"]' + re.escape(package) + r'[\'"]', content)
    if match:
        existing_imports = match.group(1).replace('\n', ' ').split(',')
        existing_imports = [i.strip() for i in existing_imports if i.strip()]
        for imp in imports:
            if imp not in existing_imports:
                existing_imports.append(imp)
        new_import_block = 'import { ' + ', '.join(existing_imports) + " } from '" + package + "'"
        content = content[:match.start()] + new_import_block + content[match.end():]
        with open(file_path, "w") as f:
            f.write(content)

ensure_import("src/components/UserSecuritySettings.tsx", ["Activity"], "lucide-react")
ensure_import("src/components/admin/AdminCommunicationManager.tsx", ["Download", "CheckCircle"], "lucide-react")
ensure_import("src/components/admin/SuperAdminView.tsx", ["Cpu"], "lucide-react")

