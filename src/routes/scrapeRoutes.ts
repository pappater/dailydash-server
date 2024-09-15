import axios from "axios";
import * as cheerio from "cheerio";
import express, { Request, Response } from "express";
import mongoose from "mongoose";
import path from "path";
const quotesFilePath = path.join(__dirname, "../data/quotes.json");

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

const getQuotes = () => {
  const data = fs.readFileSync(quotesFilePath, "utf-8");
  const quotesArray = JSON.parse(data);
  // Flatten the multidimensional array
  const allQuotes = quotesArray.flat();
  return allQuotes;
};

// Get the total length of the quotes
const totalQuotes = getQuotes().length;
console.log("Total number of quotes:", totalQuotes); // Print the total length

// Route to get a random quote
router.get("/randomQuote", (req: Request, res: Response) => {
  const allQuotes = getQuotes();
  const randomIndex = Math.floor(Math.random() * totalQuotes);
  const randomQuote = allQuotes[randomIndex];
  res.json(randomQuote);
});

export default router;
