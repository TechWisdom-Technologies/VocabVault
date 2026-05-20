# Production Database Connection Issues - Fix Guide

## Problem
App crashes after login in production with error:
```
EMAXCONNSESSION: max clients reached in session mode - max clients are limited to pool_size: 15
```

## Root Cause
- You're using **Supabase PgBouncer in session mode** with pool_size of 15
- After login, the dashboard makes multiple concurrent database queries
- Each concurrent query needs a connection from the pool
- When queries exceed 15 concurrent connections, remaining queries fail with EMAXCONNSESSION

## Solution

### Step 1: Update Environment Variables (CRITICAL)

**Add `connection_limit` parameter to your DATABASE_URL**

Current (broken):
```env
DATABASE_URL="postgresql://postgres.ionoednowlfejuanjpqu:vocabvault1@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true&prepared_statements=false"
```

**Fixed:**
```env
DATABASE_URL="postgresql://postgres.ionoednowlfejuanjpqu:vocabvault1@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true&prepared_statements=false&connection_limit=30"
```

### Where to Update

1. **Local Development** (`.env.local`):
   - Already has the connection strings
   - Add `&connection_limit=30` to DATABASE_URL

2. **Vercel Production**:
   - Go to: `Settings > Environment Variables`
   - Update `DATABASE_URL` variable
   - Add `&connection_limit=30` to the value
   - **Redeploy** after changing

### Step 2: Code Improvements (Already Applied)

Updated `/src/lib/prisma.ts`:
- ✅ Better singleton pattern
- ✅ Graceful shutdown on SIGTERM/SIGINT
- ✅ Query timeout protection (10s in production)
- ✅ Proper error formatting

## Understanding PgBouncer Connection Limit

**PgBouncer Modes:**

| Mode | Behavior | Pool Size |
|------|----------|-----------|
| **transaction** | Connection released after each transaction (good) | Can be high |
| **session** | Connection held for entire session (current) | Limited to ~15 |

Supabase recommends:
- **Session mode**: For < 10 concurrent users
- **Transaction mode**: For higher load (requires different connection string)

## Quick Diagnostics

### Check if issue persists:

1. **Deploy with updated connection_limit**
2. **Monitor logs for errors:**
   ```bash
   # In Vercel dashboard: Settings > Functions > Logs
   # Look for: EMAXCONNSESSION or connection pool errors
   ```

3. **Test login flow:**
   - Login user
   - Try navigating dashboard
   - Check if pages load without crashing

### Debug Commands

If issues persist, check connection pool status:

```sql
-- Run in Supabase SQL editor
SELECT 
  datname,
  usename,
  application_name,
  state,
  count(*)
FROM pg_stat_activity
GROUP BY datname, usename, application_name, state;
```

## Prevention Checklist

- ✅ `connection_limit=30` parameter added
- ✅ Prisma configuration optimized
- ✅ Shutdown handlers configured
- ✅ Query timeouts set (10s)
- ✅ Connection reuse enabled (singleton pattern)

## Alternative Solutions (if still having issues)

### Option A: Reduce Dashboard Query Load
- Lazy-load components
- Cache frequently accessed data
- Batch queries where possible

### Option B: Switch to Transaction Mode (Recommended long-term)
- Contact Supabase support for transaction-mode connection string
- Allows higher pool size
- Better for scalability

### Option C: Implement Query Batching
- Use DataLoader library
- Batch multiple queries into fewer database round-trips

## Monitoring After Fix

**Monitor these metrics:**
1. Active connections in Supabase dashboard
2. Error logs in Vercel
3. User session duration
4. Dashboard page load times

## Files Modified

- ✅ `/src/lib/prisma.ts` - Enhanced connection pooling configuration
- ✅ Environment variables - Add connection_limit parameter

---

**Note:** Restart your dev server after updating `.env.local`:
```bash
npm run dev  # Ctrl+C to stop, then restart
```

After deploying to Vercel, **monitor for 30 minutes** to confirm stability.
