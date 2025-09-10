import { Command, CommandRunner } from 'nest-commander';

import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/clients/prisma/prisma.service';
import { DatetimeService } from 'src/helpers/datetime/datetime.service';
import { AvailabilityService } from 'src/modules/seller/availability/availability.service';
import { AppointmentService } from 'src/modules/seller/appointment/appointment.service';
import { CommissionService } from 'src/modules/accounting/commission/commission.service';
import { AccountingService } from 'src/modules/accounting/accounting.service';
import { PaymentService } from 'src/api/app/payment/payment.service';
import { ProcessAppointmentsService } from 'src/modules/seller/appointment/process-appointments/process-appointments.service';
import { RoomsService } from 'src/modules/rooms/rooms.service';
import { TwilioService } from 'src/clients/twilio/twilio.service';

@Injectable()
@Command({
  name: 'test:tester',
  description: 'Seed the database with initial data',
})
export class TesterCommand extends CommandRunner {
  sellerId = '2684cfbd-b556-47d9-a547-86c2e47669fe';
  packageId = 'f1a5c1e8-0003-4000-9000-000000000003';
  dateStr = '2025-09-02';
  userId = '43ddd864-eb51-48b5-99b9-3c3c4c25b17a';

  constructor(
    private readonly prisma: PrismaService,
    private readonly datetime: DatetimeService,
    private readonly availabilityService: AvailabilityService,
    private readonly appointmentService: AppointmentService,
    private readonly commissionService: CommissionService,
    private readonly accountingService: AccountingService,
    private readonly paymentService: PaymentService,
    private readonly processAppointmentsService: ProcessAppointmentsService,
    private readonly roomsService: RoomsService,
    private readonly twilio: TwilioService,
  ) {
    super();
  }

  async teset() {
    console.log('test');
  }

  private async getAvailableSellers() {
    console.log('Finding seller profile...');
    const sellers = await this.prisma.sellerProfile.findFirst({
      where: {
        userId: this.sellerId,
      },
    });

    if (!sellers) {
      throw new Error('Seller not found');
    }

    const availabilities = await this.availabilityService.getDailySlotsForSeller(
      {
        sellerId: sellers.userId,
        packageId: this.packageId,
        dateStr: this.dateStr,
      },
    );

    console.log('Available slots retrieved successfully');
    return availabilities;
  }

  async testAppointment(hour: string) {
    const appointment = await this.appointmentService.createAppointment({
      userId: this.userId,
      sellerId: this.sellerId,
      packageId: this.packageId,
      hour: hour,
      dateStr: this.dateStr,
    });

    console.log('Appointment created:', appointment);
    return appointment;
  }

  async makeTestAppointment() {
    try {
      console.log('=== Testing Availability and Appointment Creation ===\n');

      // Test 1: Get available slots for a seller
      console.log('1. Testing available slots...');
      const results = await this.getAvailableSellers();
      if (!results) {
        console.log('No available slots found for testing');
        return;
      }
      const availableSlots = results.slots;

      if (availableSlots && availableSlots.length > 0) {
        console.log(`Found ${availableSlots.length} available slots`);
        console.log('Sample slots:');
        availableSlots.slice(0, 5).forEach((slot, index) => {
          console.log(`  ${index + 1}. ${slot.dayDate} at ${slot.hour}`);
        });

        // Test 2: Create appointment with a random slot
        console.log('\n2. Testing appointment creation...');
        const randomSlot =
          availableSlots[Math.floor(Math.random() * availableSlots.length)];
        console.log(
          `Selected random slot: ${randomSlot.dayDate} at ${randomSlot.hour}`,
        );

        // Create appointment using the selected slot
        const appointment = await this.testAppointment(randomSlot.startTime);

        console.log('\n3. Appointment created successfully!');
        console.log('Appointment details:', appointment);

        // Test 3: Verify the appointment was created
        console.log('\n4. Verifying appointment in database...');
        const createdAppointment = await this.prisma.appointment.findUnique({
          where: { id: appointment.id },
          include: {
            package: true,
          },
        });

        if (createdAppointment) {
          console.log('✅ Appointment verified in database');
          console.log(
            `   Start: ${createdAppointment.startTime.toISOString()}`,
          );
          console.log(`   End: ${createdAppointment.endTime.toISOString()}`);
          console.log(
            `   Package: ${createdAppointment.package.name} (${createdAppointment.package.durationMin} min)`,
          );
        } else {
          console.log('❌ Appointment not found in database');
        }
      } else {
        console.log('No available slots found for testing');
      }

      console.log('\n=== Testing completed ===');
    } catch (error) {
      console.error('Error during testing:', error);
      throw error;
    }
  }

  async testProcessAppointments() {
    await this.processAppointmentsService.checkUpComingAppointments();
  }

  async testRooms(appointmentId: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: {
        id: appointmentId,
      },
    });
    if (!appointment) {
      throw new Error('Appointment not found');
    }

    await this.roomsService.generateVideoToken(
      appointmentId,
      appointment.userId,
    );
  }

  async run(): Promise<void> {
    try {
      //await this.testProcessAppointments();
      //  await this.testRooms('5338812b-64b4-41a3-9f91-9346b7a959e9');

      const keys = await this.twilio.generateKeySid();
      console.log(keys);
    } catch (error) {
      console.log(error);
    }
  }
}
