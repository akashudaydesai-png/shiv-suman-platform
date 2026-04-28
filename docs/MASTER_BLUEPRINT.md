# Master Blueprint

## Product Goal

Build a premium connected platform for Shiv Suman Motor Training School: public website, role-based ERP, RTO CRM, training automation, payment automation, and fleet/camera evidence.

## Roles

- Super Admin
- Admin
- Branch Admin
- Receptionist
- Supervisor
- Trainer
- Student
- Accountant

## Core Permission Rules

- Admin can add, update, edit, delete, pause, and manage every feature.
- Reception sees restricted branch student data only and cannot directly delete.
- Supervisor sees restricted branch student data and trainer leave status only.
- Trainer leave approval belongs only to Admin.
- Admin can open full student and staff profiles.
- Only Admin can view sensitive fleet and camera evidence.
- All important status changes create audit logs.

## Major Modules

- Public SEO website with blog, courses, trainers, branches, enquiry, booking, RTO lead forms, and login.
- Dashboard for admin, reception, supervisor, trainer, student, and optional accountant.
- Dynamic enquiry, advance booking, admission, document workflow, and plan/installment engine.
- Razorpay payment links, webhooks, receipts, and installment triggers.
- RTO module for internal students and external customers.
- DL practice and DL test event workflow managed by supervisor.
- Leave automation with student leave no-approval and trainer leave admin approval.
- Session start/accept/end with car selection, 30-minute timer, fleet data, and camera evidence references.
- Dynamic notification templates and workflow triggers.

## Initial Delivery Strategy

1. Build foundation, auth, roles, branches, dashboards, and audit logs.
2. Add public website and CMS/blog.
3. Add enquiry, advance booking, admission, documents, plans, payments, receipts.
4. Add training operations: slots, leave, sessions, feedback, progress.
5. Add RTO and supervisor DL workflows.
6. Add notification automation.
7. Integrate fleet/camera vendor APIs.
8. Add reports, exports, security tests, monitoring, and backups.
