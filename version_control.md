# Version Control, Branching, and Commit Standards

## Branching Strategy

Primary branches are:

- **main** – The stable production branch. Only tested and approved code should be merged here.
- **dev** – The active development branch where new features and fixes are integrated before being pushed to `main`.
- **feature/*** – Feature-specific branches that originate from `dev`.

### Workflow
1. **Creating a New Feature Branch:**
   - Branch off from `dev` using the naming convention:
     ```bash
     git checkout dev
     git pull origin dev
     git checkout -b feature/your-feature-name
     ```
2. **Developing the Feature:**
   - Make incremental commits following the commit message standards.
3. **Merging the Feature:**
   - When the feature is complete and tested, create a pull request (PR) to merge it back into `dev`.
   - Ensure the branch is reviewed before merging.
4. **Releasing to Main:**
   - Once enough features and fixes have been tested, `dev` will be merged into `main` through a PR.

## Commit Message Standards

Commit message format inspired by [Conventional Commits](https://www.conventionalcommits.org/). The format is:

```
<type>: <short description>

[Optional: Detailed description]
```

### Allowed Commit Types
- **feat** – Introducing a new feature
- **fix** – Bug fixes and minor improvements
- **hotfix** – Critical fixes, usually merged directly into `main`
- **docs** – Documentation changes
- **refactor** – Code changes that neither add a feature nor fix a bug
- **test** – Adding or modifying tests
- **chore** – Maintenance tasks like dependency updates

### Examples:
```bash
git commit -m "feat: add login authentication"
git commit -m "fix: resolve crash when submitting form"
git commit -m "docs: update README with setup instructions"
```

## Additional Guidelines
- Keep commits atomic (one logical change per commit).
- Rebase frequently to keep branches up to date.
- Write meaningful commit messages that describe the *why* and *what*.
- Avoid committing directly to `main` or `dev` unless necessary.

## Basic Git Commands

Common Git commands and their explanations:

- **Clone a repository:**
  ```bash
  git clone <repository-url>
  ```
  Clones a remote repository to your local machine.

- **Check the current branch:**
  ```bash
  git branch
  ```
  Lists all local branches and highlights the current branch.

- **Create a new branch:**
  ```bash
  git checkout -b feature/branch-name
  ```
  Creates and switches to a new feature branch.

- **Switch branches:**
  ```bash
  git checkout branch-name
  ```
  Switches to the specified branch.

- **Stage changes:**
  ```bash
  git add .
  ```
  Stages all modified and new files for commit.

- **Commit changes:**
  ```bash
  git commit -m "feat: short description of the change"
  ```
  Commits staged changes with a meaningful message.

- **Push changes to remote repository:**
  ```bash
  git push origin branch-name
  ```
  Pushes local commits to the remote repository.

- **Pull latest changes from remote:**
  ```bash
  git pull origin branch-name
  ```
  Fetches and merges the latest changes from the remote branch.

- **Merge branches:**
  ```bash
  git checkout dev
  git merge feature/branch-name
  ```
  Merges a feature branch into `dev`.

- **Rebase a branch:**
  ```bash
  git checkout feature/branch-name
  git rebase dev
  ```
  Reapplies commits from the feature branch on top of the latest `dev` branch.

- **Resolve merge conflicts:**
  ```bash
  git status
  ```
  Shows conflicted files, which must be manually resolved before continuing.

- **View commit history:**
  ```bash
  git log --oneline --graph --all
  ```
  Displays a compact commit history with branch visualization.
  
---
