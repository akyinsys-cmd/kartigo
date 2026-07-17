const fs = require('fs');
let c = fs.readFileSync('src/components/BrowseDocumentsSection.tsx', 'utf8');

const highlightTextComponent = `
const HighlightText = ({ text, highlight }: { text: string; highlight: string }) => {
  if (!highlight.trim()) return <>{text}</>;
  
  const regex = new RegExp(\`(\${highlight.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&')})\`, 'gi');
  const parts = text.split(regex);
  
  return (
    <>
      {parts.map((part, i) => 
        regex.test(part) ? <span key={i} className="bg-amber-200 text-amber-900 px-0.5 rounded-sm">{part}</span> : <span key={i}>{part}</span>
      )}
    </>
  );
};
`;

c = c.replace(/const CategoryIcon = /, highlightTextComponent + '\nconst CategoryIcon = ');

// replace the useMemo for resolvedCategories to use Lucide icons
const newResolvedCategories = `
  const resolvedCategories = useMemo(() => {
    return categories.map(c => {
      let illustration: any = 'FileText';
      if (c.id === 'legal') illustration = 'Scale';
      else if (c.id === 'hr') illustration = 'Users';
      else if (c.id === 'business') illustration = 'Briefcase';
      else if (c.id === 'real_estate') illustration = 'Building';
      else if (c.id === 'corporate') illustration = 'Building2';
      else if (c.id === 'technology') illustration = 'Monitor';
      else if (c.id === 'finance') illustration = 'CircleDollarSign';
      else if (c.icon) illustration = c.icon;
      
      return {
        id: c.id,
        title: c.title,
        icon: illustration,
        description: c.description || 'Vetted templates'
      };
    });
  }, [categories]);
`;

c = c.replace(/const resolvedCategories = useMemo\(\(\) => \{[\s\S]*?\}, \[categories\]\);/, newResolvedCategories.trim());

// Highlight titles and categories
c = c.replace(/{doc\.title}/g, '<HighlightText text={doc.title} highlight={searchQuery} />');
c = c.replace(/{docCategoryObj\.title}/g, '<HighlightText text={docCategoryObj.title} highlight={searchQuery} />');

fs.writeFileSync('src/components/BrowseDocumentsSection.tsx', c);
