with open("src/components/MyDocumentsView.tsx", "r") as f:
    content = f.read()

table_code = """        <div className="overflow-x-auto hidden md:block">
          <table className="w-full text-left border-collapse">"""

if '<div className="overflow-x-auto">\n          <table' in content:
    content = content.replace('<div className="overflow-x-auto">\n          <table', table_code)

mobile_cards = """        {/* Mobile Cards (Visible only on small screens) */}
        <div className="md:hidden divide-y divide-vanilla-main/60">
          {filteredDocs.length > 0 ? (
            filteredDocs.map((doc) => (
              <div key={doc.id} className="p-4 bg-white hover:bg-vanilla-secondary/20 transition-colors" onClick={() => onOpenDoc(doc)}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-brand-primary/10 rounded-lg flex items-center justify-center shrink-0 text-brand-primary">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="font-bold text-brand-secondary line-clamp-1">{doc.title}</span>
                      <span className="text-[10px] text-text-light font-mono block mt-0.5">{doc.documentType}</span>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleActionMenu(doc.id, e); }}
                    className="p-1.5 text-text-light hover:text-brand-primary rounded-lg transition-colors"
                  >
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-3 text-xs">
                  <span className="text-text-light">{doc.createdAt.toLocaleDateString()}</span>
                  <span className="px-2 py-1 bg-green-50 text-green-700 rounded-md text-[10px] font-bold uppercase tracking-wider border border-green-100">
                    Completed
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6">
              <EmptyState 
                icon={FileText} 
                title="No documents found" 
                description="You haven't generated any documents matching this search." 
                actionText="Draft New Document" 
                onAction={onCreateNew} 
              />
            </div>
          )}
        </div>

        {/* Pagination */}"""

if "{/* Pagination */}" in content and "{/* Mobile Cards (Visible only on small screens) */}" not in content:
    content = content.replace("{/* Pagination */}", mobile_cards)

with open("src/components/MyDocumentsView.tsx", "w") as f:
    f.write(content)

