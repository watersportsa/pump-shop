# GitHub Setup — Click-by-Click Guide (No Terminal Required)

## Part 1 — Create a repository
1. Sign in at github.com → click the **"+"** icon (top-right) → **"New repository"**.
2. Name it `pump-shop`, set **Public**, do **not** check "Add a README".
3. Click **"Create repository"**.

## Part 2 — Upload your files (preserving folder structure)
To avoid folders getting flattened, upload one folder at a time:
1. On the empty repo page, click **"Add file"** → **"Upload files"**.
2. Drag in `index.html`, `README.md`, and `GITHUB_SETUP.md` from your local `pump-shop` folder root. Commit.
3. Click **"Add file"** → **"Create new file"**, type `css/style.css` as the filename (the `/` auto-creates the folder), paste in the contents, commit.
4. Repeat for `js/app.js`, `data/config.json`, `data/products.json`, `data/RECONCILIATION_LOG.md`, `assets/images/logo.svg`, `assets/images/placeholder.svg` — either via "Create new file" with the full path, or by navigating into an already-created folder and uploading directly into it.

## Part 3 — Enable GitHub Pages
1. Go to **Settings → Pages** (left sidebar, under "Code and automation").
2. Under **Source**, select **"Deploy from a branch"**.
3. Branch: **main**, folder: **/ (root)** → **Save**.
4. Wait ~30-60 seconds, refresh — you'll see your live URL:
   `https://<your-username>.github.io/pump-shop/`

## Part 4 — Future updates
Open any file in the repo → click the pencil (✏️) icon → edit → commit.
The live site rebuilds automatically within about a minute.

## Troubleshooting
| Problem | Fix |
|---|---|
| Page looks unstyled / no products show | Check that `css/`, `js/`, `data/`, `assets/` are actual folders in your repo file list — not files sitting flat at the root. |
| 404 error | `index.html` must be directly in the repo root, not inside a subfolder. |
