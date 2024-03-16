function calculateAverages(scrapeContent) {
    const symbolStats = {};
    console.log(scrapeContent);

    scrapeContent.forEach(item => {
        const { symbol, price, amount, total, side, filled } = item;
        if (filled !== "Completed") {
            return;
        }

        /**
         * Exctract prices
         *  amount = amount bought, sometimes it comes as how many tokens (ex 1.45 INJ) and sometimes as total usdt (ex bought 50 USDT)
         *  total = total stock price market on buy/sell
         *  i have to take the currency in the amount into measure, to know if its a token or total usdt and format it as needed. i need the total tokens bought.
         */
        const amountBought = parseFloat(amount.split(' ')[0].replace(/,/g, ''));
        const currency = amount.split(' ')[1];
        const stockPrice = parseFloat(total.split(' ')[0].replace(/,/g, ''));

        let correctedAmount;
        let correctedTotal;

        if (currency === 'USDT') {
            correctedAmount = amountBought / stockPrice;
            correctedTotal = amountBought;
        } else {
            correctedAmount = amountBought;
            correctedTotal = amountBought * stockPrice;
        }

        if (!symbolStats[symbol]) {
            symbolStats[symbol] = {
                totalAmount: 0,
                totalPrice: 0,
                totalCount: 0
            };
        }

        // Update the symbol statistics based on the side of the transaction
        if (side === 'Buy') {
            symbolStats[symbol].totalAmount += correctedAmount;
            symbolStats[symbol].totalPrice += correctedTotal; // Multiply by amount for total price
        } else if (side === 'Sell') {
            symbolStats[symbol].totalAmount -= correctedAmount;
            symbolStats[symbol].totalPrice -= correctedTotal; // Multiply by amount for total price
        }

        symbolStats[symbol].totalCount++;
    });

    /**
     * Calculate Average
     */
    for (const symbol in symbolStats) {
        const stats = symbolStats[symbol];
        stats.totalAmount = isNaN(stats.totalAmount) ? 0 : stats.totalAmount;
        stats.totalPrice = isNaN(stats.totalPrice) ? 0 : stats.totalPrice;
        stats.totalCount = isNaN(stats.totalCount) ? 0 : stats.totalCount;
        // Calculate average price only if totalAmount is not 0
        if (stats.totalAmount > 0.00) {
            stats.averagePrice = stats.totalPrice / stats.totalAmount; // Divide by total amount for average price
        } else {
            stats.averagePrice = 0; // Avoid division by zero
        }
    }

    const sortedSymbolStats = Object.fromEntries(
        Object.entries(symbolStats).sort(([, a], [, b]) => b.totalPrice - a.totalPrice)
    );
    return sortedSymbolStats;
}

// Function to perform the scraping logic
function scrapeKucoinContent() {
    // Select all table rows with class "lrtcss-tjxdah" HISTORY TABLE
    const rows = document.querySelectorAll('tr.lrtcss-tjxdah');
    const scrapedData = [];

    // Iterate over each row
    rows.forEach(row => {
        if (row) {
            // Extract data from specific columns
            const timestamp = row.querySelector('td:nth-child(1)').innerText.trim();
            const symbol = row.querySelector('td:nth-child(2)').innerText.trim();
            const side = row.querySelector('td:nth-child(3)').innerText.trim();
            const orderType = row.querySelector('td:nth-child(4)').innerText.trim();
            const price = row.querySelector('td:nth-child(7)').innerText.trim();
            const amount = row.querySelector('td:nth-child(8)').innerText.trim();
            const total = row.querySelector('td:nth-child(9)').innerText.trim();
            const filled = row.querySelector('td:nth-child(10)').innerText.trim();

            // Create an object for the row and push it to the scrapedData array
            const rowData = {
                timestamp: timestamp,
                symbol: symbol,
                side: side,
                orderType: orderType,
                price: price,
                amount: amount,
                total: total,
                filled: filled
            };

            scrapedData.push(rowData);
        }
    });
    let items = calculateAverages(scrapedData);
    // Send the scraped data to the background script
    if (scrapedData.length > 0) {
        chrome.runtime.sendMessage({ scrapedData: scrapedData, average: items });
    }
}

scrapeKucoinContent();





/**
 * CSV UPLOAD FORMAT TO OBJECT
 */

function parseCSV(csvData) {
    const rows = csvData.split('\n');
    const keys = rows[0].split(',');
    const result = [];

    for (let i = 1; i < rows.length; i++) {
        const values = rows[i].split(',');

        const rowObject = {};
        for (let j = 0; j < keys.length; j++) {
            rowObject[keys[j]] = values[j];
        }

        result.push(rowObject);
    }

    return result;
}

export function processDataKucoin(csvData) {
    let data = parseCSV(csvData);
    const symbolStats = {};
    console.log(data);
    data.forEach(transaction => {
        const { Symbol, Side,  Fee } = transaction;
        const amountBought = transaction["Order Amount"];
        const totalPaid = transaction["Filled Volume"];

        if (Symbol === "USDT" || Symbol === '' || Symbol === undefined) return;

        const amount = parseFloat(amountBought);
        const paid = parseFloat(totalPaid);
        const fee = parseFloat(Fee);

        const total  =  paid + fee;

        if (!symbolStats[Symbol]) {
            symbolStats[Symbol] = {
                totalAmount: 0,
                totalPrice: 0,
                totalCount: 0,
                averagePrice: 0
            };
        }

        symbolStats[Symbol].totalAmount += Side === 'BUY' ? amount : -amount;
        symbolStats[Symbol].totalPrice += Side === 'BUY' ? total: -total;
        symbolStats[Symbol].totalCount++;
        symbolStats[Symbol].averagePrice = symbolStats[Symbol].totalPrice / symbolStats[Symbol].totalAmount;
    });
    return symbolStats;
}