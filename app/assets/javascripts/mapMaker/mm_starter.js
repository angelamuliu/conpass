
// Map Maker setup file
// Initializes globals and map maker instance variables
// Should be loaded first

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// CONSTANTS + GLOBALS
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

var TOOLS = {
    RECTANGLE : "rectangle",
    ERASER : "eraser",
    SELECT: "select",
    INFOSELECT: "infoselect"
}

var ACTIONS = { // Used to store action for history
    CREATE : "create",
    UPDATE : "update",
    DELETE : "delete"
}

var TYPES = { // Used to store what object we'll want to use
    MAP : "map",
    TAG : "tag",
    VENDOR : "vendor",
    BOOTH : "booth",
    VENDOR_TAG : "vendor_tag",
    VENDOR_BOOTH : "vendor_booth"
}

// Keycodes and statuses used later to track which keys are being pressed together
var KEYCODES = {CTRL : 17, V : 86, C : 67};
var KEYSTATUS = { CTRL : false, V : false, C : false };

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// MAPMAKER INITIALIZATION AND VARIABLES
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

var MapMaker = {};
var actionHistory = []; // Store create, update action objs in here in order of occurance
var toolContext = {}; // Store information about interactions as needed

MapMaker.selectedTool = TOOLS.SELECT; // Which tool is the user currently using, default is SELECT
MapMaker.transform = { // Store information about transformations to ensure data is saved correctly
    "zoom" : 1 // 100%
};

MapMaker.vendorDict = {}; // {"vendor ID" : vendor name}; Updated and used in vendor tag creation
MapMaker.tagDict = {}; // {"tag ID" : tag name}; Updated and used in vendor tag creation

// Vendors/tags/booths/vendor_tags that haven't been saved to the system are given a temp ID
// stored in the data-id attr of an EL (all start with "t" ex "t1") that allows us to not waste
// effort creating/updating objs that are deleted anyway and more complicated operations
MapMaker.lastVendorId = 0;
MapMaker.lastTagId = 0;
MapMaker.lastBoothId = 0;
MapMaker.lastVendorBoothId = 0;
MapMaker.lastVendorTagId = 0;
