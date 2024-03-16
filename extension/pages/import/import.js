import { processData } from '../../src/Platforms/Bybit.js';
import { processDataKucoin } from '../../src/Platforms/Kucoin.js';

document.addEventListener('DOMContentLoaded', function () {
  const kucoinButton = document.getElementById('kucoinBTN');
  const bybitButton = document.getElementById('bybitBTN');
  const binanceButton = document.getElementById('binanceBTN');


  kucoinButton.addEventListener('click', function (e) {
    toggleTabMenu(e)
  });
  bybitButton.addEventListener('click', function (e) {
    toggleTabMenu(e)
  });

  document.getElementById('directionText').addEventListener('click', function (e) {
    const data = e.target.getAttribute('data');
    if (data !== null) {
      if (data === "kucoin") {
        chrome.tabs.create({ url: 'https://www.kucoin.com/order/trade/history?pageSize=500&currentPage=1' });
      }
      if (data === "binance") {

      }
      if (data === "bybit") {
        chrome.tabs.create({ url: 'https://www.bybit.com/trade/usdc/assets/unifiedtranslog' });
      }
    }
  });

  document.getElementById('fetchDataBtn').addEventListener('click', function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      var activeTab = tabs[0];
      chrome.scripting.executeScript({
        target: { tabId: activeTab.id },
        files: ['src/Platforms/Kucoin.js']
      });
    });
  });
  document.getElementById('dropdownButton').addEventListener('click', toggleDropdown);

  //CSV upload
  document.getElementById('fileInput').addEventListener('change', handleFileSelect);

  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const currentUrl = tabs[0].url;
  });

});


/**
 * UPLOAD CSV DATA
 */

function handleFileSelect(event) {
  const selectedButton = document.getElementsByClassName('selected-button')[0]
  const platform = selectedButton.getAttribute('data-target');
  const hideSmallValues = document.getElementById('hide').checked;

  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const csvData = e.target.result;
      let processedData;

      // Parse the CSV data and process it
      if (platform === 'kucoin') {
        processedData = processDataKucoin(csvData);
        console.log(processedData);
      }
      if (platform === 'bybit') {
        processedData = processData(csvData);
      }

      // Filter out bad data with  values less than 0
      let filteredData = Object.fromEntries(
        Object.entries(processedData)
        .filter(([key, value]) => value.totalAmount > 0 && value.totalPrice > 0)
        );

        //Filter out less than 20 if checkbox checked
      if (hideSmallValues){
        filteredData = Object.fromEntries(
          Object.entries(filteredData)
          .filter(([key, value]) => value.totalPrice > 20)
          );
      }
      if (filteredData) {
        // Send the processed data to the background script using messaging API
        chrome.runtime.sendMessage({
          type: 'csvData',
          data: filteredData,
          platform: platform
        });
      }
    };
    reader.readAsText(file);
  }
}

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
 * Tab menu for table
 * @param {*} tabIndex 
 */
function toggleTabMenu(event) {
  const button = event.target.closest('button');
  console.log(button);
  if (button) {
    const buttonId = button.id
    let desc = '';
    let platform = '';

    switch (buttonId) {
      case 'kucoinBTN':
        desc = 'Visit Kucoin</div> to extract your historical transactions!';
        platform = 'kucoin';
        break;
      case 'binanceBTN':
        desc = 'Description for Button 2';
        platform = 'binance';
        break;
      case 'bybitBTN':
        desc = 'Description for Button 3';
        platform = 'bybit';
        break;
      default:
        desc = 'No description available';
        break;
    }
    document.getElementById('directionText').innerHTML = desc;
    document.getElementById('directionText').setAttribute('data', platform);

    const tabButtons = document.querySelectorAll('#navigation button');
    tabButtons.forEach(btn => {
      if (btn !== button) {
        btn.classList.remove('selected-button');
        btn.classList.add('not-selected-button');
      }
    });
    renderOptionsOnSelect(button);
    // Add background color class to the clicked button
    button.classList.remove('not-selected-button');
    button.classList.add('selected-button');
  }
}

function renderOptionsOnSelect(button) {
  const fetchDataBtn = document.getElementById('fetchDataBtn');
  const fetchDataFile = document.getElementById('fetchDataFile');
  const optionsContainer = document.getElementById('optionsContainer');

  switch (button.id) {
    case 'kucoinBTN':
      optionsContainer.style.display = 'flex'
      fetchDataBtn.style.display = 'block';
      fetchDataFile.style.display = 'block';
      break;
    case 'binanceBTN':
      optionsContainer.style.display = 'flex'
      fetchDataBtn.style.display = 'none';
      fetchDataFile.style.display = 'none';
    case 'bybitBTN':
      optionsContainer.style.display = 'flex'
      fetchDataBtn.style.display = 'none';
      fetchDataFile.style.display = 'block';
      break;
    default:
      optionsContainer.style.display = 'none'
  }
}