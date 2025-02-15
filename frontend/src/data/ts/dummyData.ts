export interface dummyUser {
    id: number;
    role: "admin" | "user";
    email: string;
    password: string;
}

export interface dummyImage {
    id: number;
    date: string;
    src: string;
    description: string;
}

export interface dummyTable {
    id: number;
    date: string;
    clockIn: string;
    clockOut: string;
    status: string;
    totalHours: string;
    overtime: string;
}

export interface dummyNotif {
    id: number;
    date: string;
    message: string;
}

export const dummyData: dummyUser[] = [
    {
        id: 1,
        role: "admin",
        email: "admin@email.com",
        password: "admin",
    },
    {
        id: 2,
        role: "user",
        email: "user@email.com",
        password: "user",
    }
];

export const imgData: dummyImage[] = [
    {
        id: 1,
        date: "March 25, 2025",
        src: "/frontend/src/assets/images/1.png",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In pellentesque posuere leo non porta.Cras eget scelerisque magna. Nulla ultricies eget turpis sit amet interdum. Aenean egestas ac metus eu vehicula. Integer fringilla malesuada ultricies. Proin lobortis mattis feugiat. Cras posuere ultricies ligula, laoreet venenatis lorem bibendum vitae. Lorem ipsum dolor sit amet, consectetur adipiscing elit. In pellentesque posuere leo non porta."
    },
    {
        id: 2,
        date: "March 25, 2025",
        src: "/frontend/src/assets/images/2.png",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In pellentesque posuere leo non porta.Cras eget scelerisque magna. Nulla ultricies eget turpis sit amet interdum. Aenean egestas ac metus eu vehicula. Integer fringilla malesuada ultricies. Proin lobortis mattis feugiat. Cras posuere ultricies ligula, laoreet venenatis lorem bibendum vitae. Lorem ipsum dolor sit amet, consectetur adipiscing elit. In pellentesque posuere leo non porta."
    },
    {
        id: 3,
        date: "March 25, 2025",
        src: "/frontend/src/assets/images/3.png",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In pellentesque posuere leo non porta.Cras eget scelerisque magna. Nulla ultricies eget turpis sit amet interdum. Aenean egestas ac metus eu vehicula. Integer fringilla malesuada ultricies. Proin lobortis mattis feugiat. Cras posuere ultricies ligula, laoreet venenatis lorem bibendum vitae. Lorem ipsum dolor sit amet, consectetur adipiscing elit. In pellentesque posuere leo non porta."
    }
];


export const table: dummyTable[] = [
    {
        id: 1,
        date: "March 25, 2025",
        clockIn: "8:00 AM",
        clockOut: "5:00 PM",
        status: "Working",
        totalHours: "8 hours",
        overtime: "5 hours",
    },
    {
        id: 2,
        date: "March 25, 2025",
        clockIn: "8:00 AM",
        clockOut: "5:00 PM",
        status: "Working",
        totalHours: "8 hours",
        overtime: "5 hours",
    },
    {
        id: 3,
        date: "March 25, 2025",
        clockIn: "8:00 AM",
        clockOut: "5:00 PM",
        status: "Working",
        totalHours: "8 hours",
        overtime: "5 hours",
    },
    {
        id: 4,
        date: "March 25, 2025",
        clockIn: "8:00 AM",
        clockOut: "5:00 PM",
        status: "Working",
        totalHours: "8 hours",
        overtime: "5 hours",
    },
    {
        id: 5,
        date: "March 25, 2025",
        clockIn: "8:00 AM",
        clockOut: "5:00 PM",
        status: "Working",
        totalHours: "8 hours",
        overtime: "5 hours",
    },
    {
        id: 6,
        date: "March 25, 2025",
        clockIn: "8:00 AM",
        clockOut: "5:00 PM",
        status: "Working",
        totalHours: "8 hours",
        overtime: "5 hours",
    },
    {
        id: 7,
        date: "March 25, 2025",
        clockIn: "8:00 AM",
        clockOut: "5:00 PM",
        status: "Working",
        totalHours: "8 hours",
        overtime: "5 hours",
    },
    {
        id: 8,
        date: "March 25, 2025",
        clockIn: "8:00 AM",
        clockOut: "5:00 PM",
        status: "Working",
        totalHours: "8 hours",
        overtime: "5 hours",
    },
    {
        id: 9,
        date: "March 25, 2025",
        clockIn: "8:00 AM",
        clockOut: "5:00 PM",
        status: "Working",
        totalHours: "8 hours",
        overtime: "5 hours",
    },

    {
        id: 10,
        date: "March 25, 2025",
        clockIn: "8:00 AM",
        clockOut: "5:00 PM",
        status: "Working",
        totalHours: "8 hours",
        overtime: "5 hours",
    },
];


export const notif: dummyNotif[] = [
    {
        id: 1,
        date: "March 25, 2025",
        message: "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
    },
    {
        id: 2,
        date: "March 25, 2025",
        message: "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
    },
    {
        id: 3,
        date: "March 25, 2025",
        message: "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
    },
    {
        id: 4,
        date: "March 25, 2025",
        message: "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
    },
    {
        id: 5,
        date: "March 25, 2025",
        message: "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
    },
    {
        id: 6,
        date: "March 25, 2025",
        message: "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
    },
    {
        id: 7,
        date: "March 25, 2025",
        message: "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
    },
    {
        id: 8,
        date: "March 25, 2025",
        message: "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
    },
    {
        id: 9,
        date: "March 25, 2025",
        message: "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
    },
    {
        id: 10,
        date: "March 25, 2025",
        message: "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
    },
    
];