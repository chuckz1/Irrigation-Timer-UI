"use strict";

//used to delay initialization function calls till all functions have been declared

//tags collapsible menus so that they can function
setupCollapsibleMenus();

//fills in input box with the value from the dropdown
setBaudRate();

//refreshes and loads ui elements correctly
refreshUI();

//displays if the arduino is connected and if it is in testing mode
updateConnectionStatus();

//displays whether data is being transfered between website and arduino
updateSendingStatus();