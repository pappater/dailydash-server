const fs = require("fs");
import axios from "axios";
import * as cheerio from "cheerio";
import path from "path";

const baseURL = "https://www.nitch.com/posts/?before=";

export const fetchQuotes = async (url: string) => {
  try {
    // Fetch the HTML of the page
    const { data } = await axios.get(url);

    // Load the HTML into cheerio
    const $ = cheerio.load(data);

    // Array to store quotes
    const quotes: Array<{ author: string; quote: string; image: string }> = [];

    // Adjust the selector based on the actual HTML structure
    $("article.post").each((index, element) => {
      const quoteText = $(element).find("p").text().trim();
      const imageSrc = $(element).find("img").attr("src") || "";

      const [author, quote] = quoteText.split("//").map((text) => text.trim());

      quotes.push({
        author: author || "",
        quote: quote || "",
        image: "https://www.nitch.com" + imageSrc,
      });
    });

    console.log("Fetched quotes from:", url);
    console.log("Quotes:", quotes);

    // Append quotes to quotes.json
    fs.appendFileSync("quotes.json", JSON.stringify(quotes, null, 2) + ",\n");

    // Find the "Next" link
    const nextLink = $("footer nav a#next").attr("href");

    if (nextLink) {
      const nextURL = new URL(nextLink, baseURL).toString();
      console.log("Next URL:", nextURL);

      // Fetch the next page
      await fetchQuotes(nextURL);
    } else {
      console.log("No more pages.");
    }
  } catch (error) {
    console.error("Error fetching quotes:", error);
  }
};

export const mergeJson = () => {
  // Resolve the path to the data file
  const dataFilePath = path.resolve(__dirname, "data/quotes.json");

  // Load your JSON data
  const data = JSON.parse(fs.readFileSync(dataFilePath, "utf8"));

  // Check if the data is an array of arrays and merge them
  const mergedArray = [].concat(...data);

  // Write the merged result to a new JSON file
  fs.writeFileSync(
    path.resolve(__dirname, "merged.json"),
    JSON.stringify(mergedArray, null, 2)
  );

  console.log("Merged array saved as merged.json");
};
