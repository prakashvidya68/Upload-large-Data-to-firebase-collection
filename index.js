var admin = require("firebase-admin");

var serviceAccount = require("./test.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://recipe-d88f2.firebaseio.com"
});

const firestore = admin.firestore();
const path = require("path");
const fs = require("fs");
const directoryPath = path.join(__dirname, "files");

var batches = [];
var oprationCounter = 0;
var batchIndex = 0;
batches[batchIndex] = firestore.batch();

fs.readdir(directoryPath, function (err, files) {
  if (err) {
    return console.log("Unable to scan directory: " + err);
  }

  files.forEach(async function (file) {
    let data = require("./files/" + file);
    await data.forEach(async function (obj) {
      let docRef = firestore.collection("expertise").doc();
      await batches[batchIndex].set(docRef, obj);
      oprationCounter++;
      // console.log(oprationCounter);
      if (oprationCounter === 495) {
        oprationCounter = 0;
        batchIndex += 1;
        batches[batchIndex] = firestore.batch();
      }
    });
    await writeToDb(batches);
    return;
    // batches.forEach(async (batch, index) => {
    //   console.log(index);
    // });
  });
  return;
});
function oneSecond() {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve('resolved');
    }, 3010);
  });
}

async function writeToDb(arr) {
  console.log("beginning write");
  arr.forEach(async (element, index) => {
    await element.commit();
    console.log("wrote batch " + index);
    await oneSecond();
  });
  console.log("done.");
}