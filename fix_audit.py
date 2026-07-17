import re

with open("src/components/admin/SuperAdminView.tsx", "r") as f:
    lines = f.readlines()

out = []
seen_audit = False
for line in lines:
    if "import AuditLogs from './AuditLogs';" in line:
        if not seen_audit:
            seen_audit = True
            out.append(line)
    else:
        out.append(line)

with open("src/components/admin/SuperAdminView.tsx", "w") as f:
    f.writelines(out)
