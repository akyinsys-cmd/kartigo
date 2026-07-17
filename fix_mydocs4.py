with open("src/components/MyDocumentsView.tsx", "r") as f:
    content = f.read()

import_statement = "import { EmptyState } from './CustomerWorkspacePlaceholders';\n"
if "EmptyState" not in content:
    content = content.replace(
        "import { motion, AnimatePresence } from 'motion/react';",
        "import { motion, AnimatePresence } from 'motion/react';\n" + import_statement
    )

old_empty = """                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-text-light">
                    <FileText className="h-8 w-8 mx-auto mb-3 opacity-20 text-brand-primary" />
                    <p className="font-medium text-brand-secondary text-sm">No documents found</p>
                    <p className="mt-1 mb-4">You haven't generated any documents matching this search.</p>
                    <button onClick={onCreateNew} className="text-xs font-bold text-brand-primary hover:underline">Draft New Document</button>
                  </td>
                </tr>"""

new_empty = """                <tr>
                  <td colSpan={6} className="px-5 py-6">
                    <EmptyState 
                      icon={FileText} 
                      title="No documents found" 
                      description="You haven't generated any documents matching this search." 
                      actionText="Draft New Document" 
                      onAction={onCreateNew} 
                    />
                  </td>
                </tr>"""

content = content.replace(old_empty, new_empty)

with open("src/components/MyDocumentsView.tsx", "w") as f:
    f.write(content)

