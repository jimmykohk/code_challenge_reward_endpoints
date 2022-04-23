# Code challenge: Reward endpoints
This project is for code challenge: Rewards endpoints

## Dependencies
- express
- readline
- log4js

## How to run the project
1. npm install
2. node ./

## How to test the project
npm run test

## How does it work
When the service starts, create "user" folder if not exist.

When user redeem the reward, it will update reward records to "<<UserID>>.txt" inside the folder "user" if no redeemed record found.
