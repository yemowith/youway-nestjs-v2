import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/clients/prisma/prisma.service';
import { PaymentMethodResponseDto } from './dto';

@Injectable()
export class PaymentMethodsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all active payment methods ordered by sortOrder
   */
  async getAllPaymentMethods(): Promise<PaymentMethodResponseDto[]> {
    const paymentMethods = await this.prisma.paymentMethod.findMany({
      where: {
        isActive: true,
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });

    return paymentMethods.map((method) => ({
      id: method.id,
      name: method.name,
      icon: method.icon || undefined,
      color: method.color || undefined,
      providerKey: method.providerKey,
      description: method.description || undefined,
      isActive: method.isActive,
      sortOrder: method.sortOrder,
      createdAt: method.createdAt,
      updatedAt: method.updatedAt,
    }));
  }

  /**
   * Get a specific payment method by ID
   */
  async getPaymentMethodById(
    id: string,
  ): Promise<PaymentMethodResponseDto | null> {
    const paymentMethod = await this.prisma.paymentMethod.findUnique({
      where: { id },
    });

    if (!paymentMethod) {
      return null;
    }

    return {
      id: paymentMethod.id,
      name: paymentMethod.name,
      icon: paymentMethod.icon || undefined,
      color: paymentMethod.color || undefined,
      providerKey: paymentMethod.providerKey,
      description: paymentMethod.description || undefined,
      isActive: paymentMethod.isActive,
      sortOrder: paymentMethod.sortOrder,
      createdAt: paymentMethod.createdAt,
      updatedAt: paymentMethod.updatedAt,
    };
  }
}
