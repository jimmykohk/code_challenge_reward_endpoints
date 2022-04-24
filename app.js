// Create logger
import log4js from "log4js";
export const logger = log4js.getLogger("Reward endpoints");
logger.level = "debug"

// Import user class
import { User } from "./user.js"
const user = new User(logger)

// Express server
import express from 'express'
const app = express()

// [GET]
// Get the whole week of redeemed reward
// Example /users/1/rewards?at=2020-03-19T12:00:00Z
app.get('/users/:userId/rewards', function(req, res){
  // Check query
  if (req.query.at == null){
    res.status(400).send({ "error": { "message": `Missing paramter 'at'` } })
    return;
  }

  // Validate the date
  let dateAt = convertStringToDate(req.query.at);
  if (dateAt == null){
    res.status(400).send({"error": { "message": "Invalid date" } })
    return;
  }

  let userId = req.params.userId
  let dateList = []
  let dateFrom = new Date(dateAt.getTime())

  // Reset time to UTC 00:00:00
  // and set dateFrom to Sunday
  setDateHourToNoon(dateFrom)
  dateFrom.setDate(dateFrom.getDate() - dateFrom.getDay())

  // Read redeem records from user file
  user.readUserFile(userId)
    .then(list=>{
      let record = list.find(r=>r.availableAt == dateToString(dateFrom))
      if (record != null){
        let day = 0
        do{
          dateList.push({
            "availableAt": record.availableAt,
            "redeemedAt": record.redeemedAt, 
            "expiresAt": record.expiresAt
          })
          dateFrom.setDate(dateFrom.getDate() + 1)  // Set to sunday
          day ++
          record = list.find(r=>r.availableAt == dateToString(dateFrom))
        }while (day < 7)
      }else{
        dateList = generate7DaysEmptyRewards(dateFrom)
        user.insertRedeemRewards(userId, dateList.map(r=>JSON.stringify(r)))
      }
      res.send({"data": dateList })
    })
    .catch(error=>{
      logger.error(error)
      res.status(500).send({"error": { "message": error.toString() } })
    })
});



// [PATCH]
// Redeem user reward
// Example /users/1/rewards/2020-03-18T00:00:00Z/redeem
app.patch("/users/:userId/rewards/:availableAt/redeem", function(req, res){
  let userId = req.params.userId
  let availableAt = convertStringToDate(req.params.availableAt)

  // Validate the date
  if (availableAt == null){
    res.status(400).send({"error": { "message": "Invalid date" } })
    return
  }

  // Set time to noon
  setDateHourToNoon(availableAt)

  // Set variable expire at
  let expiresAt = new Date(availableAt.getTime())
  expiresAt.setDate(expiresAt.getDate() + 1)

  // Current date
  let currentDate = new Date()
  if (expiresAt.getTime() < currentDate.getTime()){
    res.status(400).send({ "error": { "message": "This reward is already expired." } })
    return
  }else if (currentDate.getTime() < availableAt.getTime()){
    res.status(400).send({ "error": { "message": "You cannot redeem the reward from the future day." } })
    return
  }

  user.readUserFile(userId)
    .then(list=>{
      
      let record = list.find(r => r.availableAt == dateToString(availableAt))
      if (record != null){
        if (record.redeemedAt != null)
          throw(`You have already redeemed the reward at ${record.redeemedAt}`)

        let jsonStringRecord = JSON.stringify(record)
        let newRecord = JSON.parse(jsonStringRecord)
        newRecord.redeemedAt = dateToString(currentDate)
        user.updateRedeemReward(
          userId,
          jsonStringRecord,
          JSON.stringify(newRecord)
        )
        return newRecord
      }else{
        let dateFrom = new Date(availableAt.getTime())
        dateFrom.setDate(dateFrom.getDate() - dateFrom.getDay())
        let list = generate7DaysEmptyRewards(dateFrom)
        let record = list.find(r => r.availableAt == dateToString(availableAt))
        record.redeemedAt = dateToString(currentDate)
        user.insertRedeemRewards(userId, list.map(r=>JSON.stringify(r)))
        return record
      }
    })
    .then((json)=>{
      res.send({ "data": json })
    })
    .catch(e=>{
      res.status(400).send({ "error": { "message": e } })
    })
})




/**
 * Set the time of the date to noon
 * @param {object} date 
 * @returns 
 */
export function setDateHourToNoon(date){
  if (!(date instanceof Date)) return null
  date.setUTCHours(0, 0, 0, 0)
}


/**
 * Generate 7 days rewards
 * @param {object} dateFrom 
 * @returns {object[]}
 */
export function generate7DaysEmptyRewards(dateFrom){
  if (!(dateFrom instanceof Date)) return []
  let list = []

  // Set dateTo to the next date of dateFrom
  let dateTo = new Date(dateFrom)
  dateTo.setDate(dateTo.getDate() + 1)
  
  // Loop days start from sunday
  for (let i = 0; i < 7; i++){
    let availableAt = dateToString(dateFrom)
    let expiresAt = dateToString(dateTo)
    let json = {
      "availableAt": availableAt,
      "redeemedAt": null, 
      "expiresAt": expiresAt
    }
    list.push(json)
    dateFrom.setDate(dateFrom.getDate() + 1)  // Set to sunday
    dateTo.setDate(dateTo.getDate() + 1)      // Set to next date
  }
  return list
}


/**
 * Convert string to date
 * If date is valid, return date
 * otherwise, return null
 * @param {string} string 
 * @returns {Date|null}
 */
export function convertStringToDate(string){
  let date = new Date(string)
  return date != "Invalid Date" ? date : null
}


/**
 * Convert date to certain string format
 * @param {object} date 
 * @returns {string}
 */
export function dateToString(date){
  if (!(date instanceof Date) || date == "Invalid Date") return ""
  return date.toISOString().replace(/\.\d{3}/, "")
}

export default app