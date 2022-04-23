# Code challenge: Reward endpoints
This project is for code challenge: Rewards endpoints

## Dependencies
- Express
- readline
- log4js

## How to run the project
1. npm install
2. node ./index.js

## How does it work
When the service starts, create "user" folder if not exist.

When user redeem the reward, it will append one record to the "<<UserID>>.txt" inside the folder "user" if no redeemed record found.
