// Import library
const cheerio = require("cheerio");
const axios = require("axios");
const express = require("express");

const PORT = 8000;

// Define Variabel
const app = express();
const url = "https://nu.or.id/tokoh";
const baseUrl = "https://nu.or.id";
const tokoh_data = [];
// Routes
app.get("/", (req, res) => {
  res.json("Unofficially API from nu.or.id");
});

app.get("/tokoh", (req, response) => {
  // Function get Title
  async function getTitle(url) {
    try {
      // Get Data
      const res = await axios.get(url);
      const $ = cheerio.load(res.data);

      // Get From tag article
      const tokoh = $("article");
      tokoh.each(function () {
        const title = $(this)
          .find(".post-list-med__entry-title")
          .text()
          .trim(/\r?\n|\r/, "");

        // Cek title apakah kosong/engga
        if (title != "") {
          const link = $(this)
            .find(".post-list-med__entry-title a")
            .attr("href");
          const img = $(this).find("img").attr("src");
          const date_upload = $(this).find(".entry__meta span").last().text();
          const slug = link.substring(link.indexOf("/") + 21);
          tokoh_data.push({
            title,
            link,
            img,
            date_upload,
            slug,
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
        return response.status(200).json({
          status: "ok",
          totalResults: Object.keys(tokoh_data).length,
          data: tokoh_data,
        });
      }
    } catch (error) {
      console.log("Get title have an error", error);
      response.status(500).json({ error: error.message || err.toString() });
      return;
    }
  }
  getTitle(url);
});

app.get("/tokoh/:slug", async (req, res) => {
  const slug = req.params.slug;
  const spec_url = url + "/" + slug;
  // Function get Body
  axios
    .get(spec_url)
    .then((response) => {
      const $ = cheerio.load(response.data);
      const body = $("article");

      const title = $(".single-post__entry-title")
        .text()
        .trim(/\r?\n|\r/, "");

      const date_upload = $(".entry__meta-date")
        .first()
        .text()
        .trim(/\r?\n|\r/, "");

      const author = $(".entry__meta-author")
        .text()
        .trim(/<p><br[\/]?><[\/]?p>/g, "");

      let content_data = "";

      body.each(function () {
        const data = $(this)
          .find(".post-read")
          .first()
          .text()
          .trim(/<p><br[\/]?><[\/]?p>/g, "");
        if (data != "") {
          content_data = data;
        }
      });
      return res.status(200).json({
        status: "ok",
        data: {
          title: title,
          date_upload: date_upload,
          author: author,
          content: content_data,
        },
      });
    })
    .catch((err) => {
      res.status(500).json({ error: err.message || err.toString() });
      return;
    });
});
app.listen(PORT, () => console.log(`Server Running on PORT ${PORT}`));
