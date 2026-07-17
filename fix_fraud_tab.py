import re

with open("src/components/admin/AdminSecurityManager.tsx", "r") as f:
    content = f.read()

pattern = r"        \{activeTab === 'fraud' && \([\s\S]*?        \{activeTab === 'maintenance' && \("

fraud_tab = """        {activeTab === 'fraud' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-[24px] border border-[#E5F5B8] shadow-sm">
              <h3 className="text-lg font-bold font-display text-[#3C1A47] mb-4">Fraud Monitoring</h3>
              <div className="space-y-3">
                 <div className="flex items-center justify-between p-3 border border-[#E5F5B8] rounded-xl bg-vanilla-secondary/30">
                    <div>
                      <div className="text-sm font-bold text-[#3C1A47]">Detect Multiple Failed Payments</div>
                      <div className="text-xs text-[#8395A7]">Alert if &gt;3 failed payments from same IP</div>
                    </div>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#2B9348] transition-colors">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-3 border border-[#E5F5B8] rounded-xl bg-vanilla-secondary/30">
                    <div>
                      <div className="text-sm font-bold text-[#3C1A47]">Suspicious Referral Activity</div>
                      <div className="text-xs text-[#8395A7]">Flag accounts with same-IP referrals</div>
                    </div>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#2B9348] transition-colors">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-3 border border-[#E5F5B8] rounded-xl bg-vanilla-secondary/30">
                    <div>
                      <div className="text-sm font-bold text-[#3C1A47]">Rapid Document Requests</div>
                      <div className="text-xs text-[#8395A7]">Alert on unusually high API traffic from single user</div>
                    </div>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#2B9348] transition-colors">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-3 border border-[#E5F5B8] rounded-xl bg-vanilla-secondary/30">
                    <div>
                      <div className="text-sm font-bold text-[#3C1A47]">Duplicate Accounts</div>
                      <div className="text-xs text-[#8395A7]">Prevent multiple sign-ups from the same device fingerprint</div>
                    </div>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#2B9348] transition-colors">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-3 border border-[#E5F5B8] rounded-xl bg-vanilla-secondary/30">
                    <div>
                      <div className="text-sm font-bold text-[#3C1A47]">Account Abuse</div>
                      <div className="text-xs text-[#8395A7]">Detect automated credential stuffing and bot behavior</div>
                    </div>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#2B9348] transition-colors">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                    </button>
                  </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'maintenance' && ("""

new_content = re.sub(pattern, fraud_tab, content)

with open("src/components/admin/AdminSecurityManager.tsx", "w") as f:
    f.write(new_content)
