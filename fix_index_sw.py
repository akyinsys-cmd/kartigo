import re

with open("index.html", "r") as f:
    content = f.read()

if "navigator.serviceWorker" not in content:
    content = content.replace("  </body>", """    <script>
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/sw.js').then(reg => {
            console.log('ServiceWorker registered:', reg.scope);
          }).catch(err => {
            console.log('ServiceWorker registration failed:', err);
          });
        });
      }
    </script>
  </body>""")

with open("index.html", "w") as f:
    f.write(content)
