# PURGE

This file records interface material removed from the active Consumer repository during the interaction and relevance audit. Purged source remains recoverable from Git history; it is intentionally excluded from the live site.

## Broken Messages navigation

**Removed from:** `script.js`

**Reason:** The link targeted `#messages`, but the repository contains no Messages section, route, handler, or service.

```html
<a class="nav" href="#messages"><span class="nav-mark" aria-hidden="true"></span>Messages</a>
```

## Legacy Jobs shell

**Removed files:** `jobs/index.html`, `jobs/script.js`, `jobs/styles.css`

**Reason:** This duplicate page presented seven cards whose links only targeted each card's own ID. The cards did not open a job list, saved jobs, tracker, interviews, alerts, calendar, or tools. The implemented Jobs, Saved Jobs, Jobs Tracker, and Interviews workflows remain in `task/`.

**Purged cards:**

```text
Discover Jobs  -> #discover
Saved Jobs     -> #saved
Jobs Tracker   -> #tracker
Interviews     -> #interviews
Job Alerts     -> #alerts
Career Calendar -> #calendar
Career Tools   -> #tools
```

The associated script only marked the selected self-link and scrolled it into view; it did not implement any named workflow.

## Unavailable account-service controls

**Removed from:** `settings/index.html`, `settings/script.js`

**Reason:** These controls did not perform password reset, MFA enrollment, recovery verification, or username changes. Password Reset and MFA only displayed an unavailable-service toast; the remaining fields only stored unverified values locally while describing account-level behavior.

```text
Backend pending
Password Reset / Request reset
MFA / Set up MFA
Phone Number for account recovery
Alternate Email Recovery
User Name / Change
```

Recruiter visibility and contact-sharing controls remain because they have working input, change, validation, persistence, and status-update behavior.

## Implementation-status notice

**Removed from:** `profile/index.html`

**Reason:** Internal prototype/backend status is not professional-profile content and has no user action.

```text
Saved securely in this browser for the current prototype. Cloud synchronization will follow authenticated backend integration.
```

## Repaired rather than purged

Dashboard Saved Jobs and Jobs Tracker entries previously sent every selection to the generic `task/#jobs` section and discarded the selected job ID. They now link to `task/?job=<job-id>#jobs`; `task/script.js` validates the ID, opens Jobs, and displays the selected job dialog.
