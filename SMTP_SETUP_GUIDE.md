# Email Configuration Guide - Student Hub MVP

## Problem Diagnosis

The email delivery issues during signup are caused by:

1. **✅ FIXED**: Environment variable mismatch between `.env` and `client.ts`
2. **⚠️ CRITICAL**: Default Supabase SMTP restrictions
3. **⚠️ CRITICAL**: Missing custom SMTP configuration

## Why Emails Aren't Being Sent

### Default Supabase SMTP Limitations:
- **Team-only delivery**: Only sends emails to project team members
- **Severe rate limits**: 2 messages per hour maximum
- **No production guarantee**: Best-effort service only
- **Authorization required**: Gmail addresses need to be pre-authorized

## Solution: Configure Custom SMTP

### Option 1: Gmail SMTP Setup (Recommended for testing)

#### Step 1: Enable Gmail App Passwords
1. Go to Google Account settings
2. Security → 2-Step Verification (must be enabled)
3. App Passwords → Generate password for "Mail"
4. Save the generated 16-character password

#### Step 2: Configure Supabase SMTP
1. Go to your Supabase Dashboard
2. Navigate to `Authentication > Settings`
3. Scroll to "SMTP Settings"
4. Enable "Enable custom SMTP"
5. Configure:
   ```
   SMTP Host: smtp.gmail.com
   SMTP Port: 587
   SMTP User: your-gmail@gmail.com
   SMTP Password: [16-character app password]
   Sender Name: Student Hub
   Sender Email: your-gmail@gmail.com
   ```

### Option 2: Professional Email Services (Production Ready)

#### Resend (Recommended)
```bash
# Free tier: 3,000 emails/month
# Sign up at: https://resend.com
Host: smtp.resend.com
Port: 587
User: resend
Password: [API Key from Resend dashboard]
```

#### SendGrid
```bash
# Free tier: 100 emails/day
# Sign up at: https://sendgrid.com
Host: smtp.sendgrid.net
Port: 587
User: apikey
Password: [API Key from SendGrid]
```

#### AWS SES
```bash
# Very cost-effective for high volume
Host: email-smtp.[region].amazonaws.com
Port: 587
User: [SMTP Username from AWS]
Password: [SMTP Password from AWS]
```

## Environment Variables Setup

Add these to your `.env` file (optional, for additional configuration):

```env
# Current Supabase Configuration
VITE_SUPABASE_PROJECT_ID="qfnakcrjzzchrjifdnaz"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmbmFrY3JqenpjaHJqaWZkbmF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4OTg0NTcsImV4cCI6MjA3NDQ3NDQ1N30.FXWq0WGGlbn3_Rx4qkwTWiPjqpS8fvQ_OzKFiIltzgs"
VITE_SUPABASE_URL="https://qfnakcrjzzchrjifdnaz.supabase.co"

# Email Configuration (these are set in Supabase dashboard, not in code)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASS=your-app-password
```

## Quick Setup Steps

### Immediate Fix (5 minutes):
1. ✅ **Environment mismatch fixed** - Updated client.ts to use correct project
2. Go to Supabase Dashboard → Authentication → Settings
3. Add your Gmail address to "Additional email addresses" under team settings
4. Test signup with your Gmail address

### Production Setup (15 minutes):
1. Choose an email service (Resend recommended)
2. Create account and get SMTP credentials
3. Configure in Supabase Dashboard
4. Update rate limits to reasonable values (100-1000/hour)
5. Test with any Gmail address

## Testing the Fix

### Test Cases:
1. **Team member email**: Should work immediately after env fix
2. **Random Gmail**: Will work after SMTP setup
3. **High volume**: Will work after rate limit adjustment

### Debug Steps:
1. Check Supabase Auth logs for errors
2. Verify SMTP credentials in dashboard
3. Test with different email providers
4. Monitor rate limit usage

## Security Best Practices

### For Gmail SMTP:
- Use App Passwords, never your main password
- Enable 2FA on Gmail account
- Consider dedicated email account for app

### For Production:
- Use professional email service (Resend/SendGrid)
- Set up SPF, DKIM, DMARC records
- Use separate domain for auth emails
- Monitor sending reputation

## Email Template Customization

Navigate to `Authentication > Email Templates` in Supabase to customize:
- Confirmation email content
- Password reset emails
- Magic link emails
- Invite emails

## Troubleshooting

### Common Issues:
1. **"Email address not authorized"**: Add to team or setup custom SMTP
2. **Rate limit exceeded**: Increase limits or use custom SMTP
3. **Emails in spam**: Setup SPF/DKIM records
4. **No emails received**: Check spam folder and SMTP logs

### Debug Commands:
```bash
# Check current environment
echo $VITE_SUPABASE_URL

# Test signup programmatically
curl -X POST 'https://qfnakcrjzzchrjifdnaz.supabase.co/auth/v1/signup' \
  -H 'Content-Type: application/json' \
  -H 'apikey: [your-anon-key]' \
  -d '{"email":"test@gmail.com","password":"testpass123"}'
```

## Next Steps

1. **Immediate**: Follow "Quick Setup Steps" above
2. **Short-term**: Implement professional SMTP service
3. **Long-term**: Set up email reputation monitoring
4. **Advanced**: Consider custom email templates and branding

## Support Resources
- [Supabase SMTP Documentation](https://supabase.com/docs/guides/auth/auth-smtp)
- [Gmail App Passwords Setup](https://support.google.com/mail/answer/185833)
- [Resend Documentation](https://resend.com/docs)