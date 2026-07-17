with open("src/components/admin/SettingsManager.tsx", "r") as f:
    content = f.read()

banner_code = """                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-xs font-bold text-[#3C1A47] mb-2">Global Announcement Banner (HTML allowed)</label>
                    <textarea rows={3} placeholder="e.g. Scheduled maintenance on Sunday 2AM EST..." className="w-full p-3 rounded-xl border border-[#E5F5B8] bg-[#F8FDDC]/20 text-sm font-medium text-[#3C1A47] focus:outline-none focus:border-[#3C1A47]" />
                  </div>
                </div>
              </motion.div>"""

content = content.replace("                </div>\n              </motion.div>", banner_code)

with open("src/components/admin/SettingsManager.tsx", "w") as f:
    f.write(content)
