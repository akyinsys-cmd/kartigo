import json

with open("public/manifest.json", "r") as f:
    data = json.load(f)

data["theme_color"] = "#FFFDF2" # Vanilla Secondary background
data["background_color"] = "#FFFDF2"
data["categories"] = ["business", "productivity", "utilities"]

with open("public/manifest.json", "w") as f:
    json.dump(data, f, indent=2)
