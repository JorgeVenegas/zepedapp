// Mock patterns data for testing the drawer functionality
// Use this in your component or page to test the pattern drawer

export const mockPatterns = [
  {
    id: "pattern-001",
    title: "Metro Line 1 Service Delays",
    description: "Recurring delays on Metro Line 1 during peak hours, affecting morning commute between 7-9 AM. Multiple incidents reported related to signal failures and overcrowding.",
    filters: {
      service: ["Metro"],
      category: ["Delay", "Service Interruption"],
      priority: [4, 5]
    },
    priority: 4,
    frequency: 23,
    timeRangeStart: "2025-11-01T07:00:00Z",
    timeRangeEnd: "2025-11-23T09:30:00Z",
    incidentIds: [
      "b8dfa55f-5dab-41ab-8bee-75c9ac94e764",
      "a11a3610-bab4-4cbf-ada2-417037cbe88a",
      "e7105105-ba90-4ea8-abdf-4d1355e5e3ba",
      "f2c8b9d1-3e4a-5f6b-7c8d-9e0a1b2c3d4e",
      "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
      "2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e",
      "3c4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f",
      "4d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f9a",
      "5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b",
      "6f7a8b9c-0d1e-2f3a-4b5c-6d7e8f9a0b1c",
      "7a8b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d",
      "8b9c0d1e-2f3a-4b5c-6d7e-8f9a0b1c2d3e",
      "9c0d1e2f-3a4b-5c6d-7e8f-9a0b1c2d3e4f",
      "0d1e2f3a-4b5c-6d7e-8f9a-0b1c2d3e4f5a",
      "1e2f3a4b-5c6d-7e8f-9a0b-1c2d3e4f5a6b",
      "2f3a4b5c-6d7e-8f9a-0b1c-2d3e4f5a6b7c",
      "3a4b5c6d-7e8f-9a0b-1c2d-3e4f5a6b7c8d",
      "4b5c6d7e-8f9a-0b1c-2d3e-4f5a6b7c8d9e",
      "5c6d7e8f-9a0b-1c2d-3e4f-5a6b7c8d9e0f",
      "6d7e8f9a-0b1c-2d3e-4f5a-6b7c8d9e0f1a",
      "7e8f9a0b-1c2d-3e4f-5a6b-7c8d9e0f1a2b",
      "8f9a0b1c-2d3e-4f5a-6b7c-8d9e0f1a2b3c",
      "9a0b1c2d-3e4f-5a6b-7c8d-9e0f1a2b3c4d"
    ],
    created_at: "2025-11-01T10:00:00Z",
    updated_at: "2025-11-23T06:00:00Z"
  },
  {
    id: "pattern-002",
    title: "Bus Route 45 No-Shows",
    description: "Pattern of buses not arriving at scheduled times on Route 45, particularly at downtown stops. Users report waiting 30+ minutes beyond scheduled arrival.",
    filters: {
      service: ["Bus"],
      category: ["No-Show", "Schedule Deviation"],
      subservice: ["Route 45"]
    },
    priority: 3,
    frequency: 18,
    timeRangeStart: "2025-11-10T06:00:00Z",
    timeRangeEnd: "2025-11-22T20:00:00Z",
    incidentIds: [
      "abc123de-4567-89ab-cdef-0123456789ab",
      "def456gh-7890-abcd-ef01-23456789abcd",
      "ghi789jk-0123-4567-89ab-cdef0123456",
      "jkl012mn-3456-7890-abcd-ef0123456789",
      "mno345pq-6789-0abc-def0-123456789abc",
      "pqr678st-9012-3456-789a-bcdef0123456",
      "stu901vw-2345-6789-0abc-def0123456789",
      "vwx234yz-5678-90ab-cdef-0123456789ab",
      "yza567bc-8901-2345-6789-0abcdef01234",
      "bcd890ef-1234-5678-90ab-cdef0123456",
      "efg123hi-4567-890a-bcde-f0123456789a",
      "hij456kl-7890-123a-bcde-f0123456789a",
      "klm789no-0123-456a-bcde-f0123456789a",
      "nop012qr-3456-789a-bcde-f0123456789a",
      "qrs345tu-6789-012a-bcde-f0123456789a",
      "tuv678wx-9012-345a-bcde-f0123456789a",
      "wxy901za-2345-678a-bcde-f0123456789a",
      "zab234cd-5678-901a-bcde-f0123456789a"
    ],
    created_at: "2025-11-10T08:00:00Z",
    updated_at: "2025-11-22T18:00:00Z"
  },
  {
    id: "pattern-003",
    title: "Train Overcrowding - Rush Hour",
    description: "Severe overcrowding on express trains during evening rush hour (5-7 PM). Safety concerns raised by multiple passengers unable to board.",
    filters: {
      service: ["Train"],
      category: ["Overcrowding", "Safety Concern"],
      priority: [5]
    },
    priority: 5,
    frequency: 31,
    timeRangeStart: "2025-10-15T17:00:00Z",
    timeRangeEnd: "2025-11-23T19:00:00Z",
    incidentIds: [
      "aaa111bb-2222-3333-4444-555566667777",
      "bbb222cc-3333-4444-5555-666677778888",
      "ccc333dd-4444-5555-6666-777788889999",
      "ddd444ee-5555-6666-7777-888899990000",
      "eee555ff-6666-7777-8888-999900001111"
    ],
    created_at: "2025-10-15T20:00:00Z",
    updated_at: "2025-11-23T19:30:00Z"
  },
  {
    id: "pattern-004",
    title: "Station Elevator Outages",
    description: "Multiple elevator outages at major stations affecting accessibility. Particularly impacting passengers with mobility devices and strollers.",
    filters: {
      service: ["Metro", "Train"],
      category: ["Facility Issue", "Accessibility"],
      priority: [4]
    },
    priority: 4,
    frequency: 12,
    timeRangeStart: "2025-11-18T00:00:00Z",
    timeRangeEnd: "2025-11-23T12:00:00Z",
    incidentIds: [
      "lift001a-bcde-4567-89ab-cdef01234567",
      "lift002b-cdef-5678-90ab-cdef12345678",
      "lift003c-def0-6789-01ab-cdef23456789",
      "lift004d-ef01-7890-12ab-cdef34567890",
      "lift005e-f012-8901-23ab-cdef45678901",
      "lift006f-0123-9012-34ab-cdef56789012",
      "lift007g-1234-0123-45ab-cdef67890123",
      "lift008h-2345-1234-56ab-cdef78901234",
      "lift009i-3456-2345-67ab-cdef89012345",
      "lift010j-4567-3456-78ab-cdef90123456",
      "lift011k-5678-4567-89ab-cdef01234567",
      "lift012l-6789-5678-90ab-cdef12345678"
    ],
    created_at: "2025-11-18T08:00:00Z",
    updated_at: "2025-11-23T11:00:00Z"
  },
  {
    id: "pattern-005",
    title: "Payment System Failures",
    description: "Widespread payment terminal failures across multiple stations. Passengers unable to purchase or reload transit cards.",
    filters: {
      service: ["Metro", "Bus", "Train"],
      category: ["Payment Issue", "Technical Failure"]
    },
    priority: 3,
    frequency: 9,
    timeRangeStart: "2025-11-20T09:00:00Z",
    timeRangeEnd: "2025-11-22T16:00:00Z",
    incidentIds: [
      "pay001aa-1111-2222-3333-444455556666",
      "pay002bb-2222-3333-4444-555566667777",
      "pay003cc-3333-4444-5555-666677778888",
      "pay004dd-4444-5555-6666-777788889999",
      "pay005ee-5555-6666-7777-888899990000",
      "pay006ff-6666-7777-8888-999900001111",
      "pay007gg-7777-8888-9999-000011112222",
      "pay008hh-8888-9999-0000-111122223333",
      "pay009ii-9999-0000-1111-222233334444"
    ],
    created_at: "2025-11-20T10:00:00Z",
    updated_at: "2025-11-22T15:00:00Z"
  },
  {
    id: "pattern-006",
    title: "Customer Service Wait Times",
    description: "Excessive wait times at customer service centers, with reports of 45+ minute waits for basic inquiries.",
    filters: {
      service: ["Customer Service"],
      category: ["Wait Time", "Service Quality"]
    },
    priority: 2,
    frequency: 7,
    timeRangeStart: "2025-11-15T10:00:00Z",
    timeRangeEnd: "2025-11-21T17:00:00Z",
    incidentIds: [
      "cs001aaa-1234-5678-9abc-def012345678",
      "cs002bbb-2345-6789-0abc-def123456789",
      "cs003ccc-3456-7890-1abc-def234567890",
      "cs004ddd-4567-8901-2abc-def345678901",
      "cs005eee-5678-9012-3abc-def456789012",
      "cs006fff-6789-0123-4abc-def567890123",
      "cs007ggg-7890-1234-5abc-def678901234"
    ],
    created_at: "2025-11-15T12:00:00Z",
    updated_at: "2025-11-21T16:00:00Z"
  }
];

// You can also export individual patterns if needed
export const highPriorityPattern = mockPatterns[2]; // Overcrowding pattern
export const recentPattern = mockPatterns[4]; // Payment system failures
