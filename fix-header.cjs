const fs = require('fs');
let c = fs.readFileSync('src/components/Header.tsx', 'utf8');

const mobileMenu = `
    {/* Mobile Drawer menu */}
    <AnimatePresence>
      {isMobileMenuOpen && (
        <motion.div
          id="mobile-menu"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="md:hidden fixed top-[72px] left-0 right-0 bottom-0 bg-vanilla-secondary z-30 overflow-y-auto"
        >
          <div className="flex flex-col h-full">
            <div className="space-y-4 p-4 pb-20">
              {menuItems.map((item) => (
                <button
                  id={\`mobile-nav-\${item.id}\`}
                  key={item.id}
                  onClick={() => handleNavAction(item)}
                  className={\`flex items-center justify-between w-full p-4 rounded-2xl text-left transition-all \${
                    (item.type === 'view' && currentView === item.id) || (item.type === 'scroll' && currentView === 'landing' && item.id === 'hero')
                      ? 'bg-brand-primary text-white font-bold shadow-lg'
                      : 'text-brand-secondary font-semibold hover:bg-vanilla-alt'
                  }\`}
                >
                  <span>{item.name}</span>
                  <ChevronRight className={\`h-4 w-4 \${currentView === item.id ? 'text-white' : 'text-text-light'}\`} />
                </button>
              ))}
              
              {!user && (
                <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-vanilla-main">
                  <button
                    id="mobile-login-btn"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenAuth('login');
                    }}
                    className="flex items-center justify-center py-4 bg-vanilla-secondary text-brand-secondary font-bold rounded-2xl shadow-xs"
                  >
                    Login
                  </button>
                  <button
                    id="mobile-register-btn"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenAuth('register');
                    }}
                    className="flex items-center justify-center py-4 bg-brand-primary text-white font-bold rounded-2xl shadow-lg"
                  >
                    Register
                  </button>
                </div>
              )}

              {user && (
                <div className="pt-6 mt-4 border-t border-vanilla-main flex flex-col gap-2">
                  <button
                    onClick={() => handleUserMenuAction('overview')}
                    className="flex items-center gap-3 w-full p-4 rounded-2xl text-left transition-all text-text-secondary font-semibold hover:bg-vanilla-alt"
                  >
                    <LayoutDashboard className="h-5 w-5" />
                    <span>My Dashboard</span>
                  </button>
                  <button
                    onClick={handleSecureLogout}
                    className="flex items-center gap-3 w-full p-4 rounded-2xl text-left transition-all text-text-light font-bold hover:bg-red-50 hover:text-red-500"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Secure Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}
`;

c = c.replace(/\{\/\* Mobile Drawer menu \*\/\}[\s\S]*/, mobileMenu.trim());
c = c.replace(/return\s*\(\s*<>\s*<header/, 'return (\n    <>\n    <header');

fs.writeFileSync('src/components/Header.tsx', c);
