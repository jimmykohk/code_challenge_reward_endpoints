import request from "supertest"
import app, { dateToString, setDateHourToNoon } from "./app.js"
import fs from "fs"
import { User } from "./user.js"

const testAccount = "testAccount"

describe("GET user reward", () => {
  test("should response 200 status code", async () => {
    let testDate = "2022-04-19T14:45:02Z"
    let url = `/users/${testAccount}/rewards?at=${testDate}`
    const response = await request(app).get(url)
    expect(response.statusCode).toBe(200)
    
    let body = response.body
    expect(body.data).not.toBeNull()

    let data = body.data
    expect(data.length).toBe(7)

    expect(data[0].availableAt).toBe("2022-04-17T00:00:00Z")
    expect(data[0].expiresAt).toBe("2022-04-18T00:00:00Z")

    testDate = new Date(testDate)
    testDate.setUTCHours(0,0,0,0)
    let testDateFrom = new Date(testDate.getTime())
    testDateFrom.setDate(testDateFrom.getDate() - testDateFrom.getDay())
    let testDateTo = new Date(testDateFrom.getTime())
    testDateTo.setDate(testDateTo.getDate() + 1)

    for (let i = 0; i < 7; i++){
      expect(data[i].availableAt).toBe(dateToString(testDateFrom))
      expect(data[i].expiresAt).toBe(dateToString(testDateTo))

      testDateFrom.setDate(testDateFrom.getDate() + 1)
      testDateTo.setDate(testDateTo.getDate() + 1)
    }
  })

  test("Invalid date", async () => {
    let testDate = "20220417"
    let url = `/users/${testAccount}/rewards?at=${testDate}`
    const response = await request(app).get(url)
    expect(response.statusCode).toBe(400)
  })

  test("Invalid input", async () => {
    let testDate = "abcd"
    let url = `/users/${testAccount}/rewards?at=${testDate}`
    const response = await request(app).get(url)
    // console.log(response.body)
    expect(response.statusCode).toBe(400)
  })
})





describe("Redeem reward", () => {
  test("should response 200 status code", async () => {
    let testDate = new Date()
    let url = `/users/${testAccount}/rewards/${dateToString(testDate)}/redeem`
    const response = await request(app).patch(url)
    expect(response.statusCode).toBe(200)

    // Set testDate to noon
    testDate.setUTCHours(0, 0, 0, 0)
    let nextDate = new Date(testDate.getTime())
    nextDate.setDate(nextDate.getDate() + 1)

    let body = response.body
    expect(response.data).not.toBeNull()
    let data = body.data
    expect(data.availableAt).not.toBeNull()
    expect(data.redeemedAt).not.toBeNull()
    expect(data.expiresAt).not.toBeNull()
    expect(data.availableAt).toBe(dateToString(testDate))
    expect(data.expiresAt).toBe(dateToString(nextDate))
  })

  test("Insert day before today", async () => {
    let testDate = new Date()
    setDateHourToNoon(testDate)
    testDate.setDate(testDate.getDate() - 1)

    let url = `/users/${testAccount}/rewards/${dateToString(testDate)}/redeem`
    const response = await request(app).patch(url)
    expect(response.statusCode).toBe(400)
    let body = response.body
    expect(body.error).not.toBeNull()
    let error = body.error
    expect(error.message).not.toBeNull()
    expect(error.message).toBe("This reward is already expired.")
  })


  test("Insert day after today", async () => {
    let testDate = new Date()
    setDateHourToNoon(testDate)
    testDate.setDate(testDate.getDate() + 1)

    let url = `/users/${testAccount}/rewards/${dateToString(testDate)}/redeem`
    const response = await request(app).patch(url)
    expect(response.statusCode).toBe(400)
    let body = response.body
    expect(body.error).not.toBeNull()
    let error = body.error
    expect(error.message).not.toBeNull()
    expect(error.message).toBe("You cannot redeem the reward from the future day.")
  })


  test("Insert duplicate rewards", async () => {
    let testDate = dateToString(new Date())
    let url = `/users/${testAccount}/rewards/${testDate}/redeem`
    let response = await request(app).patch(url)
    expect(response.statusCode).toBe(200)

    response = await request(app).patch(url)
    expect(response.statusCode).toBe(400)
  })


  test("Invalid date", async () => {
    let testDate = "2022-02-33"
    let url = `/users/${testAccount}/rewards/${testDate}/redeem`
    let response = await request(app).patch(url)
    expect(response.statusCode).toBe(400)
  })

  
  test("Invalid date 2", async () => {
    let testDate = "2022-02-ac"
    let url = `/users/${testAccount}/rewards/${testDate}/redeem`
    let response = await request(app).patch(url)
    expect(response.statusCode).toBe(400)
  })

  
  afterEach(() => {
    const user = new User()
    let userFilePath = user.getUserFilePath(testAccount);
    if (fs.existsSync(userFilePath)){
      fs.unlinkSync(userFilePath)
    }
  })
})