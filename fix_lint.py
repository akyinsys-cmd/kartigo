import re

# 1. ErrorBoundary
with open("src/components/ErrorBoundary.tsx", "r") as f:
    content = f.read()

content = content.replace("class ErrorBoundary extends Component<Props, State>", "class ErrorBoundary extends React.Component<Props, State>")
with open("src/components/ErrorBoundary.tsx", "w") as f:
    f.write(content)

# 2. DashboardView
with open("src/components/DashboardView.tsx", "r") as f:
    content = f.read()

if "import UserSecuritySettings from './UserSecuritySettings';" not in content:
    content = content.replace("import HelpCenterView from './HelpCenterView';", "import HelpCenterView from './HelpCenterView';\nimport UserSecuritySettings from './UserSecuritySettings';\nimport UserDeveloperPortal from './UserDeveloperPortal';")

if "Code" not in content and "import { " in content:
    content = content.replace("import { \n  FileText,", "import { \n  Code,\n  FileText,")

with open("src/components/DashboardView.tsx", "w") as f:
    f.write(content)

# 3. UserSecuritySettings.tsx
with open("src/components/UserSecuritySettings.tsx", "r") as f:
    content = f.read()

if "Activity" not in content and "import { " in content:
    content = content.replace("import { ", "import { Activity, ")

with open("src/components/UserSecuritySettings.tsx", "w") as f:
    f.write(content)

# 4. AdminAnalyticsManager.tsx
with open("src/components/admin/AdminAnalyticsManager.tsx", "r") as f:
    content = f.read()
    
if "MessageSquare" not in content and "import { " in content:
    content = content.replace("import { ", "import { MessageSquare, ")

if "CheckCircle2" not in content and "import { " in content:
    content = content.replace("import { ", "import { CheckCircle2, ")
    
with open("src/components/admin/AdminAnalyticsManager.tsx", "w") as f:
    f.write(content)

# 5. AdminCommunicationManager.tsx
with open("src/components/admin/AdminCommunicationManager.tsx", "r") as f:
    content = f.read()
    
if "Download" not in content and "import { " in content:
    content = content.replace("import { ", "import { Download, ")

with open("src/components/admin/AdminCommunicationManager.tsx", "w") as f:
    f.write(content)

# 6. SuperAdminView.tsx
with open("src/components/admin/SuperAdminView.tsx", "r") as f:
    content = f.read()

if "Cpu" not in content and "import { " in content:
    content = content.replace("import { ", "import { Cpu, ")

content = content.replace("function AuditLogs(", "function AuditLogsDummy(")

with open("src/components/admin/SuperAdminView.tsx", "w") as f:
    f.write(content)

