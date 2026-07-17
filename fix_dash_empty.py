with open("src/components/DashboardView.tsx", "r") as f:
    content = f.read()

import_statement = "import { EmptyState } from './CustomerWorkspacePlaceholders';\n"
if "EmptyState" not in content:
    content = content.replace(
        "import { motion, AnimatePresence } from 'motion/react';",
        "import { motion, AnimatePresence } from 'motion/react';\n" + import_statement
    )

old_empty = """                  {myDocuments.length === 0 ? (
                    <div className="py-8 text-center text-text-light space-y-2">
                      <div className="mx-auto h-12 w-12 rounded-full bg-vanilla-secondary flex items-center justify-center">
                        <FileText className="h-6 w-6 text-brand-secondary" />
                      </div>
                      <span className="block text-xs font-bold text-brand-secondary">No Recent Documents</span>
                      <p className="text-[11px] max-w-xs mx-auto text-text-secondary leading-relaxed">
                        You don't have any recent documents. Create a new document to get started.
                      </p>
                    </div>
                  ) : ("""

new_empty = """                  {myDocuments.length === 0 ? (
                    <EmptyState 
                      icon={FileText} 
                      title="No Recent Documents" 
                      description="You don't have any recent documents. Create a new document to get started." 
                      actionText="Create Document" 
                      onAction={onBrowseDocuments} 
                    />
                  ) : ("""

content = content.replace(old_empty, new_empty)

with open("src/components/DashboardView.tsx", "w") as f:
    f.write(content)

