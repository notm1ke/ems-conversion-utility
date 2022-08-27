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