with open("src/components/MyDocumentsView.tsx", "r") as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    if line.strip() == "let aVal = a[sortField];" or line.strip() == "let bVal = b[sortField];":
        continue
    new_lines.append(line)

with open("src/components/MyDocumentsView.tsx", "w") as f:
    f.writelines(new_lines)

# Fix UserManagement.tsx originTopRight
with open("src/components/admin/UserManagement.tsx", "r") as f:
    content = f.read()
content = content.replace("originTopRight: true,", "")
with open("src/components/admin/UserManagement.tsx", "w") as f:
    f.write(content)

