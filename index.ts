import axios from 'axios';
import moment from 'moment';
import env from './env.json';
import RSS from 'rss-generator';

import { STANDARD_TIME_FORMAT, paginate } from './util';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'fs';
import { ApiTimeSelectorOpts, RoomBooking, RoomBookingMap, RoomSchedule } from './types';

axios.defaults.baseURL = 'https://uconn.emscloudservice.com/platform/api/v1';

const { clientId, clientSecret: secret } = env;
const { HIDE_ELAPSED } = process.env;

(async () => {
    let start = Date.now();
    let authToken = await axios
        .post('/clientauthentication', { clientId, secret })
        .then(res => res.data)
        .then(res => res.clientToken)
        .catch(_ => null);

    if (!authToken) {
        console.warn('Failed to authenticate with EMS.');
        process.exit(-1);
    }

	let hideElapsed = HIDE_ELAPSED === '1';

    axios.defaults.headers['x-ems-api-token'] = authToken;
    console.log('Authenticated with EMS.');

    let rooms = await paginate<RoomBooking>('resolveRooms', 'GET', '/rooms?pageSize=2000');
    if (!rooms || rooms.length === 0) {
        console.warn('Failed to fetch rooms from EMS.');
        process.exit(-1);
    }

    let schedules = await paginate<RoomBooking, ApiTimeSelectorOpts>('fetchSchedules', 'POST', '/bookings/actions/search?pageSize=2000', {
        minReserveStartTime: moment().format(STANDARD_TIME_FORMAT),
        maxReserveStartTime: moment().add(1, 'day').format(STANDARD_TIME_FORMAT)
    });

    if (!schedules || schedules.length === 0) {
        console.warn('Failed to fetch schedules from EMS.');
        process.exit(-1);
    }

    let mappings: RoomBookingMap = schedules.reduce((acc, cur) => {
        let roomName = cur.room.description.replace(/\s/g, '_');
        if (!acc[roomName]) acc[roomName] = [];
        acc[roomName].push(cur);
        return acc;
    }, {});

    if (hideElapsed) {
        console.log('Hiding elapsed events..');
        let now = moment();
        for (let room of Object.keys(mappings)) {
            mappings[room] = mappings[room].filter(booking => {
                let start = moment(booking.eventStartTime);
                let end = moment(booking.eventEndTime);
                return now.isBetween(start, end) || now.isBefore(start);
            });
        }
    }

    // Inject empty rooms so that an RSS feed still exists, despite no events.
    rooms.forEach(room => {
        let roomName = room.description.replace(/\s/g, '_');
        if (!mappings[roomName]) mappings[roomName] = [];
    });

    console.log(`Retrieved ${Object.keys(mappings).length} room mappings from EMS.`);
    
    let payloads: RoomSchedule[] = Object
        .keys(mappings)
        .map(room => {
            let schedule = mappings[room];
            return {
                name: room,
                events: schedule.map(booking => ({
                    title: booking.eventName,
                    description: `${moment(booking.eventStartTime).format('h:mm A')} - ${moment(booking.eventEndTime).format('h:mm A')}`
                }))
            };
        });

    console.log('Starting export, this may take a moment..');

    let outDir = `./signageData${!hideElapsed ? 'All' : ''}`;
    if (existsSync(outDir)) {
        rmSync(outDir, { recursive: true });
        console.log('Signage data export directory cleaned.');
    }
    
    mkdirSync(outDir);
    
    for (let entry of Object.values(payloads)) {
        let clean = entry.name.replace(/\s/g, '_').replace(/\//g, '_');
        let feed = new RSS({
            title: entry.name,
            description: moment().format('MM/DD/YYYY'),
            site_url: 'https://rooms.internal/',
            feed_url: `https://rooms.internal/roomSignage${!hideElapsed ? 'All' : ''}/${clean}.xml`
        });

        entry
            .events
            .forEach(({ title, description }) => feed.item({
                title, description
            }));

        writeFileSync(`./signageData${!hideElapsed ? 'All' : ''}/${clean}.xml`, feed.xml({ indent: true }));
    }

    console.log(`Export took ${(Date.now() - start).toFixed(2)}ms.`);
})();