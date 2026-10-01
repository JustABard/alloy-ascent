# Optional GitHub Actions

These two workflows are ready to use. They are not active yet because the GitHub CLI token used to create the repository lacked the `workflow` scope.

| File | What it does |
|---|---|
| `pages.yml` | On every push to `main`: runs the engine tests and a 200-game balance smoke test, then deploys `web/` to GitHub Pages. |
| `keepalive.yml` | Daily: pings the Supabase database so the free project never pauses, and purges rooms idle for more than three days. |

To enable them, first grant the GitHub CLI the `workflow` scope (a browser sign-in opens):

```bash
gh auth refresh -h github.com -s workflow
```

Then copy both files into `.github/workflows/`:

```bash
mkdir -p .github/workflows && cp ci/*.yml .github/workflows/
```

Commit and push the copies:

```bash
git add .github && git commit -m "Enable CI, Pages deploy and keep-alive" && git push
```

Finally, switch GitHub Pages to deploy from Actions:

```bash
gh api -X PUT repos/JustABard/alloy-ascent/pages -f build_type=workflow
```

Until then, the site is served from the `gh-pages` branch. To update it after changing `web/`, publish that folder to the branch:

```bash
git subtree split --prefix web -b gh-pages-tmp && git push -f origin gh-pages-tmp:gh-pages && git branch -D gh-pages-tmp
```

GitHub Pages caches files for about 10 minutes, so after an update, players may need a hard refresh (Ctrl+F5) to see it straight away. Avoid redeploying in the 10 minutes before a demo.

If the multiplayer backend is ever paused (no use for a week), open the Supabase dashboard and press **Restore project**. Pass-and-play keeps working regardless.
