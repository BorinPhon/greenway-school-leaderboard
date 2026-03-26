// ════════════════════════════════════════════════════════════════════
// GREENWAY SCHOOL - PHOTO UPLOAD SYSTEM
// Google Apps Script for uploading student photos to Google Drive
// and updating Google Sheet Column H with photo URLs
// ════════════════════════════════════════════════════════════════════

// ⚙️ CONFIGURATION - UPDATE THESE VALUES
// ════════════════════════════════════════════════════════════════════

// Your Google Sheet ID (from the URL)
const SPREADSHEET_ID = '1SK7kWxD_mYWKqMJN_P2L5-8RGRwUylzX9SUXOiRevwM';

// Your Google Drive Folder ID (where photos will be stored)
// You'll get this after creating the folder structure
// For now, use empty string and we'll update it after creating the folder
const PHOTOS_FOLDER_ID = '';  // ← UPDATE THIS AFTER CREATING GOOGLE DRIVE FOLDER

// Sheet names (must match exactly)
const SHEET_NAMES = ['BA', 'BB', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4'];

// ════════════════════════════════════════════════════════════════════
// MAIN HANDLER - Receives photo upload from leaderboard
// ════════════════════════════════════════════════════════════════════

function doPost(e) {
  try {
    // Parse incoming data from leaderboard
    const data = JSON.parse(e.postData.contents);
    const { sheetName, studentName, imageData, fileName } = data;

    // Validate that all required fields are present
    if (!sheetName || !studentName || !imageData) {
      return createErrorResponse('Missing required fields: sheetName, studentName, or imageData');
    }

    // Check if PHOTOS_FOLDER_ID is configured
    if (!PHOTOS_FOLDER_ID) {
      return createErrorResponse('PHOTOS_FOLDER_ID not configured. Please set it in the script.');
    }

    // Validate sheet name
    if (!SHEET_NAMES.includes(sheetName)) {
      return createErrorResponse(`Invalid sheet name: ${sheetName}`);
    }

    // Step 1: Get or create the level folder in Google Drive
    const levelFolder = getOrCreateLevelFolder(sheetName);
    if (!levelFolder) {
      return createErrorResponse(`Could not create or access folder for ${sheetName}`);
    }

    // Step 2: Convert base64 image data to blob
    const blob = convertBase64ToBlob(imageData, fileName);
    if (!blob) {
      return createErrorResponse('Could not process image data');
    }

    // Step 3: Save image to Google Drive
    const file = savePhotoToGoogleDrive(levelFolder, studentName, blob);
    if (!file) {
      return createErrorResponse('Could not save photo to Google Drive');
    }

    // Step 4: Get shareable URL for the photo
    const photoUrl = getShareablePhotoUrl(file);
    if (!photoUrl) {
      return createErrorResponse('Could not generate photo URL');
    }

    // Step 5: Update Google Sheet Column H with the photo URL
    const updateSuccess = updateSheetWithPhoto(sheetName, studentName, photoUrl);

    // Step 6: Return success response
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      photoUrl: photoUrl,
      message: `Photo uploaded successfully for ${studentName}`,
      warning: !updateSuccess ? 'Photo saved to Drive but student not found in sheet' : null
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('Error in doPost: ' + error.toString());
    return createErrorResponse('Server error: ' + error.toString());
  }
}

// ════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ════════════════════════════════════════════════════════════════════

/**
 * Get or create a level folder in Google Drive
 * @param {string} sheetName - The sheet/level name (e.g., "Grade 1")
 * @returns {Folder} The Google Drive folder object
 */
function getOrCreateLevelFolder(sheetName) {
  try {
    // Get the main photos folder
    const parentFolder = DriveApp.getFolderById(PHOTOS_FOLDER_ID);
    
    // Check if level folder already exists
    const folders = parentFolder.getFoldersByName(sheetName);
    
    if (folders.hasNext()) {
      // Folder exists, return it
      return folders.next();
    } else {
      // Folder doesn't exist, create it
      const newFolder = parentFolder.createFolder(sheetName);
      Logger.log(`Created new folder: ${sheetName}`);
      return newFolder;
    }
  } catch (error) {
    Logger.log('Error in getOrCreateLevelFolder: ' + error.toString());
    return null;
  }
}

/**
 * Convert base64 image data to a Blob object
 * @param {string} imageData - Base64 image data (e.g., "data:image/jpeg;base64,...")
 * @param {string} fileName - Original file name
 * @returns {Blob} The image blob
 */
function convertBase64ToBlob(imageData, fileName) {
  try {
    // Extract base64 data (remove "data:image/...;base64," prefix)
    const base64String = imageData.split(',')[1];
    
    if (!base64String) {
      Logger.log('Invalid image data format');
      return null;
    }

    // Decode base64 to bytes
    const decodedData = Utilities.base64Decode(base64String);
    
    // Determine MIME type from file name
    let mimeType = 'image/jpeg';
    if (fileName.toLowerCase().endsWith('.png')) {
      mimeType = 'image/png';
    } else if (fileName.toLowerCase().endsWith('.gif')) {
      mimeType = 'image/gif';
    } else if (fileName.toLowerCase().endsWith('.webp')) {
      mimeType = 'image/webp';
    }

    // Create and return blob
    const blob = Utilities.newBlob(decodedData, mimeType, fileName);
    return blob;
  } catch (error) {
    Logger.log('Error in convertBase64ToBlob: ' + error.toString());
    return null;
  }
}

/**
 * Save photo to Google Drive
 * @param {Folder} folder - The Google Drive folder to save to
 * @param {string} studentName - Student name (used for file naming)
 * @param {Blob} blob - The image blob
 * @returns {File} The created file object
 */
function savePhotoToGoogleDrive(folder, studentName, blob) {
  try {
    // Create file with student name
    const fileName = `${studentName}.jpg`;
    const file = folder.createFile(blob);
    file.setName(fileName);
    
    // Make file publicly viewable
    file.setSharing(DriveApp.Access.ANYONE, DriveApp.Permission.VIEW);
    
    Logger.log(`Saved photo: ${fileName}`);
    return file;
  } catch (error) {
    Logger.log('Error in savePhotoToGoogleDrive: ' + error.toString());
    return null;
  }
}

/**
 * Get shareable URL for a Google Drive file
 * @param {File} file - The Google Drive file
 * @returns {string} The shareable URL
 */
function getShareablePhotoUrl(file) {
  try {
    // Get the file ID
    const fileId = file.getId();
    
    // Create a direct view URL
    const photoUrl = `https://lh3.googleusercontent.com/d/${fileId}`;
    
    Logger.log(`Generated photo URL: ${photoUrl}`);
    return photoUrl;
  } catch (error) {
    Logger.log('Error in getShareablePhotoUrl: ' + error.toString());
    return null;
  }
}

/**
 * Update Google Sheet Column H with photo URL
 * @param {string} sheetName - The sheet name (e.g., "Grade 1")
 * @param {string} studentName - Student name to find in the sheet
 * @param {string} photoUrl - The photo URL to store
 * @returns {boolean} True if successful, false if student not found
 */
function updateSheetWithPhoto(sheetName, studentName, photoUrl) {
  try {
    // Open the spreadsheet
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    // Get the specific sheet
    const sheet = spreadsheet.getSheetByName(sheetName);
    
    if (!sheet) {
      Logger.log(`Sheet not found: ${sheetName}`);
      return false;
    }

    // Get all data from the sheet
    const data = sheet.getDataRange().getValues();
    
    // Find the row with the student name (Column B = index 1)
    let studentRow = -1;
    for (let i = 0; i < data.length; i++) {
      if (data[i][1] && data[i][1].toString().trim() === studentName.trim()) {
        studentRow = i + 1; // Convert to 1-based row number
        break;
      }
    }

    if (studentRow === -1) {
      Logger.log(`Student not found: ${studentName} in sheet ${sheetName}`);
      return false;
    }

    // Update Column H (Photo URL) - Column H is index 8 (1-based)
    sheet.getRange(studentRow, 8).setValue(photoUrl);
    
    Logger.log(`Updated ${studentName} in ${sheetName} with photo URL at row ${studentRow}`);
    return true;

  } catch (error) {
    Logger.log('Error in updateSheetWithPhoto: ' + error.toString());
    return false;
  }
}

/**
 * Create error response JSON
 * @param {string} errorMessage - The error message
 * @returns {TextOutput} JSON error response
 */
function createErrorResponse(errorMessage) {
  Logger.log('Error: ' + errorMessage);
  return ContentService.createTextOutput(JSON.stringify({
    success: false,
    error: errorMessage
  })).setMimeType(ContentService.MimeType.JSON);
}

// ════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS FOR TESTING
// ════════════════════════════════════════════════════════════════════

/**
 * Test function to verify script configuration
 * Run this from the Apps Script editor to test
 */
function testConfiguration() {
  Logger.log('=== Configuration Test ===');
  Logger.log('SPREADSHEET_ID: ' + SPREADSHEET_ID);
  Logger.log('PHOTOS_FOLDER_ID: ' + PHOTOS_FOLDER_ID);
  Logger.log('SHEET_NAMES: ' + JSON.stringify(SHEET_NAMES));
  
  if (!PHOTOS_FOLDER_ID) {
    Logger.log('⚠️ WARNING: PHOTOS_FOLDER_ID is not set!');
  } else {
    try {
      const folder = DriveApp.getFolderById(PHOTOS_FOLDER_ID);
      Logger.log('✅ Folder found: ' + folder.getName());
    } catch (e) {
      Logger.log('❌ ERROR: Could not access folder with ID: ' + PHOTOS_FOLDER_ID);
    }
  }
}

/**
 * Get the current script's deployment ID
 * Run this to get the URL for your HTML files
 */
function getDeploymentUrl() {
  const scriptId = ScriptApp.getScriptId();
  Logger.log('Script ID: ' + scriptId);
  Logger.log('After deployment, your URL will be:');
  Logger.log('https://script.google.com/macros/s/' + scriptId + '/exec');
}

/**
 * List all files in the photos folder (for debugging)
 */
function listPhotosFolder() {
  try {
    if (!PHOTOS_FOLDER_ID) {
      Logger.log('PHOTOS_FOLDER_ID not set');
      return;
    }
    
    const folder = DriveApp.getFolderById(PHOTOS_FOLDER_ID);
    Logger.log('=== Photos Folder Contents ===');
    Logger.log('Folder: ' + folder.getName());
    
    const subfolders = folder.getFolders();
    while (subfolders.hasNext()) {
      const subfolder = subfolders.next();
      Logger.log('  📁 ' + subfolder.getName());
      
      const files = subfolder.getFiles();
      while (files.hasNext()) {
        const file = files.next();
        Logger.log('    📄 ' + file.getName());
      }
    }
  } catch (error) {
    Logger.log('Error: ' + error.toString());
  }
}

// ════════════════════════════════════════════════════════════════════
// END OF SCRIPT
// ════════════════════════════════════════════════════════════════════
