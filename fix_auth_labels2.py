import re

with open("src/components/AuthModal.tsx", "r") as f:
    content = f.read()

replacements = {
    '<label className="block text-xs font-bold text-brand-secondary">Password</label>': '<label htmlFor="login-password" className="block text-xs font-bold text-brand-secondary">Password</label>',
    '<label className="block text-xs font-bold text-brand-secondary mb-1.5">First Name *</label>': '<label htmlFor="register-first-name" className="block text-xs font-bold text-brand-secondary mb-1.5">First Name *</label>',
    '<label className="block text-xs font-bold text-brand-secondary mb-1.5">Last Name *</label>': '<label htmlFor="register-last-name" className="block text-xs font-bold text-brand-secondary mb-1.5">Last Name *</label>',
    '<label className="block text-xs font-bold text-brand-secondary mb-1.5">Email Address *</label>': '<label htmlFor="register-email" className="block text-xs font-bold text-brand-secondary mb-1.5">Email Address *</label>',
    '<label className="block text-xs font-bold text-brand-secondary mb-1.5">Phone Number (Optional)</label>': '<label htmlFor="register-phone" className="block text-xs font-bold text-brand-secondary mb-1.5">Phone Number (Optional)</label>',
    '<label className="block text-xs font-bold text-brand-secondary mb-1.5">Password *</label>': '<label htmlFor="register-password" className="block text-xs font-bold text-brand-secondary mb-1.5">Password *</label>',
    '<label className="block text-xs font-bold text-brand-secondary mb-1.5">Confirm Password *</label>': '<label htmlFor="register-password-confirm" className="block text-xs font-bold text-brand-secondary mb-1.5">Confirm Password *</label>',
    '<label className="block text-xs font-bold text-brand-secondary mb-1.5">Registered Email Address</label>': '<label htmlFor="forgot-email" className="block text-xs font-bold text-brand-secondary mb-1.5">Registered Email Address</label>',
    '<label className="block text-xs font-bold text-brand-secondary mb-1.5">Mobile Phone Number</label>': '<label htmlFor="otp-phone-input" className="block text-xs font-bold text-brand-secondary mb-1.5">Mobile Phone Number</label>',
    '<label className="block text-xs font-bold text-brand-secondary mb-1.5">6-Digit Verification Code</label>': '<label htmlFor="otp-code-input" className="block text-xs font-bold text-brand-secondary mb-1.5">6-Digit Verification Code</label>',
    '<label className="flex items-center gap-2 font-medium text-text-secondary cursor-pointer">': '<label htmlFor="remember-me-checkbox" className="flex items-center gap-2 font-medium text-text-secondary cursor-pointer">',
}

for k, v in replacements.items():
    content = content.replace(k, v)
    
# Checkbox logic
content = content.replace('<label htmlFor="remember-me-checkbox" className="flex items-start gap-2.5 text-[11px] font-medium text-text-secondary cursor-pointer">', '<label className="flex items-start gap-2.5 text-[11px] font-medium text-text-secondary cursor-pointer">') # Revert just in case

# Fix the two checkboxes in register
lines = content.split('\n')
for i, line in enumerate(lines):
    if '<label className="flex items-start gap-2.5 text-[11px] font-medium text-text-secondary cursor-pointer">' in line:
        if 'register-accept-terms' in lines[i+2] or 'register-accept-terms' in lines[i+1]:
            lines[i] = line.replace('<label className=', '<label htmlFor="register-accept-terms" className=')
        elif 'register-marketing-consent' in lines[i+2] or 'register-marketing-consent' in lines[i+1]:
            lines[i] = line.replace('<label className=', '<label htmlFor="register-marketing-consent" className=')

content = '\n'.join(lines)

with open("src/components/AuthModal.tsx", "w") as f:
    f.write(content)
