"use strict"


const {productInfoEx, restockEx, orderEx} = require("./examples");


//MAX PACKAGE SIZE THAT CAN FIT IN SINGLE SHIPMENT (IN GRAMS)
const MAX_SHIPMENT_MASS_G = 1800;

//HOLDS CURRENT INVENTORY
let inventory;

//HOLDS OUTSTANDING ORDERS
let orders = [];


//INITIALIZE CATALOG AND SET PRODUCT QUANTITIES TO ZERO
let initCatalog = (productInfo) => {
    console.log("INITIALIZING CATALOG...\n")
    productInfo
        .forEach(product =>
            product.quantity = 0);
    return productInfo;
}


//SHIP PACKAGE
let shipPackage = (shipment) => {
    console.log("SHIPPING PACKAGE...");
    console.log(shipment);
}


//PROCESS ORDER
let processOrder = (order) => {
	console.log("PROCESSING ORDER...\n");
    let shipments = [];
    //IF CALLED WITH NEW ORDER, ADD IT TO OUTSTANDING ORDERS
    if(!Array.isArray(order)){
        orders.push(order);
    }

    orders.forEach(ord => {
        let shipInd = 0;
		
        ord.requested.forEach(request => {
           //GRAB THE INDEX OF REQUESTED ITEM FROM INVENTORY
           let invIndex = inventory.findIndex(iProduct => request.product_id === iProduct.product_id);

           let processed = false;
           while(!processed){

               //BREAK IF PRODUCT IS NOT IN INVENTORY STOCK
               if(inventory[invIndex].quantity === 0)
               {
                   break;
               }
               else{

                   //CREATE SHIPMENT FOR ORDER. IF THERE'S AN EXISTING SHIPMENT, ADD CURRENT PRODUCT IF IT'S NOT ADDED YET
                   if(!shipments[shipInd]){
                       shipments.push({ order_id: ord.order_id, shipped: [{product_id: inventory[invIndex].product_id, quantity: 0}]})
                   }else if(!shipments[shipInd].shipped.find(shipped => shipped.product_id == inventory[invIndex].product_id)){
                       shipments[shipInd].shipped.push({product_id: inventory[invIndex].product_id, quantity: 0})
                   }

                   let currentProductMass = inventory[invIndex].mass_g;
                   let currentShipmentMass = (shipments[shipInd].shipped.quantity || 0) * currentProductMass;

                   /*ADD PRODUCTS TO CURRENT SHIPMENT WHILES THERES AN OUTSTANDING ORDER, 
                   INVENTORY AND WEIGHT OF SHIPMENT IS NOT EXCEEDED BY OPERATION*/
                   while((currentShipmentMass + currentProductMass < MAX_SHIPMENT_MASS_G) & 
                   (inventory[invIndex].quantity > 0) & 
                   (request.quantity > 0)){
                       shipments[shipInd].shipped[shipments[shipInd].shipped.length - 1].quantity += 1;
                       currentShipmentMass += currentProductMass;
                       request.quantity--;
                       inventory[invIndex].quantity--;
                   }
                   
                   //IF WEIGHT OF SHIPMENT IS EXCEEDED, INCREMENT SHIPMENT INDEX
                   if(currentShipmentMass + currentProductMass > MAX_SHIPMENT_MASS_G){
                       shipInd++;
                   }
               }

               //IF INVENTORY FOR PRODUCT IS DEPLETED OR ORDER QUANTITY MET, BREAK 
			    if((inventory[invIndex].quantity == 0) || (request.quantity == 0)){
                       processed = true;
                   }
           }
        })
        
    })

    //SHIP PROCESSED ORDERS
    for(let shipment of shipments){
        shipPackage(shipment);
        console.log();
    }

     //CLEAR COMPLETED ORDERS FROM OUTSTANDING ORDER LIST
   for(let i = 0; i < orders.length; i++){
    let j = orders[i].requested.length;
    while(j--){
        if(orders[i].requested[j].quantity == 0)
        {
          orders[i].requested.splice(j,1);
        }
    }
     if (orders[i].requested.length == 0){
         orders.splice(i,1);
     }
 }
}


//UPDATE INVENTORY TO REFLECT INCOMING STOCK AND PROCESS OUTSTANDING ORDERS 
let processRestock = (restock) => {
    console.log("RESTOCKING INVENTORY...\n");
    inventory.forEach(iProduct => {
        let restockInfo = restock.find(rProduct => rProduct.product_id === iProduct.product_id);
        iProduct.quantity += restockInfo.quantity;
    })
    processOrder(orderEx);
}



//MAIN PROGRAM
//INITIALIZE CATALOG WITH EXAMPLE DATA
inventory = initCatalog(productInfoEx);

//PROCESS RESTOCK AND CALL processOrder. processOrder() calls shipPackage()
inventory = processRestock(restockEx);