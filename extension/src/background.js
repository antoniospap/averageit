/**
 * 
 * 
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // GET user history, user tokens
  if (message.type === 'fetchUserHistory') {
    chrome.storage.local.get('authToken', function (data) {
      const authToken = data.authToken;
      fetchDataFromBackend(authToken, message.platform)
        .then(response => {
          sendResponse(response);
        })
        .catch(error => {
          console.error('Error fetching data:', error);
          sendResponse({ error: 'Failed to fetch data' });
        });
    });
    return true;
  }

  if (message.type === 'csvData') {
    chrome.storage.local.get('authToken', function (data) {
      const authToken = data.authToken;
      uploadUserHistory(authToken, message.platform, message.data)
        .then(response => {
          console.log(response);
          sendResponse(response);
        })
        .catch(error => {
          console.error('Error fetching data:', error);
          sendResponse({ error: 'Failed to fetch data' });
        });
    });
    return true;
  }

  

  // POST fetched user tokens to database
  if (message.average) {
    chrome.storage.local.get('authToken', function (data) {
      const authToken = data.authToken;

      const requestData = {
        history: message.average,
        platform: 'kucoin'
      };

      fetch('http://localhost:4000/api/user/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`, // Include the token in the request headers
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json(); // Parse the JSON response
        })
        .then(data => {
          console.log('Data saved successfully:', data);
        })
        .catch(error => {
          console.error('Error saving data:', error);
        });
    });
    return;
  }

  // Send the scraped data to the content script
  if (message.scrapedData) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      console.log(tabs);
      if (tabs[0] !== undefined) {
        chrome.tabs.sendMessage(tabs[0].id, { data: message });
      }
    });
  }

  if (message.type === 'signup') {
    signup(message)
      .then(response => {
        // Send response back to content script
        console.log(response);
        sendResponse(response);
      })
      .catch(error => {
        sendResponse({ success: false, message: error.message });
      });
    // Return true to indicate that sendResponse will be used asynchronously
    return true;
  }

  if (message.type === 'login') {
    login(message)
      .then(response => {
        // Send response back to content script
        console.log(response);
        sendResponse(response);
      })
      .catch(error => {
        sendResponse({ success: false, message: error.message });
      });
    // Return true to indicate that sendResponse will be used asynchronously
    return true;
  }

  if (message.type === 'logout') {
    logout()
      .then(response => {
         sendResponse(response);
      })
      .catch(error => {
        sendResponse({ success: false, message: error.message });
      });
    // Return true to indicate that sendResponse will be used asynchronously
    return true;
  }

});

function signup(data) {
  // Send signup data to server
  return fetch('http://localhost:4000/api/user', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
    .then(response => {
      if (response.ok === true) {
        //getTokenAfterSignupOrLogin();
        return { success: true, message: 'User created successfully' };
      }
      else return { success: false, message: 'Failed to create the user!' };
    })
}

function login(data) {
  // Send signup data to server
  return fetch('http://localhost:4000/api/user/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
    .then(response => {
      if (response.ok === true) {
        //getTokenAfterSignupOrLogin();
        return { success: true, message: 'User logged in successfully' };
      }
      else return { success: false, message: 'Failed to login the user!' };
    })
}

function logout() {
  // Send signup data to server
  return fetch('http://localhost:4000/api/user/logout', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
  })
    .then(response => {
      console.log(response);
      if (response.ok === true) {
        //getTokenAfterSignupOrLogin();
        return { success: true, message: 'User logged out sucessfully' };
      }
      else return { success: false, message: 'Failed to logout the user!' };
    })
}




/**
 * Function to fetch data from the backend with specific parameters
 * @param {*} platform platform data example, kucoin, binance etc
 * @returns response with data
 */
async function fetchDataFromBackend(token, platform) {
  try {
    // Perform the fetch request to your backend API with the appropriate parameters
    const response = await fetch('http://localhost:4000/api/user/upload/get', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Include the token in the request headers
      },
      body: JSON.stringify({ platform })
    });
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }
    return response.json();
  } catch (error) {
    // Handle errors
    console.error('Error fetching data:', error);
    throw error; // Re-throw the error to be caught by the caller
  }
}



async function uploadUserHistory(token, platform, history){
  const requestData = {
    history: history,
    platform: platform
  };
    try {
      // Perform the fetch request to your backend API with the appropriate parameters
      const response = await fetch('http://localhost:4000/api/user/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Include the token in the request headers
        },
        body: JSON.stringify(requestData)
      });
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      return response.json();
    } catch (error) {
      // Handle errors
      console.error('Error fetching data:', error);
      throw error; // Re-throw the error to be caught by the caller
    }
}