import { Command, CommandRunner } from 'nest-commander';
import { PrismaService } from '../../clients/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { AvailabilityService } from 'src/modules/seller/availability/availability.service';
import { LocationService } from 'src/modules/user/location/location.service';
import { AvailabilitySetupService } from 'src/modules/seller/availability/availability-setup.service';
import { PackagesService } from 'src/modules/seller/packages/packages.service';

@Injectable()
@Command({
  name: 'db:appointments',
  description: 'Seed the database with initial appointments',
})
export class AppointmentsCommand extends CommandRunner {
  constructor(
    private readonly prisma: PrismaService,
    private readonly availabilityService: AvailabilityService,
    private readonly availabilitySetupService: AvailabilitySetupService,
    private readonly locationService: LocationService,
    private readonly packagesService: PackagesService,
  ) {
    super();
  }

  private async setupAvailabilities() {
    const sellers = await this.prisma.sellerProfile.findMany();
    for (const seller of sellers) {
      await this.availabilitySetupService.setupSellerAvailability(
        seller.userId,
      );
    }
  }

  private async setupLocationForSellers() {
    const sellers = await this.prisma.sellerProfile.findMany();
    for (const seller of sellers) {
      await this.locationService.createLocation(seller.userId, {
        countryCode: 'TR',
      });
    }
  }

  private async setupPackagesForSellers() {
    const sellers = await this.prisma.sellerProfile.findMany();
    for (const seller of sellers) {
      await this.packagesService.setupSellerPackages(seller.userId);
    }
  }

  /**
   * Runner
   */
  async run(): Promise<void> {
    try {
      console.log('Starting database appointments setup...');
      //await this.setupAvailabilities();
      //  await this.setupLocationForSellers();
      await this.setupPackagesForSellers();
      console.log('Database appointments setup completed successfully');
    } catch (error) {
      console.error('Error during database seeding:', error);
      throw error;
    }
  }
}
