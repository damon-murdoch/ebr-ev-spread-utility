// Parse Showdown Export
function parseShowdownExport() {
  // Get the showdown export text area
  const showdownExport = document.getElementById('showdownExport');

  // Get the content from the text area
  const content = showdownExport.value;

  // Parse the showdown sets from the content
  const sets = parseSets(content);

  // Return the sets
  return sets;
}

// Create Item Table
function createItemTable(set, setNo, items, price) {

  // Dereference Species
  const species = set["species"]

  console.log(`Generating table ${setNo} (${species}) ...`)

  // Clear instructions div
  const parent = document.getElementById('instructions');

  // Create a new table for the spread
  const newTable = document.createElement('table');
  newTable.classList.add("table", "table-dark");

  // Create the header for the table
  const tableHeader = document.createElement('thead');

  // Assign table header contents
  tableHeader.innerHTML = `<tr>
<th colspan=${colsPerRow}>
  Spread ${setNo} 
  <span class='text-secondary'>(${species})</span>
</th>
</tr>
<tr>
  <th colspan=${colsPerRow}>
    Items Required
    <span class='text-secondary'>(Total Cost: ¥${price})</span>
  </th>
</tr>
`;

  // Add table header to table
  newTable.appendChild(tableHeader);

  // Create the body for the table
  const tableBody = document.createElement('tbody');
  tableBody.classList.add("text-left");

  // Iterator
  let i = 0;

  // Get all of the item names
  const keys = Object.keys(items);

  // While we have not reached the end of the array
  while (i < keys.length) {
    // Create the table row
    const row = document.createElement('tr');
    // Create 'colsPerRow' columns per row
    for (let j = i + colsPerRow; i < j; i++) {
      // Create the table column
      const col = document.createElement('td');

      // Index is in range
      if (i < keys.length) {

        // Get the item name
        const item = keys[i];

        // Add item, amount to column
        col.innerHTML = `${item} x${items[item]}`;
      }
      else // Index not in range
      {
        // Empty column
        col.innerHTML = `-`;
      }
      // Add column to the row
      row.appendChild(col);
    }
    // Add the row to the body
    tableBody.appendChild(row);
  }

  // ...

  // Add table body to table
  newTable.appendChild(tableBody);

  // Append table to the parent
  parent.appendChild(newTable);
}

// Instructions Generator
function generate() {

  // Clear instructions div
  const parent = document.getElementById('instructions');
  parent.innerHTML = "";

  // Parse the showdown set export
  const sets = parseShowdownExport();

  // Set number
  let setNo = 1;

  // Loop over all of the sets
  for (const set of sets) {

    // Set is not null
    if (set !== null) {

      // Total price for the set
      let price = 2500 + 300; // Bottle Cap + Fresh Start Mochi

      // Items Table
      // Format: 
      // key = item name
      // value = quantity
      const items = {
        // Required to reset existing evs
        "Fresh Start Mochi (Optional)": 1,
        // Required to maximise ivs
        "Bottle Cap": 1,
      }

      // Get the nature from the set
      const nature = set.nature.toLowerCase();

      // Nature is in list of valid natures
      if (nature in natureMint) {
        // Get the nature mint string
        const natureItemName = natureMint[nature]

        // Add the mint to the items
        items[natureItemName] = 1;
      }

      // Get the EVs from the set
      const evs = set.evs;

      // Loop over the evs
      for (const stat in evs) {

        // Get the ev number for the stat
        const value = evs[stat];

        // Get the remainder after applying 'n' big modifiers
        const evSmall = value % evModifierBig;

        // Get the clean number of 'big' modifiers
        const evBig = value - evSmall;

        // Get the number of modifiers required
        const evBigAmount = evBig / evModifierBig;
        const evSmallAmount = evSmall / evModifierSmall;

        // Any 'big' items required
        if (evBigAmount > 0) {
          // Get the name of the item required
          const evBigItem = evIncreaseBig[stat];

          // Add the item, quantity to the list
          items[evBigItem] = evBigAmount;

          // Add item prices to the total
          price += (evIncreaseBigPrice * evBigAmount);
        }

        // Any 'small' items required
        if (evSmallAmount > 0) {
          // Get the name of the item required
          const evSmallItem = evIncreaseSmall[stat];

          // Add the item, quantity to the list
          items[evSmallItem] = evSmallAmount;

          // Add item prices to the total
          price += (evIncreaseSmallPrice * evSmallAmount);
        }
      }

      // Get the IVs from the set
      const ivs = set.ivs;

      // Loop over the ivs
      for (const stat in ivs) {
        // Get the ev number for the stat
        const value = ivs[stat];

        // Value less than 31
        if (value < 31) {
          // If stat is less than 15, and has
          // an iv-zeroing item associated
          if (value < 15 && stat in ivMin) {

            // Get the iv-min item required
            const ivMinItem = ivMin[stat];

            // Add the iv-min item to the list
            items[ivMinItem] = 1;
            price += berryPrice;

            // Non-zero ivs
            if (value > 0) {
              // Add the iv increasing item required
              const ivIncreaseItem = ivIncrease[stat];
              items[ivIncreaseItem] = value;

              // Add item prices to the total
              price += (value * berryPrice);
            }
          }
          else // Value over 15/stat not in iv min
          {
            // Get the number of items required
            const ivReduce = 31 - value;

            // At least one item required
            if (ivReduce > 0) {
              // Get the iv-reducing item required
              const ivReduceItem = ivDecrease[stat];
              items[ivReduceItem] = ivReduce;

              // Add item prices to the total
              price += (ivReduce * berryPrice);
            }
          }
        }
      }

      // Create the item table, increment set number
      createItemTable(set, setNo++, items, price);
    }
  }
} 