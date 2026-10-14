---
name: db-sql-postgres-expert
description: Expert guidelines for SQL Server and PostgreSQL schema design, indexing strategies, query performance tuning, migration safety, and transaction management.
---

# Database (SQL Server & PostgreSQL) Expert Skill

Use this skill when designing relational schemas, writing complex SQL queries, creating migrations, or diagnosing slow database performance.

## Best Practices

1. **Schema Design & Normalization**:
   - Proper normalization (3NF) for transactional systems, denormalizing judiciously for read-heavy reporting.
   - Use appropriate data types (`UUID`/`bigint` for primary keys, `timestamptz` for timestamps, `numeric` for money/currency).
   - Enforce constraints: Foreign keys with explicit `ON DELETE` rules, `CHECK` constraints, `UNIQUE` constraints.

2. **Indexing Strategies**:
   - Create B-tree indexes for frequently filtered columns (`WHERE`) and join keys (`FOREIGN KEY`).
   - Use composite indexes with correct column order (equality columns first, then range columns).
   - Leverage partial / filtered indexes for soft-deleted columns (e.g., `WHERE is_deleted = false`).
   - Monitor and avoid index bloating; analyze query plans using `EXPLAIN ANALYZE` (Postgres) or Execution Plans (SQL Server).

3. **Transaction Safety & Concurrency**:
   - Keep transactions concise to prevent connection pool exhaustion and deadlocks.
   - Use optimistic concurrency control (RowVersion / version columns) for web application edits.
   - Use explicit isolation levels (`READ COMMITTED`, `REPEATABLE READ`, `SERIALIZABLE`) where strict invariants are required.

4. **Zero-Downtime Migrations**:
   - Expand-and-contract pattern for schema evolution:
     - Phase 1: Add new column / table (nullable or with default).
     - Phase 2: Dual-write or migrate data.
     - Phase 3: Switch application reads to new column.
     - Phase 4: Deprecate and drop old column safely.
