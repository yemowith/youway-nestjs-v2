import { Command, CommandRunner } from 'nest-commander'
import { PrismaService } from '../../clients/prisma/prisma.service'
import { Injectable } from '@nestjs/common'
import * as fs from 'fs/promises'

@Injectable()
@Command({
  name: 'db:import',
  description: 'Import data from JSON files to database',
})
export class ImportDbCommand extends CommandRunner {
  private readonly dataDir = './data'
  constructor(private readonly prisma: PrismaService) {
    super()
  }

  private async importDb() {
    // Check if data directory exists
    try {
      await fs.access(this.dataDir)
      console.log(`Found backup directory: ${this.dataDir}`)
    } catch (error) {
      console.error(`Backup directory not found: ${this.dataDir}`)
      throw new Error(
        'Backup directory does not exist. Please run export first.',
      )
    }

    const tables = [
      'User',
      'UserReferral',
      'Admin',
      'Identity',
      'Therapy',
      'TherapySchool',
      'SellerProfile',
      'SellerProfileTherapy',
      'SellerProfileTherapySchool',
      'PaymentMethod',
      'PaymentSetting',
      'Currency',
      'Country',
      'PageCategory',
      'Page',
      'PageMenu',
      'PageMenuItem',
      'Setting',
    ]

    for (const table of tables) {
      try {
        const fileName = `${table}.json`
        const filePath = `${this.dataDir}/${fileName}`

        // Check if file exists
        try {
          await fs.access(filePath)
        } catch (error) {
          console.log(`Skipping ${fileName} - file not found`)
          continue
        }

        // Read and parse JSON data
        const fileContent = await fs.readFile(filePath, 'utf-8')
        const data = JSON.parse(fileContent)

        if (data && data.length > 0) {
          // Clear existing data for this table
          await this.prisma[table].deleteMany()
          console.log(`Cleared existing data from ${table}`)

          // Insert new data
          await this.prisma[table].createMany({
            data: data,
            skipDuplicates: true,
          })
          console.log(`Imported ${data.length} records to ${table}`)
        } else {
          console.log(`No data found in ${fileName}`)
        }
      } catch (error) {
        console.error(`Error importing ${table}:`, error.message)
      }
    }
  }

  async run(): Promise<void> {
    try {
      console.log('Starting database import...')

      await this.importDb()

      console.log('Database import completed successfully')
    } catch (error) {
      console.error('Error during database import:', error)
      throw error
    }
  }
}
