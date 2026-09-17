# How to Publish Your Portfolio Online (Live Web Link)

Here are the **3 fastest, 100% free ways** to get a public link for your portfolio right now:

---

## ⚡ Method 1: Netlify Drop (Fastest — 30 Seconds, No Code)

This gives you a permanent, free HTTPS link like:  
👉 `https://lakshya-portfolio.netlify.app`

1. Open your browser and go to: **[https://app.netlify.com/drop](https://app.netlify.com/drop)**
2. Open this folder in Windows Explorer:
   `C:\Users\DELL\.gemini\antigravity\scratch\cosmic-student-portfolio\`
3. **Drag and drop the entire `cosmic-student-portfolio` folder** into the circle on the Netlify web page.
4. Netlify will instantly deploy your portfolio and give you a live link!
5. *(Optional)* Click **Site configuration** -> **Change site name** to set a custom URL like `lakshya-portfolio.netlify.app`.

---

## 🐙 Method 2: GitHub Pages (Recommended for Developers & Resumes)

This gives you an official developer URL like:  
👉 `https://lakshyar13.github.io/portfolio`

Your Git repository is already initialized and committed locally. Follow these 3 quick steps:

### Step 1: Create a GitHub Repo
1. Go to **[https://github.com/new](https://github.com/new)**.
2. Enter repository name: `portfolio` (or `lakshyar13.github.io`).
3. Leave it **Public** and do NOT initialize with README (it already has one).
4. Click **Create repository**.

### Step 2: Push your code
Open PowerShell or your terminal in this directory and run (replace `YOUR-USERNAME` with your GitHub username):

```bash
git remote add origin https://github.com/YOUR-USERNAME/portfolio.git
git branch -M main
git push -u origin main
```

### Step 3: Turn on GitHub Pages
1. Go to your repository on GitHub -> **Settings** -> **Pages** (on the left menu).
2. Under **Build and deployment** > **Source**, choose **Deploy from a branch**.
3. Under **Branch**, select `main` and `/ (root)`, then click **Save**.
4. In ~60 seconds, your site will be live at `https://YOUR-USERNAME.github.io/portfolio`!

---

## ▲ Method 3: Vercel (1-Click Command)

If you prefer Vercel, run this in your terminal:

```bash
npx vercel
```
- Follow the prompts in the terminal (press Enter for defaults).
- Vercel will build and output your live link immediately (e.g. `https://lakshya-portfolio.vercel.app`).
