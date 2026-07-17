import re

with open("src/components/admin/SuperAdminView.tsx", "r") as f:
    content = f.read()

# Add imports
imports = """import AdminHealthManager from './AdminHealthManager';
import AdminMediaManager from './AdminMediaManager';
import AdminLocalizationManager from './AdminLocalizationManager';"""

content = content.replace("import AdminHealthManager from './AdminHealthManager';\nimport AdminMediaManager from './AdminMediaManager';", imports)

# Add menu section
menu_pattern = r"    \{\n      title: \"System & Security\","
new_menu = """    {
      title: "Localization & Global",
      items: [
        { id: 'countries', label: 'Countries & Regions', icon: Globe },
        { id: 'languages', label: 'Languages', icon: MessageSquare },
        { id: 'currencies', label: 'Currencies & Rates', icon: DollarSign },
        { id: 'localization_settings', label: 'Global Settings', icon: Settings },
      ]
    },
    {
      title: "System & Security","""

content = re.sub(menu_pattern, new_menu, content)

# Add cases
cases_pattern = r"      case 'health':\n        return <AdminHealthManager />;"
new_cases = """      case 'health':
        return <AdminHealthManager />;
      case 'countries':
        return <AdminLocalizationManager activeTab="countries" />;
      case 'languages':
        return <AdminLocalizationManager activeTab="languages" />;
      case 'currencies':
        return <AdminLocalizationManager activeTab="currencies" />;
      case 'localization_settings':
        return <AdminLocalizationManager activeTab="settings" />;"""

content = re.sub(cases_pattern, new_cases, content)

# Also ensure icons are imported
if "Globe" not in content and "import { " in content:
    content = content.replace("import { \n", "import { \n  Globe,\n  MessageSquare,\n")

with open("src/components/admin/SuperAdminView.tsx", "w") as f:
    f.write(content)
