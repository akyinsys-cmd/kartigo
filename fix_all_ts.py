import re

# 1. DashboardView.tsx
with open("src/components/DashboardView.tsx", "r") as f:
    content = f.read()

content = content.replace(
    "activeTab?: 'overview' | 'agent' | 'profile' | 'security' | 'notifications'",
    "activeTab?: 'overview' | 'agent' | 'profile' | 'security' | 'developer' | 'notifications'"
)
content = content.replace(
    "setActiveTab?: (tab: 'overview' | 'agent' | 'profile' | 'security' | 'notifications'",
    "setActiveTab?: (tab: 'overview' | 'agent' | 'profile' | 'security' | 'developer' | 'notifications'"
)
with open("src/components/DashboardView.tsx", "w") as f:
    f.write(content)

# 2. HelpCenterView.tsx
with open("src/components/HelpCenterView.tsx", "r") as f:
    content = f.read()

if "interface HelpCenterViewProps" not in content:
    content = content.replace("export default function HelpCenterView() {", "export default function HelpCenterView({ onNavigateHome }: { onNavigateHome?: () => void }) {")
else:
    # Just add it if it's there
    pass
with open("src/components/HelpCenterView.tsx", "w") as f:
    f.write(content)

# 3. MyDocumentsView.tsx
with open("src/components/MyDocumentsView.tsx", "r") as f:
    content = f.read()

content = content.replace("b.createdAt.getTime()", "new Date(b.createdAt).getTime()")
content = content.replace("a.createdAt.getTime()", "new Date(a.createdAt).getTime()")
content = content.replace("b.updatedAt.getTime()", "new Date(b.updatedAt).getTime()")
content = content.replace("a.updatedAt.getTime()", "new Date(a.updatedAt).getTime()")

with open("src/components/MyDocumentsView.tsx", "w") as f:
    f.write(content)

# 4. AdminCommunicationManager.tsx
with open("src/components/admin/AdminCommunicationManager.tsx", "r") as f:
    content = f.read()
lines = content.split('\n')
for i, line in enumerate(lines):
    if "import { " in line and "CheckCircle" in line:
        parts = line.split("CheckCircle")
        if len(parts) > 2: # duplicate
            lines[i] = parts[0] + "CheckCircle" + parts[2]
content = '\n'.join(lines)
with open("src/components/admin/AdminCommunicationManager.tsx", "w") as f:
    f.write(content)

# 5. AdminSecurityManager.tsx
with open("src/components/admin/AdminSecurityManager.tsx", "r") as f:
    content = f.read()
if "initialTab = 'dashboard'" in content:
    content = re.sub(r'activeTab\?: \'.*?\'', "activeTab?: 'dashboard' | 'login' | 'sessions' | 'api' | 'fraud' | 'maintenance'", content)
    content = re.sub(r'useState<\'.*?\'', "useState<'dashboard' | 'login' | 'sessions' | 'api' | 'fraud' | 'maintenance'", content)
with open("src/components/admin/AdminSecurityManager.tsx", "w") as f:
    f.write(content)

# 6. UserManagement.tsx
with open("src/components/admin/UserManagement.tsx", "r") as f:
    content = f.read()
content = content.replace("originTopRight: true,", "")
with open("src/components/admin/UserManagement.tsx", "w") as f:
    f.write(content)

