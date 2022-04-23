import { User, dirUsers } from './user'
import { dateToString, generate7DaysEmptyRewards } from './app';
import fs from 'fs'

const testAccount = "testAccount";

describe("User", () => {
  let user = null;

  beforeEach(() => {
    user = new User()
  })

  test("Get user file path", () => {
    expect(user.getUserFilePath(testAccount)).toBe(`${dirUsers}/${testAccount}.txt`)
  })
  
  test('Add one redeem record', () => {
    const availableAt = "2022-04-19T00:00:00Z"
    const current = dateToString(new Date())
    const expiresAt = "2022-04-20T00:00:00Z"
    const expectedJson = {
      availableAt: availableAt,
      redeemedAt: current,
      expiresAt: expiresAt
    }
    user.insertRedeemReward(testAccount, JSON.stringify(expectedJson))
      .then(json => {
        expect(json.availableAt).toBe(expectedJson.availableAt)
        expect(json.redeemedAt).toBe(expectedJson.redeemedAt)
        expect(json.expiresAt).toBe(expectedJson.expiresAt)
      })
  })

  test("Update redeem record", () => {
    const availableAt = "2022-04-17T00:00:00Z"
    const redeemedAt = "2022-04-18T14:28:13Z"
    let list = generate7DaysEmptyRewards(new Date(availableAt))
    user.insertRedeemReward(testAccount, JSON.stringify(list))
      .then(json => {
        let oldValue = JSON.parse(JSON.stringify(list[1]))
        list[1].redeemedAt = redeemedAt
        return user.updateRedeemReward(testAccount, oldValue, list[1])
      })
      .then(json => {
        expect(json.redeemedAt).toBe(redeemedAt) 
      })
  })


  afterEach(() => {
    // Remove user file
    let userFilePath = user.getUserFilePath(testAccount);
    if (fs.existsSync(userFilePath)){
      fs.unlinkSync(userFilePath)
    }
  })

})