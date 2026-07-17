with open("src/components/MyDocumentsView.tsx", "r") as f:
    lines = f.readlines()

new_sort = """    let aVal: any = a[sortField];
    let bVal: any = b[sortField];
    let aCmp: string | number;
    let bCmp: string | number;
    if (sortField === 'title') {
      aCmp = aVal ? String(aVal).toLowerCase() : '';
      bCmp = bVal ? String(bVal).toLowerCase() : '';
    } else {
      aCmp = aVal ? new Date(aVal).getTime() : 0;
      bCmp = bVal ? new Date(bVal).getTime() : 0;
    }
    if (aCmp < bCmp) return sortDirection === 'asc' ? -1 : 1;
    if (aCmp > bCmp) return sortDirection === 'asc' ? 1 : -1;
    return 0;
"""

for i in range(len(lines)):
    if "if (sortField === 'title') {" in lines[i]:
        # go up 2 lines
        start_idx = i - 2
        for j in range(i, len(lines)):
            if "return 0;" in lines[j]:
                end_idx = j
                break
        
        lines = lines[:start_idx] + [new_sort] + lines[end_idx+1:]
        break

with open("src/components/MyDocumentsView.tsx", "w") as f:
    f.writelines(lines)
