export type PaginatedApiResponse<T> = {
    page: number;
    pageCount: number;
    pageSize: number;
    results: T[];
    resultsCount: number;
}

export type ApiTimeSelectorOpts = {
    minReserveStartTime: string;
    maxReserveStartTime: string;
}

export type RoomSchedule = {
    name: string;
    events: RoomScheduleEvent[];
}

export type RoomScheduleEvent = {
    title: string;
    description: string;
}

export type RoomMapping = {
    name: string;
    roomId: string;
    building: string;
    buildingId: string;
}

export type BuildingMap = {
    [key: string]: RoomMapping[];
}

export type RoomScheduleMap = {
    [key: string]: RoomSchedule[];
}

export type RoomBookingMap = {
    [key: string]: RoomBooking[];
}

export type RoomBooking = {
    actualAttendance: number;
    audit: RoomBookingAudit;
    avgOccupancy: number;
    calendarUID: string;
    canCancel: boolean;
    canCheckIn: boolean;
    canEdit: boolean;
    canEndNow: boolean;
    changeCounter: number;
    checkedIn: boolean;
    conferenceCode: string;
    conferenceHostURL: string;
    conferenceProvider: string;
    conferenceURL: string;
    conflictResolutionGroup: string;
    eventEndTime: Date;
    eventName: string;
    eventStartTime: Date;
    eventTypeDisplayOnWeb: boolean;
    eventTypeId: number;
    group: RoomBookingGroup;
    hasServiceOrders: boolean;
    id: number;
    isHost: boolean;
    maxOccupancy: number;
    outlookPatternOriginalDateTime: Date;
    overrideDescription: string;
    pamId: string;
    reservation: RoomBookingReservation;
    room: RoomBookingSpace;
    reserveEndTime: Date;
    reserveStartTime: Date;
}

export type RoomBookingAudit = {
    addedBy: string;
    changedBy: string;
    dateAdded: Date;
    dateChanged: Date;
}

export type RoomBookingGroup = {
    emailAddress: string;
    id: number;
    name: string;
}

export type RoomBookingReservation = {
    contactName: string;
    eventName: string;
    groupDisplayOnWeb: boolean;
    groupName: string;
    id: number;
    templateId: number;
    vip: boolean;
    webUserId: number;
    setupCount: number;
    setupMinutes: number;
    setupTypeId: number;
    status: RoomBookingStatus;
    tearDownMinutes: number;
    videoConference: boolean;
}

export type RoomBookingSpace = {
    building: RoomBookingBuilding;
    code: string;
    defaultCapacity: number;
    defaultSetupTypeId: number;
    description: string;
    displayOnWeb: boolean;
    floor: {
        description: string;
        id: number;
        sequence: number;
    };
    hideGroup: boolean;
    id: number;
    imageId: number;
    isAssociatedRoom: boolean;
    promptForBillingReference: boolean;
    recordType: string;
    requiresCheckIn: boolean;
    roomType: {
        description: string;
        id: number;
        sequence: number;
    };
}

export type RoomBookingBuilding = {
    calendaringTBDRoom: {
        description: string;
        id: number;
    };
    code: string;
    currency: {
        isTrailing: boolean;
        symbol: string;
    };
    description: string;
    id: number;
    latitude: number;
    longitude: number;
    notes: string;
    timeZone: {
        abbreviation: string;
        description: string;
        gmtDescription: string;
        hourOffset: number;
        id: number;
        minuteOffset: number;
        name: string;
        timestamp: Date;
    };
    timezoneId: number;
    url: string;
}

export type RoomBookingStatus = {
    allowBookingCancellation: boolean;
    allowBookingEdit: boolean;
    allowServiceEdit: boolean;
    commitInventory: boolean;
    description: string;
    displayOnWeb: boolean;
    id: number;
    statusType: string;
}

export type TrackedResource = {
    name: string;
    slug: string;
    items: number;
}