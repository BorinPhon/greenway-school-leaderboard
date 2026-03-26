# Google Apps Script Deployment – Step-by-Step Guide

Follow these exact steps to set up the photo upload system.

---

## 📋 Phase 1: Create Google Drive Folder Structure

### Step 1.1: Create Main Photos Folder

1. Open [Google Drive](https://drive.google.com)
2. Click "New" → "Folder"
3. Name it: `Greenway School - Student Photos`
4. Click "Create"

### Step 1.2: Create Level Subfolders

Inside the "Greenway School - Student Photos" folder, create these 6 subfolders:

1. `BA`
2. `BB`
3. `Grade 1`
4. `Grade 2`
5. `Grade 3`
6. `Grade 4`

**How to create subfolders:**
1. Open the main folder
2. Click "New" → "Folder"
3. Enter the name (e.g., "BA")
4. Click "Create"
5. Repeat for all 6 levels

### Step 1.3: Share the Main Folder

1. Right-click on "Greenway School - Student Photos"
2. Click "Share"
3. Change to "Anyone with the link can view"
4. Click "Share"

### Step 1.4: Get the Folder ID

1. Open "Greenway School - Student Photos"
2. Look at the URL in your browser:
   ```
   https://drive.google.com/drive/folders/YOUR_FOLDER_ID
   ```
3. Copy the ID (the long string after `/folders/`)

**Example:**
```
URL: https://drive.google.com/drive/folders/1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p
ID:  1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p
```

**Save this ID** – You'll need it in the next step!

---

## 🔧 Phase 2: Create and Deploy Google Apps Script

### Step 2.1: Create New Apps Script Project

1. Go to [script.google.com](https://script.google.com)
2. Click "New project"
3. Name it: `Greenway Photo Upload`
4. Click "Create"

### Step 2.2: Paste the Script Code

1. Delete the default `myFunction()` code
2. Copy the entire code from `GoogleAppsScript_PhotoUpload.js`
3. Paste it into the editor
4. You should see the complete script with all functions

### Step 2.3: Update Configuration

In the script, find these lines at the top:

```javascript
// Your Google Sheet ID (from the URL)
const SPREADSHEET_ID = '1SK7kWxD_mYWKqMJN_P2L5-8RGRwUylzX9SUXOiRevwM';

// Your Google Drive Folder ID (where photos will be stored)
const PHOTOS_FOLDER_ID = '';  // ← UPDATE THIS
```

**Update PHOTOS_FOLDER_ID:**
1. Replace the empty string with your folder ID from Step 1.4
2. Example:
   ```javascript
   const PHOTOS_FOLDER_ID = '1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p';
   ```

### Step 2.4: Save the Script

1. Press `Ctrl+S` (or `Cmd+S` on Mac)
2. Or click the "Save" button
3. You should see "Project saved" notification

### Step 2.5: Test Configuration

1. In the editor, find the `testConfiguration()` function
2. Click on it to select it
3. Click the "Run" button (▶️)
4. A popup will ask for permissions – click "Review permissions"
5. Select your Google account
6. Click "Allow"
7. Check the "Execution log" at the bottom
8. You should see:
   ```
   ✅ Folder found: Greenway School - Student Photos
   ```

If you see an error, check:
- PHOTOS_FOLDER_ID is correct
- Folder exists in Google Drive
- You have access to the folder

### Step 2.6: Deploy as Web App

1. Click "Deploy" button (top right)
2. Click "New deployment"
3. Click the gear icon ⚙️
4. Select "Web app"
5. Fill in the form:
   - **Execute as:** Your email address
   - **Who has access:** Anyone
6. Click "Deploy"
7. A popup will show your deployment URL
8. Click "Copy" to copy the URL

**Save this URL** – You'll need it in Phase 3!

**Example URL:**
```
https://script.google.com/macros/s/AKfycbwXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/exec
```

---

## 📝 Phase 3: Update HTML Files

### Step 3.1: Update index.html

1. Open your `index.html` file
2. Find line 612:
   ```javascript
   const SCRIPT_URL = '';  // e.g. 'https://script.google.com/macros/s/AKfy.../exec'
   ```
3. Replace with your deployment URL:
   ```javascript
   const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/exec';
   ```
4. Save the file

### Step 3.2: Update reports.html

1. Open your `reports.html` file
2. Find the SCRIPT_URL line (around line 290)
3. Update it the same way:
   ```javascript
   const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/exec';
   ```
4. Save the file

### Step 3.3: Upload Files to Your Server

1. Upload both `index.html` and `reports.html` to your web server
2. Or commit to GitHub if using version control

---

## ✅ Phase 4: Testing

### Step 4.1: Open Your Leaderboard

1. Open your leaderboard URL in a browser
2. You should see the leaderboard with student cards

### Step 4.2: Upload a Test Photo

1. Click on any student card
2. Click "Upload Photo" or the camera icon
3. Select an image file from your computer
4. The photo should appear instantly on the card

### Step 4.3: Verify Google Drive

1. Open Google Drive
2. Go to "Greenway School - Student Photos"
3. Open the corresponding level folder (e.g., "Grade 1")
4. You should see the photo file there with the student's name

### Step 4.4: Verify Google Sheet

1. Open your Google Sheet
2. Go to the corresponding level sheet (e.g., "Grade 1")
3. Find the student row
4. Check Column H (Photo URL)
5. You should see the photo URL there

**Example URL in Column H:**
```
https://lh3.googleusercontent.com/d/1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p
```

### Step 4.5: Verify Photo Displays

1. Refresh the leaderboard page
2. The photo should still show on the card
3. Open the leaderboard on a different device
4. The photo should show there too

### Step 4.6: Check Toast Messages

When uploading, you should see one of these messages:

**Success:**
```
✅ Photo saved to Google Drive — visible to everyone!
```

**Error:**
```
⚠️ Drive upload failed — photo saved locally only.
```

If you see an error, check:
- SCRIPT_URL is correct
- Google Apps Script is deployed
- Permissions are granted
- Folder ID is correct

---

## 🆘 Troubleshooting

### Problem: "Could not reach upload server"

**Check:**
1. Is SCRIPT_URL correct? (Copy from deployment)
2. Is the script deployed as Web App?
3. Is "Anyone" allowed to access?

**Fix:**
1. Re-deploy the script
2. Copy the new URL
3. Update HTML files
4. Try again

### Problem: Photo uploads but doesn't appear in Google Drive

**Check:**
1. Is PHOTOS_FOLDER_ID correct?
2. Does the folder exist?
3. Do you have access to the folder?

**Fix:**
1. Run `testConfiguration()` function
2. Check the execution log
3. Verify folder ID

### Problem: Photo uploads but Column H is empty

**Check:**
1. Is SPREADSHEET_ID correct?
2. Do sheet names match exactly? (BA, BB, Grade 1, etc.)
3. Is student name spelled exactly the same?

**Fix:**
1. Check sheet names in the script
2. Verify student names in the sheet
3. Run `testConfiguration()` to verify

### Problem: "Permission denied" error

**Fix:**
1. Go back to Google Apps Script
2. Click "Deploy" → "Manage deployments"
3. Click the deployment
4. Click "Edit"
5. Change "Who has access" to "Anyone"
6. Click "Update"

---

## 📊 Verification Checklist

After deployment, verify everything:

- [ ] Google Drive folder created: "Greenway School - Student Photos"
- [ ] 6 subfolders created: BA, BB, Grade 1-4
- [ ] Main folder shared with "Anyone can view"
- [ ] Google Apps Script created
- [ ] PHOTOS_FOLDER_ID updated in script
- [ ] Script tested with `testConfiguration()`
- [ ] Script deployed as Web App
- [ ] Deployment URL copied
- [ ] index.html updated with SCRIPT_URL
- [ ] reports.html updated with SCRIPT_URL
- [ ] Files uploaded to server
- [ ] Test photo uploaded successfully
- [ ] Photo appears in Google Drive folder
- [ ] Photo URL appears in Column H
- [ ] Photo displays on leaderboard
- [ ] Photo persists after page refresh
- [ ] Photo visible on different device

---

## 🎯 Summary

**What You Did:**
1. ✅ Created Google Drive folder structure
2. ✅ Created Google Apps Script
3. ✅ Deployed script as Web App
4. ✅ Updated HTML files with Script URL
5. ✅ Tested the system

**What Now Happens:**
1. User uploads photo
2. Photo saved to Google Drive (organized by level)
3. Photo URL saved to Google Sheet Column H
4. Photo visible to all users
5. Photo persists forever

**Result:**
- Each student has a unique photo
- Photos organized by level
- Column H contains photo URLs
- All users see the same photos
- Professional system!

---

## 📞 Need Help?

If you encounter issues:

1. **Check the execution log** in Google Apps Script
2. **Run `testConfiguration()`** to verify settings
3. **Check Google Sheet** to see if URL was saved
4. **Check Google Drive** to see if photo was saved
5. **Check browser console** for JavaScript errors

All errors are logged in the Apps Script execution log – check there first!

