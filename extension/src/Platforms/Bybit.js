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
  
  function processData(csvData) {
    let data = parseCSV(csvData);
    console.log(data);
  
    const symbolStats = {};
  
    data.forEach(transaction => {
      const { Currency, Contract, Direction, Quantity,  } = transaction;
      if (Currency === "USDT" || Currency === '')  return;
  
      const amountBought = parseFloat(Quantity);
      const filledPrice = parseFloat(transaction["Filled Price"]);
  
      if (!symbolStats[Contract]) {
        symbolStats[Contract] = {
          totalAmount: 0,
          totalPrice: 0,
          totalCount: 0,
          averagePrice: 0
        };
      }
  
      symbolStats[Contract].totalAmount += Direction === 'BUY' ? amountBought : -amountBought;
      symbolStats[Contract].totalPrice += Direction === 'BUY' ? filledPrice : -filledPrice;
      symbolStats[Contract].totalCount++;
      symbolStats[Contract].averagePrice = symbolStats[Contract].totalPrice / symbolStats[Contract].totalAmount;
    });
    return symbolStats;
  }
  
  export { processData };