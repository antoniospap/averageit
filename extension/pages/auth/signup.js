document.addEventListener('DOMContentLoaded', function () {
    const signupFom = document.getElementById('signupFom');
    const errorElement = document.getElementById('error');

    signupFom.addEventListener('submit', function (event) {
        event.preventDefault();

        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // Example validation (you can add more)
        if (!username || !password) {
            errorElement.textContent = 'Please enter username and password';
            return;
        }

        
        // Send login data to background script
        chrome.runtime.sendMessage({ type: 'signup', username, email, password }, function (response) {
            // Handle the response from the background script
            if (response.success) {
                // Do something with the successful response, like redirecting to the dashboard
                fetch(chrome.runtime.getURL('pages/dashboard/dashboard.html'))
                    .then(response => response.text())
                    .then(html => {
                        // Replace the content of the popup with the dashboard HTML
                        document.body.innerHTML = html;
                    })
                    .catch(error => {
                        console.error('Error loading dashboard:', error.message);
                    });
            } else {
                // Display error message to the user
                const error = document.getElementById('error');
                error.innerHTML = response.message;
            }
        });
    });
});