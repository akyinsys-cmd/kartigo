python3 -c '
import sys

with open("src/components/admin/AdminSecurityManager.tsx", "r") as f:
    content = f.read()

# Add a tab for "login" and "sessions"
content = content.replace("{ id: \"fraud\", label: \"Fraud Detection\", icon: AlertTriangle },", "{ id: \"fraud\", label: \"Fraud Detection\", icon: AlertTriangle },\n          { id: \"login\", label: \"Login Protection\", icon: ShieldAlert },\n          { id: \"sessions\", label: \"Session & Devices\", icon: Activity },")

login_html = """
        {activeTab === '"'"'login'"'"' && (
          <div className="bg-white rounded-[24px] border border-[#E5F5B8] shadow-sm p-6">
            <div className="flex justify-between items-end mb-6">
              <div>
                <h3 className="text-lg font-bold font-display text-[#3C1A47]">Login Protection</h3>
                <p className="text-xs text-[#8395A7] mt-1">Configure protections against brute force and credential stuffing.</p>
              </div>
              <button className="px-4 py-2 bg-[#3C1A47] text-white rounded-xl text-xs font-bold shadow-md hover:bg-[#2C1335] transition-colors flex items-center gap-2">
                <Save className="h-4 w-4" /> Save
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#8395A7] mb-1.5 block">Max Login Attempts (before lock)</label>
                  <input type="number" defaultValue={5} className="w-full bg-[#F1FEC8]/30 border border-[#E5F5B8] rounded-xl px-4 py-2 text-sm text-[#3C1A47] focus:outline-hidden" />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#8395A7] mb-1.5 block">Account Lockout Duration (Minutes)</label>
                  <input type="number" defaultValue={30} className="w-full bg-[#F1FEC8]/30 border border-[#E5F5B8] rounded-xl px-4 py-2 text-sm text-[#3C1A47] focus:outline-hidden" />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border border-[#E5F5B8] rounded-xl bg-vanilla-secondary/30 mt-4">
                <div>
                  <div className="text-sm font-bold text-[#3C1A47]">Suspicious Login Alerts</div>
                  <div className="text-xs text-[#8395A7]">Send email alert on login from new device/location</div>
                </div>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#2B9348] transition-colors">
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                </button>
              </div>
            </div>
          </div>
        )}
"""

sessions_html = """
        {activeTab === '"'"'sessions'"'"' && (
          <div className="bg-white rounded-[24px] border border-[#E5F5B8] shadow-sm p-6">
            <div className="flex justify-between items-end mb-6">
              <div>
                <h3 className="text-lg font-bold font-display text-[#3C1A47]">Session & Device Management</h3>
                <p className="text-xs text-[#8395A7] mt-1">Configure user session lifecycles and device tracking.</p>
              </div>
              <button className="px-4 py-2 bg-[#3C1A47] text-white rounded-xl text-xs font-bold shadow-md hover:bg-[#2C1335] transition-colors flex items-center gap-2">
                <Save className="h-4 w-4" /> Save
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#8395A7] mb-1.5 block">Default Session Expiry (Hours)</label>
                  <input type="number" defaultValue={24} className="w-full bg-[#F1FEC8]/30 border border-[#E5F5B8] rounded-xl px-4 py-2 text-sm text-[#3C1A47] focus:outline-hidden" />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#8395A7] mb-1.5 block">"Remember Me" Session Expiry (Days)</label>
                  <input type="number" defaultValue={30} className="w-full bg-[#F1FEC8]/30 border border-[#E5F5B8] rounded-xl px-4 py-2 text-sm text-[#3C1A47] focus:outline-hidden" />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border border-[#E5F5B8] rounded-xl bg-vanilla-secondary/30 mt-4">
                <div>
                  <div className="text-sm font-bold text-[#3C1A47]">Concurrent Sessions</div>
                  <div className="text-xs text-[#8395A7]">Allow users to be logged in on multiple devices simultaneously</div>
                </div>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#2B9348] transition-colors">
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                </button>
              </div>
              <div className="flex items-center justify-between p-4 border border-[#E5F5B8] rounded-xl bg-vanilla-secondary/30">
                <div>
                  <div className="text-sm font-bold text-[#3C1A47]">Force Logout All Users</div>
                  <div className="text-xs text-[#8395A7] text-red-600">Immediately invalidates all active sessions (Emergency only)</div>
                </div>
                <button className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors">
                  Execute Global Logout
                </button>
              </div>
            </div>
          </div>
        )}
"""

content = content.replace("{activeTab === '"'"'api'"'"' && (", login_html + sessions_html + "{activeTab === '"'"'api'"'"' && (")

with open("src/components/admin/AdminSecurityManager.tsx", "w") as f:
    f.write(content)
'
