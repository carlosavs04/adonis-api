import { BaseCommand } from '@adonisjs/core/build/standalone'
const axios = require('axios');
const local = 'http://127.0.0.1:3333/api/v1/escuela/works';

export default class Jobs extends BaseCommand {
  /**
   * Command name is used to run the command
   */
  public static commandName = 'jobs'

  /**
   * Command description is displayed in the "help" output
   */
  public static description = ''

  public static settings = {
    /**
     * Set the following value to true, if you want to load the application
     * before running the command. Don't forget to call `node ace generate:manifest` 
     * afterwards.
     */
    loadApp: false,

    /**
     * Set the following value to true, if you want this command to keep running until
     * you manually decide to exit the process. Don't forget to call 
     * `node ace generate:manifest` afterwards.
     */
    stayAlive: false,
  }

  public async run() {
    await axios.get(local)
  }
}
