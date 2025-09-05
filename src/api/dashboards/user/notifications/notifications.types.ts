export type NotificationDetails =
  | { type: 'post-status'; postSlug: string; status: string }
  | {
      type: 'profile-status';
      profileType: 'individual' | 'corporate';
      profileId: string;
      status: 'pending' | 'confirmed' | 'rejected';
    };

// Add more detail types as needed
