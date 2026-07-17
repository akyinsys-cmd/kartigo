with open("src/components/DashboardView.tsx", "r") as f:
    text = f.read()

text = text.replace("n.type === 'alert'", "n.type === 'error'")
text = text.replace("{n.message}", "{n.content}")

with open("src/components/DashboardView.tsx", "w") as f:
    f.write(text)
