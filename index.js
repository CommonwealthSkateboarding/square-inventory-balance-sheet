var parse = require('csv-parse/lib/sync');
var fs = require('fs');

var maxItemVariations = 77;
var skuKey = 'SKU (do not edit)';
var quantityKey = 'Current Quantity (do not edit)';
var itemIdKey = 'Item ID';
var internalIdKey = 'Internal ID (do not edit)';
var stockItemNameKey = 'Item Name (do not edit)';
var stockItemVariationNameKey = 'Variation Name (do not edit)';
var itemCategoryKey = 'Category';

var items = parse(fs.readFileSync(__dirname+'/data/items.csv'), {delimiter: ',', columns: true});
var stock = parse(fs.readFileSync(__dirname+'/data/stock.csv'), {delimiter: ',', columns: true});

// Generate a map of SKU->Price
var skuMap = {};
for (var i = 0; items.length > i; i += 1) {
  //for (var j = 1; items[i]['Variant '+ j +' - SKU']; j += 1) {
  for (var j = 1; j < maxItemVariations; j += 1) {
    if (items[i]['Variant '+ j +' - SKU'] && !items[i]['Variant '+ j +' - Price']) {
      console.log('No price for SKU: ' + items[i]['Variant '+ j +' - SKU'] + ', Price: ' + items[i]['Variant '+ j +' - Price']);
    } else if (items[i]['Variant '+ j +' - SKU'] && items[i]['Variant '+ j +' - Price']) {
      skuMap[items[i]['Variant '+ j +' - SKU']] = {price: items[i]['Variant '+ j +' - Price'], category: items[i][itemCategoryKey]};
    }
  }
}
var itemsInStock = 0;
var itemsWithNoSku = 0;
var inventoryValue = 0;

var noSku = [];
var categoryTotals = {};

// Iterate over stock CSV to calculate value for each SKU in stock
stock.forEach(function(key, value){
  if (key[quantityKey] > 0) {
    if (!key[skuKey]) {
      itemsWithNoSku++;
      noSku.push(key);
    } else {
      itemsInStock++;
      var totalValue = key[quantityKey] * skuMap[key[skuKey]].price;
      //if (!totalValue) console.log(key[stockItemNameKey] + ' (' + key[stockItemVariationNameKey] +') ' + skuMap[key[skuKey]]);
      inventoryValue += totalValue;
      if (categoryTotals[skuMap[key[skuKey]].category]) {
        categoryTotals[skuMap[key[skuKey]].category] = categoryTotals[skuMap[key[skuKey]].category] + totalValue;
      } else {
        categoryTotals[skuMap[key[skuKey]].category] = totalValue;
      }
      //console.log('Total value of ' + key[quantityKey] + 'x '+ key[stockItemNameKey] + ' ' + key[stockItemVariationNameKey] + ': $' + totalValue);
    }
  }
 });

console.log('Number of SKUs: ' + Object.keys(skuMap).length);
console.log('Items in stock: ' + itemsInStock);
console.log('Items with no SKU: ' + noSku.length);
if (noSku.length) console.log(noSku);
console.log('Total value of all merchandise: $' + inventoryValue);
console.log(categoryTotals);
