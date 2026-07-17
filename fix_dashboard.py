import re

with open("src/components/DashboardView.tsx", "r") as f:
    content = f.read()

# Replace from `            {activeTab === 'security' && (` up to `            {/* TAB: HELP */}`
pattern = r"            \{activeTab === 'security' && \([\s\S]*?            \{/\* TAB: HELP \*/\}"
replacement = """            {activeTab === 'security' && (
              <motion.div
                key="security"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <UserSecuritySettings />
              </motion.div>
            )}

            {/* TAB: HELP */}"""
new_content = re.sub(pattern, replacement, content)

with open("src/components/DashboardView.tsx", "w") as f:
    f.write(new_content)
