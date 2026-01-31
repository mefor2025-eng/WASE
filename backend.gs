// WASE Backend - Google Apps Script
// Deploy this as a Web App:
// 1. Extensions > Apps Script
// 2. Paste this code
// 3. Deploy > New Deployment > Web App > Execute as: Me > Who has access: Anyone

const SPREADSHEET_ID = ""; // Optional: Leave empty to use the active spreadsheet if bound
const SHEET_PRODUCTS = "Products";
const SHEET_ORDERS = "Orders";
const SHEET_USERS = "Users";

function doGet(e) {
  const action = e.parameter.action;
  
  if (action === "getProducts") {
    return getProducts();
  }
  
  return responseJSON({ status: "error", message: "Invalid action" });
}

function doPost(e) {
  if (!e.postData || !e.postData.contents) {
    return responseJSON({ status: "error", message: "No data received" });
  }

  let data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return responseJSON({ status: "error", message: "Invalid JSON" });
  }

  const action = data.action;

  if (action === "signup") {
    return registerUser(data);
  } else if (action === "login") {
    return loginUser(data);
  } else if (action === "placeOrder") {
    return placeOrder(data);
  }

  return responseJSON({ status: "error", message: "Invalid action" });
}

// --- Actions ---

function getProducts() {
  const sheet = getSheet(SHEET_PRODUCTS);
  if (!sheet) return responseJSON({ status: "error", message: "Products sheet not found" });
  
  const data = sheet.getDataRange().getValues();
  const headers = data.shift(); // Remove headers
  
  // Mapping A-R as per requirement
  // A:id, B:name, C:price, D:description, E:category, F:stock
  // G-Q: images, R: video
  
  const products = data.map(row => {
    return {
      id: row[0],
      name: row[1],
      price: row[2],
      description: row[3],
      category: row[4],
      stock: row[5],
      images: [row[6], row[7], row[8], row[9], row[10], row[11], row[12], row[13], row[14], row[15], row[16]].filter(Boolean),
      video: row[17]
    };
  });

  return responseJSON({ status: "success", products: products });
}

function registerUser(data) {
  const sheet = getSheet(SHEET_USERS);
  if (!sheet) return responseJSON({ status: "error", message: "Configuration error" });
  
  const users = sheet.getDataRange().getValues();
  // Check if phone exists (Col B)
  const exists = users.some(row => row[1] == data.phone);
  if (exists) {
    return responseJSON({ status: "error", message: "User already exists" });
  }
  
  const hashedPassword = hash(data.password);
  const newRow = [
    data.name,
    data.phone,
    hashedPassword,
    data.address,
    data.city,
    data.pincode,
    new Date()
  ];
  
  sheet.appendRow(newRow);
  return responseJSON({ 
    status: "success", 
    user: { name: data.name, phone: data.phone, address: data.address, city: data.city, pincode: data.pincode }
  });
}

function loginUser(data) {
  const sheet = getSheet(SHEET_USERS);
  if (!sheet) return responseJSON({ status: "error", message: "Configuration error" });

  const users = sheet.getDataRange().getValues();
  const hashedPassword = hash(data.password);
  
  // Find user by phone (Col B)
  const userRow = users.find(row => row[1] == data.phone);
  
  if (!userRow || userRow[2] !== hashedPassword) {
    return responseJSON({ status: "error", message: "Invalid credentials" });
  }
  
  return responseJSON({
    status: "success",
    user: {
      name: userRow[0],
      phone: userRow[1],
      address: userRow[3],
      city: userRow[4],
      pincode: userRow[5]
    }
  });
}

function placeOrder(data) {
  const sheet = getSheet(SHEET_ORDERS);
  if (!sheet) return responseJSON({ status: "error", message: "Configuration error" });
  
  const orderId = "ORD-" + Date.now();
  const orderRow = [
    orderId,
    data.user_phone,
    data.user_name,
    JSON.stringify(data.items),
    data.total,
    data.address,
    "Pending",
    new Date()
  ];
  
  sheet.appendRow(orderRow);
  return responseJSON({ status: "success", orderId: orderId });
}

// --- Helpers ---

function getSheet(name) {
  const ss = SPREADSHEET_ID ? SpreadsheetApp.openById(SPREADSHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    // Auto-create if not exists
    sheet = ss.insertSheet(name);
    // Add headers if new
    if (name === SHEET_PRODUCTS) {
      sheet.appendRow(["id", "name", "price", "description", "category", "stock", "image1", "image2", "image3", "image4", "image5", "image6", "image7", "image8", "image9", "image10", "image11", "video"]);
    } else if (name === SHEET_USERS) {
      sheet.appendRow(["Full Name", "Phone", "Password Hash", "Address", "City", "Pincode", "Created At"]);
    } else if (name === SHEET_ORDERS) {
      sheet.appendRow(["Order ID", "User Phone", "User Name", "Items (JSON)", "Total", "Address", "Status", "Date"]);
    }
  }
  return sheet;
}

function responseJSON(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function hash(input) {
  const rawHash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, input);
  let txtHash = '';
  for (let i = 0; i < rawHash.length; i++) {
    let hashVal = rawHash[i];
    if (hashVal < 0) {
      hashVal += 256;
    }
    if (hashVal.toString(16).length == 1) {
      txtHash += '0';
    }
    txtHash += hashVal.toString(16);
  }
  return txtHash;
}
