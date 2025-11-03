import { i } from '@instantdb/react';

// InstantDB Schema Definition
// Translating from the existing Supabase schema to InstantDB's graph-based approach

export const schema = i.schema({
  entities: {
    // Core Users table
    users: i.entity({
      email: i.string().unique(),
      role: i.string(), // 'admin', 'coordinator', 'regional_director', 'host_family', 'student', 'sending_org'
      firstName: i.string().optional(),
      lastName: i.string().optional(),
      phone: i.string().optional(),
      avatarUrl: i.string().optional(),
      status: i.string(), // 'active', 'inactive', 'pending', 'suspended'
      metadata: i.json().optional(),
      lastSignIn: i.date().optional(),
      createdAt: i.date(),
      updatedAt: i.date(),
    }),

    // User Profiles for different types
    profiles: i.entity({
      userId: i.string(),
      type: i.string(), // 'coordinator', 'regional_director', 'host_family', 'student', 'sending_org'
      data: i.json(), // All profile-specific data stored as JSON
      status: i.string(), // 'active', 'inactive', 'pending', 'approved', 'rejected'
      verified: i.boolean(),
      verificationDate: i.date().optional(),
      createdAt: i.date(),
      updatedAt: i.date(),
    }),

    // Applications for different user types
    applications: i.entity({
      type: i.string(), // 'host_family', 'student', 'coordinator'
      status: i.string(), // 'draft', 'submitted', 'under_review', 'approved', 'rejected', 'on_hold'
      submitterId: i.string().optional(),
      reviewerId: i.string().optional(),
      data: i.json(), // Application-specific data
      feedback: i.json().optional(),
      submissionDate: i.date().optional(),
      decisionDate: i.date().optional(),
      version: i.number(),
      previousVersionId: i.string().optional(),
      createdAt: i.date(),
      updatedAt: i.date(),
    }),

    // Relationships between entities
    relationships: i.entity({
      type: i.string(), // 'coordinator_host', 'host_student', 'sending_org_student', etc.
      primaryId: i.string(),
      secondaryId: i.string(),
      status: i.string(), // 'pending', 'active', 'inactive', 'terminated'
      startDate: i.date().optional(),
      endDate: i.date().optional(),
      data: i.json().optional(),
      createdAt: i.date(),
      updatedAt: i.date(),
    }),

    // Student placements
    placements: i.entity({
      studentProfileId: i.string(),
      hostFamilyProfileId: i.string(),
      coordinatorProfileId: i.string(),
      applicationId: i.string().optional(),
      status: i.string(), // 'pending', 'active', 'completed', 'terminated', 'on_hold'
      startDate: i.date().optional(),
      endDate: i.date().optional(),
      school: i.string().optional(),
      grade: i.string().optional(),
      programDuration: i.string().optional(), // 'semester', 'academic_year', etc.
      customDurationWeeks: i.number().optional(),
      transportationDetails: i.json().optional(),
      emergencyContactName: i.string().optional(),
      emergencyContactPhone: i.string().optional(),
      emergencyContactRelationship: i.string().optional(),
      details: i.json().optional(),
      notes: i.string().optional(),
      createdAt: i.date(),
      updatedAt: i.date(),
    }),

    // Monitoring activities
    monitoring: i.entity({
      type: i.string(), // 'orientation', 'monthly_check_in', 'quarterly_visit', etc.
      placementId: i.string(),
      conductedBy: i.string().optional(),
      status: i.string(), // 'scheduled', 'completed', 'missed', 'rescheduled'
      scheduledDate: i.date().optional(),
      completionDate: i.date().optional(),
      method: i.string().optional(), // 'in_person', 'phone', 'video', 'email'
      location: i.string().optional(),
      rating: i.number().optional(),
      concerns: i.boolean(),
      followUpNeeded: i.boolean(),
      followUpDate: i.date().optional(),
      followUpNotes: i.string().optional(),
      details: i.json().optional(),
      createdAt: i.date(),
      updatedAt: i.date(),
    }),

    // Reference data
    referenceData: i.entity({
      category: i.string(),
      code: i.string(),
      displayName: i.string(),
      description: i.string().optional(),
      sortOrder: i.number(),
      active: i.boolean(),
      createdAt: i.date(),
      updatedAt: i.date(),
    }),

    // Documents
    documents: i.entity({
      entityType: i.string(), // 'user', 'profile', 'application', 'placement', 'monitoring'
      entityId: i.string(),
      type: i.string(),
      name: i.string(),
      storagePath: i.string(),
      sizeBytes: i.number().optional(),
      mimeType: i.string().optional(),
      status: i.string(), // 'active', 'inactive', 'pending_review'
      uploadedBy: i.string().optional(),
      metadata: i.json().optional(),
      createdAt: i.date(),
      updatedAt: i.date(),
    }),

    // Notes
    notes: i.entity({
      entityType: i.string(), // 'user', 'profile', 'application', 'placement', 'monitoring'
      entityId: i.string(),
      authorId: i.string(),
      content: i.string(),
      isPrivate: i.boolean(),
      createdAt: i.date(),
      updatedAt: i.date(),
    }),

    // Change queue for SEVIS workflows
    changeQueue: i.entity({
      entityType: i.string(),
      entityId: i.string(),
      changeType: i.string(),
      status: i.string(),
      priority: i.string(),
      requestedBy: i.string(),
      assignedTo: i.string().optional(),
      requestData: i.json(),
      responseData: i.json().optional(),
      notes: i.string().optional(),
      dueDate: i.date().optional(),
      completedDate: i.date().optional(),
      createdAt: i.date(),
      updatedAt: i.date(),
    }),

    // SEVIS processing records
    sevisProcessing: i.entity({
      profileId: i.string(), // Reference to student profile
      batchId: i.string().optional(), // Batch processing identifier
      status: i.string(), // 'ready', 'queued', 'processing', 'successful', 'failed'
      sevisId: i.string().optional(), // Assigned SEVIS ID
      submissionDate: i.date().optional(),
      completionDate: i.date().optional(),
      processedBy: i.string().optional(), // User who processed
      attempts: i.number().optional(), // Number of processing attempts
      lastAttemptDate: i.date().optional(),
      processedData: i.json().optional(), // Data sent to SEVIS
      responseData: i.json().optional(), // Response from SEVIS
      notes: i.string().optional(),
      createdAt: i.date(),
      updatedAt: i.date(),
    }),

    // SEVIS processing failed fields
    sevisFailedFields: i.entity({
      sevisProcessingId: i.string(), // Reference to sevisProcessing record
      fieldName: i.string(), // Name of the field that failed
      fieldPath: i.string().optional(), // JSON path to the field (e.g., 'profile.data.dateOfBirth')
      expectedValue: i.string().optional(), // What value was expected
      actualValue: i.string().optional(), // What value was provided
      errorCode: i.string().optional(), // SEVIS error code
      errorMessage: i.string(), // Human-readable error message
      severity: i.string(), // 'error', 'warning', 'info'
      isResolved: i.boolean(), // Whether the issue has been resolved
      resolvedBy: i.string().optional(), // User who resolved the issue
      resolvedDate: i.date().optional(),
      createdAt: i.date(),
      updatedAt: i.date(),
    }),

    // Student Applications - Comprehensive application data separated from profiles
    studentApplications: i.entity({
      profileId: i.string(), // Reference to student profile
      comprehensiveData: i.json(), // All comprehensive application data
      createdAt: i.date(),
      updatedAt: i.date(),
    }),
  },
  
  links: {
    // User relationships
    userProfiles: {
      forward: {
        on: "users",
        has: "many",
        label: "profiles"
      },
      reverse: {
        on: "profiles",
        has: "one",
        label: "user"
      }
    },

    // Application relationships
    submittedApplications: {
      forward: {
        on: "users",
        has: "many",
        label: "submittedApplications"
      },
      reverse: {
        on: "applications",
        has: "one",
        label: "submitter"
      }
    },

    reviewedApplications: {
      forward: {
        on: "users",
        has: "many",
        label: "reviewedApplications"
      },
      reverse: {
        on: "applications",
        has: "one",
        label: "reviewer"
      }
    },

    // Placement relationships
    studentPlacements: {
      forward: {
        on: "profiles",
        has: "many",
        label: "studentPlacements"
      },
      reverse: {
        on: "placements",
        has: "one",
        label: "studentProfile"
      }
    },

    hostFamilyPlacements: {
      forward: {
        on: "profiles",
        has: "many",
        label: "hostFamilyPlacements"
      },
      reverse: {
        on: "placements",
        has: "one",
        label: "hostFamilyProfile"
      }
    },

    coordinatorPlacements: {
      forward: {
        on: "profiles",
        has: "many",
        label: "coordinatorPlacements"
      },
      reverse: {
        on: "placements",
        has: "one",
        label: "coordinatorProfile"
      }
    },

    // Monitoring relationships
    placementMonitoring: {
      forward: {
        on: "placements",
        has: "many",
        label: "monitoring"
      },
      reverse: {
        on: "monitoring",
        has: "one",
        label: "placement"
      }
    },

    // Document relationships
    entityDocuments: {
      forward: {
        on: "documents",
        has: "one",
        label: "entity"
      },
      reverse: {
        on: "documents",
        has: "many",
        label: "documents"
      }
    },

    // Note relationships
    entityNotes: {
      forward: {
        on: "notes",
        has: "one",
        label: "entity"
      },
      reverse: {
        on: "notes",
        has: "many",
        label: "notes"
      }
    },

    // SEVIS processing relationships
    profileSevisProcessing: {
      forward: {
        on: "profiles",
        has: "many",
        label: "sevisProcessing"
      },
      reverse: {
        on: "sevisProcessing",
        has: "one",
        label: "profile"
      }
    },

    sevisProcessingFailedFields: {
      forward: {
        on: "sevisProcessing",
        has: "many",
        label: "failedFields"
      },
      reverse: {
        on: "sevisFailedFields",
        has: "one",
        label: "sevisProcessing"
      }
    },

    // Student Application relationships
    profileStudentApplications: {
      forward: {
        on: "profiles",
        has: "many",
        label: "studentApplications"
      },
      reverse: {
        on: "studentApplications",
        has: "one",
        label: "profile"
      }
    }
  }
});

export type Schema = typeof schema; 