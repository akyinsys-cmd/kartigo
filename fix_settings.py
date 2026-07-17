with open("src/components/admin/SettingsManager.tsx", "r") as f:
    content = f.read()

new_nav = """        {[
          { id: 'general', label: 'General Settings', icon: Globe },
          { id: 'theme', label: 'Theme & Branding', icon: SettingsIcon },
          { id: 'email', label: 'Email (SMTP)', icon: Mail },
          { id: 'firebase', label: 'Firebase Config', icon: Server },
          { id: 'security', label: 'Security & Auth', icon: Lock },
        ].map(item => ("""

content = content.replace("        {[\n          { id: 'general', label: 'General Settings', icon: Globe },\n          { id: 'email', label: 'Email (SMTP)', icon: Mail },\n          { id: 'firebase', label: 'Firebase Config', icon: Server },\n          { id: 'security', label: 'Security & Auth', icon: Lock },\n        ].map(item => (", new_nav)

theme_block = """            {activeSection === 'theme' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-[#3C1A47] mb-2">Primary Color</label>
                    <div className="flex items-center gap-3">
                      <input type="color" defaultValue="#FD1843" className="w-12 h-12 rounded-xl cursor-pointer border border-[#E5F5B8]" />
                      <input type="text" defaultValue="#FD1843" className="flex-1 w-full p-3 rounded-xl border border-[#E5F5B8] bg-[#F8FDDC]/20 text-sm font-mono text-[#3C1A47] focus:outline-none focus:border-[#3C1A47]" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#3C1A47] mb-2">Secondary Color</label>
                    <div className="flex items-center gap-3">
                      <input type="color" defaultValue="#3C1A47" className="w-12 h-12 rounded-xl cursor-pointer border border-[#E5F5B8]" />
                      <input type="text" defaultValue="#3C1A47" className="flex-1 w-full p-3 rounded-xl border border-[#E5F5B8] bg-[#F8FDDC]/20 text-sm font-mono text-[#3C1A47] focus:outline-none focus:border-[#3C1A47]" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#3C1A47] mb-2">Logo Upload (SVG/PNG)</label>
                    <div className="w-full p-3 rounded-xl border border-[#E5F5B8] bg-[#F8FDDC]/20 text-sm font-mono text-[#3C1A47] focus:outline-none focus:border-[#3C1A47] cursor-pointer flex items-center justify-center">
                      Upload Logo
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#3C1A47] mb-2">Favicon Upload</label>
                    <div className="w-full p-3 rounded-xl border border-[#E5F5B8] bg-[#F8FDDC]/20 text-sm font-mono text-[#3C1A47] focus:outline-none focus:border-[#3C1A47] cursor-pointer flex items-center justify-center">
                      Upload Favicon
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#3C1A47] mb-2">Loading Animation Style</label>
                    <select className="w-full p-3 rounded-xl border border-[#E5F5B8] bg-[#F8FDDC]/20 text-sm font-bold text-[#3C1A47] focus:outline-none focus:border-[#3C1A47] cursor-pointer">
                      <option>Kartigo Pulse (Default)</option>
                      <option>Skeleton Shimmer</option>
                      <option>Spinner Loop</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#3C1A47] mb-2">Dark Mode Support</label>
                    <select disabled className="w-full p-3 rounded-xl border border-[#E5F5B8] bg-gray-100 text-sm font-bold text-[#8395A7] cursor-not-allowed">
                      <option>Disabled (Light Mode Only)</option>
                    </select>
                    <span className="text-[10px] text-[#8395A7] mt-1 block">Premium plan restriction: Dark mode disabled globally.</span>
                  </div>
                </div>
              </motion.div>
            )}

            {activeSection === 'email' && ("""

content = content.replace("            {activeSection === 'email' && (", theme_block)

with open("src/components/admin/SettingsManager.tsx", "w") as f:
    f.write(content)

