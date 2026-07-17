with open("src/components/DashboardView.tsx", "r") as f:
    content = f.read()

notifs_block = """            {activeTab === 'notifications' && (
              <motion.div
                key="notifications"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-bold text-brand-secondary">Notifications</h3>
                  <p className="text-xs text-text-light mt-1">View your latest alerts, messages, and updates.</p>
                </div>
                {notifications.length === 0 ? (
                  <EmptyState 
                    icon={Bell} 
                    title="No Notifications" 
                    description="You are all caught up! No new notifications to display."
                  />
                ) : (
                  <div className="bg-white rounded-[20px] border border-vanilla-main p-1 divide-y divide-vanilla-main/60 card-shadow">
                    {notifications.map((n) => (
                      <div key={n.id} className={`p-4 flex gap-3 hover:bg-vanilla-secondary/30 transition-colors ${!n.read ? 'bg-vanilla-secondary/10' : ''}`}>
                        <div className="mt-0.5">
                          {n.type === 'alert' ? <AlertCircle className="h-5 w-5 text-red-500" /> : 
                           n.type === 'success' ? <CheckCircle className="h-5 w-5 text-green-500" /> : 
                           <Bell className="h-5 w-5 text-brand-primary" />}
                        </div>
                        <div className="flex-1">
                          <h4 className={`text-sm ${!n.read ? 'font-bold text-brand-secondary' : 'font-medium text-text-secondary'}`}>{n.title}</h4>
                          <p className="text-xs text-text-light mt-1">{n.message}</p>
                          <span className="text-[10px] text-text-light/70 font-mono mt-2 block">{new Date(n.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'profile' && ("""

content = content.replace("            {activeTab === 'profile' && (", notifs_block)

with open("src/components/DashboardView.tsx", "w") as f:
    f.write(content)

