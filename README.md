# Arrad Hub

Arrad Hub is an operational control centre for Arrad Foot Balconies Ltd. The first testing release connects the core journey:

**Enquiry → Quote → Accepted job → Drawings/manufacturing → Installation → Invoice**

It also includes customer, stock, supplier and dashboard views.

## Run locally

```bash
npm ci
npm run dev -- --hostname 127.0.0.1
```

Open `http://127.0.0.1:3000`.

## First testing script

1. Add an enquiry with a customer, site and description.
2. Select **Create quote** on the enquiry.
3. Add or edit quote line items and save the quote.
4. Review the customer quote and use **Print / save PDF**.
5. Select **Accept & create job** and confirm the job appears under Live Jobs.
6. Move the job through Survey, Manufacturing, Ready, Installation and Complete.
7. Set the drawing status and a target date.
8. Raise a draft invoice from the job, then mark it Sent and Paid.
9. Add a stock item at its reorder level and confirm it appears under Needs attention on the dashboard.
10. Add a supplier and confirm its email and phone links work.
11. Check the Customers page consolidates the enquiry, quote and job under one customer.
12. Check the layout on both a phone-sized screen and a desktop screen.

## Data during first testing

This release stores data in the browser on the device being used. It is suitable for workflow and usability testing, but it is not yet a shared multi-user production system. Clearing browser storage will remove test records.

Before live business use, add authentication, a shared database, backups and role-based access. Formal company details, VAT rules and payment terms should also be confirmed before customer quotes are issued from the system.

## Validation

```bash
npm run lint
npx tsc --noEmit
npm run build
```
