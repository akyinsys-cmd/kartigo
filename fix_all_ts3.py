import re

# DashboardView
with open("src/components/DashboardView.tsx", "r") as f:
    content = f.read()

content = content.replace(
    "const [internalTab, setInternalTab] = useState<'overview' | 'agent' | 'profile' | 'security' | 'notifications' | 'future'",
    "const [internalTab, setInternalTab] = useState<'overview' | 'agent' | 'profile' | 'security' | 'developer' | 'notifications' | 'future'"
)
with open("src/components/DashboardView.tsx", "w") as f:
    f.write(content)

# MyDocumentsView
with open("src/components/MyDocumentsView.tsx", "r") as f:
    content = f.read()

old_sort = """    let aVal: string | Date = a[sortField];
    let bVal: string | Date = b[sortField];
    if (sortField === 'title') {
      aVal = a.title.toLowerCase();
      bVal = b.title.toLowerCase();
    } else {
      const aTime = new Date(aVal as string).getTime();
      const bTime = new Date(bVal as string).getTime();
    }
    if (aTime < bTime) return sortDirection === 'asc' ? -1 : 1;
    if (aTime > bTime) return sortDirection === 'asc' ? 1 : -1;"""

new_sort = """    let aVal = a[sortField];
    let bVal = b[sortField];
    let aCmp: string | number;
    let bCmp: string | number;
    
    if (sortField === 'title') {
      aCmp = aVal ? String(aVal).toLowerCase() : '';
      bCmp = bVal ? String(bVal).toLowerCase() : '';
    } else {
      aCmp = aVal ? new Date(aVal as string).getTime() : 0;
      bCmp = bVal ? new Date(bVal as string).getTime() : 0;
    }
    
    if (aCmp < bCmp) return sortDirection === 'asc' ? -1 : 1;
    if (aCmp > bCmp) return sortDirection === 'asc' ? 1 : -1;"""

content = content.replace(old_sort, new_sort)

with open("src/components/MyDocumentsView.tsx", "w") as f:
    f.write(content)
