//
// constants for the blockchain.
//
// 1. block numbers for each given year (start, end)
//

const UBIQ_BLOCKS = [
  { year: 2020, startBlock: 1060539 },
  { year: 2021, startBlock: 1422327 },
  { year: 2022, startBlock: 1782887 },
];

interface IBlockStartEnd {
  start: number;
  end: number;
}

// returns an object with:
//
// {
//    start = lowest height block to start the year
//    end = highest height block to end the year
// }
export const lookupBlocksForYear = (year: number, chain: string): IBlockStartEnd | undefined => {
  const BLOCKS = chain === "Ubiq" ? UBIQ_BLOCKS : [];

  for (let i = 0; i < BLOCKS.length; i++) {
    if (BLOCKS[i].year === year && i + 1 < BLOCKS.length) {
      return {
        start: BLOCKS[i].startBlock,
        end: BLOCKS[i + 1].startBlock - 1, // go up to the next years start block -1
      };
    }
  }
};
