claude code task --task "Implement central API endpoint rate limiting with both user-based and IP-based limits. Requirements:
- Create configurable rate limiter that can be updated via config deployment
- Support both user ID and IP address based limiting
- Make limits configurable per endpoint
- Ensure rate limit changes take effect on deployment without restart
Files to modify: likely middleware/, config/, and main.go"

claude code task --task "Create backend route for /api/v1/admin/curation/analyze
Requirements:
- Send full user profile of main user to AI
- Send complete partner preferences data when matching with potential dates
- Update proto definitions in root/proto/
- Implement service in admin service layer
- Add repository methods in admin repo"

claude code task --task "Add tabbed interface to http://localhost:3000/admin/curate page:
- Create two tabs: 'AI Dates Curation' (existing content) and 'Curated Dates' (new, empty)
- Move existing curation content under 'AI Dates Curation' tab
- Prepare empty state for 'Curated Dates' tab
- Maintain existing styling and responsiveness"

claude code task --task "Implement date suggestion actions in AI Dates Curation tab:
- Add proto changes for accept/reject/review-later actions
- Create HTTP endpoint in main.go for date suggestion actions
- Implement admin service methods for these actions
- Add admin repo methods to persist action states
- Apply rate limiting using existing logic"

claude code task --task "Implement Curated Dates backend functionality:
- Proto changes to support curated dates with status (past/ongoing/future)
- HTTP endpoints in main.go for fetching curated dates by status
- Admin service and repo methods for CRUD operations
- User-level endpoints for accept/reject with reason (multiple choice options)
- Add 'genie' (admin) assignment to each curated date
- Implement Google Meet link generation (1 hour default duration)
- Generate and send Google Calendar invites to both users
Files: proto/, main.go, admin service, admin repo, user service"

claude code task --task "Create 'Love Zone' tab in UI header with comprehensive date management:

Backend:
- Proto changes for user date views and statistics
- HTTP endpoints in main.go for date suggestions, upcoming, past, rejected dates
- Implement RPC methods for date statistics (completed, suggested, accepted, rejected counts)
- Service and repo layer implementation

Frontend:
- Add 'Love Zone' to header navigation
- Create responsive UI with sections: date suggestions, upcoming dates, past dates, rejected dates
- Display statistics dashboard (dates completed, suggested, accepted, rejected)
- Follow existing theme and ensure excellent UX
- Make fully responsive across devices"

claude code task --task "Update user landing page after login:
- Create carousel showing ongoing and upcoming dates
- Add availability check - if not submitted, show prompt with link to availability page
- Implement backend RPC for fetching user's ongoing/upcoming dates
- Implement backend RPC for checking availability submission status
- Design responsive carousel component matching app theme
- Add smooth navigation to availability page"