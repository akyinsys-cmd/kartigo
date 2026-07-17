sed -i '/    {    {/,/    }    }/c\
    {\
      title: "System & Security",\
      items: [\
        { id: '"'security'"', label: '"'Security Center'"', icon: ShieldAlert },\
        { id: '"'audit'"', label: '"'Audit Logs'"', icon: FileText },\
        { id: '"'compliance'"', label: '"'Compliance & Privacy'"', icon: Shield },\
        { id: '"'backup'"', label: '"'Backups & Recovery'"', icon: Database },\
        { id: '"'health'"', label: '"'System Health'"', icon: Activity },\
        { id: '"'settings'"', label: '"'System Config'"', icon: Settings }\
      ]\
    }' src/components/admin/SuperAdminView.tsx
