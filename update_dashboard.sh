sed -i 's/import UserManagement from '"'"'.\/admin\/UserManagement'"'"';/import UserManagement from '"'"'.\/admin\/UserManagement'"'"';\nimport UserSecuritySettings from '"'"'.\/UserSecuritySettings'"'"';/' src/components/DashboardView.tsx
sed -i '/<h3 className="text-lg font-bold text-brand-secondary">Security & Session Management<\/h3>/,/<\/div>/c\
                  <UserSecuritySettings />' src/components/DashboardView.tsx
