# Changelog

## [2024-03-24 06:15] Question Format and Upload Enhancements

### Type
- Added
- Enhanced
- Fixed

### Files
- /src/components/admin/QuestionUpload.tsx
- /supabase/migrations/20250324051915_violet_shadow.sql
- /supabase/migrations/20250324052028_turquoise_castle.sql
- /supabase/migrations/20250324052553_small_moon.sql
- /supabase/migrations/20250324052857_ancient_cave.sql
- /supabase/migrations/20250324053900_bronze_field.sql
- /supabase/migrations/20250324070616_quick_star.sql
- /src/utils/dbCleanup.ts

### Changes
- Added tabbed interface for question format help
- Added comprehensive question format template
- Added real-world question examples
- Added valid question formats list
- Enhanced question parsing and validation
- Added duplicate question detection
- Added answer text validation
- Added database cleanup utilities
- Fixed RLS policies for profiles and questions
- Improved topic/subtopic management functions

### Dependencies
- No new dependencies added

### Database
- Added normalized_text column to questions table
- Added question text normalization function
- Added duplicate detection trigger
- Added answer text validation constraints
- Fixed RLS policies for better security
- Improved topic/subtopic management functions
- Added database cleanup capabilities

### Notes
- Question format now includes clear sections for correct/incorrect options
- Added support for multiple question upload with ---
- Added comprehensive error reporting
- Improved validation and error messages
- Added dark mode support for all components

## [2024-03-24 05:30] Fix RLS Policies and Question Upload

### Type
- Fixed

### Files
- /supabase/migrations/20250324051915_violet_shadow.sql
- /supabase/migrations/20250324052028_turquoise_castle.sql
- /src/components/admin/QuestionUpload.tsx

### Changes
- Fixed infinite recursion in profile RLS policies
- Improved topic/subtopic ID lookup and creation
- Enhanced question upload component with better error handling
- Added batch question upload support
- Added detailed error reporting for failed uploads

### Dependencies
- No new dependencies added

### Database
- Modified RLS policies for profiles table
- Added new functions for topic/subtopic management
- Improved error handling in database functions

### Notes
- Fixed infinite recursion issue in profile policies
- Added support for uploading multiple questions at once
- Improved error messages and validation
- Added comprehensive question format guide

## [2024-03-23 10:45] Schema Documentation Updates

### Type
- Added

### Files
- /scripts/generateSchema.js
- /docs/db_schema.md
- /package.json

### Changes
- Added new script to generate database schema documentation
- Created schema documentation generator
- Added generate-schema npm script command

### Dependencies
- No new dependencies added

### Database
- No schema changes
- Added documentation generation capability

### Notes
- Schema documentation is now automatically generated from schema_export.json
- Documentation includes tables, columns, functions, triggers, and security features
- Old database_schema.md has been replaced with auto-generated version

## [2024-03-22 15:30] Initial Database Schema

### Type
- Added

### Files
- /supabase/migrations/20250322000000_initial_schema.sql
- /docs/database_schema.md

### Changes
- Created initial database schema
- Added core tables and relationships
- Added basic RLS policies
- Added documentation

### Dependencies
- Added @supabase/supabase-js

### Database
- Created users table
- Created profiles table
- Created roles table
- Created basic RLS policies
- Added initial indexes

### Notes
- Basic schema structure established
- Core user management tables created
- Initial security policies in place

## [2024-03-21 14:15] Project Setup

### Type
- Added

### Files
- /package.json
- /vite.config.ts
- /tsconfig.json
- /tailwind.config.js
- /index.html

### Changes
- Initial project setup
- Added core dependencies
- Configured build tools
- Set up TypeScript
- Added Tailwind CSS

### Dependencies
- Added React 18
- Added Vite
- Added TypeScript
- Added Tailwind CSS
- Added other core dependencies

### Notes
- Basic project structure established
- Development environment configured
- Core build tools set up