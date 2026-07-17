with open("src/components/DashboardView.tsx", "r") as f:
    content = f.read()

content = content.replace(
    '<div className="lg:col-span-3 bg-white border border-vanilla-main rounded-[20px] p-5 card-shadow space-y-6">',
    '<div className="lg:col-span-3 bg-white border border-vanilla-main rounded-[20px] p-5 card-shadow space-y-6 lg:sticky lg:top-8">'
)

with open("src/components/DashboardView.tsx", "w") as f:
    f.write(content)
