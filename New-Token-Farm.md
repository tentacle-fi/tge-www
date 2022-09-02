## Steps for adding a new farm to the frontend (may not be complete yet)

### Things you'll need:

[] Farming contract address
[] LP pair address
[] Coin logo
[] Individual token addresses for the pair

### Integration Steps

[] Add logo file to `assets/tokens` (128x128 px, png, transparent background)
[] Add logo file to `public/tokens` (128x128 px, png, transparent background)
[] Open `./src/farms/AvailableFarms.ts` and update:
    [] Logo import
    [] Token address export(s)
    [] Farm contract and LP address export(s)
    [] Create IToken const for each new token added
    [] Add new entry into "AvailableFarms" export
        [] Make sure tokens are listed in the appropriate direction
        [] Make sure the farm start time is set properly so the countdown will work
