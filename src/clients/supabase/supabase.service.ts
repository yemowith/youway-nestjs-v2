import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private supabase: SupabaseClient;
  private supabaseAdmin: SupabaseClient;
  private readonly logger = new Logger(SupabaseService.name);

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('supabase.url');
    const supabaseKey = this.configService.get<string>('supabase.key');
    const supabaseServiceKey = this.configService.get<string>(
      'supabase.serviceKey',
    );

    if (!supabaseUrl || !supabaseKey || !supabaseServiceKey) {
      this.logger.warn(
        'Supabase URL or key is missing. Some features may not work correctly.',
      );
      return;
    }

    try {
      // Initialize regular client
      this.supabase = createClient(supabaseUrl, supabaseKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
        },
      });

      // Initialize admin client with service key if available
      if (supabaseServiceKey) {
        this.supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
          auth: {
            autoRefreshToken: true,
            persistSession: true,
          },
        });
        this.logger.log('Supabase admin client initialized successfully');
      } else {
        this.logger.warn(
          'Supabase service key is missing. Admin features will not be available.',
        );
      }
    } catch (error) {
      this.logger.error('Failed to initialize Supabase client:', error);
    }
  }

  onModuleInit() {
    if (!this.supabase) {
      this.logger.warn(
        'Supabase client not initialized. Skipping connection verification.',
      );
      return;
    }

    // Verify connection for both clients
    Promise.all([
      this.supabase.auth.getSession(),
      this.supabaseAdmin?.auth.getSession(),
    ]).catch((error) => {
      this.logger.error('Failed to connect to Supabase:', error);
    });
  }

  getClient(): SupabaseClient {
    if (!this.supabase) {
      throw new Error(
        'Supabase client not initialized. Please check your environment variables.',
      );
    }
    return this.supabase;
  }

  getAdminClient(): SupabaseClient {
    if (!this.supabaseAdmin) {
      throw new Error(
        'Supabase admin client not initialized. Please check your service key in environment variables.',
      );
    }
    return this.supabaseAdmin;
  }

  // Helper methods for common operations
  async uploadFile(
    bucket: string,
    path: string,
    file: File,
    useAdmin: boolean = false,
  ) {
    const client = useAdmin ? this.getAdminClient() : this.getClient();

    const { data, error } = await client.storage
      .from(bucket)
      .upload(path, file);

    if (error) throw error;
    return data;
  }

  getPublicUrl(bucket: string, path: string) {
    const client = this.getClient();
    const { data } = client.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  async deleteFile(bucket: string, path: string, useAdmin: boolean = false) {
    const client = useAdmin ? this.getAdminClient() : this.getClient();

    const { error } = await client.storage.from(bucket).remove([path]);

    if (error) throw error;
  }

  // Admin-specific methods
  async createUser(
    email: string,
    password: string,
    metadata?: Record<string, any>,
  ) {
    const admin = this.getAdminClient();
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: metadata,
    });

    if (error) throw error;
    return data;
  }

  async deleteUser(userId: string) {
    const admin = this.getAdminClient();
    const { error } = await admin.auth.admin.deleteUser(userId);

    if (error) throw error;
  }

  async updateUserMetadata(userId: string, metadata: Record<string, any>) {
    const admin = this.getAdminClient();
    const { data, error } = await admin.auth.admin.updateUserById(userId, {
      user_metadata: metadata,
    });

    if (error) throw error;
    return data;
  }

  async getUserById(userId: string) {
    const admin = this.getAdminClient();
    const { data, error } = await admin.auth.admin.getUserById(userId);

    if (error) throw error;
    return data;
  }

  async listUsers(page: number = 1, perPage: number = 20) {
    const admin = this.getAdminClient();
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage,
    });

    if (error) throw error;
    return data;
  }
}
