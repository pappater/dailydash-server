import express, { Request, Response } from "express";
import axios from "axios";

const router = express.Router();

const API_KEY = process.env.HUGGING_FACE;
const API_URL = "https://api-inference.huggingface.co/models/gpt2";

// Endpoint to get the gold rate
router.post("/text-gen", async (req: Request, res: Response) => {
  const { prompt } = req.body;

  try {
    const response = await axios.post(
      API_URL,
      { inputs: prompt },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Process and log the response
    console.log("Response data:", response.data);

    // Return only the relevant part of the response
    res.status(200).json({
      generatedText: response.data[0]?.generated_text || "No result",
      message: "Text fetched successfully using AI",
    });
  } catch (error) {
    // Extract and log error details
    const errorMessage = error?.response
      ? error?.response.data
      : error?.message;
    console.error("Error generating text:", errorMessage);

    res.status(500).json({
      message: "Error generating text",
      details: errorMessage,
    });
  }
});

export default router;
