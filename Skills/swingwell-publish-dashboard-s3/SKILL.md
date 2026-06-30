---
name: swingwell-publish-dashboard-s3
description: Publish the SWINGWELL static dashboard, diary entries, and media to a public AWS S3 static website using AWS CLI. Use when the user asks to push, deploy, publish, upload, sync, or host the SWINGWELL dashboard on S3, especially after dashboard updates.
---

# SWINGWELL Publish Dashboard to S3

## Workflow

1. Ensure the dashboard is current. If not, use `swingwell-update-dashboard` first.
2. Ask for or read the target bucket name. Do not guess it.
3. Confirm AWS CLI is available and authenticated with `aws sts get-caller-identity` when network/tool permissions allow it.
4. Publish with:
   `bash Skills/swingwell-publish-dashboard-s3/scripts/publish_dashboard_s3.sh <bucket-name>`
5. If this is the first publish and the user wants S3 website hosting configured, add `--configure-website`.
6. After publish, give the S3 website URL pattern:
   `http://<bucket-name>.s3-website-<region>.amazonaws.com`
   or use the exact endpoint reported by AWS if available.

## What gets published

- `Dashboard/` contents sync to the bucket root.
- `Diary Entries/` sync to `s3://<bucket>/Diary Entries/` so existing dashboard links work.
- `Media/` sync to `s3://<bucket>/Media/` so diary image links work.

## Public hosting assumptions

The SWINGWELL owner has said security is not required for this dashboard. Public S3 website hosting is acceptable for this workflow. Still, do not publish to S3 unless the user asks for the publish action or confirms the bucket.

## Safety notes

- The publish script does not use `--delete` by default, to avoid removing diary/media files accidentally.
- Use `--delete-dashboard-root` only when the user explicitly wants old root dashboard files removed.
- Never run destructive bucket cleanup commands unless the user explicitly requests them.
