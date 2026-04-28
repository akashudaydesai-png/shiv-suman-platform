# API Contracts

All backend routes use `/api` prefix.

## Public Website

- `GET /api/blueprint`
- `GET /api/public/pages/:slug`
- `GET /api/public/blog`
- `GET /api/public/blog/:slug`
- `POST /api/public/enquiries`
- `POST /api/public/advance-bookings`
- `POST /api/public/rto-enquiries`

## Dashboards

- `GET /api/dashboards/:role`
- `GET /api/admin/dashboard?branchId=all`
- `GET /api/reception/dashboard?branchId=:id`
- `GET /api/supervisor/dashboard?branchId=:id`

## Core Operations

- `POST /api/auth/login`
- `GET /api/users`
- `POST /api/users`
- `PATCH /api/users/:id`
- `POST /api/users/:id/pause`
- `POST /api/users/:id/reactivate`
- `GET /api/students/:id/profile`
- `GET /api/staff/:id/profile`
- `POST /api/delete-requests`
- `POST /api/delete-requests/:id/approve`
- `POST /api/delete-requests/:id/reject`

## Enquiry, Booking, Admission

- `GET /api/enquiries`
- `POST /api/enquiries`
- `POST /api/enquiries/:id/transfer-to-admission`
- `GET /api/advance-bookings`
- `POST /api/advance-bookings`
- `POST /api/admissions`
- `POST /api/admissions/:id/documents`

## Plans, Payments, RTO

- `GET /api/plans`
- `POST /api/plans`
- `POST /api/payments/razorpay-link`
- `POST /api/payments/webhooks/razorpay`
- `GET /api/receipts/:id`
- `GET /api/rto/services`
- `POST /api/rto/services`
- `GET /api/rto/cases`
- `POST /api/rto/cases`
- `POST /api/rto/cases/:id/status`

## Training, Leave, Fleet

- `GET /api/slots/availability`
- `POST /api/leaves/student`
- `POST /api/leaves/trainer`
- `POST /api/leaves/trainer/:id/approve`
- `POST /api/leaves/trainer/:id/reject`
- `POST /api/sessions/request`
- `POST /api/sessions/:id/accept`
- `POST /api/sessions/:id/complete`
- `POST /api/fleet/webhooks/trip`
- `POST /api/camera/webhooks/recording`

## Notifications

- `GET /api/notification-templates`
- `POST /api/notification-templates`
- `GET /api/notification-workflows`
- `POST /api/notification-workflows`
- `GET /api/notification-logs`
