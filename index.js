// Import library
const cheerio = require("cheerio");
const axios = require("axios");
const j2cp = require("json2csv").Parser;
const fs = require("fs");

// Define Variabel
const url = "https://nu.or.id/tokoh";
const baseUrl = "https://nu.or.id";
const tokoh_data = [];

async function getTitle(url) {
  try {
    // Get Data
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    // Get From tag article
    const tokoh = $("article");
    tokoh.each(function () {
      title = $(this)
        .find(".post-list-med__entry-title")
        .text()
        .trim(/\r?\n|\r/, "");

      // Cek title apakah kosong/engga
      if (title != "") {
        link = $(this).find(".post-list-med__entry-title a").attr("href");
        img = $(this).find("img").attr("src");
        date_upload = $(this).find(".entry__meta span").last().text();
        tokoh_data.push({
          title,
          link,
          img,
          date_upload,
        });
      }
    });

    // Next page
    if (
      $(".widget-content .text-center a").length > 0 &&
      $(".widget-content .text-center a").last().attr("href") != "/tokoh/1"
    ) {
      next_page =
        baseUrl + $(".widget-content .text-center a").last().attr("href");
      getTitle(next_page);
    } else {
      // Parsing data to csv
      const parser = new j2cp();
      const csv = parser.parse(tokoh_data);
      fs.writeFileSync("./tokoh.csv", csv);
      console.log("berhasil");
    }
    // console.log(tokoh_data);
  } catch (error) {
    console.log(error);
  }
}

getTitle(url);
