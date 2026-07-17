import re

with open("src/components/DashboardView.tsx", "r") as f:
    content = f.read()

# 1. Add Code import
if "import { " in content and "Code," not in content:
    content = content.replace("import { ", "import { Code, ")

# 2. Add import for UserDeveloperPortal
if "import UserDeveloperPortal" not in content:
    content = content.replace("import UserSecuritySettings from './UserSecuritySettings';", "import UserSecuritySettings from './UserSecuritySettings';\nimport UserDeveloperPortal from './UserDeveloperPortal';")

# 3. Add tab button
tab_pattern = r"            <button\n              id=\"tab-security-btn\""
new_tab = """            <button
              id="tab-developer-btn"
              onClick={() => setActiveTab('developer')}
              className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all focus:outline-hidden cursor-pointer ${
                activeTab === 'developer' 
                  ? 'bg-brand-primary/5 text-brand-primary' 
                  : 'text-text-secondary hover:bg-vanilla-secondary hover:text-brand-secondary'
              }`}
            >
              <Code className="h-4 w-4" />
              <span>API & Webhooks</span>
            </button>

            <button
              id="tab-security-btn\""""
              
if "activeTab === 'developer'" not in content:
    content = re.sub(tab_pattern, new_tab, content)
    
# 4. Add tab content
content_pattern = r"            \{\/\* TAB: SECURITY \*\/\}"
new_content = """            {/* TAB: DEVELOPER */}
            {activeTab === 'developer' && (
              <motion.div
                key="developer"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <UserDeveloperPortal />
              </motion.div>
            )}

            {/* TAB: SECURITY */}"""
            
if "TAB: DEVELOPER" not in content:
    content = re.sub(content_pattern, new_content, content)

# 5. Fix header interface / type
if "activeTab: 'overview'" in content:
    content = content.replace("activeTab: 'overview' | 'agent' | 'profile' | 'security' | 'notifications' | 'future' | 'help'", "activeTab: 'overview' | 'agent' | 'profile' | 'security' | 'developer' | 'notifications' | 'future' | 'help'")
if "setActiveTab: (tab: 'overview'" in content:
    content = content.replace("setActiveTab: (tab: 'overview' | 'agent' | 'profile' | 'security' | 'notifications' | 'future' | 'help') => void;", "setActiveTab: (tab: 'overview' | 'agent' | 'profile' | 'security' | 'developer' | 'notifications' | 'future' | 'help') => void;")
    
with open("src/components/DashboardView.tsx", "w") as f:
    f.write(content)
