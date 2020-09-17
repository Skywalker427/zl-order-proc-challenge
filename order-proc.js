"use strict"

const {productInfoEx, restockEx, orderEx} = require("./examples");

//MAX PACKAGE SIZE THAT CAN FIT IN SINGLE SHIPMENT (IN GRAMS)
const MAX_SHIPMENT_MASS_G = 1800;

//HOLDS CURRENT INVENTORY
let inventory;

//HOLDS OUTSTANDING ORDERS
let orders = [];

