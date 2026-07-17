import re

with open("src/components/admin/SuperAdminView.tsx", "r") as f:
    content = f.read()

# Add AdminQAManager import
if "import AdminQAManager" not in content:
    content = content.replace("import AdminPerformanceManager from './AdminPerformanceManager';", "import AdminPerformanceManager from './AdminPerformanceManager';\nimport AdminQAManager from './AdminQAManager';")

# Add to menu under System & Security
qa_menu = "        { id: 'qa_testing', label: 'QA & Auditing', icon: CheckSquare },"
if "qa_testing" not in content:
    content = content.replace("        { id: 'performance', label: 'Performance & Scale', icon: Cpu },", "        { id: 'performance', label: 'Performance & Scale', icon: Cpu },\n" + qa_menu)

# Add to cases
qa_case = """      case 'qa_testing':
        return <AdminQAManager />;"""
if "qa_testing" not in content:
    content = content.replace("      case 'performance':\n        return <AdminPerformanceManager />;", qa_case + "\n      case 'performance':\n        return <AdminPerformanceManager />;")
    
# Import CheckSquare
if "CheckSquare" not in content and "import { " in content:
    content = content.replace("import { ", "import { CheckSquare, ")

with open("src/components/admin/SuperAdminView.tsx", "w") as f:
    f.write(content)
