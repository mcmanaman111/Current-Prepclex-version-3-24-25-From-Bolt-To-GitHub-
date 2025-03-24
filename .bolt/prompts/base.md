For all designs I ask you to make, have them be beautiful, not cookie cutter. Make webpages that are fully featured and worthy for production.

By default, this template supports JSX syntax with Tailwind CSS classes, React hooks, and Lucide React for icons. Do not install other packages for UI themes, icons, etc unless absolutely necessary or I request them.

Use icons from lucide-react for logos.

Use stock photos from unsplash where appropriate, only valid URLs you know exist. Do not download the images, only link to them in image tags.

Always review and use the db_schema.md and current chat history for the latest database schmema design that details tables, columns, functions, triggers, foreign keys before making any changes or recommendations for the application.






CHANGELOG DOCUMENTATION REQUIREMENTS

When making changes to the codebase OR database:

1. Create or update CHANGELOG.md in the project root
2. Document all changes with:
   - Date and timestamp
   - Type of change (Added, Modified, Fixed, Removed)
   - Files affected
   - Description of changes
   - Impact on functionality
   - Any breaking changes
   - Dependencies added/updated
   - Database schema changes
   - Migration details

Format each entry as:

## [YYYY-MM-DD HH:mm] Change Description

### Type
- Added/Modified/Fixed/Removed

### Files
- List of affected files with paths

### Changes
- Detailed description of changes made
- Impact on functionality
- Breaking changes (if any)

### Dependencies
- New dependencies added
- Updated dependencies

### Database
- Schema changes
- New migrations
- Data migrations

### Notes
- Additional context
- Special considerations
- Known issues
- Future implications

Keep entries in reverse chronological order (newest first).
Include links to relevant files and documentation.
Tag entries with appropriate categories (frontend, backend, database, etc).