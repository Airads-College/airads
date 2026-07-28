# AIRADS ERP ↔ Django LMS integration context

Generated from a read-only inspection on 27 July 2026. No student-level records, credentials, or payment values are included.

## Decision

Ultimate ERP should remain the authoritative source for official student identity, registration, invoices, receipts, sponsorship, and fee-clearance decisions.

The Django LMS should keep its own application database for authentication, sessions, course content, submissions, learning activity, and local workflow state.

Do not run Django migrations inside the vendor `AIRADS` database. “One main database” should mean one authoritative record for each business fact—not one physical set of tables used directly by every application.

The permanent cross-system student identifier must be ERP `dbo.Register.AdmnNo`. In Django, add a unique indexed field such as:

```python
erp_student_id = models.CharField(max_length=50, unique=True, null=True, blank=True)
```

Email must not be used as the reconciliation key.

## Verified live ERP structure

- Database: `AIRADS`
- Platform: Microsoft SQL Server
- User tables: 638
- Columns: 9,204
- Declared primary keys: 615
- Declared foreign keys: 3
- Allocated database size at inspection: about 211.2 MB
- Student master: `dbo.Register`
- Student master key: `AdmnNo`
- Student master rows: 7,764

The schema is mostly related through naming conventions and ERP application logic rather than database foreign-key constraints. Every integration join must therefore be explicitly documented and tested.

## Core table map

| Table | Approx. rows | Role | Key / important fields |
|---|---:|---|---|
| `dbo.Register` | 7,764 | Student master | PK `AdmnNo`; `names`, `email`, `telno`, `class`, `Prog`, `Campus`, `StudyLevel`, `StudStatus`, `RegistrationStatus`, `Completed`, sync flags |
| `dbo.Applicant` | 10 | Admissions staging | PK `Ref`; `AdmnNo`, `Programme`, application/payment status, `ProcessedToRegister`, `UserId` |
| `dbo.Invoice` | 9,924 | Official student charges | PK `ID`; `AdmnNo`, `Class`, `term`, `type`, fee buckets, `InvType`, `RefNo`, dates, sync flags |
| `dbo.ReceiptBook` | 14,764 | Official receipts | PK `Receipt Number`; `AdmnNo`, `Amount`, payment mode/reference, dates, balances, banking state, sync flags |
| `dbo.ReceiptBookDetail` | 14,772 | Receipt allocations | PK `ID`; `Receipt Number`, `Account`, `Invoice Number`, `Amount` |
| `dbo.Fees` | 18,729 | Fee schedules/templates | PK `ID`; `Class`, `type`, `term`, fee buckets, approval/sync fields |
| `dbo.Reporting` | 9,102 | Student term reporting/registration | No declared PK; `AdmnNo`, `Term`, `Class`, `Year`, `Semester`, status, sync flags |
| `dbo.StudentSubject` | 235 | Unit-registration header | PK `ID`; `EmpNo`, `RegNo`, `Term`, `Year`, `Semester`, `Status`, sync flags |
| `dbo.StudentSubjectDetails` | 936 | Registered-unit details | PK `ID`; `Ref`, `Subject`, `Class`, `StudyMode`, `Retake`, assessment flags, `Status` |
| `dbo.Class` | 2,764 | Class/cohort master | PK `ID`; `names`, `programme`, `Campus`, `Intake`, `Year`, `Semester`, `StudyLevel` |
| `dbo.ClassSchedule` | 16,428 | Class-term schedule | PK `ID`; `Class`, `Term`, `Year`, `Semester`, `Closed` |
| `dbo.Programme` | 283 | Programme catalog | PK `ID`; `names`, `Code`, `department`, curriculum/level settings |
| `dbo.Subjects` | 1,096 | Unit catalog | No declared PK; `Code`, `Names`, `Department`, `CreditUnits`, `Prog` |
| `dbo.CurriculumDetails` | 384 | Curriculum-unit mapping | PK `ID`; `Ref`, `Subject`, `Year`, `Semester`, `SpecializationID` |
| `dbo.MpesaService` | 0 | M-Pesa ingestion/staging | PK `ID`; transaction reference, account, amount, status, receipt/admission/invoice fields |

## Verified relationships

| Relationship | Result |
|---|---|
| `Invoice.AdmnNo → Register.AdmnNo` | 9,924/9,924 matched; no FK declared |
| `ReceiptBook.AdmnNo → Register.AdmnNo` | All 14,071 nonblank student receipt keys matched; 693 rows had blank student keys, likely non-student receipts |
| `ReceiptBookDetail.[Receipt Number] → ReceiptBook.[Receipt Number]` | 14,772/14,772 matched; no FK declared |
| `RegOldClass.AdmnNo → Register.AdmnNo` | 2,209/2,211 matched; two historical exceptions |
| `RegLog.AdmnNo → Register.AdmnNo` | 31,852/32,046 nonblank keys matched; 194 unmatched and 91 blank |
| `PortalCredentials.AdmnNo → Register.AdmnNo` | Declared trusted FK, but `PortalCredentials` currently has zero rows |
| `ReceiptBookDetail.[Invoice Number] → Invoice.ID` | Rejected: 0/14,772 matched; the field is textual and needs the vendor's actual allocation rule |

## Identity and data-quality constraints

- `Register.AdmnNo` is complete: zero missing values.
- `Register.email` is missing for 7,406 of 7,764 students.
- Only 355 distinct nonblank emails exist.
- Three normalized email values are duplicated across six student rows.
- 7,752 student rows are not marked closed, so `closed = 0` alone is not a sufficient active-student rule.
- At inspection, 5,677 students were marked `OutOfSync` and 5,676 were marked `VOutOfSync`.

## Existing ERP synchronization behavior

Important tables contain:

- `OutOfSync`
- `VOutOfSync`
- `OutOfSyncDate`
- `VOutOfSyncDate`

Update triggers on `Register`, `Invoice`, `ReceiptBook`, `StudentSubject`, and `StudentSubjectDetails` set both sync flags when ordinary fields change.

Delete triggers on core records write tombstones to `dbo.ErpPortal_deleteInfo`.

This proves the ERP has an existing synchronization convention, but it is not yet a documented LMS API. The roles of `OutOfSync` and `VOutOfSync`, and the large current flagged population, must be explained before the LMS reuses this mechanism.

## Downloaded Django LMS findings

- Configured database backends: SQLite, MySQL, PostgreSQL.
- No Microsoft SQL Server backend is configured.
- No Ultimate ERP, `pyodbc`, MSSQL, `AdmnNo`, or ERP-student connector was found.
- The custom Django user model has no ERP identifier.
- Admission onboarding currently matches or creates users by email.
- The LMS has local models for admissions, enrollments, orders, payment attempts, and webhook events.
- Successful LMS payment currently marks the local order paid and grants local enrollment.
- Host-aware middleware already recognizes `virtual.airads.ac.ke`.

## Required Django changes

1. Add `erp_student_id` to the user or a dedicated student-profile model.
2. Make the ERP ID unique and indexed.
3. Resolve identity from the ERP ID before email during onboarding.
4. Add an ERP integration-state model containing:
   - ERP ID
   - last observed ERP version/timestamp
   - financial-clearance state
   - clearance reason
   - last successful sync time
   - last error and retry count
5. Add durable integration events/outbox records with unique idempotency keys.
6. Add payment workflow states including:
   - `received`
   - `received_pending_erp`
   - `erp_posted`
   - `erp_rejected`
   - `reconciliation_required`
7. Grant official LMS access only after an ERP-confirmed clearance result.
8. Create a reconciliation command/report comparing ERP clearance with LMS enrollment access.

## Recommended ownership

- ERP owns: student number, official biodata/status, programme/class/unit registration, invoices, receipts, sponsorship, fee clearance.
- LMS owns: login/session data, learning content, submissions, learning progress, LMS audit events.
- LMS temporarily owns a payment-provider event until the ERP confirms posting and returns an official reference.

## Recommended data flow

### ERP → LMS

1. Integration worker reads an approved ERP API or read-only integration view.
2. It identifies the student using `AdmnNo`.
3. It upserts a minimal LMS student read model.
4. It imports the ERP's official eligibility/clearance decision.
5. LMS access is granted or suspended idempotently.
6. A reconciliation job reports unexplained differences.

### LMS payment → ERP

1. Django verifies the payment-provider webhook signature.
2. Django stores the event once using a unique idempotency key.
3. The payment enters `received_pending_erp`.
4. A private integration worker submits the payment through the vendor-approved ERP operation.
5. ERP returns the official receipt/reference.
6. Django records that reference and refreshes ERP clearance.
7. Access is granted only from the confirmed result.

Never expose SQL Server port 1433 to the public internet. The cloud LMS should reach an integration API over HTTPS or through a private VPN/tunnel, using least-privilege credentials.

## Questions that must be answered before production

1. What exact ERP rule defines financial clearance?
2. Does the ERP vendor provide a supported API or documented posting operation?
3. What do `OutOfSync` and `VOutOfSync` each target?
4. Why are thousands of student rows currently marked for synchronization?
5. Which ERP state officially controls LMS enrollment: `Register.class`, `Reporting`, `StudentSubject`, or another rule?
6. Are the main and virtual campuses one Django deployment with shared authentication, or separate deployments using single sign-on?

## First implementation milestone

Build read-only synchronization first:

- map LMS accounts to `Register.AdmnNo`;
- import minimum student/programme/registration context;
- obtain an ERP-confirmed clearance decision;
- update LMS access;
- generate a reconciliation report;
- perform no ERP writes.

Only after that works reliably should LMS-originated payment posting be enabled.
