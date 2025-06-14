declare module 'inspirational-quotes' {
  interface Quote {
    text: string;
    author: string;
  }

  const getRandomQuote: () => Quote;

  export { getRandomQuote };
}