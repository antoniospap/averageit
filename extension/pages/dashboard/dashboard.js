
document.addEventListener('DOMContentLoaded', function () {
  //tab menu
  const tabButtons = document.querySelectorAll('.tabMenu button');
  tabButtons.forEach(button => {
    button.addEventListener('click', toggleTabMenu);
  });

  document.getElementById('dropdownButton').addEventListener('click', toggleDropdown);

  document.getElementById('import').addEventListener('click', function () {
    window.location.href = './../import/import.html'
  });
});


// Fetch User imported DATA
chrome.runtime.sendMessage({ type: 'fetchUserHistory', platform: 'kucoin' }, function (response) {
  if (response.data) {
    createTable(response.data.history);
  }
});

/*
// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.average) {
    createTable(message.average);
  }
});

*/


// Function to toggle visibility of dropdown menu
function toggleDropdown() {
  const dropdownMenu = document.getElementById('dropdownMenu');
  dropdownMenu.classList.toggle('hidden');

  document.getElementById('logout').addEventListener('click', function () {
    chrome.runtime.sendMessage({ type: 'logout' }, function (response) {
      if (response && response.success === true) {
        window.location.href = './../auth/login.html'
      }
    });
  })
}






/**
 * 
 * 
 * CREATE TABLE STRUCTURE
 * 
 * 
 * 
 */

function createTableCell(data, classList) {
  const cell = document.createElement('td');

  if (data === '') { // For the 'Actions' column
    const btns = document.createElement('div');
    btns.classList.add('flex');

    const editButton = document.createElement('div');
    editButton.innerHTML = '<i class="fas fa-edit"></i>'; // Edit icon
    editButton.classList.add('mr-2', 'px-2', 'py-1', 'bg-blue-500', 'text-white', 'rounded', 'cursor-pointer');
    editButton.addEventListener('click', () => {
      console.log('edit');
    });
    btns.appendChild(editButton);

    const deleteButton = document.createElement('div');
    deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>'; // Delete icon
    deleteButton.classList.add('px-2', 'py-1', 'bg-red-500', 'text-white', 'rounded', 'cursor-pointer');
    deleteButton.addEventListener('click', () => {
      console.log('delete');
    });
    btns.appendChild(deleteButton);

    cell.appendChild(btns);
  } else {
    cell.textContent = data;
  }
  cell.classList.add(...classList);
  return cell;
}

function createTable(displayData) {
  console.log(displayData);
  const container = document.getElementById('result');
  const table = document.createElement('table');
  table.classList.add('table', 'border', 'border-collapse', 'w-full');

  const headerRow = table.insertRow();
  const headers = ['Token', 'Holdings', 'Total Price', 'txs', 'Avg', 'Actions'];
  headers.forEach(headerText => {
    const headerCell = document.createElement('th');
    headerCell.textContent = headerText;
    headerCell.classList.add('border', 'px-4', 'py-2', 'text-left');
    headerRow.appendChild(headerCell);
  });

  for (const symbol in displayData) {
    if (Object.hasOwnProperty.call(displayData, symbol)) {
      const rowData = displayData[symbol];

      const row = document.createElement('tr');
      const cells = [
        symbol,
        rowData.totalAmount.toFixed(2),
        rowData.totalPrice.toFixed(2),
        rowData.totalCount,
        rowData.averagePrice?.toFixed(5) || 0,
        '' // Placeholder for the 'Actions' column
      ];
      const classLists = [
        ['border', 'px-4', 'py-2', 'text-left'],
        ['border', 'px-4', 'py-2', 'text-left'],
        ['border', 'px-4', 'py-2', 'text-left'],
        ['border', 'px-4', 'py-2', 'text-left'],
        ['border', 'px-4', 'py-2', 'text-left'],
        ['border', 'px-4', 'py-2', 'text-left'] // For the 'Actions' column
      ];
      cells.forEach((data, index) => {
        row.appendChild(createTableCell(data, classLists[index]));
      });
      table.appendChild(row);
    }
  }

  container.innerHTML = ''; // Clear previous content
  container.appendChild(table);
}







/**
 * Tab menu for table
 * @param {*} tabIndex 
 */
function toggleTabMenu(event) {
  const tabButtons = document.querySelectorAll('.tabMenu button');
  tabButtons.forEach(button => {
    if (button !== event.target) {
      button.classList.remove('selected-tab');
    }
  });

  // Add background color class to the clicked button
  event.target.classList.add('selected-tab');
}