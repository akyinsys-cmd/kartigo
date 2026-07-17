with open("src/main.tsx", "r") as f:
    content = f.read()

content = content.replace(
    "<AuthProvider>\n      <ErrorBoundary><App /></ErrorBoundary>\n    </AuthProvider>",
    "<ErrorBoundary>\n      <AuthProvider><App /></AuthProvider>\n    </ErrorBoundary>"
)

with open("src/main.tsx", "w") as f:
    f.write(content)
