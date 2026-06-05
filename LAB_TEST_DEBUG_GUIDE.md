# Lab Test Detail Page - Description & FAQ Fix

## 🔧 Changes Made

### 1. **Enhanced Description Extraction** 
**File:** [LabTestDetailPage.jsx](app/WebsiteComponent/FindLabComponents/FindTestlab/LabTestDetailPage.jsx)

Added more fallback field names for description:
- `product?.raw?.test_description`
- `product?.raw?.details`
- Extended fallback chain for better data extraction

### 2. **Improved FAQ Extraction**
**Files:** 
- [LabTestDetailPage.jsx](app/WebsiteComponent/FindLabComponents/FindTestlab/LabTestDetailPage.jsx)
- [cityApi.js](app/utils/cityApi.js)

**Changes:**
- Added fallback fields: `questions`, `qa`
- Enhanced `normalizeFaqs()` to handle different FAQ object structures:
  - Field name variations: `q/question`, `a/answer`, `content/value`, `title/label`
- Improved filtering logic to check for non-empty questions or answers

### 3. **Better Data Mapping**
**File:** [cityApi.js](app/utils/cityApi.js)

Enhanced `mapApiProduct()` to capture:
- Description alternatives: `test_description`, `testDescription`, `overview`
- FAQ alternatives: `questions`, `qa`
- Added `city` extraction to mapped object

### 4. **Debug Logging**
Added console logging that shows:
```javascript
{
  name: product name,
  hasDescription: boolean,
  descriptionLength: number,
  faqsCount: number,
  raw: raw product data
}
```

**Action:** Open browser console (F12) and check what data is being logged when you visit a lab test detail page.

### 5. **User-Friendly Empty States**
- Shows "No description available for this test" when description is missing
- Shows "FAQs not available for this test" when no FAQs found
- Helps identify if it's a data issue or display issue

---

## 🔍 How to Debug

### Step 1: Check Browser Console
1. Open website and go to any lab test detail page
2. Press `F12` to open Developer Tools
3. Go to "Console" tab
4. Check the logged data structure
5. Verify:
   - Is `descriptionLength` > 0?
   - Is `faqsCount` > 0?
   - What does the `raw` product data contain?

### Step 2: Verify API Response
1. Open Network tab (F12 → Network)
2. Look for the API call: `get_product?city=...`
3. Check the response JSON:
   - Does it have `description` field? 
   - Does it have `faqs` or `faq` field?
   - What are the actual field names?

### Step 3: Check Data in Database
If API returns empty descriptions/FAQs:
- Query your MongoDB/database directly
- Check what's stored for lab tests
- Verify description and FAQ data exists

---

## 🎯 Most Likely Issues & Solutions

### **Issue 1: API Not Returning Data**
**Signs:**
- Console shows `descriptionLength: 0` and `faqsCount: 0`
- Network tab shows empty `description` and `faqs` fields

**Solution:**
- Check your API endpoint and database
- Ensure lab test documents have description and faqs fields
- Update database with sample data

### **Issue 2: Different Field Names in API**
**Signs:**
- Console shows data, but it's in different fields
- E.g., `test_info` instead of `description`

**Solution:**
- Note the actual field name from console log
- Add it to the fallback chain in:
  - `LabTestDetailPage.jsx` (description extraction)
  - `mapApiProduct()` in `cityApi.js`

**Example:**
```javascript
// In cityApi.js mapApiProduct:
description:
  product?.description ||
  product?.test_info ||  // ← Add your field here
  product?.descrption ||
  ...
```

### **Issue 3: FAQs in Different Format**
**Signs:**
- FAQs exist but structure is different (nested objects, arrays within arrays)

**Solution:**
- Check the `raw` data in console
- Update `normalizeFaqs()` to handle that structure
- Add new field name variations to `mapApiProduct()`

### **Issue 4: HTML Rendering Issue**
**Signs:**
- Description shows but appears as raw HTML

**Solution:**
- Already handled by `dangerouslySetInnerHTML`
- Check if HTML entities need decoding

---

## 📋 Testing Checklist

- [ ] Open browser console on lab test detail page
- [ ] Check console logs for product data
- [ ] Verify `descriptionLength > 0` and `faqsCount > 0`
- [ ] Check if description displays
- [ ] Check if FAQs expand/collapse correctly
- [ ] Test with multiple lab tests
- [ ] Test with lab tests that have no description/FAQs

---

## 🚀 Next Steps

1. **Check Console Logs** - See what data structure you're getting
2. **Identify Missing Fields** - Note any fields that should be included
3. **Update Field Mappings** - Add new field names as needed
4. **Verify Database** - Ensure test data has description and FAQs
5. **Remove Debug Logging** - Remove the console log in production

---

## 📝 Code Locations

| Issue | File | Location |
|-------|------|----------|
| FAQ extraction | `LabTestDetailPage.jsx` | Lines ~30-50 |
| Description logic | `LabTestDetailPage.jsx` | Lines ~51-75 |
| Data mapping | `cityApi.js` | `mapApiProduct()` function |
| FAQs normalization | `LabTestDetailPage.jsx` | `normalizeFaqs()` function |
| Console logging | `LabTestDetailPage.jsx` | Inside `useEffect` after FAQ/description computation |

---

**Last Updated:** April 30, 2026
