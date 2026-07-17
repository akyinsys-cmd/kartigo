import re

with open("src/components/DashboardView.tsx", "r") as f:
    content = f.read()

if "import UserSecuritySettings" not in content:
    content = content.replace("import HelpCenterView from './HelpCenterView';", "import HelpCenterView from './HelpCenterView';\nimport UserSecuritySettings from './UserSecuritySettings';\nimport UserDeveloperPortal from './UserDeveloperPortal';")

if "import { Code" not in content:
    content = content.replace("import { \n  FileText,", "import { \n  Code,\n  FileText,")

with open("src/components/DashboardView.tsx", "w") as f:
    f.write(content)
