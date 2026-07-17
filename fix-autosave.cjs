const fs = require('fs');
let c = fs.readFileSync('src/components/DocumentEditor.tsx', 'utf8');

const autosaveCode = `
  // DEBOUNCED AUTO-SAVE FUNCTIONALITY (Saves to Firestore with 3.0s delay of inactivity as requested)
  useEffect(() => {
    if (!isLoaded) return;

    // Immediately set to saving state on content or title change
    setSaveStatus('saving');

    const timer = setTimeout(async () => {
      try {
        if (userId) {
          const docRef = doc(db, 'users', userId, 'documents', documentId);
          const updatePayload = {
            title,
            content,
            updatedAt: Timestamp.now()
          };
          await setDoc(docRef, updatePayload, { merge: true });
        } else {
          // Local storage save for guests
          const guestsStr = localStorage.getItem('kartigo_guest_documents');
          let guests = guestsStr ? JSON.parse(guestsStr) : [];
          const existingIdx = guests.findIndex((g: any) => g.id === documentId);
          const payload = { id: documentId, title, content, documentType, updatedAt: new Date().toISOString() };
          if (existingIdx > -1) {
            guests[existingIdx] = payload;
          } else {
            guests.push(payload);
          }
          localStorage.setItem('kartigo_guest_documents', JSON.stringify(guests));
        }

        setSaveStatus('saved');
        setLastSavedTime(new Date());
        
        // Only trigger this subtle toast occasionally or let the visual indicator handle it, 
        // but we'll add it per requirements if it's not obtrusive
        triggerNotification("Draft auto-saved securely", "info");
      } catch (err) {
        console.error("Auto-save error:", err);
        setSaveStatus('error');
      }
    }, 3000); // 3.0s debounce delay of inactivity

    return () => clearTimeout(timer);
  }, [content, title, userId, documentId, isLoaded]);
`;

c = c.replace(/\/\/ DEBOUNCED AUTO-SAVE FUNCTIONALITY \[\.\.\.\]/, autosaveCode.trim()); 
// Need to properly regex replace the useEffect
const oldEffect = c.substring(c.indexOf('// DEBOUNCED AUTO-SAVE FUNCTIONALITY'), c.indexOf('}, [content, title, userId, documentId, isLoaded]);') + 53);
c = c.replace(oldEffect, autosaveCode.trim());
fs.writeFileSync('src/components/DocumentEditor.tsx', c);
