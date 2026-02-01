# Rollback / Restore Guide

Use these commands if you need to undo changes quickly. Run them from the project root.

## Inspect history
```bash
git log --oneline
```

## Discard local WIP (not pushed)
```bash
git reset --hard HEAD
```

## Reset local to a specific commit
```bash
git reset --hard <commit-hash>
```

## Revert a published commit (safe, keeps history)
```bash
git revert <commit-hash>
git push
```

## Roll main back to an older commit (force push)
> Use only when you want `main` to point to an older commit.
```bash
git reset --hard <commit-hash>
git push -f origin main
```

Keep commits small and push after each working change. This makes rollbacks nearly instant.
