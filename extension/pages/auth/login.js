document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');
    const errorElement = document.getElementById('error');


    loginForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // Example validation (you can add more)
        if (!email || !password) {
            errorElement.textContent = 'Please enter username and password';
            return;
        }

        // Send login data to background script
        chrome.runtime.sendMessage({ type: 'login', email, password }, function (response) {
            // Handle the response from the background script
            console.log(response);
            if (response.success) {
                // Do something with the successful response, like redirecting to the dashboard
                window.location.href = './../dashboard./dashboard.html'
            } else {
                // Display error message to the user
                const error = document.getElementById('error');
                error.innerHTML = response.message;
            }
        });
    });

    // Check if the authentication cookie exists
    chrome.cookies.get({ url: 'http://localhost:4000/', name: 'token' }, function (cookie) {
        console.log(cookie);
        console.log(Date.now() / 1000);
        if (cookie && cookie.expirationDate > Date.now() / 1000) {
            console.log('HAS NOT EXPIRED');
            chrome.storage.local.set({ authToken: cookie.value }, function() {
                console.log('Authentication token stored:', cookie.value);
            });
            //window.location.href = './../import/import.html'
            window.location.href = './../dashboard/dashboard.html'
        }
    });
});