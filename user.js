import fs from "fs"
import readline from 'readline'

export const dirUsers = './users'
let logger;

export class User{
  /**
   * Constructor
   * @param {Object} logger 
   */
  constructor(logger){
    this.logger = logger;
    
    // Check whether the user directoy exists or not
    // If not exist, then creat directory
    if (!fs.existsSync(dirUsers)){
      logger.info("--> Create directory users")
      fs.mkdirSync(dirUsers);
    }
  }

  /**
   * Return the file path of the user
   * @param {string} userId 
   * @returns {string} File path
   */
   getUserFilePath(userId){
    return `${dirUsers}/${userId}.txt`
  }


  /**
   * Read user record from file
   * @param {string} userId 
   * @returns {object[]} Array of json
   */
  readUserFile(userId){
    return new Promise(async(resolve, reject)=>{
      if (userId == null || userId == ""){
        reject("Empty user id")
        return
      }

      let list = []
      const filePath = this.getUserFilePath(userId)

      // Read user records
      if (fs.existsSync(filePath)){
        const fileStream = fs.createReadStream(filePath);
        const rl = readline.createInterface({
          input: fileStream,
          crlfDelay: Infinity
        });

        for await (const line of rl) {
          try{
            list.push(JSON.parse(line))
          }catch(e){
            logger.error("Fail to parse json")
            reject(e)
          }
        }
      }
      resolve(list)
    })
  }


  insertRedeemReward(userId, content){
    return new Promise((resolve, reject)=>{
      if (userId == null || userId == ""){
        reject("Empty user id")
        return
      }

      const filePath = this.getUserFilePath(userId)
      if (fs.existsSync(filePath))
        content = "\n" + content
      fs.appendFileSync(filePath, content, function(err) {
        if(err) {
          logger.error(error)
          reject(err)
        }
        resolve(json)
      });
    })
  }

  /**
   * Add redeem reward record to user
   * @param {string} userId 
   * @param {string} oldValue
   * @param {string} newValue
   * @returns 
   */
  updateRedeemReward(userId, oldValue, newValue){
    return new Promise(async(resolve, reject)=>{
      if (userId == null || userId == ""){
        reject("Empty user id")
        return
      }

      const filePath = this.getUserFilePath(userId)
      fs.readFile(filePath, "utf-8", (err, data) => {
        if (err) reject(err)

        let newContent = data.replace(oldValue, newValue)
        fs.writeFileSync(filePath, newContent, (err2) => {
          if(err) {
            logger.error(error)
            reject(err)
          }
          resolve()
        })
      })
    })
  }
}