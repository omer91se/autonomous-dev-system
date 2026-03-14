# Browser Setup for UI

How to configure which browser opens automatically when using the UI.

## Default Behavior

The `start-with-ui.sh` script now **automatically opens Chrome** when the UI starts.

## macOS

### Chrome Opens Automatically

When you run:
```bash
./start-with-ui.sh "Your app idea"
```

The script automatically:
1. Starts the UI
2. Opens Chrome to http://localhost:3000 (or your custom port)
3. Runs the orchestrator

### If Chrome Isn't Your Default Browser

No problem! The script specifically opens Chrome regardless of your default browser.

### If Chrome Isn't Installed

The script will fall back to your default browser.

**To use Chrome**, install it:
```bash
# Using Homebrew
brew install --cask google-chrome
```

### Use a Different Browser

Edit `start-with-ui.sh` and change this line:

```bash
# Find this (around line 91):
open -a "Google Chrome" "http://localhost:$UI_PORT" 2>/dev/null || \
```

**For Firefox:**
```bash
open -a "Firefox" "http://localhost:$UI_PORT" 2>/dev/null || \
```

**For Safari:**
```bash
open -a "Safari" "http://localhost:$UI_PORT" 2>/dev/null || \
```

**For Brave:**
```bash
open -a "Brave Browser" "http://localhost:$UI_PORT" 2>/dev/null || \
```

**For Arc:**
```bash
open -a "Arc" "http://localhost:$UI_PORT" 2>/dev/null || \
```

## Linux

### Chrome Opens Automatically

The script tries `google-chrome` command on Linux.

### If Chrome Isn't Installed

Install Chrome:
```bash
# Ubuntu/Debian
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo dpkg -i google-chrome-stable_current_amd64.deb

# Or using snap
sudo snap install chromium
```

### Use a Different Browser

Edit `start-with-ui.sh` and change:

```bash
# Find this (around line 94):
google-chrome "http://localhost:$UI_PORT" &
```

**For Firefox:**
```bash
firefox "http://localhost:$UI_PORT" &
```

**For Brave:**
```bash
brave-browser "http://localhost:$UI_PORT" &
```

## Manual Opening (Any OS)

Don't want auto-open? You can:

### Option 1: Use Environment Variable

```bash
# Disable auto-open
NO_BROWSER=1 ./start-with-ui.sh "Your app idea"
```

Then manually open: http://localhost:3000

### Option 2: Start UI Manually

```bash
# Terminal 1: Start UI (no auto-open)
cd ui
npm run dev

# Terminal 2: Open browser manually
# Visit http://localhost:3000

# Terminal 3: Run orchestrator
tsx orchestrate-ui.ts "Your app idea"
```

### Option 3: Edit the Script

Comment out the browser opening section in `start-with-ui.sh`:

```bash
# Around line 90-98, comment out:
# # Open Chrome automatically
# echo "🌐 Opening Chrome browser..."
# if command -v open &> /dev/null; then
#     ...
# fi
```

## Terminal Browser Opening

If you're using iTerm2 or another terminal, `Cmd+Click` on the URL in the terminal output will open it in your default browser.

Example:
```bash
✅ UI started successfully!
📊 Dashboard: http://localhost:3000
                ↑ Cmd+Click this
```

## Why Chrome?

Chrome is recommended because:
- ✅ Best WebSocket support
- ✅ Excellent DevTools for debugging
- ✅ React DevTools work great
- ✅ Best performance with Monaco Editor
- ✅ Good Tailwind CSS rendering

But any modern browser works fine!

## Troubleshooting

### "Chrome not found" Error

**macOS:**
```bash
# Check if Chrome is installed
ls /Applications/ | grep Chrome

# If not found, install:
brew install --cask google-chrome
```

**Linux:**
```bash
# Check if Chrome is installed
which google-chrome

# If not found, install (Ubuntu):
sudo apt update
sudo apt install google-chrome-stable
```

### Browser Opens But Shows Error

**Problem**: Browser opens but page doesn't load

**Solution**:
1. UI might not be ready yet (wait 2-3 seconds)
2. Refresh the page
3. Check UI is actually running: `lsof -i :3000`

### Wrong Port Opens

**Problem**: Opens http://localhost:3000 but UI is on 3002

**Solution**: The script uses the `$UI_PORT` variable. Make sure you pass the port:
```bash
./start-with-ui.sh "Your idea" 3002 3003
```

### Multiple Windows Open

**Problem**: Chrome opens a new window every time

**Solution**: Close duplicate tabs. Chrome will remember the last one used.

## Configuration Summary

| What | How |
|------|-----|
| **Auto-open Chrome** | Default behavior in `start-with-ui.sh` |
| **Use different browser** | Edit script, change browser name |
| **Disable auto-open** | Set `NO_BROWSER=1` or comment out code |
| **Manual opening** | Visit http://localhost:3000 yourself |
| **Change default port** | See [PORT_CONFIGURATION.md](PORT_CONFIGURATION.md) |

---

**Quick answer**: The script now opens Chrome automatically on macOS and Linux. If you want a different browser, just edit the script!
