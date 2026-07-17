sed -i 's/import AdminHealthManager from '"'"'.\/AdminHealthManager'"'"';/import AdminHealthManager from '"'"'.\/AdminHealthManager'"'"';\nimport AdminMediaManager from '"'"'.\/AdminMediaManager'"'"';/' src/components/admin/SuperAdminView.tsx
sed -i '/case '"'"'media'"'"':/,/return <AdminPlaceholder title="Media Library" description="Manage images, PDFs, and assets with auto-compression." \/>;/c\
      case '"'"'media'"'"':\
        return <AdminMediaManager />;' src/components/admin/SuperAdminView.tsx
