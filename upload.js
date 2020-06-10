var admin = require("firebase-admin");
var serviceAccount = require("./a.json");
require('should');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://headstrt-mobile.firebaseio.com"
});
const firestore = admin.firestore();
const path = require("path");
const fs = require("fs");
const directoryPath = path.join(__dirname, "files");

var batches = [];
var counter = 0;
var batchIndex = 0;
batches[batchIndex] = firestore.batch();

fs.readdir(directoryPath, function (err, files) {
    if (err) {
        return console.log("Unable to scan directory: " + err);
    }

    files.forEach(async function (file) {
        let data = require("./files/" + file);
        await data.forEach(async function (obj) {
            if (counter < 500) {
                thisRef = firestore.collection("JobTitle").doc();
                batches[batchIndex].set(thisRef, obj);
                counter = counter + 1;
            } else {
                counter = 0;
                batchIndex = batchIndex + 1;
                batches[batchIndex] = firestore.batch();
                thisRef = firestore.collection("JobTitle").doc();
                batches[batchIndex].set(thisRef, obj);
                counter += 1;
            }
        });
        writeToDb(batches);

    });
});
function oneSecond() {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve('resolved');
        }, 1010);
    });
}
async function writeToDb(arr) {
    console.log("beginning write");
    for (var i = 0; i < arr.length; i++) {
        await oneSecond();
        arr[i].commit().then(function () {
            console.log("wrote batch " + i);
        });
    }
    console.log("done.");
}