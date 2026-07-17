import re
import sys

# 1. App.tsx
with open("src/App.tsx", "r") as f:
    content = f.read()

content = content.replace(
    "useState<'overview' | 'agent' | 'profile' | 'security' | 'notifications'",
    "useState<'overview' | 'agent' | 'profile' | 'security' | 'developer' | 'notifications'"
)
with open("src/App.tsx", "w") as f:
    f.write(content)

# 2. MyDocumentsView.tsx
with open("src/components/MyDocumentsView.tsx", "r") as f:
    content = f.read()

content = content.replace("aVal = new Date(aVal as string).getTime();", "const aTime = new Date(aVal as string).getTime();")
content = content.replace("bVal = new Date(bVal as string).getTime();", "const bTime = new Date(bVal as string).getTime();")
content = content.replace("aVal < bVal", "aTime < bTime")
content = content.replace("aVal > bVal", "aTime > bTime")
with open("src/components/MyDocumentsView.tsx", "w") as f:
    f.write(content)

# 3. AdminCommunicationManager.tsx
with open("src/components/admin/AdminCommunicationManager.tsx", "r") as f:
    content = f.read()
if "Download" not in content and "import { " in content:
    content = content.replace("import { Mail", "import { Mail, Download")
with open("src/components/admin/AdminCommunicationManager.tsx", "w") as f:
    f.write(content)

# 4. AdminSecurityManager.tsx
with open("src/components/admin/AdminSecurityManager.tsx", "r") as f:
    content = f.read()
content = content.replace(
    "activeTab?: 'dashboard' | 'api' | 'fraud' | 'maintenance'",
    "activeTab?: 'dashboard' | 'login' | 'sessions' | 'api' | 'fraud' | 'maintenance'"
)
content = content.replace(
    "useState<'dashboard' | 'api' | 'fraud' | 'maintenance'",
    "useState<'dashboard' | 'login' | 'sessions' | 'api' | 'fraud' | 'maintenance'"
)
with open("src/components/admin/AdminSecurityManager.tsx", "w") as f:
    f.write(content)

# 5. UserManagement.tsx
with open("src/components/admin/UserManagement.tsx", "r") as f:
    content = f.read()
content = content.replace("originTopRight: true,", "")
with open("src/components/admin/UserManagement.tsx", "w") as f:
    f.write(content)

