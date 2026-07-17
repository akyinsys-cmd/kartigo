import re

with open("src/components/DocumentAgent.tsx", "r") as f:
    content = f.read()

content = content.replace(
    'placeholder="Search past chats..."',
    'placeholder="Search past chats..." aria-label="Search past chats"'
)
content = content.replace(
    '<input\n                  type="text"\n                  placeholder={',
    '<input\n                  type="text"\n                  aria-label="Message Document Agent"\n                  placeholder={'
)
# Send button
content = content.replace(
    'className={`p-3 rounded-xl transition-all',
    'aria-label="Send Message"\n                  className={`p-3 rounded-xl transition-all'
)
# Export button
content = content.replace(
    '<Download className="h-4 w-4" />',
    '<Download className="h-4 w-4" /> <span className="sr-only">Export Chat</span>'
)

with open("src/components/DocumentAgent.tsx", "w") as f:
    f.write(content)
