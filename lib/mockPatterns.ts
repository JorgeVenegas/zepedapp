// Mock patterns data with real incident IDs from database for testing

export const mockPatterns = [
  {
    id: "pattern-001",
    title: "Metro Line Accessibility Issues",
    description: "Recurring accessibility problems across metro lines including broken ramps for wheelchairs, lack of assistance for people with reduced mobility, and elevator failures at stations.",
    filters: {
      service: ["metro"],
      category: ["accessibility"],
      priority: ["2"]
    },
    priority: 2,
    frequency: 3,
    timeRangeStart: "2023-10-24T14:47:00Z",
    timeRangeEnd: "2025-08-24T19:18:00Z",
    incident_ids: [
      "000cb3f7-24a1-4f8e-887d-a6857746adfe",
      "001bf7a2-53e0-43e3-8c4c-74f0b5c28566",
      "002449d4-7250-4c70-af54-818acdc3358a"
    ],
    created_at: "2025-11-01T10:00:00Z",
    updated_at: "2025-11-23T06:00:00Z"
  },
  {
    id: "pattern-002",
    title: "Lost Items - High Value Personal Belongings",
    description: "Pattern of passengers losing high-value items (laptops, strollers, clothes, baby strollers) during their journey. Multiple reports of lost personal belongings with frustration about lack of clear communication and support.",
    filters: {
      service: ["tren", "metro"],
      category: ["lost-items-security"],
      priority: ["4"]
    },
    priority: 1,
    frequency: 8,
    timeRangeStart: "2023-03-11T21:11:00Z",
    timeRangeEnd: "2025-12-11T09:16:00Z",
    incident_ids: [
      "0590db8c-0494-465a-a743-7eb4d3a6bcd8",
      "060e29c4-607d-403f-a48c-05cd56bff537",
      "077f28d3-edd5-4ed1-8bf3-d7ce29aeea29",
      "0766ef67-150c-4545-9ca2-eb3df7700be0",
      "0826f5a4-a9ab-4261-9662-fbe43f6315d1",
      "09e3be51-d8ee-4054-b18b-4724a084f0dc",
      "0eb3bd9a-e917-40fd-b525-74c9366adf43",
      "0acca63b-4a5e-4db3-84b1-4a2ccebeb741"
    ],
    created_at: "2025-11-10T08:00:00Z",
    updated_at: "2025-11-22T18:00:00Z"
  },
  {
    id: "pattern-003",
    title: "Facility Cleanliness and Maintenance Issues",
    description: "Recurring cleanliness problems including dirty seats, unwashed bins, dirty windows, insufficient lighting, persistent bad odors, and dirty/broken bathrooms. Multiple complaints about poor maintenance affecting passenger comfort.",
    filters: {
      service: ["metro", "tren"],
      category: ["facilities-cleanliness"],
      priority: ["2", "3"]
    },
    priority: 2,
    frequency: 12,
    timeRangeStart: "2023-10-07T09:59:00Z",
    timeRangeEnd: "2025-11-27T16:33:00Z",
    incident_ids: [
      "001bf7a2-53e0-43e3-8c4c-74f0b5c28566",
      "006deb34-d5e6-49bb-be2a-656cbae52144",
      "03652667-4ba3-475d-9220-4a63b723aec9",
      "04e2f372-bb07-4767-a45d-6f16bbe432f4",
      "0567a460-1b3d-4197-a4d9-ba22ee82e7b2",
      "07cebcae-ee9b-4f2b-ac4f-1d61e9903a92",
      "079c4554-4e1c-4a1e-923a-7cac1400bd3a",
      "0aed6d2e-7ae9-4927-8263-be0d4592d05a",
      "120b8087-a1fd-4f96-9ad6-e86d1f30cb9a",
      "14f3a895-f1cb-4bd1-86a6-aaa80ac16804",
      "16e5d87b-e8fd-493a-b0fd-a1622c99689d",
      "0ea3e69c-4737-449c-aa10-a3ad9d67e4e3"
    ],
    created_at: "2025-10-15T20:00:00Z",
    updated_at: "2025-11-23T19:30:00Z"
  },
  {
    id: "pattern-004",
    title: "Compensation and Refund Process Confusion",
    description: "Passengers experiencing confusion about compensation for delays, rejected compensation requests, ticket refund processes, and lack of clear information about reimbursement policies.",
    filters: {
      service: ["metro", "tren"],
      category: ["delays-cancellations", "tickets-fares"],
      priority: ["2"]
    },
    priority: 2,
    frequency: 10,
    timeRangeStart: "2023-01-08T12:34:00Z",
    timeRangeEnd: "2025-12-16T17:55:00Z",
    incident_ids: [
      "010d6d62-1ba8-46bb-9c92-71e38aa82636",
      "047ce056-bc14-44aa-9aae-3d248ee33236",
      "05e050f5-9a5d-4b4c-bee4-037c9b725c6a",
      "07a27d61-b1ed-421a-8446-6eb80932f062",
      "0b644809-4090-459c-b01f-f38cf18eb743",
      "0ce29a09-25b5-43fd-87bc-da521d85c39b",
      "0dd3be41-ca3b-4616-8340-801fbad46383",
      "10381d4a-6ba7-4cd6-bd8a-fd05f4150d19",
      "14443e18-f1b0-4256-b457-c960bff9bf8b",
      "0c9f6fda-efdd-407e-b2fd-596bf7834528"
    ],
    created_at: "2025-11-18T08:00:00Z",
    updated_at: "2025-11-23T11:00:00Z"
  },
  {
    id: "pattern-005",
    title: "Staff Shortage Causing Service Delays",
    description: "Recurring delays caused by lack of available staff including missing drivers/conductors. Passengers report significant wait times, service disruptions, and unplanned stops.",
    filters: {
      service: ["metro", "tren"],
      category: ["delays-cancellations"],
      subservice: ["conductor"],
      priority: ["2"]
    },
    priority: 1,
    frequency: 7,
    timeRangeStart: "2024-09-19T06:26:00Z",
    timeRangeEnd: "2025-11-15T11:15:00Z",
    incident_ids: [
      "0450dcce-1bfc-4efc-8334-53e2273f1c0e",
      "08a74df5-8d46-49d7-a51a-f52ca2b3c424",
      "0aeb978d-f8bc-4886-8f65-1b6dff3f1618",
      "11d24ab9-d1a8-4010-ac5f-d972c48a5e85",
      "002449d4-7250-4c70-af54-818acdc3358a",
      "12412259-bd91-49a7-b64e-d5d8834607b9",
      "1252b658-bfa2-4c87-aa39-8075b44081ac"
    ],
    created_at: "2025-11-20T10:00:00Z",
    updated_at: "2025-11-22T15:00:00Z"
  },
  {
    id: "pattern-006",
    title: "Pet Travel and Bicycle Transport Confusion",
    description: "Passengers experiencing confusion about traveling with pets and unclear rules for transporting bicycles on public transport. Lack of clear information and communication.",
    filters: {
      service: ["metro", "tren"],
      category: ["information-communication"],
      priority: ["2", "3"]
    },
    priority: 3,
    frequency: 6,
    timeRangeStart: "2023-04-11T18:01:00Z",
    timeRangeEnd: "2025-10-21T16:06:00Z",
    incident_ids: [
      "01663cd9-f323-42e0-bd81-115519d3e7f2",
      "01a0e29e-1e6b-4cc7-a4df-a066aab77af7",
      "06f7226b-d25e-4ea9-a5e2-f27b5f6a73fa",
      "075d6993-fbdf-4019-8afe-587ca0d8a366",
      "0aa95ef9-f29f-4193-9c99-7242a83b4f49",
      "0cd886ea-5537-4dd3-a6f1-be3746d37396"
    ],
    created_at: "2025-11-15T12:00:00Z",
    updated_at: "2025-11-21T16:00:00Z"
  }
];
