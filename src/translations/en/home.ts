/**
 * Homepage / tools-hub module — every string that belongs to the site's
 * front door, not to any one tool. Merged with the shell in `./index.ts`,
 * the same way each tool module is, so it never touches GST's or
 * Percentage's own dictionaries.
 */
export const home = {
  app: {
    title: "UtilityBazaar",
    tagline: "Simple online tools for everyday calculations.",
  },

  seo: {
    title: "UtilityBazaar — Simple Online Calculators",
    description:
      "Free calculators for everyday tasks, including GST and percentage calculations — fast, private, and available in English and Hindi.",
    ogAlt: "UtilityBazaar",
  },

  tools: {
    heading: "Tools",
    gstDescription:
      "Calculate GST-inclusive and GST-exclusive amounts, with the CGST, SGST or IGST split.",
    percentageDescription:
      "Calculate percentages, find what percentage one number is of another, and work out percentage change.",
  },
};
