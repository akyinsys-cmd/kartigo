with open("src/App.tsx", "r") as f:
    content = f.read()

import_nav = """import MobileBottomNav from './components/MobileBottomNav';
"""

if "MobileBottomNav" not in content:
    content = content.replace("import DocumentLandingView from './components/DocumentLandingView';", "import DocumentLandingView from './components/DocumentLandingView';\n" + import_nav)

nav_code = """      <MobileBottomNav 
        currentView={currentView}
        activeTab={dashboardTab}
        onNavigateHome={() => setCurrentView('landing')}
        onNavigateDashboard={(tab) => { 
          if (!user) {
            setAuthInitialMode('login');
            setIsAuthModalOpen(true);
          } else {
            setDashboardTab(tab as any);
            setCurrentView('dashboard');
          }
        }}
        onStartAgent={handleStartDrafting}
      />
    </div>
  );
}"""

content = content.replace("    </div>\n  );\n}", nav_code)

with open("src/App.tsx", "w") as f:
    f.write(content)
