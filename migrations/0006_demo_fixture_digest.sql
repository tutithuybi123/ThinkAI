-- Baseline sources are immutable.  A runtime may only use the exact reviewed
-- fixture version and digest that were first registered for each profile.
ALTER TABLE demo_fixture_baselines
  ADD COLUMN fixture_digest TEXT NOT NULL DEFAULT '';
