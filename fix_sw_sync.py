with open("public/sw.js", "r") as f:
    content = f.read()

sync_code = """
// Background Sync Preparation
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-offline-documents') {
    event.waitUntil(
      // In a real app, we would fetch offline queued actions from IndexedDB and replay them here
      Promise.resolve()
    );
  }
});
"""

if "sync-offline-documents" not in content:
    content += sync_code

with open("public/sw.js", "w") as f:
    f.write(content)
