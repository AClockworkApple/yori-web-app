# Upload to GitHub

## Prerequisites
- Git installed
- GitHub account

---

## Step 1: Create GitHub Repository

1. Go to [github.com](https://github.com)
2. Click **+** (top right) → **New repository**
3. Repository name: `yori-web-app`
4. Choose: Public or Private
5. Click **Create repository**
6. Copy the repository URL (e.g., `https://github.com/yourusername/yori-web-app.git`)

---

## Step 2: Initialize Git Locally

Open terminal in project folder:

```bash
cd "C:/Users/AN/Desktop/Yori Web App"
git init
```

---

## Step 3: Configure Git (First Time Only)

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

---

## Step 4: Add and Commit

```bash
git add .
git commit -m "Initial commit: Restaurant CRUD setup"
```

---

## Step 5: Add Remote

Replace `YOUR_REPO_URL` with your GitHub repository URL:

```bash
git remote add origin https://github.com/yourusername/yori-web-app.git
```

---

## Step 6: Push to GitHub

```bash
git branch -M main
git push -u origin main
```

---

## Verification

After push, refresh your GitHub repository page. You should see:
- `README.md`
- `client/` folder
- `server/` folder
- `.github/` folder
- `.gitignore`

---

## Commands Summary

```bash
# 1. Go to project folder
cd "C:/Users/AN/Desktop/Yori Web App"

# 2. Initialize git
git init

# 3. Add all files
git add .

# 4. Commit
git commit -m "Initial commit"

# 5. Add remote (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/yori-web-app.git

# 6. Push
git branch -M main
git push -u origin main
```

---

## Notes

- `.env` is NOT uploaded (in .gitignore)
- Run `git status` anytime to see pending changes
- Run `git log` to see commit history