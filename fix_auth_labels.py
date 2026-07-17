import re

with open("src/components/AuthModal.tsx", "r") as f:
    content = f.read()

content = content.replace('<label className="block text-xs font-bold text-brand-secondary mb-1.5">Email Address</label>', '<label htmlFor="login-email" className="block text-xs font-bold text-brand-secondary mb-1.5">Email Address</label>')
content = content.replace('<label className="block text-xs font-bold text-brand-secondary mb-1.5">Password</label>', '<label htmlFor="login-password" className="block text-xs font-bold text-brand-secondary mb-1.5">Password</label>')
content = content.replace('<label className="block text-xs font-bold text-brand-secondary mb-1.5">First Name</label>', '<label htmlFor="register-first-name" className="block text-xs font-bold text-brand-secondary mb-1.5">First Name</label>')
content = content.replace('<label className="block text-xs font-bold text-brand-secondary mb-1.5">Last Name</label>', '<label htmlFor="register-last-name" className="block text-xs font-bold text-brand-secondary mb-1.5">Last Name</label>')
# Some are generic, let's fix them with regex if needed

with open("src/components/AuthModal.tsx", "w") as f:
    f.write(content)
