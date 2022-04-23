import { setDateHourToNoon, convertStringToDate, dateToString, generate7DaysEmptyRewards } from './app.js'

describe("App", () => {
  const redeemedList = [
    {
        "availableAt": "2022-04-16T00:00:00Z",
        "redeemedAt": null,
        "expiresAt": "2022-04-17T00:00:00Z"
    },
    {
        "availableAt": "2022-04-17T00:00:00Z",
        "redeemedAt": null,
        "expiresAt": "2022-04-18T00:00:00Z"
    },
    {
        "availableAt": "2022-04-18T00:00:00Z",
        "redeemedAt": "2022-04-21T14:23:34Z",
        "expiresAt": "2022-04-19T00:00:00Z"
    },
    {
        "availableAt": "2022-04-19T00:00:00Z",
        "redeemedAt": null,
        "expiresAt": "2022-04-20T00:00:00Z"
    },
    {
        "availableAt": "2022-04-20T00:00:00Z",
        "redeemedAt": null,
        "expiresAt": "2022-04-21T00:00:00Z"
    },
    {
        "availableAt": "2022-04-21T00:00:00Z",
        "redeemedAt": null,
        "expiresAt": "2022-04-22T00:00:00Z"
    },
    {
        "availableAt": "2022-04-22T00:00:00Z",
        "redeemedAt": null,
        "expiresAt": "2022-04-23T00:00:00Z"
    }
  ]


  test("Convert string to date", () => {
    let string = "2022-04-20T00:00:00.000Z"
    expect(convertStringToDate(string)).not.toBeNull()
  })

  test("Convert string without time zone to date", () => {
    let string = "2022-04-20"
    expect(convertStringToDate(string)).not.toBeNull()
  })

  test("Convert invalid string to date", () => {
    let string = "abcd"
    expect(convertStringToDate(string)).toBeNull()
  })

  test("Convert date to string", () => {
    let string = "2022-04-20T00:00:00.000Z"
    expect(dateToString(new Date(string))).toBe("2022-04-20T00:00:00Z")
  })

  test("Convert invalid date to string", () => {
    let string = "2022-04-44"
    expect(dateToString(new Date(string))).toBe("")
  })


  test("Generate 7 days reward", () => {
    let string = "2022-04-20T00:00:00.000Z"
    let dateFrom = new Date(string)
    setDateHourToNoon(dateFrom)
    dateFrom.setDate(dateFrom.getDate() - dateFrom.getDay())

    let list = generate7DaysEmptyRewards(new Date(dateFrom.getTime()))
    for (let i = 0; i < 7; i++){
      expect(list[i].availableAt).toBe(dateToString(dateFrom))
      dateFrom.setDate(dateFrom.getDate() + 1)
    }
  })
})