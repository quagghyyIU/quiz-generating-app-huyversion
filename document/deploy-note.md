# Guide and Notes for Deploying the React Quiz App to GitHub Pages

This document summarizes the steps and configurations required to deploy the React quiz application to GitHub Pages, based on our setup conversation.

## 1. `package.json` Configuration (`quiz-react-app/package.json`)

To ensure the application's assets are served correctly from a subdirectory on GitHub Pages (e.g., `https://<username>.github.io/<repository-name>/`), the `homepage` field must be set:

```json
{
  "name": "quiz-react-app",
  "version": "0.1.0",
  "private": true,
  "homepage": "https://NP-Dat.github.io/quiz-generating-app/", // Replace NP-Dat and quiz-generating-app if necessary
  "dependencies": {
    // ...
  },
  "scripts": {
    // ...
    "predeploy": "npm run build",
    "deploy": "gh-pages -d build" // For manual gh-pages deployment (optional if using Actions)
  },
  // ...
}
```

## 2. GitHub Actions Workflow (`.github/workflows/react-deploy.yml`)

A GitHub Actions workflow automates the build, test, and deployment process.

### Key Workflow Features:

*   **Trigger**: Runs on pushes to `main` and pull requests targeting `main`.
*   **Working Directory**: All `run` commands for the Node.js project are executed within the `quiz-react-app` subdirectory using `defaults.run.working-directory: ./quiz-react-app`.
*   **Node.js Version**: Uses Node.js 22.x for consistency (can be adjusted in the `matrix.node-version`).
*   **Caching**: Caches npm dependencies using `actions/setup-node@v4` with `cache: 'npm'` and `cache-dependency-path: quiz-react-app/package-lock.json`.
*   **Two-Job Structure**:
    1.  `build-and-test`:
        *   Checks out code.
        *   Sets up Node.js.
        *   Installs dependencies (`npm ci`).
        *   Builds the application (`npm run build --if-present`).
        *   (Tests were commented out: `npm test` - uncomment when tests are added).
        *   Uploads the build output (`quiz-react-app/build`) as an artifact named `github-pages-artifact`.
    2.  `deploy-to-github-pages`:
        *   Depends on the successful completion of `build-and-test`.
        *   Runs **only** on pushes to the `main` branch.
        *   **Permissions**: Requires `pages: write` and `id-token: write` to deploy to GitHub Pages.
        *   **Environment**: Configured for `github-pages` deployment.
        *   **Steps**:
            *   Downloads the `github-pages-artifact`.
            *   Uses `actions/configure-pages@v5` to prepare for Pages deployment.
            *   Uses `actions/upload-pages-artifact@v3` to upload the site for Pages.
            *   Uses `actions/deploy-pages@v4` to deploy the uploaded artifact.

### Example Snippet for `deploy-to-github-pages` job:

```yaml
# ... (build-and-test job defined above) ...

  deploy-to-github-pages:
    name: Deploy to GitHub Pages
    runs-on: ubuntu-latest
    needs: build-and-test
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    permissions:
      contents: read
      pages: write
      id-token: write
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
    - name: Download build artifact
      uses: actions/download-artifact@v4
      with:
        name: github-pages-artifact
        path: ./build-output
    - name: Setup Pages
      uses: actions/configure-pages@v5
      # with:
      #   enablement: true # Can be explicitly set if needed
    - name: Upload artifact for GitHub Pages deployment
      uses: actions/upload-pages-artifact@v3
      with:
        path: ./build-output
    - name: Deploy to GitHub Pages
      id: deployment
      uses: actions/deploy-pages@v4
      # with:
      #   token: ${{ secrets.GITHUB_TOKEN }} # GITHUB_TOKEN is typically available by default
```

## 3. Repository GitHub Pages Settings

After pushing the workflow and `package.json` changes:

1.  Go to your repository on GitHub.
2.  Navigate to `Settings` > `Pages`.
3.  Under "Build and deployment", for the "Source", select **`GitHub Actions`**.

## 4. Fixing Static Asset Paths in React Components

When fetching static files (like JSON data from the `public` folder) in a React application deployed to a subdirectory on GitHub Pages, paths need to be prefixed with `process.env.PUBLIC_URL`.

*   **The Issue**: In development, `fetch('/data/index.json')` works. On GitHub Pages (e.g., `https://NP-Dat.github.io/quiz-generating-app/`), this path would incorrectly point to `https://NP-Dat.github.io/data/index.json`.
*   **The Solution**: `process.env.PUBLIC_URL` resolves to the `homepage` path in `package.json` during the build (e.g., `/quiz-generating-app`) or an empty string in development.

### Example Changes:

**`quiz-react-app/src/QuizList.js`:**
```javascript
// Before
// fetch('/data/index.json')

// After
fetch(`${process.env.PUBLIC_URL}/data/index.json`)
```

**`quiz-react-app/src/Quiz.js`:**
```javascript
// Before
// fetch(`/data/${selectedQuiz}`)

// After
fetch(`${process.env.PUBLIC_URL}/data/${selectedQuiz}`)
```

## 5. Committing and Pushing

Commit all changes (`package.json`, `.github/workflows/react-deploy.yml`, and any source code changes for `PUBLIC_URL`) to your `main` branch and push to GitHub. This will trigger the workflow, and upon successful completion, your site will be deployed to the URL specified in your `homepage` (e.g., `https://NP-Dat.github.io/quiz-generating-app/`).
