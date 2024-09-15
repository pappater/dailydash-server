import axios from "axios";
import * as cheerio from "cheerio";
import express, { Request, Response } from "express";
import mongoose from "mongoose";
const fs = require("fs");
const router = express.Router();

// Function to scrape chart data
const scrapeChartData = async (symbol: string): Promise<any> => {
  const url = `https://finance.yahoo.com/quote/${symbol}.NS`;

  try {
    const response = await axios.get(url);
    console.log("Full Axios Response:", response); // Log the full response object

    const { data } = response;
    console.log("HTML Data:", data); // Log the HTML data
    const $ = cheerio.load(data); // Ensure data is passed to cheerio correctly

    const priceElement = $("span[data-reactid='32']").text();
    const price = parseFloat(priceElement.replace(",", ""));

    return {
      symbol,
      price,
    };
  } catch (error) {
    console.error(`Error fetching stock data for ${symbol}:`, error.message);
    throw new Error("Failed to fetch stock data");
  }
};

// Route to get chart data for a symbol
router.get("/chart/:symbol", async (req: Request, res: Response) => {
  const { symbol } = req.params;

  try {
    const chartData = await scrapeChartData(symbol);
    console.log("chartData", chartData);

    res.status(200).json(chartData);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch chart data" });
  }
});

// const baseURL = "https://www.nitch.com/posts/?before=";
// const pages = [
//   1724427573, 1721273434, 1719021043, 1716906161, 1714939514, 1713125153,
//   1711473816, 1710010309, 1708547878, 1707155133, 1706036783, 1704567314,
//   1703011956, 1699907031, 1696975175, 1694037291, 1691876245, 1690404982,
//   1688758681, 1687195051, 1685468467, 1683572981, 1681411950, 1679253366,
//   1677522755, 1675650778, 1674344183, 1673028201, 1671822999, 1670354665,
//   1669042632, 1667744532, 1666369377, 1665086314, 1663539495, 1661971654,
//   1660418439, 1658792389, 1657055937, 1655942424, 1654649463, 1653766358,
//   1652033574, 1650503065, 1649184551, 1647681986, 1646110424, 1644526055,
//   1643324665, 1642369647, 1641263011, 1640379933, 1639574731, 1638557084,
//   1637521979, 1636164763, 1635021810, 1633722217, 1632761223,
// ];

const baseURL = "https://www.nitch.com/posts/?before=";
const pages = [
  // Add the initial page numbers or leave empty if starting fresh
];

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

export default router;
