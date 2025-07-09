# Production Deployment Fix

## Problem
The Discord bot was failing in Railway production with the error:
```
Error: Cannot find module '@/database/connection'
```

This occurred because TypeScript path mapping (aliases like `@/`) work during development but Node.js doesn't understand them in production.

## Solution
Implemented `module-alias` package to resolve path aliases at runtime.

### Changes Made

1. **Added module-alias dependency**
   - Added `module-alias: ^2.2.3` to dependencies
   - Added `@types/module-alias: ^2.0.4` to devDependencies

2. **Configured package.json**
   - Added `_moduleAliases` configuration mapping `@` to `dist`
   - Updated start scripts to use `-r module-alias/register`

3. **Updated TypeScript entry point**
   - Added `import 'module-alias/register'` as the first import in `src/index.ts`

4. **Fixed command/event loaders**
   - Updated filters to exclude `.d.ts` files that were causing load errors
   - Now properly filters: `(file.endsWith('.ts') || file.endsWith('.js')) && !file.endsWith('.d.ts')`

5. **Added Dockerfile**
   - Created optimized Dockerfile for Railway deployment
   - Includes proper build process and production optimization

## Verification
- ✅ Module aliases now work in production
- ✅ Database connection successful
- ✅ Command and event loaders fixed
- ✅ Ready for Railway deployment

## Scripts
- `npm run build` - Compiles TypeScript
- `npm start` - Runs in production with module-alias support
- `npm run start:prod` - Explicit production mode
- `npm run dev` - Development mode (unchanged)

The bot should now deploy successfully on Railway without the module resolution errors.
