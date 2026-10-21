/** Converts integer number to Indian Rupees in words */
export const numberToWordsINR = (num: number): string => {
  const rounded = Math.round(Math.abs(num));
  if (rounded === 0) return "Rupees Zero Only";

  const a = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  const formatTens = (n: number): string => {
    if (n === 0) return "";
    if (n < 20) return a[n];
    const tens = Math.floor(n / 10);
    const rest = n % 10;
    return `${b[tens]} ${a[rest]}`.trim();
  };

  const formatHundreds = (n: number): string => {
    let str = "";
    if (n >= 100) {
      str += `${a[Math.floor(n / 100)]} Hundred `;
      n %= 100;
    }
    if (n > 0) {
      str += formatTens(n);
    }
    return str.trim();
  };

  let n = rounded;
  let words = "";

  const crore = Math.floor(n / 10000000);
  n %= 10000000;
  if (crore > 0) {
    words += `${formatHundreds(crore)} Crore `;
  }

  const lakh = Math.floor(n / 100000);
  n %= 100000;
  if (lakh > 0) {
    words += `${formatHundreds(lakh)} Lakh `;
  }

  const thousand = Math.floor(n / 1000);
  n %= 1000;
  if (thousand > 0) {
    words += `${formatHundreds(thousand)} Thousand `;
  }

  if (n > 0) {
    words += formatHundreds(n);
  }

  return `Rupees ${words.trim()} Only`;
};
