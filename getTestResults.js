var request = require("request");
const cheerio = require("cheerio");
const fs = require("fs");
const Papa = require("papaparse");

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const asyncSeries = (tasks, fn) =>
  tasks.reduce(
    (promiseChain, currentTask) =>
      promiseChain.then(chainResults =>
        fn(currentTask).then(currentResult => [...chainResults, currentResult])
      ),
    Promise.resolve([])
  );

const readFile = (filepath) => {
  return new Promise((resolve, reject) => {
    const file = fs.createReadStream(filepath);
    const csvData = [];
    Papa.parse(file, {
      header: true,
      step: function (result) {
        csvData.push(result.data);
      },
      complete: function (results, file) {
        resolve(csvData);
      },
      error: function () {
        reject("error reading file");
      },
    });
  });
};

const getTestSonuc = (barkod, belgeNo) => {
  var options = {
    method: "POST",
    url: "https://covid-19.gov.ct.tr/",
    headers: {
      "Postman-Token": "b00f50a9-64fa-410a-adfc-db130e33c88d",
      "cache-control": "no-cache",
      Cookie:
        "REPLACE_ME",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    form: {
      barkod: barkod,
      belge_no: belgeNo,
      _token: "REPLACE_ME",
      undefined: undefined,
    },
  };

  request(options, function (error, response, body) {
    const $ = cheerio.load(body);
    console.log("SONUC: ", $(".negatifTestler").text());
  });
};

const sonuclariAl = async () => {
    const calisanlar = await readFile("./calisan_listesi.csv")
    await asyncSeries(calisanlar, async calisan => {
        console.log("CALISAN SONUC", calisan.isim);
        await getTestSonuc(calisan.barkod, calisan.kimlik);
        await sleep(2000);
    })
}
sonuclariAl();