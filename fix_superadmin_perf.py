import re

with open("src/components/admin/SuperAdminView.tsx", "r") as f:
    content = f.read()

# Replace health tab in menu with performance
old_health_menu = "{ id: 'health', label: 'System Health', icon: Activity },"
new_perf_menu = "{ id: 'performance', label: 'Performance & Scale', icon: Cpu },"

if old_health_menu in content:
    content = content.replace(old_health_menu, new_perf_menu)
else:
    print("Could not find health menu item")

# Add AdminPerformanceManager import
if "import AdminPerformanceManager" not in content:
    content = content.replace("import AdminHealthManager", "import AdminHealthManager from './AdminHealthManager';\nimport AdminPerformanceManager")
    content = content.replace("import AdminHealthManager from './AdminHealthManager';\nimport AdminPerformanceManager from './AdminHealthManager';", "import AdminPerformanceManager from './AdminPerformanceManager';\nimport AdminHealthManager from './AdminHealthManager';")
    content = content.replace("import AdminPerformanceManager from './AdminHealthManager';", "")

# Replace case 'health' with case 'performance'
old_health_case = "      case 'health':\n        return <AdminHealthManager />;"
new_perf_case = """      case 'performance':
        return <AdminPerformanceManager />;
      case 'health':
        return <AdminPerformanceManager activeTab="health" />;\n"""

if old_health_case in content:
    content = content.replace(old_health_case, new_perf_case)
else:
    print("Could not find health case")

if "Cpu" not in content and "import { " in content:
    content = content.replace("import { ", "import { Cpu, ")

with open("src/components/admin/SuperAdminView.tsx", "w") as f:
    f.write(content)
