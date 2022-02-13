# Release Notes for Tentacle.Finance

## 0.1.0
- initial launch of INK/UBQ Yield Farm, with Tentacle.Finance branding and tweaks

## 1.0.1
- added versioning to build outputs, update `package.json` `version` for next release
- further UI improvements for a link on the Farming page to Shinobi LP addition
- added LP % for staked amount to the Farm page and shortened the displayed digits for easier reading
- small UI visual style improvements
- dev nice-to-have changes
- added UBQ balance to My Walet modal
- React 17 upgrade
- added MUI components library
- forked `use-wallet` repo to modify for react 17 and include UBQ network
- general improvements fixing errors and UI issues
- multi farming support
- web3 wallet helper functionality added to recommend the UBQ network, and add INK token via button click
- forced Dark Mode to always on
- updates to UI nav bar
- fixed bug with harvest, stake, unstake and redeem buttons
- add introduction text to homepage
- add wallet address to wallet button
- react rendering performance upgrades and UI improvements
- block number and timestamp UI updates
- added `SLink` component for internal and external links
- Confirm Modal custom message option enabled
- Performance fixes for react state changes
- Updated gas fees
- Phase 2 farm testing
- Mobile styling updates

## 1.0.2
- reload page on account change
- Address page updates
- Wallet modal fix very small balances
- change "cancel" to "close" in wallet modal
- displayed values for token0/token1 in staked balance accuracy improved
- ubq Price oracle timeframe expanded to reduce potential for missing the latest price

## 1.0.3
- TGE1 Community Farm added
- cleanup
- update block timer to use new 22 second average target
- update oracle block calculations to use new 22 second target

## 1.1.0
- bumping version number to `1.1.0` with a future release incrementing the minor number
- hotfix for gas spending due to EIP-1559

## 1.1.1
- fix for gas prices on donate button(s)

## 1.2.0
- ubq/esch farm added

## 1.3.0
- hotfix for staked token value calculations
- updated TGE1 farm pair name

## 1.4.0
- add farm tier label to the Tentacle farms (tier 1, tier 2, etc...)
- added tooltip to tier label
- adjusted dao info page text (summary)
- build version shown in footer
- links to charts added
- mobile style updates
- Harvest all button to trigger a harvest for each farm with an unharvested balance
- APY is now 0% when contract `isPaused` or current date is after `periodFinish`

#### DAO Info Page
- ecosystemTvl added
- circulating INK added NOTE: Calculates based on harvested INK. IE, unharvested INK is not circulating based on this calculation.
- daily transaction count added
- prices added
- DAO holdings added, including multisig and farm addresses
- add mission statement
- marketcap added
- ToS added to footer

## 1.4.3
- mobile styling of DAO info page
- add ubq weth farm
- show fully diluted marketcap while hovering over marketcap

## Unreleased
nothing at this time
