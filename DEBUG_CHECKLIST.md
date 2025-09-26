# Debug Guide for Student Hub Functions

## Current Status: Functions not working after white screen fix

### What's Working:
- ✅ Application loads (white screen fixed)
- ✅ Environment variables corrected (import.meta.env)
- ✅ Supabase client connection established

### What's Not Working:
- ❌ Document upload functionality
- ❌ Other features (to be diagnosed)

### Debug Steps:

1. **Check Browser Console**
   - Open Developer Tools (F12)
   - Go to Console tab
   - Look for errors or debug messages

2. **Check Network Tab**
   - Open Network tab in Developer Tools
   - Try uploading a document
   - Look for failed requests (red entries)

3. **Common Issues to Check:**

   **Profile Creation:**
   - User might not have a profile record in database
   - Check: `debugSupabase()` in console

   **Database Permissions:**
   - Row Level Security might be blocking operations
   - Check if user can read/write to tables

   **Storage Permissions:**
   - Storage bucket might not be accessible
   - Check if 'documents' bucket exists

   **Authentication:**
   - User session might be invalid
   - Check if user is properly authenticated

### Manual Tests in Console:

```javascript
// Test 1: Check current user
debugSupabase()

// Test 2: Check if profile exists
const { data: profile } = await supabase.from('profiles').select('*').eq('user_id', (await supabase.auth.getUser()).data.user.id).single()
console.log('Profile:', profile)

// Test 3: Test storage access
const { data: buckets } = await supabase.storage.listBuckets()
console.log('Storage buckets:', buckets)

// Test 4: Test documents table access
const { data: docs } = await supabase.from('documents').select('*').limit(1)
console.log('Documents test:', docs)
```

### Expected Console Messages:
When working correctly, you should see:
- `🔍 Debug Info:` messages
- `🔍 Fetching profile for user:` messages
- `📊 Profile fetch result:` messages
- `🔍 Fetching documents for profile:` messages

### If Profile is Missing:
The user might need to be created in the profiles table. This should happen automatically on signup, but might have failed.

### Next Steps:
1. Open the application in browser
2. Check console for debug messages
3. Try document upload and note any errors
4. Run manual tests above
5. Report specific error messages