# Changelog / 更新日志

## [v0.1.3] - 2026-02-24
1. 📝 **Documentation Rewritten**: Renamed the tool to "Buckshot Roulette Tactical Terminal" and removed all "AI" terminology to avoid misunderstandings, clarifying that the tool is a "Decision Assist" feature using heuristics and probability calculation.
2. 🖼️ **Icon and Metadata Fixes**: Fixed the application's executable `.exe` file icon and window icon to properly reflect the custom logo rather than Wails' default icon.
3. 📝 **Changelog Formatting**: Updated the `CHANGELOG.md` file format to permanently track releases by date and version tags. CI/CD now automatically extracts the latest version notes for GitHub Releases.

## [v0.1.2] - 2026-02-24
1. 💻 **Windows Only Supported**: Removed automated Linux and macOS builds from GitHub Actions due to CI compilation issues.
2. 🧰 **Manual Build Instruction**: Added specific instructions in `README.md` and `README_zh.md` for Linux and macOS users to compile the application locally from source.
3. 🛠️ **Workflow Optimization**: Refactored the CI/CD release workflow to correctly extract and format changelogs and publish Windows artifacts seamlessly.

## [v0.1.1] - 2026-02-24
1. 🐛 **CI Bug Fix**: Fixed a bug where GitHub Actions failed to upload artifacts on macOS and Linux runners due to a file path issue.
2. 🔒 **Permissions Fix**: Granted GitHub token write access in the CI workflow.
3. 📝 **Doc Updates**: Added proper in-app screenshot previews and updated bilingual `README` files.