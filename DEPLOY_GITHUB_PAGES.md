# Deploying Gebeta to GitHub Pages

1. Install gh-pages:

    npm install --save gh-pages

2. Update package.json:
- Add this line (replace with your username/repo):
  "homepage": "https://kibrom1.github.io/gebeta"
- Add these scripts:
  "predeploy": "npm run build",
  "deploy": "gh-pages -d build"

3. Initialize git and push to GitHub:

    git init
    git remote add origin https://github.com/kibrom1/gebeta.git
    git add .
    git commit -m "Initial commit"
    git push -u origin main

4. Deploy:

    npm run deploy

5. On GitHub, go to Settings > Pages and set source to gh-pages branch.

Your app will be live at the homepage URL you set.
